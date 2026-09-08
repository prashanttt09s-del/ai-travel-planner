import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const DEFAULT_PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

function startServerOnPort(port: number) {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`AI Travel Planner server running on http://localhost:${port}`);
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.warn(`Port ${port} is already in use. Retrying on port ${port + 1}...`);
      startServerOnPort(port + 1);
      return;
    }

    console.error('Unable to start server:', error);
    process.exit(1);
  });
}

// Lazy GenAI client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set in environment.');
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Helper schema for structured Gemini travel generation
const travelPlanSchema = {
  type: Type.OBJECT,
  properties: {
    destination: { type: Type.STRING },
    startingCity: { type: Type.STRING },
    country: { type: Type.STRING },
    tagline: { type: Type.STRING, description: 'Catchy 1-line trip headline' },
    summary: { type: Type.STRING, description: 'Overview paragraph of the trip' },
    bestTimeToVisit: { type: Type.STRING },
    weatherSummary: { type: Type.STRING },
    budget: {
      type: Type.OBJECT,
      properties: {
        currency: { type: Type.STRING },
        accommodation: { type: Type.NUMBER },
        foodDining: { type: Type.NUMBER },
        transport: { type: Type.NUMBER },
        activitiesTickets: { type: Type.NUMBER },
        miscellaneous: { type: Type.NUMBER },
        totalEstimate: { type: Type.NUMBER },
        budgetAdvice: { type: Type.STRING },
      },
      required: ['currency', 'accommodation', 'foodDining', 'transport', 'activitiesTickets', 'miscellaneous', 'totalEstimate', 'budgetAdvice'],
    },
    routeTransit: {
      type: Type.OBJECT,
      properties: {
        origin: { type: Type.STRING },
        destination: { type: Type.STRING },
        distanceEstimate: { type: Type.STRING },
        bestTravelMode: { type: Type.STRING },
        recommendedModeReason: { type: Type.STRING },
        bestTimeToBookAdvice: { type: Type.STRING },
        estimatedTransitTotal: { type: Type.NUMBER },
        pitstopsOrScenicHighlights: { type: Type.ARRAY, items: { type: Type.STRING } },
        transitOptions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              mode: { type: Type.STRING, description: 'flight | train | bus | road_trip' },
              title: { type: Type.STRING },
              duration: { type: Type.STRING },
              approxCostPerPerson: { type: Type.NUMBER },
              costCurrency: { type: Type.STRING },
              summary: { type: Type.STRING },
              isRecommended: { type: Type.BOOLEAN },
              bookingTip: { type: Type.STRING },
              departureHub: { type: Type.STRING },
              arrivalHub: { type: Type.STRING },
            },
            required: ['mode', 'title', 'duration', 'approxCostPerPerson', 'summary', 'bookingTip'],
          },
        },
      },
      required: ['origin', 'destination', 'bestTravelMode', 'recommendedModeReason', 'transitOptions', 'bestTimeToBookAdvice', 'estimatedTransitTotal'],
    },
    bikeTripGuide: {
      type: Type.OBJECT,
      properties: {
        isSuitableForBiking: { type: Type.BOOLEAN },
        recommendedBikeRoute: { type: Type.STRING },
        alternativeScenicRoute: { type: Type.STRING },
        highwayNames: { type: Type.STRING },
        roadConditionsAndTerrain: { type: Type.STRING },
        difficultyLevel: { type: Type.STRING, description: 'Easy & Smooth Highway | Moderate Scenic Ride | Challenging Ghats & Curves | High Altitude Expedition' },
        totalDistanceKm: { type: Type.NUMBER },
        recommendedDailyRidingKm: { type: Type.NUMBER },
        recommendedRideDays: { type: Type.NUMBER },
        safeRidingWindow: { type: Type.STRING },
        intermediateNightStays: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              stopNumber: { type: Type.INTEGER },
              dayLabel: { type: Type.STRING },
              cityOrTown: { type: Type.STRING },
              distanceFromStartKm: { type: Type.NUMBER },
              legDistanceKm: { type: Type.NUMBER },
              whyStayHere: { type: Type.STRING },
              hotelBudgetRange: { type: Type.STRING },
              recommendedDhabasOrFood: { type: Type.STRING },
              bikeSafetyAndAmenities: { type: Type.STRING },
            },
            required: ['stopNumber', 'dayLabel', 'cityOrTown', 'distanceFromStartKm', 'legDistanceKm', 'whyStayHere', 'hotelBudgetRange'],
          },
        },
        petrolAndExpenses: {
          type: Type.OBJECT,
          properties: {
            totalDistanceKm: { type: Type.NUMBER },
            defaultMileageKmpl: { type: Type.NUMBER },
            fuelPricePerLitre: { type: Type.NUMBER },
            fuelLitresOneWay: { type: Type.NUMBER },
            fuelCostOneWay: { type: Type.NUMBER },
            fuelCostRoundTrip: { type: Type.NUMBER },
            bikeMaintenanceBuffer: { type: Type.NUMBER },
            tollNote: { type: Type.STRING },
            estimatedStaysAndFoodCost: { type: Type.NUMBER },
            totalTripCostSolo: { type: Type.NUMBER },
            costPerPersonWithPillion: { type: Type.NUMBER },
          },
          required: ['totalDistanceKm', 'defaultMileageKmpl', 'fuelPricePerLitre', 'fuelLitresOneWay', 'fuelCostOneWay', 'fuelCostRoundTrip', 'bikeMaintenanceBuffer', 'tollNote', 'estimatedStaysAndFoodCost', 'totalTripCostSolo', 'costPerPersonWithPillion'],
        },
        essentialRiderGear: { type: Type.ARRAY, items: { type: Type.STRING } },
        bikePreparationTips: { type: Type.ARRAY, items: { type: Type.STRING } },
        safetyAndPunctureAdvice: { type: Type.STRING },
      },
      required: ['isSuitableForBiking', 'recommendedBikeRoute', 'highwayNames', 'roadConditionsAndTerrain', 'difficultyLevel', 'totalDistanceKm', 'recommendedDailyRidingKm', 'recommendedRideDays', 'safeRidingWindow', 'intermediateNightStays', 'petrolAndExpenses', 'essentialRiderGear', 'bikePreparationTips', 'safetyAndPunctureAdvice'],
    },
    aiSmartAdvice: {
      type: Type.OBJECT,
      properties: {
        overallVerdict: { type: Type.STRING },
        topTips: { type: Type.ARRAY, items: { type: Type.STRING } },
        thingsToDo: { type: Type.ARRAY, items: { type: Type.STRING } },
        thingsToAvoid: { type: Type.ARRAY, items: { type: Type.STRING } },
        moneySavingHacks: { type: Type.ARRAY, items: { type: Type.STRING } },
        localInsiderSecret: { type: Type.STRING },
      },
      required: ['overallVerdict', 'topTips', 'thingsToDo', 'thingsToAvoid', 'moneySavingHacks', 'localInsiderSecret'],
    },
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dayNumber: { type: Type.INTEGER },
          title: { type: Type.STRING },
          theme: { type: Type.STRING },
          summary: { type: Type.STRING },
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                timeSlot: { type: Type.STRING, description: 'Morning | Afternoon | Evening | Night' },
                timeRange: { type: Type.STRING, description: 'e.g. 09:00 AM - 12:00 PM' },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                locationName: { type: Type.STRING },
                approxDuration: { type: Type.STRING },
                approxCost: { type: Type.NUMBER },
                costCurrency: { type: Type.STRING },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                transportTip: { type: Type.STRING },
                mapQuery: { type: Type.STRING },
              },
              required: ['id', 'timeSlot', 'title', 'description', 'locationName'],
            },
          },
          meals: {
            type: Type.OBJECT,
            properties: {
              breakfast: { type: Type.STRING },
              lunch: { type: Type.STRING },
              dinner: { type: Type.STRING },
            },
          },
          localProTip: { type: Type.STRING },
        },
        required: ['dayNumber', 'title', 'theme', 'summary', 'activities'],
      },
    },
    packingList: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          category: { type: Type.STRING, description: 'Essentials | Clothing | Tech | Health & Toiletries | Documents' },
          isChecked: { type: Type.BOOLEAN },
        },
        required: ['id', 'name', 'category'],
      },
    },
    foodRecommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          type: { type: Type.STRING, description: 'veg | non-veg | vegan | sweet | drink' },
          bestPlaceToTry: { type: Type.STRING },
          priceRange: { type: Type.STRING },
        },
        required: ['name', 'description', 'type', 'priceRange'],
      },
    },
    emergencyAndEtiquette: {
      type: Type.OBJECT,
      properties: {
        emergencyNumbers: { type: Type.ARRAY, items: { type: Type.STRING } },
        culturalTips: { type: Type.ARRAY, items: { type: Type.STRING } },
        scamsToAvoid: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['emergencyNumbers', 'culturalTips', 'scamsToAvoid'],
    },
  },
  required: ['destination', 'tagline', 'summary', 'days', 'budget', 'routeTransit', 'aiSmartAdvice', 'packingList', 'foodRecommendations', 'emergencyAndEtiquette'],
};

