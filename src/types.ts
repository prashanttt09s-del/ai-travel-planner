export type BudgetTier = 'budget' | 'moderate' | 'luxury';
export type TravelerType = 'solo' | 'couple' | 'friends' | 'family';
export type TravelVibe = 
  | 'adventure'
  | 'biking'
  | 'road_trip'
  | 'beaches'
  | 'culture'
  | 'foodie'
  | 'nature'
  | 'nightlife'
  | 'photography'
  | 'relaxed'
  | 'shopping';

export type SupportedLanguage = 'en' | 'hi_hinglish';
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'THB';

export interface TravelPlanRequest {
  destination: string;
  days: number;
  budgetTier: BudgetTier;
  travelerType: TravelerType;
  vibes: TravelVibe[];
  language: SupportedLanguage;
  currency: CurrencyCode;
  startingCity?: string;
  startDate?: string;
  customNotes?: string;
}

export interface Activity {
  id: string;
  timeSlot: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  timeRange?: string;
  title: string;
  description: string;
  locationName: string;
  approxDuration?: string;
  approxCost?: number;
  costCurrency?: string;
  tags?: string[];
  transportTip?: string;
  mapQuery?: string;
  isCompleted?: boolean;
}

export interface DayPlan {
  dayNumber: number;
  title: string;
  theme: string;
  summary: string;
  activities: Activity[];
  meals?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  localProTip?: string;
}

export interface BudgetEstimate {
  currency: CurrencyCode;
  accommodation: number;
  foodDining: number;
  transport: number;
  activitiesTickets: number;
  miscellaneous: number;
  totalEstimate: number;
  budgetAdvice: string;
}

export interface PackingItem {
  id: string;
  name: string;
  category: 'Essentials' | 'Clothing' | 'Tech' | 'Health & Toiletries' | 'Documents';
  isChecked: boolean;
}

export interface FoodRecommendation {
  name: string;
  description: string;
  type: 'veg' | 'non-veg' | 'vegan' | 'sweet' | 'drink';
  bestPlaceToTry?: string;
  priceRange: string;
}

export interface EmergencyAndEtiquette {
  emergencyNumbers: string[];
  culturalTips: string[];
  scamsToAvoid: string[];
}

export interface TransitOption {
  mode: 'flight' | 'train' | 'bus' | 'road_trip';
  title: string;
  duration: string;
  approxCostPerPerson: number;
  costCurrency?: string;
  summary: string;
  isRecommended?: boolean;
  bookingTip: string;
  departureHub?: string;
  arrivalHub?: string;
}

export interface BikeNightStay {
  stopNumber: number;
  dayLabel: string;
  cityOrTown: string;
  distanceFromStartKm: number;
  legDistanceKm: number;
  whyStayHere: string;
  hotelBudgetRange: string;
  recommendedDhabasOrFood: string;
  bikeSafetyAndAmenities: string;
}

export interface BikeExpenseCalculator {
  totalDistanceKm: number;
  defaultMileageKmpl: number;
  fuelPricePerLitre: number;
  fuelLitresOneWay: number;
  fuelCostOneWay: number;
  fuelCostRoundTrip: number;
  bikeMaintenanceBuffer: number;
  tollNote: string;
  estimatedStaysAndFoodCost: number;
  totalTripCostSolo: number;
  costPerPersonWithPillion: number;
}

export interface BikeTripGuide {
  isSuitableForBiking: boolean;
  recommendedBikeRoute: string;
  alternativeScenicRoute?: string;
  highwayNames: string;
  roadConditionsAndTerrain: string;
  difficultyLevel: 'Easy & Smooth Highway' | 'Moderate Scenic Ride' | 'Challenging Ghats & Curves' | 'High Altitude Expedition';
  totalDistanceKm: number;
  recommendedDailyRidingKm: number;
  recommendedRideDays: number;
  safeRidingWindow: string;
  intermediateNightStays: BikeNightStay[];
  petrolAndExpenses: BikeExpenseCalculator;
  essentialRiderGear: string[];
  bikePreparationTips: string[];
  safetyAndPunctureAdvice: string;
}

export interface RouteTransitInfo {
  origin: string;
  destination: string;
  distanceEstimate?: string;
  bestTravelMode: string;
  recommendedModeReason: string;
  transitOptions: TransitOption[];
  pitstopsOrScenicHighlights?: string[];
  bestTimeToBookAdvice: string;
  estimatedTransitTotal: number;
}

export interface AISmartAdvice {
  overallVerdict: string;
  topTips: string[];
  thingsToDo: string[];
  thingsToAvoid: string[];
  moneySavingHacks: string[];
  localInsiderSecret: string;
}

export interface WeatherForecastDay {
  dayIndex: number;
  dateString: string;
  dayName: string;
  condition: 'Sunny' | 'Partly Cloudy' | 'Rainy' | 'Thunderstorm' | 'Cloudy' | 'Clear & Pleasant' | 'Snow / Misty';
  tempMaxC: number;
  tempMinC: number;
  rainChancePercent: number;
  humidityPercent: number;
  windSpeedKmh: number;
  uvIndex: number;
  recommendation: string;
}

export interface DestinationWeather {
  destination: string;
  currentTempC: number;
  currentCondition: string;
  weatherSummary: string;
  bestVisitingSeason: string;
  travelPackingWeatherTip: string;
  forecast5Days: WeatherForecastDay[];
}

export interface TravelPlan {
  id: string;
  destination: string;
  startingCity?: string;
  startDate?: string;
  country?: string;
  tagline: string;
  summary: string;
  daysCount: number;
  budgetTier: BudgetTier;
  travelerType: TravelerType;
  vibes: TravelVibe[];
  language: SupportedLanguage;
  bestTimeToVisit: string;
  weatherSummary: string;
  weatherForecast?: DestinationWeather;
  days: DayPlan[];
  budget: BudgetEstimate;
  routeTransit?: RouteTransitInfo;
  bikeTripGuide?: BikeTripGuide;
  aiSmartAdvice?: AISmartAdvice;
  packingList: PackingItem[];
  foodRecommendations: FoodRecommendation[];
  emergencyAndEtiquette: EmergencyAndEtiquette;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
