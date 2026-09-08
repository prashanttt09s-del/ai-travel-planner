import React, { useState } from 'react';
import {
  Bike,
  Fuel,
  Compass,
  MapPin,
  ShieldAlert,
  Wrench,
  Moon,
  Utensils,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Users,
  User,
  ArrowRight,
  Zap,
  Info,
  CalendarDays,
  Gauge,
  Check,
  RefreshCw,
  TrendingDown
} from 'lucide-react';
import { BikeTripGuide, SupportedLanguage, CurrencyCode } from '../types';

interface BikeTourSectionProps {
  bikeGuide?: BikeTripGuide;
  origin: string;
  destination: string;
  language: SupportedLanguage;
  currency: CurrencyCode;
}

export const BikeTourSection: React.FC<BikeTourSectionProps> = ({
  bikeGuide,
  origin,
  destination,
  language,
  currency,
}) => {
  const isHinglish = language === 'hi_hinglish';

  // Fallback defaults if bikeGuide isn't present
  const baseDistance = bikeGuide?.totalDistanceKm || 650;
  const initialMileage = bikeGuide?.petrolAndExpenses?.defaultMileageKmpl || 32;

  // Interactive Live Calculator States
  const [tripDirection, setTripDirection] = useState<'one_way' | 'round_trip'>('round_trip');
  const [mileage, setMileage] = useState<number>(initialMileage);
  const [fuelPrice, setFuelPrice] = useState<number>(currency === 'INR' ? 100 : 1.25);
  const [ridersCount, setRidersCount] = useState<1 | 2>(1); // 1 = Solo, 2 = Rider + Pillion
  const [stayPerNightCost, setStayPerNightCost] = useState<number>(currency === 'INR' ? 1500 : 30);
  const [foodPerDayCost, setFoodPerDayCost] = useState<number>(currency === 'INR' ? 700 : 15);

  // Dynamic calculations based on state
  const effectiveDistance = tripDirection === 'round_trip' ? baseDistance * 2 : baseDistance;
  const litresNeeded = Number((effectiveDistance / Math.max(mileage, 10)).toFixed(1));
  const totalFuelCost = Math.round(litresNeeded * fuelPrice);
  
  const estimatedRideDays = Math.max(1, Math.ceil(baseDistance / (bikeGuide?.recommendedDailyRidingKm || 400)));
  const totalTripRideDays = tripDirection === 'round_trip' ? estimatedRideDays * 2 : estimatedRideDays;
  const totalNightsOnRoad = Math.max(0, totalTripRideDays - (tripDirection === 'round_trip' ? 2 : 1));

  // Hotel rooms needed (1 room shared whether 1 or 2 riders)
  const totalStayCost = totalNightsOnRoad * stayPerNightCost;
  const totalFoodCost = totalTripRideDays * foodPerDayCost * ridersCount;
  const maintenanceBuffer = currency === 'INR' ? (tripDirection === 'round_trip' ? 1500 : 800) : (tripDirection === 'round_trip' ? 30 : 15);

  // Grand Total for the bike journey (Fuel + Stay + Food + Maintenance)
  const grandTotalCost = totalFuelCost + totalStayCost + totalFoodCost + maintenanceBuffer;
  
  // Per Person Cost (Per Admi Kharcha)
  // When 2 people (Rider + Pillion), fuel, hotel room, and bike maintenance are split equally! Food is per person.
  const costPerPerson = Math.round(grandTotalCost / ridersCount);

  // Mileage presets for quick picking
  const bikePresets = [
    { label: 'Commuter (125-160cc)', sub: 'Pulsar / FZ / Raider', kmpl: 45, icon: '🛵' },
    { label: 'Tourer / Royal Enfield (350-400cc)', sub: 'Classic / Himalayan / Dominar / Scrambler', kmpl: 32, icon: '🏍️' },
    { label: 'Twin / Superbike (650cc+)', sub: 'Interceptor / Ninja / ADV 800', kmpl: 20, icon: '🚀' },
  ];

  return (
    <div id="bike-tour-section" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-black uppercase tracking-wider flex items-center space-x-1.5">
              <Bike className="w-3.5 h-3.5" />
              <span>{isHinglish ? 'Biker Expedition Mode' : 'Motorcycle Tour & Petrol Guide'}</span>
            </span>

            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold">
              {bikeGuide?.difficultyLevel || 'Moderate Scenic Highway'}
            </span>

            <span className="px-2.5 py-1 bg-white/10 text-slate-300 rounded-full text-xs font-semibold">
              {baseDistance} km (One-Way)
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center space-x-2">
            <span>{origin}</span>
            <ArrowRight className="w-6 h-6 text-amber-400 shrink-0" />
            <span>{destination}</span>
            <span className="text-amber-400 ml-1 text-xl sm:text-2xl">🏍️ Ride Plan</span>
          </h2>

          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            {isHinglish
              ? `${origin} se ${destination} tak bike se jane ke liye safest & scenic route, raste me kahan kahan night stay karna sahi rahega, live petrol kharcha calculator aur per-person total budget ka complete roadmap.`
              : `Complete motorcycle touring guide from ${origin} to ${destination}: best safe & scenic highway route, recommended en-route night stops, dynamic fuel & stay calculator, and per-person cost breakdown.`}
          </p>
        </div>
      </div>

      {/* SECTION 1: Interactive Live Petrol & Trip Cost Calculator */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <Fuel className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-black text-slate-900">
                {isHinglish ? 'Live Petrol & Total Kharcha Calculator' : 'Interactive Bike & Fuel Expense Calculator'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isHinglish
                ? 'Apni bike ka mileage, petrol rate aur travelers select karein — total aur per person kharcha live update hoga.'
                : 'Select your bike category, fuel price, and travelers — total and per-person costs update instantly.'}
            </p>
          </div>

          {/* One-Way vs Round-Trip Selector */}
          <div className="inline-flex bg-slate-100 p-1 rounded-2xl shrink-0 self-start sm:self-auto border border-slate-200">
            <button
              onClick={() => setTripDirection('one_way')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tripDirection === 'one_way'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isHinglish ? 'One-Way (Ek Taraf)' : 'One-Way'}
            </button>
            <button
              onClick={() => setTripDirection('round_trip')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                tripDirection === 'round_trip'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <RefreshCw className="w-3 h-3" />
              <span>{isHinglish ? 'Round-Trip (Aana + Jaana)' : 'Round-Trip 🔄'}</span>
            </button>
          </div>
        </div>

        {/* Input Parameters Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Bike Category & Mileage Preset */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Gauge className="w-4 h-4 text-slate-500" />
                <span>{isHinglish ? 'Bike Model / Mileage (km/L)' : 'Bike Engine & Mileage'}</span>
              </span>
              <span className="text-amber-700 font-extrabold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                {mileage} km/L
              </span>
            </label>

            <div className="space-y-2">
              {bikePresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setMileage(preset.kmpl)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                    mileage === preset.kmpl
                      ? 'bg-amber-50/70 border-amber-500 text-amber-950 font-bold shadow-2xs'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-lg">{preset.icon}</span>
                    <div>
                      <div className="text-xs font-bold leading-tight">{preset.label}</div>
                      <div className="text-[10px] text-slate-500">{preset.sub}</div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-amber-700 shrink-0 ml-2">
                    ~{preset.kmpl} kmpl
                  </span>
                </button>
              ))}
            </div>

            {/* Custom Mileage Slider */}
            <div className="pt-1">
              <div className="flex justify-between text-[10px] text-slate-500 font-semibold mb-1">
                <span>Heavy/Superbike (15 km/L)</span>
                <span>Commuter (60 km/L)</span>
              </div>
              <input
                type="range"
                min={15}
                max={60}
                value={mileage}
                onChange={(e) => setMileage(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
            </div>
          </div>

          {/* Column 2: Riders & Costs */}
          <div className="space-y-4">
            {/* Solo vs Pillion Toggle */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                {isHinglish ? 'Kitne Log Hain? (Traveler Setup)' : 'Travelers Setup'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setRidersCount(1)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    ridersCount === 1
                      ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold shadow-2xs'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <User className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-bold">{isHinglish ? 'Solo Rider' : 'Solo Rider'}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">1 Bike, 1 Person (100% solo cost)</div>
                </button>

                <button
                  onClick={() => setRidersCount(2)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    ridersCount === 2
                      ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold shadow-2xs'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <Users className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-bold">{isHinglish ? 'Rider + Pillion' : 'With Pillion'}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">{isHinglish ? '2 Log (Petrol & Room 50-50 split)' : '2 Persons (Fuel & Hotel split)'}</div>
                </button>
              </div>
            </div>

            {/* Petrol Rate Input */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isHinglish ? 'Petrol Rate (per Litre)' : 'Fuel Price / Litre'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">
                    {currency === 'INR' ? '₹' : '$'}
                  </span>
                  <input
                    type="number"
                    value={fuelPrice}
                    onChange={(e) => setFuelPrice(Math.max(1, Number(e.target.value)))}
                    className="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isHinglish ? 'Hotel Stay / Night' : 'Night Stay / Room'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">
                    {currency === 'INR' ? '₹' : '$'}
                  </span>
                  <input
                    type="number"
                    value={stayPerNightCost}
                    onChange={(e) => setStayPerNightCost(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Toll Tax Exemption Note */}
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-2 text-[11px] text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Highway Toll FREE:</span>{' '}
                {bikeGuide?.petrolAndExpenses?.tollNote || 'National Highways in India are completely toll tax-free for 2-wheelers!'}
              </div>
            </div>
          </div>

          {/* Column 3: Live Output Breakdown & Per Person Highlight */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>{isHinglish ? 'Estimated Total Expense' : 'Total Expense Summary'}</span>
                <span className="text-slate-400 font-normal lowercase">({tripDirection.replace('_', ' ')})</span>
              </div>

              {/* Mini line item breakdown */}
              <div className="space-y-1.5 text-xs text-slate-300 border-b border-slate-800 pb-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Distance:</span>
                  <span className="font-bold text-white">{effectiveDistance} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Petrol Required:</span>
                  <span className="font-bold text-amber-300">{litresNeeded} Litres</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Fuel Cost:</span>
                  <span className="font-bold text-white">{currency === 'INR' ? '₹' : '$'}{totalFuelCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Highway Stays ({totalNightsOnRoad} nights):</span>
                  <span className="font-bold text-white">{currency === 'INR' ? '₹' : '$'}{totalStayCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dhaba Food & Chai ({totalTripRideDays} days):</span>
                  <span className="font-bold text-white">{currency === 'INR' ? '₹' : '$'}{totalFoodCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Chain Lube & Bike Buffer:</span>
                  <span className="font-bold text-white">{currency === 'INR' ? '₹' : '$'}{maintenanceBuffer.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 text-xs">
                <span className="text-slate-300 font-semibold">{isHinglish ? 'Total Trip Kharcha (Combined):' : 'Grand Total (Whole Bike):'}</span>
                <span className="text-base font-black text-white">
                  {currency === 'INR' ? '₹' : '$'}{grandTotalCost.toLocaleString()}
                </span>
              </div>
            </div>

            {/* PER PERSON / PER ADMI KHARCHA HIGHLIGHT BOX */}
            <div className="bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-400/40 rounded-xl p-3.5 text-center">
              <div className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider">
                {isHinglish ? '★ PER ADMI KHARCHA (PER PERSON) ★' : '★ PER PERSON ESTIMATED COST ★'}
              </div>
              <div className="text-2xl font-black text-emerald-400 tracking-tight my-0.5">
                {currency === 'INR' ? '₹' : '$'}{costPerPerson.toLocaleString()}
                <span className="text-xs font-bold text-slate-300 ml-1.5">
                  / {isHinglish ? 'person' : 'person'}
                </span>
              </div>
              <div className="text-[10px] text-slate-300">
                {ridersCount === 2
                  ? isHinglish
                    ? '2 log sath hone par petrol aur room 50% share ho jata hai!'
                    : 'With a pillion, fuel, room & bike buffer are split 50-50!'
                  : isHinglish
                    ? 'Solo ride me poora kharcha 1 rider ka hai'
                    : '100% cost calculated for solo rider'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Recommended Bike Route & Highway Info */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center space-x-2">
          <Compass className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-black text-slate-900">
            {isHinglish ? 'Best Safe & Scenic Bike Route' : 'Recommended Highway & Scenic Route'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Recommended Corridor</div>
            <div className="text-sm font-extrabold text-slate-900">
              {bikeGuide?.recommendedBikeRoute || `${origin} ➔ National Highway Corridor ➔ ${destination}`}
            </div>
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Highways:</span> {bikeGuide?.highwayNames || 'NH-48 / NH-44 / Expressways'}
            </div>
            <div className="text-xs text-slate-600 leading-relaxed pt-1">
              {bikeGuide?.roadConditionsAndTerrain || 'Good quality 4-lane tarmac with periodic food plazas and fuel points.'}
            </div>
          </div>

          <div className="p-4 bg-amber-50/50 border border-amber-200/70 rounded-2xl space-y-2">
            <div className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>{isHinglish ? 'Rider Safety & Daylight Timing' : 'Daylight Riding Window & Distance'}</span>
            </div>
            <div className="text-sm font-bold text-amber-950">
              {bikeGuide?.safeRidingWindow || '06:00 AM - 05:30 PM (No night highway riding)'}
            </div>
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">{isHinglish ? 'Daily Ride Limit:' : 'Daily Limit:'}</span>{' '}
              {bikeGuide?.recommendedDailyRidingKm || 400} km/day (Takes ~{estimatedRideDays} {estimatedRideDays === 1 ? 'day' : 'days'} one-way ride).
            </div>
            <div className="text-[11px] text-amber-800 pt-1">
              {bikeGuide?.safetyAndPunctureAdvice || 'Take a 15-min tea break every 150 km. Cruise at 80-95 km/h.'}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: En-Route Long Distance Night Stays (Safar lamba ho to kahan kahan stay karein) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Moon className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {isHinglish
                  ? 'En-Route Safe Night Stays (Raste me Kahan Stay Karein?)'
                  : 'En-Route Recommended Night Stays & Highway Pitstops'}
              </h3>
              <p className="text-xs text-slate-500">
                {isHinglish
                  ? 'Lamba safar hone par bike safety, covered parking aur acche dhabon ke sath recommended night stops.'
                  : 'Curated overnight highway halts with secure bike parking, mechanic hubs, and famous dhaba meals.'}
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-bold">
            {bikeGuide?.intermediateNightStays?.length || 2} Night Stops
          </span>
        </div>

        {bikeGuide?.intermediateNightStays && bikeGuide.intermediateNightStays.length > 0 ? (
          <div className="space-y-4">
            {bikeGuide.intermediateNightStays.map((stop, idx) => (
              <div
                key={stop.stopNumber || idx}
                className="p-5 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/70 hover:shadow-xs transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                      {stop.stopNumber || idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{stop.cityOrTown}</h4>
                      <div className="text-[11px] text-slate-500 font-semibold">{stop.dayLabel}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-bold">
                      ~{stop.distanceFromStartKm} km from {origin}
                    </span>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold">
                      Stay: {stop.hotelBudgetRange}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Why stay here */}
                  <div className="p-3 bg-white rounded-xl border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Why Stay Here & Biker Safety</div>
                    <div className="text-slate-700 font-medium leading-relaxed">{stop.whyStayHere}</div>
                  </div>

                  {/* Dhaba / Food */}
                  <div className="p-3 bg-white rounded-xl border border-slate-100">
                    <div className="text-[10px] font-bold text-amber-600 uppercase mb-1 flex items-center space-x-1">
                      <Utensils className="w-3 h-3" />
                      <span>Famous Dhaba & Food</span>
                    </div>
                    <div className="text-slate-700 font-medium leading-relaxed">{stop.recommendedDhabasOrFood}</div>
                  </div>

                  {/* Bike Amenities */}
                  <div className="p-3 bg-white rounded-xl border border-slate-100">
                    <div className="text-[10px] font-bold text-indigo-600 uppercase mb-1 flex items-center space-x-1">
                      <Wrench className="w-3 h-3" />
                      <span>Bike Care & Amenities</span>
                    </div>
                    <div className="text-slate-700 font-medium leading-relaxed">
                      {stop.bikeSafetyAndAmenities || 'Secure parking, tyre puncture shop & fuel pump within 1 km.'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-600">
            {baseDistance < 400
              ? isHinglish
                ? `Kyunki ${origin} se ${destination} ki doori lagbhag ${baseDistance} km hai, yeh ek hi din me 6-8 ghante me cover ho sakta hai. Raste me 1-2 dhabon par chai/lunch break kafi rahega!`
                : `Since the one-way distance is only ~${baseDistance} km, it can be comfortably completed in a single day ride (6-8 hours) with regular chai & lunch breaks.`
              : 'En-route night stops will be generated based on highway route.'}
          </div>
        )}
      </div>

      {/* SECTION 4: Essential Rider Gear & Pre-Ride Bike Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rider Gear Checklist */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-emerald-600" />
            <h4 className="text-base font-black text-slate-900">
              {isHinglish ? 'Rider Safety Gear Checklist' : 'Essential Rider Safety Gear'}
            </h4>
          </div>

          <div className="space-y-2 text-xs">
            {(bikeGuide?.essentialRiderGear || [
              'ECE / DOT / ISI Full-Face Helmet (with anti-fog pinlock visor)',
              'Armored Riding Jacket & Knee Guards (CE Level 2 protection)',
              'Touch-screen compatible Riding Gloves & High-ankle Riding Boots',
              'Tubeless Tyre Puncture Kit + Portable Electric Air Inflator',
              'Motorcycle Chain Lube Spray & Cleaner (apply every 400-500 km)',
              'Waterproof Saddlebags / Tail Bag secured with heavy-duty Bungee Cords',
              'Handlebar Phone Mount with Vibration Dampener & Fast USB Charger',
              'Compact Rain Gear / Raincoat & 2L Hydration Backpack',
            ]).map((gear, idx) => (
              <div key={idx} className="flex items-start space-x-2.5 p-2 rounded-xl bg-slate-50 text-slate-700 font-medium">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{gear}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bike Preparation & Pre-Ride Servicing */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-amber-600" />
            <h4 className="text-base font-black text-slate-900">
              {isHinglish ? 'Bike Preparation & Document Tips' : 'Bike Servicing & Document Checklist'}
            </h4>
          </div>

          <div className="space-y-2 text-xs">
            {(bikeGuide?.bikePreparationTips || [
              'Full service 4-5 days before trip: Engine oil change, brake pads inspection, spark plug check.',
              'Check tyre tread depth and keep cold tyre pressure at recommended PSI (29 Front, 33 Rear Solo / 36 Pillion).',
              'Carry physical + digital DigiLocker copies of RC, Valid Insurance, PUC (Pollution Certificate) & Driving License.',
              'Keep a spare master key, basic tool kit, fuse set, and clutch cable in your saddlebag.',
            ]).map((tip, idx) => (
              <div key={idx} className="flex items-start space-x-2.5 p-2 rounded-xl bg-amber-50/50 text-amber-950 font-medium border border-amber-200/50">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{tip}</span>
              </div>
            ))}

            <div className="p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] leading-relaxed">
              <span className="font-bold text-amber-400">Pro Biker Tip:</span>{' '}
              {isHinglish
                ? 'Hamesha subah 06:00 AM ride shuru karein taaki 12:00 PM tak aap aada rasta cover kar lein aur shaam 05:30 PM tak hotel check-in kar sakein.'
                : 'Always hit the highway at 06:00 AM to cover 60% of daily distance before noon and comfortably check into your stay by 05:30 PM.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