// Fallback generator when API key is missing or fallback requested
function generateFallbackPlan(reqBody: any) {
  const destination = reqBody.destination || 'Goa';
  const startingCity = reqBody.startingCity || 'Delhi';
  const daysCount = Number(reqBody.days) || 3;
  const currency = reqBody.currency || 'INR';
  const isHinglish = reqBody.language === 'hi_hinglish';
  const budgetTier = reqBody.budgetTier || 'moderate';

  const multiplier = budgetTier === 'budget' ? 1500 : budgetTier === 'luxury' ? 8500 : 3500;
  const totalCost = multiplier * daysCount;

  // Realistic transit cost calculation based on tier & currency
  const flightFare = budgetTier === 'budget' ? 3500 : budgetTier === 'luxury' ? 9500 : 5500;
  const trainFare = budgetTier === 'budget' ? 750 : budgetTier === 'luxury' ? 2800 : 1600;
  const busFare = budgetTier === 'budget' ? 800 : 1800;
  const roadFare = budgetTier === 'budget' ? 3000 : 7000;

  const days = [];
  for (let i = 1; i <= daysCount; i++) {
    days.push({
      dayNumber: i,
      title: isHinglish ? `Day ${i}: ${destination} ki iconic jagah aur exploration` : `Day ${i}: Highlights & Local Charm of ${destination}`,
      theme: i === 1 ? 'Arrival & Sightseeing' : i === 2 ? 'Cultural Wonders & Local Bites' : 'Nature, Relaxation & Sunset',
      summary: isHinglish 
        ? `${destination} ke khoobsurat nazare, local street food aur scenic spots ka full maza lijiye.` 
        : `Immerse yourself in the scenic beauty, vibrant streets, and famous local landmarks of ${destination}.`,
      activities: [
        {
          id: `d${i}-act-1`,
          timeSlot: 'Morning',
          timeRange: '09:00 AM - 12:30 PM',
          title: isHinglish ? `${destination} Iconic Landmark Tour` : `Explore Famous Landmarks of ${destination}`,
          description: isHinglish ? `Subah ki taazgi ke sath explore karein aur beautiful photos click karein.` : `Start early to beat crowds, take breathtaking photos, and learn local history.`,
          locationName: `${destination} City Center / Main Attraction`,
          approxDuration: '3.5 hrs',
          approxCost: budgetTier === 'budget' ? 200 : 800,
          costCurrency: currency,
          tags: ['Sightseeing', 'Photography'],
          transportTip: 'Rent a scooter or book a local cab/metro',
          mapQuery: `${destination} famous spot`,
        },
        {
          id: `d${i}-act-2`,
          timeSlot: 'Afternoon',
          timeRange: '01:30 PM - 04:30 PM',
          title: isHinglish ? `Local Market & Food Exploration` : `Local Bazaar & Food Walk`,
          description: isHinglish ? `Authentic authentic flavours aur traditional market me shopping karein.` : `Taste authentic delicacies and shop for souvenirs in the vibrant local quarter.`,
          locationName: `${destination} Heritage Market`,
          approxDuration: '3 hrs',
          approxCost: budgetTier === 'budget' ? 300 : 1200,
          costCurrency: currency,
          tags: ['Foodie', 'Shopping'],
          transportTip: 'Walking / short tuk-tuk ride',
          mapQuery: `${destination} market`,
        },
        {
          id: `d${i}-act-3`,
          timeSlot: 'Evening',
          timeRange: '05:30 PM - 08:30 PM',
          title: isHinglish ? `Scenic Sunset Point & Café Vibes` : `Golden Hour Viewpoint & Evening Café`,
          description: isHinglish ? `Shaam ko sunset view dekhein aur live music ke saath relax karein.` : `Catch the mesmerizing sunset, enjoy refreshing drinks, and soak in the evening atmosphere.`,
          locationName: `${destination} Sunset Point`,
          approxDuration: '3 hrs',
          approxCost: budgetTier === 'budget' ? 400 : 1500,
          costCurrency: currency,
          tags: ['Relaxation', 'Sunset', 'Views'],
          transportTip: 'Book return transport beforehand',
          mapQuery: `${destination} sunset viewpoint`,
        },
      ],
      meals: {
        breakfast: isHinglish ? 'Local fresh breakfast with chai/coffee' : 'Traditional breakfast at a cozy heritage cafe',
        lunch: isHinglish ? 'Special regional thali / popular local dish' : 'Authentic regional lunch at a top-rated local eatery',
        dinner: isHinglish ? 'Candlelight rooftop dinner with local flavours' : 'Rooftop or seaside dinner with evening views',
      },
      localProTip: isHinglish ? 'UPI aur thoda cash dono sath rakhein, aur peak hours se pehle niklein!' : 'Carry cash for small street vendors and start early to avoid afternoon heat and rush.',
    });
  }

  return {
    id: `plan-${Date.now()}`,
    destination,
    startingCity,
    country: 'Global',
    tagline: isHinglish ? `${startingCity} se ${destination} ka ultimate travel plan!` : `The Ultimate Journey from ${startingCity} to ${destination}`,
    summary: isHinglish 
      ? `${startingCity} se ${destination} ki yatra ke liye best route, transit kharch, stays, authentic food aur pro travel tips ka complete blueprint.` 
      : `Carefully crafted journey from ${startingCity} to ${destination}, balanced with realistic transit cost, top-rated landmarks, authentic local food trails, and insider tips.`,
    startDate: reqBody.startDate || new Date().toISOString().split('T')[0],
    daysCount,
    budgetTier,
    travelerType: reqBody.travelerType || 'friends',
    vibes: reqBody.vibes || ['culture', 'beaches'],
    language: reqBody.language || 'en',
    bestTimeToVisit: 'October to March (Pleasant weather, ideal for sightseeing)',
    weatherSummary: 'Sunny & pleasant during day, cool breeze in the evening (22°C - 30°C).',
    days,
    budget: {
      currency,
      accommodation: Math.round(totalCost * 0.4),
      foodDining: Math.round(totalCost * 0.25),
      transport: Math.round(totalCost * 0.15),
      activitiesTickets: Math.round(totalCost * 0.12),
      miscellaneous: Math.round(totalCost * 0.08),
      totalEstimate: totalCost,
      budgetAdvice: isHinglish 
        ? `Pre-booking aur local public transport use karke aap 20-30% extra save kar sakte hain.`
        : `Booking stays in advance and renting two-wheelers/using public transit can save up to 25% of your travel budget.`,
    },
    routeTransit: {
      origin: startingCity,
      destination,
      distanceEstimate: 'Approx. 1,450 km (Route dependant)',
      bestTravelMode: 'Flight (Fastest & most comfortable) / Express Train (Most scenic & economical)',
      recommendedModeReason: isHinglish
        ? `${startingCity} se ${destination} ke liye flight sabse tez hai (2h 15m), jabki overnight superfast train budget travellers ke liye sabse pocket-friendly hai jo hotel ka ek raat ka kharch bhi bachati hai!`
        : `Non-stop flights offer the fastest commute (~2h 15m). For budget travelers, overnight express trains save on one night accommodation while giving scenic vistas.`,
      bestTimeToBookAdvice: isHinglish
        ? 'Flights ko 3-4 hafte pehle book karein. Tuesday aur Wednesday ke tickets weekend ke mukable 15-20% saste milte hain.'
        : 'Book flights 3–4 weeks prior. Mid-week departures (Tue/Wed) typically save 15–20% over Friday/Sunday fares.',
      estimatedTransitTotal: flightFare,
      pitstopsOrScenicHighlights: [
        'Scenic countryside views along the coastal rail/highway network',
        'Famous railway food junctions for regional snacks & hot tea',
        'Highway rest plazas with clean washrooms and multi-cuisine dhabas',
      ],
      transitOptions: [
        {
          mode: 'flight',
          title: `Direct / 1-Stop Flight (${startingCity} ✈️ ${destination})`,
          duration: '2h 15m - 3h 30m',
          approxCostPerPerson: flightFare,
          costCurrency: currency,
          summary: isHinglish 
            ? 'Sabse tez aur convenient option. Airport se destination taxi 45 mins me pahuncha deti hai.'
            : 'Fastest and most convenient connection. Direct flights depart multiple times daily.',
          isRecommended: true,
          bookingTip: 'Book early morning or late night flights for best rates & less airport crowd.',
          departureHub: `${startingCity} International/Domestic Airport`,
          arrivalHub: `${destination} Airport`,
        },
        {
          mode: 'train',
          title: `Superfast / Vande Bharat / Express Train`,
          duration: '12h - 18h (Overnight)',
          approxCostPerPerson: trainFare,
          costCurrency: currency,
          summary: isHinglish 
            ? 'Aaramdayak AC Sleeper / 3AC berth jisme raat me safar karke agle din subah fresh utrein.'
            : 'Comfortable overnight sleeper/3AC coaches. Enjoy scenic countryside views and onboard meals.',
          isRecommended: false,
          bookingTip: 'Book IRCTC tickets at least 30-60 days ahead or check Tatkal at 10 AM / 11 AM.',
          departureHub: `${startingCity} Central Railway Station`,
          arrivalHub: `${destination} Main Junction`,
        },
        {
          mode: 'bus',
          title: `AC Multi-Axle Volvo / Sleeper Bus`,
          duration: '14h - 20h',
          approxCostPerPerson: busFare,
          costCurrency: currency,
          summary: isHinglish 
            ? 'Overnight semi-sleeper bus with charging points and movie screens.'
            : 'Reliable overnight private sleeper buses with recliner/berths and scheduled highway stops.',
          isRecommended: false,
          bookingTip: 'Choose top-rated operators like Zingbus, IntrCity, or State RTC with high safety ratings.',
          departureHub: `${startingCity} Major Inter-state Bus Terminal`,
          arrivalHub: `${destination} Bus Stand`,
        },
        {
          mode: 'road_trip',
          title: `Self-Drive / Private Cab Road Trip`,
          duration: '16h - 22h (Drive)',
          approxCostPerPerson: roadFare,
          costCurrency: currency,
          summary: isHinglish 
            ? 'Highway dhabon, scenic photos aur flexible stops ke liye adventure road trip.'
            : 'Great flexibility for stops at roadside cafes, scenic viewpoints, and village bazaars.',
          isRecommended: false,
          bookingTip: 'Ensure FASTag is loaded and check tire pressure & spare wheel before starting.',
        },
      ],
    },
    bikeTripGuide: {
      isSuitableForBiking: true,
      recommendedBikeRoute: `${startingCity} ➔ Main Expressway Corridor ➔ ${destination}`,
      alternativeScenicRoute: `State Highway Coastal / Valley Scenic Route`,
      highwayNames: 'National Highway (4/6 Lane Asphalt & Expressway bypasses)',
      roadConditionsAndTerrain: isHinglish
        ? 'Highway par 80-90% road kaafi smooth aur paved hai. Din me ride karna bohot aasan aur safe hai.'
        : 'Predominantly paved 4-6 lane national highway with clear lane markings, highway dhabas, and frequent fuel stations.',
      difficultyLevel: 'Moderate Scenic Ride',
      totalDistanceKm: 1450,
      recommendedDailyRidingKm: 420,
      recommendedRideDays: 3,
      safeRidingWindow: '06:00 AM - 05:30 PM (Avoid riding after dark due to truck glare and poor visibility)',
      intermediateNightStays: [
        {
          stopNumber: 1,
          dayLabel: 'Day 1 Night Stop (~420 km)',
          cityOrTown: 'Midway Highway Junction (e.g. Udaipur / Ratlam / Kolhapur)',
          distanceFromStartKm: 420,
          legDistanceKm: 420,
          whyStayHere: isHinglish
            ? 'Covered bike parking, 24x7 highway dhabas aur puncture/mechanic repair hubs available hain.'
            : 'Safe enclosed bike parking, clean budget highway motels, and puncture repair facilities nearby.',
          hotelBudgetRange: '₹1,200 - ₹1,800 / night',
          recommendedDhabasOrFood: 'Highway Dhaba (Fresh Tandoori Roti, Dal Tadka, Sev Tamatar & Special Chai)',
          bikeSafetyAndAmenities: 'CCTV monitored parking, tire air pump at nearby fuel station',
        },
        {
          stopNumber: 2,
          dayLabel: 'Day 2 Night Stop (~850 km)',
          cityOrTown: 'Expressway Bypass Hub (e.g. Vadodara / Hubli / Belgaum)',
          distanceFromStartKm: 850,
          legDistanceKm: 430,
          whyStayHere: isHinglish
            ? 'Clean AC rooms, chain lube point aur subah early breakfast ke liye best location.'
            : 'Comfortable highway stay with quick morning highway re-entry and fuel pumps.',
          hotelBudgetRange: '₹1,400 - ₹2,000 / night',
          recommendedDhabasOrFood: 'Multi-cuisine Highway Plaza / Regional Breakfast',
          bikeSafetyAndAmenities: 'Gated parking area, HP/IOCL fuel pump within 500m',
        },
      ],
      petrolAndExpenses: {
        totalDistanceKm: 1450,
        defaultMileageKmpl: 35,
        fuelPricePerLitre: 100,
        fuelLitresOneWay: 41.4,
        fuelCostOneWay: 4140,
        fuelCostRoundTrip: 8280,
        bikeMaintenanceBuffer: 1200,
        tollNote: isHinglish
          ? 'Zyadatar Indian National Highways par Motorcycles ke liye TOLL TAX bilkul FREE hota hai!'
          : 'Motorcycles are 100% EXEMPT from toll tax on almost all National Highway toll plazas across India!',
        estimatedStaysAndFoodCost: 5200,
        totalTripCostSolo: 14680,
        costPerPersonWithPillion: 8400,
      },
      essentialRiderGear: [
        'ECE / DOT / ISI Full-Face Helmet with clear/anti-fog visor',
        'Armored Riding Jacket & Knee Guards (CE Level 2 armor)',
        'Touch-friendly Riding Gloves & High-ankle Riding Boots',
        'Tubeless Tyre Puncture Kit + Portable Electric Air Inflator',
        'Motorcycle Chain Lube Spray & Cleaner (use every 400-500 km)',
        'Waterproof Saddlebags / Tail Bag with heavy-duty Bungee Cords',
        'Mobile Mount with Vibration Dampener & USB Fast Charger',
        'Hydration Bag / 2L Water Pack & Compact Rain Gear',
      ],
      bikePreparationTips: [
        'Full service 4-5 days before trip: Engine oil change, brake pads inspection, spark plug check.',
        'Keep cold tire pressure as per manual (29 PSI Front, 33 PSI Rear Solo / 36 Pillion).',
        'Keep DigiLocker + Physical copies of RC, Insurance, PUC & Driving License.',
        'Carry a spare master key, basic tool kit, fuse set, and clutch cable.',
      ],
      safetyAndPunctureAdvice: isHinglish
        ? 'Har 150-180 km par 15 minute ka chai break lein taaki engine thanda ho aur rider thake nahi. Steady 80-95 km/h par cruise karein.'
        : 'Take a mandatory 15-min hydration break every 150 km. Maintain steady 80-95 km/h cruise speed for optimum fuel economy and safety.',
    },
    aiSmartAdvice: {
      overallVerdict: isHinglish 
        ? `${startingCity} se ${destination} ka trip bohot hi rewarding rahega. Budget aur time ko balance karne ke liye flight ya 3AC train best choice hai.`
        : `Traveling from ${startingCity} to ${destination} is seamless with the right blend of advance flight booking and local scooter/cab transit.`,
      topTips: isHinglish ? [
        'Local travel ke liye airport/railway station se prepaid taxi counter ya cab apps (Ola/Uber) use karein.',
        'Destination par scooter ya self-drive car rent karna autos ke mukable roz ka 40% kharch bachata hai.',
        'UPI lagbhag har jagah chalta hai lekin remote beach/hill spots ke liye ₹2,000 cash hamesha purse me rakhein.',
        'Popular tourist spots subah 8:30 AM se 10:00 AM ke beech visit karein taaki lambi lines aur dhoop se bachein.',
        'Local water sports aur activities me direct operators se baat karein, hotel agents 20-30% commission jodte hain.'
      ] : [
        'Book local scooters or self-drive bikes upon arrival to cut local commute costs by 40%.',
        'Use official prepaid taxi kiosks or rideshare apps right outside the terminal to avoid overpriced touts.',
        'Carry a small cash buffer for local coconut vendors, entry tolls, and rural handicraft stalls.',
        'Visit headline monuments right at opening time (8:30 AM) to enjoy crowd-free photography.',
        'Negotiate directly with beach/activity shack operators instead of booking through middlemen.'
      ],
      thingsToDo: isHinglish ? [
        'Authentic local street food markets me regional delicacies zaroor try karein.',
        'Golden hour sunset viewpoint par 30 minutes pehle pahunchein taaki best spot mil sake.',
        'Local heritage monuments me audio guide ya verified guide lein.',
      ] : [
        'Taste authentic local regional cuisine at old-town heritage family eateries.',
        'Catch golden hour sunsets from elevated coastal or hilltop vantage points.',
        'Carry lightweight reusable water bottles with filtration.',
      ],
      thingsToAvoid: isHinglish ? [
        'Airport ke bahar khade unauthorized private drivers ki baaton me aakar bina meter cab na lein.',
        'Peak afternoon (12:30 PM - 3:30 PM) me khuli dhoop me continuous sightseeing avoid karein.',
        'Unverified water sports operators se bina safety life-jacket ke koi activity na karein.',
      ] : [
        'Never board unregistered private taxis soliciting passengers directly at arrival gates.',
        'Avoid strenuous outdoor sightseeing in the intense mid-afternoon heat (12:30 PM - 3:30 PM).',
        'Do not compromise on safety gear or life jackets during adventure activities.',
      ],
      moneySavingHacks: isHinglish ? [
        'Flight booking Tuesday/Wednesday karein — average 15-20% sasti milti hai.',
        'Local dining ke liye beach/main road ke theek peeche wali lanes me jayein jahan 50% kam daam me better food milta hai.',
        'Shared group day-tours ya scooter rental se transport cost bachi rehti hai.'
      ] : [
        'Mid-week flights (Tuesday/Wednesday departures) consistently yield 15-20% savings.',
        'Eat at authentic restaurants situated one lane behind the tourist strip for superior quality at half price.',
        'Combine sightseeing spots by geographical clusters to avoid backtracking and excess cab fares.'
      ],
      localInsiderSecret: isHinglish 
        ? 'Subah 6:30 AM par sunrise viewpoint aur fish/flower market visit karein — yahan aapko bina kisi crowd ke asli local life dekhne ko milegi!'
        : 'Visit the local morning fisherman or flower docks at 6:30 AM for a truly authentic, crowd-free cultural spectacle and unbeatable morning light!'
    },
    packingList: [
      { id: 'p1', name: 'Government ID & Flight/Train Tickets', category: 'Documents', isChecked: false },
      { id: 'p2', name: 'Power Bank & Universal Travel Adapter', category: 'Tech', isChecked: false },
      { id: 'p3', name: 'Breathable Cotton Clothes & Light Jacket', category: 'Clothing', isChecked: false },
      { id: 'p4', name: 'Comfortable Walking Shoes & Flip-flops', category: 'Clothing', isChecked: false },
      { id: 'p5', name: 'Sunscreen (SPF 50+), Sunglasses & Hat', category: 'Essentials', isChecked: false },
      { id: 'p6', name: 'Basic First-Aid & Motion Sickness Meds', category: 'Health & Toiletries', isChecked: false },
      { id: 'p7', name: 'Reusable Water Bottle & Wet Wipes', category: 'Essentials', isChecked: false },
    ],
    foodRecommendations: [
      {
        name: isHinglish ? `${destination} Famous Local Speciality` : `${destination} Signature Delicacy`,
        description: 'Authentic local recipe passed down generations with rich regional spices.',
        type: 'veg',
        bestPlaceToTry: 'Old City Heritage Stalls',
        priceRange: '₹150 - ₹350 / $3 - $7',
      },
      {
        name: 'Street Food & Chaat / Snacks',
        description: 'Crispy, tangy, and flavorful street delicacies popular among locals.',
        type: 'veg',
        bestPlaceToTry: 'Night Market & Food Street',
        priceRange: '₹80 - ₹200 / $2 - $4',
      },
      {
        name: 'Traditional Coastal / Regional Curry',
        description: 'Cooked fresh with local herbs, coconut or aromatics, served with rice or fresh bread.',
        type: 'non-veg',
        bestPlaceToTry: 'Local Fisherman / Heritage Restaurant',
        priceRange: '₹300 - ₹700 / $6 - $12',
      },
    ],
    emergencyAndEtiquette: {
      emergencyNumbers: ['National Emergency: 112', 'Police: 100', 'Ambulance: 102', 'Tourist Helpline: 1363'],
      culturalTips: [
        'Dress modestly when visiting sacred places and temples; remove footwear at entry.',
        'Always ask permission before taking close-up portraits of locals or holy shrines.',
        'Keep emergency offline maps downloaded on your phone in case network drops in remote areas.',
      ],
      scamsToAvoid: [
        'Avoid unlicensed touts offering unrealistic discounts on hotel bookings or private boat tours.',
        'Always agree on meter or pre-negotiated fare before getting into unmetered cabs or autos.',
        'Be mindful of counterfeit gems or overly aggressive street vendors.',
      ],
    },
    createdAt: new Date().toISOString(),
  };
}

// 1. Generate Full Travel Plan
app.post('/api/generate-plan', async (req, res) => {
  try {
    const {
      destination,
      days = 3,
      budgetTier = 'moderate',
      travelerType = 'friends',
      vibes = [],
      language = 'en',
      currency = 'INR',
      startingCity,
      customNotes,
    } = req.body;

    if (!destination || typeof destination !== 'string') {
      return res.status(400).json({ error: 'Destination is required' });
    }

    const ai = getGenAI();

    if (!ai) {
      console.log('Using fallback travel plan generator (no Gemini API key)');
      const fallback = generateFallbackPlan(req.body);
      return res.json(fallback);
    }

    const isHinglish = language === 'hi_hinglish';
    const vibesList = Array.isArray(vibes) && vibes.length > 0 ? vibes.join(', ') : 'general sightseeing, culture, food, scenic spots';
    const originCity = startingCity || 'Delhi';

    const systemPrompt = `You are a world-class travel planner, route transit expert, and local insider guide. 
Your goal is to build an exceptionally realistic, immersive, highly actionable day-by-day travel itinerary with accurate time slots, realistic cost estimates in ${currency}, authentic local dishes, secret hidden gems, comprehensive transit comparison from origin to destination, and practical AI travel advice/hacks.
${isHinglish ? 'Language: Write explanations, descriptions, summaries, pro-tips, and advice in natural, engaging Hinglish (Hindi written in Roman English script), keeping location names, times, and key headings clear and readable.' : 'Language: Write in crisp, engaging, sophisticated English with rich descriptive flair.'}

Requirements:
- Plan exactly ${days} full days for "${destination}".
- Starting City / Origin: "${originCity}". Calculate realistic route transit options from "${originCity}" to "${destination}".
- Budget Tier: ${budgetTier} (ensure cost estimates, accommodation suggestions, transit mode costs, and dining match this budget category).
- Travelers: ${travelerType}.
- Preferred Vibes/Interests: ${vibesList}.
- Currency: ${currency}.
${customNotes ? `- Special Traveler Notes/Preferences: ${customNotes}.` : ''}

Key Modules to Provide in Response:
1. "routeTransit":
   - Compare realistic transit options (Flight, Train, Bus, Road trip) from "${originCity}" to "${destination}" with realistic cost in ${currency} per person, travel duration, pros/cons, departure/arrival hubs, and specific booking advice.
   - Specify the single best recommended travel mode and clear reasoning why.
   - Include realistic estimated transit total cost for the recommended travel mode.
   - Include scenic pitstops, highway dhabas, or railway highlights along this specific route.
   - Best time to book tickets advice.
2. "bikeTripGuide":
   - Detailed Motorcycle/Bike Expedition route and expense plan from "${originCity}" to "${destination}".
   - "recommendedBikeRoute": Name exact national highways, expressways, or scenic ghats (e.g. NH-48, NH-44, NH-21).
   - "roadConditionsAndTerrain": Describe asphalt quality, curves/ghats, road work, traffic density.
   - "totalDistanceKm": Accurate one-way driving/riding distance in km.
   - "recommendedDailyRidingKm": Safe daily riding limit (e.g. 350-450 km/day in daylight).
   - "recommendedRideDays": Number of riding days required to reach destination.
   - "intermediateNightStays": If journey is >400 km, list practical, safe night stops for bikers along the highway with town/city name, distance from origin, why to stay (safe bike parking, mechanics), hotel budget range, and famous highway dhaba food.
   - "petrolAndExpenses": Calculate exact petrol litres and costs at current prices (~₹100/L) assuming ~35 kmpl average mileage. Include total one-way and round-trip fuel cost, bike buffer for chain lube/oil, highway dhaba stays, total solo cost, and per person cost with a pillion (sharing fuel & room).
   - "essentialRiderGear": Essential motorcycle gear (helmet, jacket, puncture kit + inflator, chain lube, bungee cords, rain gear).
   - "bikePreparationTips" & "safetyAndPunctureAdvice": Pre-ride servicing checks and safe highway cruising advice.
3. "aiSmartAdvice":
   - Overall verdict on this trip.
   - 4-6 smart insider travel hacks (topTips).
   - Must-do things and critical things to avoid.
   - Specific money-saving hacks for this route & destination.
   - A special local insider secret.
4. "budget": Realistic breakdown of accommodation, foodDining, transport, activitiesTickets, miscellaneous, and totalEstimate in ${currency}.
5. "days": Day-by-day schedule with 3 to 4 distinct activity timeSlots per day (Morning, Afternoon, Evening, Night) with approximate time ranges, specific real location names, actionable transit tips, and approximate cost per activity in ${currency}.
6. "packingList": Comprehensive checklist customized for climate & activities.
7. "foodRecommendations": 3 to 5 must-try authentic food/drink recommendations with dietary classification (veg, non-veg, vegan, sweet, drink).
8. "emergencyAndEtiquette": Emergency contact numbers, cultural etiquette, and common tourist scams to avoid.`;

    const userPrompt = `Create a complete travel itinerary and journey route from "${originCity}" to "${destination}" for ${days} days with a ${budgetTier} budget for ${travelerType} interested in ${vibesList}.`;

    // Multi-model resilience: Try primary model, retry with backoff, then try backup models on 503/high-demand
    const modelsToTry = ['gemini-3.7-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let textOutput: string | null = null;
    let lastError: any = null;

    for (let attempt = 0; attempt < modelsToTry.length; attempt++) {
      const model = modelsToTry[attempt];
      try {
        const response = await ai.models.generateContent({
          model,
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            responseSchema: travelPlanSchema,
            temperature: 0.7,
          },
        });
        if (response.text) {
          textOutput = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} attempt ${attempt + 1} encountered: ${err?.message || err}.`);
        if (attempt < modelsToTry.length - 1) {
          // Exponential backoff wait before trying next model
          await new Promise((resolve) => setTimeout(resolve, 800 * (attempt + 1)));
        }
      }
    }

    if (!textOutput) {
      console.warn('AI generation unavailable across all models. Activating instant comprehensive travel engine fallback.', lastError);
      const fallback = generateFallbackPlan(req.body);
      return res.json(fallback);
    }

    const parsedPlan = JSON.parse(textOutput);
    parsedPlan.id = `plan-${Date.now()}`;
    parsedPlan.destination = destination;
    parsedPlan.startingCity = originCity;
    parsedPlan.startDate = req.body.startDate || new Date().toISOString().split('T')[0];
    parsedPlan.daysCount = Number(days);
    parsedPlan.budgetTier = budgetTier;
    parsedPlan.travelerType = travelerType;
    parsedPlan.vibes = vibes;
    parsedPlan.language = language;
    parsedPlan.createdAt = new Date().toISOString();

    // Ensure IDs exist for packing list & activities
    if (parsedPlan.packingList && Array.isArray(parsedPlan.packingList)) {
      parsedPlan.packingList = parsedPlan.packingList.map((item: any, idx: number) => ({
        ...item,
        id: item.id || `pack-${idx + 1}`,
        isChecked: !!item.isChecked,
      }));
    }

    if (parsedPlan.days && Array.isArray(parsedPlan.days)) {
      parsedPlan.days = parsedPlan.days.map((day: any, dIdx: number) => ({
        ...day,
        activities: (day.activities || []).map((act: any, aIdx: number) => ({
          ...act,
          id: act.id || `d${dIdx + 1}-act-${aIdx + 1}`,
          isCompleted: false,
        })),
      }));
    }

    return res.json(parsedPlan);
  } catch (error: any) {
    console.error('Error generating travel plan:', error);
    // Fallback to high quality mock if error occurred
    const fallback = generateFallbackPlan(req.body);
    return res.json(fallback);
  }
});

// 2. Interactive Travel Concierge / Chat Assistant
app.post('/api/ask-concierge', async (req, res) => {
  try {
    const { destination, question, planContext, history = [], language = 'en' } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const ai = getGenAI();
    const isHinglish = language === 'hi_hinglish';

    if (!ai) {
      return res.json({
        reply: isHinglish 
          ? `Aapka sawaal "${question}" ke baare me: ${destination} me travel karte waqt hamesha local timings aur peak rush check karein. Agar aapko aur specific recommendations chahiye toh poochhein!`
          : `Regarding "${question}" for ${destination || 'your trip'}: It is recommended to check local timings and carry light currency notes. Feel free to ask about specific restaurants, rental options, or photography spots!`,
      });
    }

    const systemInstruction = `You are a knowledgeable local travel concierge and guide for ${destination || 'travelers'}. 
You have extensive local insider knowledge on transport, food, hidden spots, budget saving tricks, safety, weather, scooter/car rentals, and cultural norms.
${isHinglish ? 'Respond in warm, friendly, natural Hinglish (Hindi written in Roman script).' : 'Respond in helpful, concise, warm English with bullet points where appropriate.'}
${planContext ? `Context about current traveler itinerary: ${JSON.stringify(planContext).slice(0, 1500)}` : ''}
Keep your answer clear, actionable, friendly, and under 250 words.`;

    const chatHistory = history.map((h: any) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }],
    }));

    const modelsToTry = ['gemini-3.7-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let replyText = '';

    for (let attempt = 0; attempt < modelsToTry.length; attempt++) {
      const model = modelsToTry[attempt];
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            ...chatHistory,
            {
              role: 'user',
              parts: [{ text: question }],
            },
          ],
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
        if (response.text) {
          replyText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Concierge attempt ${attempt + 1} with ${model} encountered: ${err?.message || err}`);
        if (attempt < modelsToTry.length - 1) {
          await new Promise((res) => setTimeout(res, 500));
        }
      }
    }

    if (!replyText) {
      replyText = isHinglish
        ? `${destination || 'Aapki trip'} ke baare me: Local timing, seasonal weather aur peak crowd hours check karke plan karein. Agar specific recommendations chahiye toh poochhein!`
        : `For ${destination || 'your trip'}: It is recommended to check local timings and carry light currency notes. Feel free to ask more!`;
    }

    return res.json({ reply: replyText });
  } catch (error: any) {
    console.error('Error in concierge chat:', error);
    return res.json({
      reply: req.body.language === 'hi_hinglish'
        ? 'Aapka sawaal note kar liya gaya hai. Local timings check karein aur trip enjoy karein!'
        : 'Please feel free to ask again or check local guidelines.',
    });
  }
});

// 3. Customize/Tweak a Specific Day Plan
app.post('/api/customize-day', async (req, res) => {
  try {
    const { destination, dayNumber, currentDayPlan, tweakInstruction, language = 'en', currency = 'INR' } = req.body;
    
    if (!tweakInstruction || !currentDayPlan) {
      return res.status(400).json({ error: 'Instruction and current plan are required' });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.json({
        ...currentDayPlan,
        summary: `${currentDayPlan.summary} (Updated: ${tweakInstruction})`,
      });
    }

    const isHinglish = language === 'hi_hinglish';
    const daySchema = {
      type: Type.OBJECT,
      properties: {
        dayNumber: { type: Type.INTEGER },
        title: { type: Type.STRING },
        theme: { type: Type.STRING },
        summary: { type: Type.STRING },
        activities: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              timeSlot: { type: Type.STRING },
              timeRange: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              locationName: { type: Type.STRING },
              approxDuration: { type: Type.STRING },
              approxCost: { type: Type.NUMBER },
              costCurrency: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              transportTip: { type: Type.STRING },
              mapQuery: { type: Type.STRING },
            },
            required: ['id', 'timeSlot', 'title', 'description', 'locationName'],
          },
        },
        meals: {
          type: Type.OBJECT,
          properties: {
            breakfast: { type: Type.STRING },
            lunch: { type: Type.STRING },
            dinner: { type: Type.STRING },
          },
        },
        localProTip: { type: Type.STRING },
      },
      required: ['dayNumber', 'title', 'theme', 'summary', 'activities'],
    };

    const prompt = `Modify Day ${dayNumber} for ${destination} based on user instruction: "${tweakInstruction}".
Current Day Plan: ${JSON.stringify(currentDayPlan)}
Currency: ${currency}
${isHinglish ? 'Language: Hinglish' : 'Language: English'}
Return the modified day plan maintaining realistic timings and engaging details.`;

    const modelsToTry = ['gemini-3.7-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let modifiedDay: any = null;

    for (let attempt = 0; attempt < modelsToTry.length; attempt++) {
      const model = modelsToTry[attempt];
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: daySchema,
            temperature: 0.7,
          },
        });
        if (response.text) {
          modifiedDay = JSON.parse(response.text);
          break;
        }
      } catch (err: any) {
        console.warn(`Day tweak attempt ${attempt + 1} with ${model} encountered: ${err?.message || err}`);
        if (attempt < modelsToTry.length - 1) {
          await new Promise((res) => setTimeout(res, 500));
        }
      }
    }

    if (!modifiedDay) {
      // Fallback: apply note to current day plan
      modifiedDay = {
        ...currentDayPlan,
        summary: `${currentDayPlan.summary} (${tweakInstruction})`,
      };
    }

    return res.json(modifiedDay);
  } catch (error: any) {
    console.error('Error customizing day:', error);
    return res.json(req.body.currentDayPlan || { error: 'Failed to customize day' });
  }
});

// Vite Middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  startServerOnPort(DEFAULT_PORT);
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;