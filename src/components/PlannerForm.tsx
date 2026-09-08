import React, { useState } from 'react';
import { 
  Compass, 
  Calendar, 
  Wallet, 
  Users, 
  Sparkles, 
  MapPin, 
  ChevronRight, 
  Palmtree, 
  Mountain, 
  Landmark, 
  Utensils, 
  Trees, 
  Moon, 
  Camera, 
  Heart, 
  ShoppingBag,
  SlidersHorizontal,
  ArrowRightLeft,
  Navigation,
  Bike
} from 'lucide-react';
import { 
  TravelPlanRequest, 
  BudgetTier, 
  TravelerType, 
  TravelVibe, 
  SupportedLanguage, 
  CurrencyCode 
} from '../types';

interface PlannerFormProps {
  onGenerate: (request: TravelPlanRequest) => void;
  isLoading: boolean;
  language: SupportedLanguage;
  currency: CurrencyCode;
}

const POPULAR_ORIGINS = [
  'Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Hyderabad', 'Pune', 'Chennai', 'Ahmedabad'
];

const POPULAR_DESTINATIONS = [
  { name: 'Goa', country: 'India', tag: 'Beaches & Nightlife', icon: '🏖️' },
  { name: 'Manali & Kasol', country: 'India', tag: 'Mountains & Treks', icon: '🏔️' },
  { name: 'Ladakh & Spiti', country: 'India', tag: 'Ultimate Bike Expedition', icon: '🏍️' },
  { name: 'Paris', country: 'France', tag: 'Romance & Art', icon: '🗼' },
  { name: 'Bali', country: 'Indonesia', tag: 'Tropical & Culture', icon: '🌺' },
  { name: 'Dubai', country: 'UAE', tag: 'Modern Luxury', icon: '🏙️' },
  { name: 'Jaipur & Udaipur', country: 'India', tag: 'Royal Heritage', icon: '🏰' },
  { name: 'Tokyo & Kyoto', country: 'Japan', tag: 'Culture & Tech', icon: '⛩️' },
  { name: 'Switzerland', country: 'Europe', tag: 'Scenic Alps', icon: '❄️' },
  { name: 'Kerala', country: 'India', tag: 'Backwaters & Nature', icon: '🌴' },
  { name: 'Bangkok & Phuket', country: 'Thailand', tag: 'Street Food & Islands', icon: '🍜' },
  { name: 'Rome & Amalfi', country: 'Italy', tag: 'History & Coast', icon: '🏛️' },
];

const VIBE_OPTIONS: { id: TravelVibe; labelEn: string; labelHi: string; icon: React.ReactNode }[] = [
  { id: 'biking', labelEn: '🏍️ Bike Tour & Petrol Plan', labelHi: '🏍️ Bike Ride & Petrol Plan', icon: <Bike className="w-4 h-4 text-amber-600" /> },
  { id: 'beaches', labelEn: 'Beaches & Ocean', labelHi: 'Beach & Chill', icon: <Palmtree className="w-4 h-4" /> },
  { id: 'adventure', labelEn: 'Adventure & Treks', labelHi: 'Adventure & Treks', icon: <Mountain className="w-4 h-4" /> },
  { id: 'culture', labelEn: 'Culture & Heritage', labelHi: 'Culture & Heritage', icon: <Landmark className="w-4 h-4" /> },
  { id: 'foodie', labelEn: 'Foodie & Street Food', labelHi: 'Foodie & Zayka', icon: <Utensils className="w-4 h-4" /> },
  { id: 'nature', labelEn: 'Nature & Wildlife', labelHi: 'Nature & Scenery', icon: <Trees className="w-4 h-4" /> },
  { id: 'nightlife', labelEn: 'Nightlife & Clubs', labelHi: 'Nightlife & Parties', icon: <Moon className="w-4 h-4" /> },
  { id: 'photography', labelEn: 'Photography & Views', labelHi: 'Photo Spots', icon: <Camera className="w-4 h-4" /> },
  { id: 'relaxed', labelEn: 'Relaxation & Spa', labelHi: 'Peace & Relaxation', icon: <Heart className="w-4 h-4" /> },
  { id: 'shopping', labelEn: 'Shopping & Bazaars', labelHi: 'Shopping & Bazaars', icon: <ShoppingBag className="w-4 h-4" /> },
];

const FUN_LOADING_FACTS = [
  'Calculating best routes, direct flights, superfast trains and driving times...',
  'Calculating motorcycle petrol costs, safe en-route night stays & highway dhabas...',
  'Curating realistic travel costs & budgeting breakdowns for your route...',
  'Compiling AI smart hacks, secret insider tips, and things to avoid...',
  'Checking seasonal weather tips and packing requirements...',
  'Finding authentic local food spots and iconic hidden gem viewpoints...',
];

export const PlannerForm: React.FC<PlannerFormProps> = ({
  onGenerate,
  isLoading,
  language,
  currency,
}) => {
  const isHinglish = language === 'hi_hinglish';

  const [startingCity, setStartingCity] = useState('Delhi');
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(4);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('moderate');
  const [travelerType, setTravelerType] = useState<TravelerType>('friends');
  const [vibes, setVibes] = useState<TravelVibe[]>(['beaches', 'foodie', 'culture']);
  const [customNotes, setCustomNotes] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loadingFactIndex, setLoadingFactIndex] = useState(0);

  // Rotate fun facts during loading
  React.useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingFactIndex((prev) => (prev + 1) % FUN_LOADING_FACTS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isLoading]);

  const toggleVibe = (vibe: TravelVibe) => {
    if (vibes.includes(vibe)) {
      if (vibes.length > 1) {
        setVibes(vibes.filter((v) => v !== vibe));
      }
    } else {
      setVibes([...vibes, vibe]);
    }
  };

  const handleSwapRoute = () => {
    const temp = startingCity;
    setStartingCity(destination);
    setDestination(temp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      return;
    }
    onGenerate({
      destination: destination.trim(),
      startingCity: startingCity.trim() || 'Delhi',
      days,
      startDate,
      budgetTier,
      travelerType,
      vibes,
      language,
      currency,
      customNotes: customNotes.trim() || undefined,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Hero Welcome Intro */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-full mb-3 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>{isHinglish ? 'AI Route & Travel Planner' : 'AI Route & Complete Travel Planner'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
          {isHinglish ? 'Kahan Se Kahan Jana Hai?' : 'Plan Your Journey: Origin to Destination'}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
          {isHinglish 
            ? 'Starting city aur Destination daliye — AI transit modes (Flight/Train/Bus/Car), total estimated budget, day-by-day plan aur smart travel advice ready karega.' 
            : 'Enter your starting point and destination. AI Route calculates transit routes, comprehensive budget estimates, personalized itineraries, and insider advice.'}
        </p>
      </div>

      {/* Main Card Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100/60 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-7">
          
          {/* 1. Route Planning: Kahan Se (Origin) -> Kahan Jana Hai (Destination) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Navigation className="w-4 h-4 text-emerald-600" />
                <span>{isHinglish ? '1. Travel Route (Kahan se Kahan)' : '1. Route & Travel Destinations'}</span>
              </label>
              <span className="text-xs text-slate-400 font-medium">
                {isHinglish ? 'Origin ➔ Destination' : 'Origin ➔ Destination'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-3 items-center">
              {/* Origin / Starting City */}
              <div className="space-y-1.5">
                <label htmlFor="origin-input" className="text-xs font-bold text-slate-600 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  <span>{isHinglish ? 'Kahan se (Starting Point):' : 'Starting From (Origin):'}</span>
                </label>
                <div className="relative">
                  <input
                    id="origin-input"
                    type="text"
                    value={startingCity}
                    onChange={(e) => setStartingCity(e.target.value)}
                    placeholder={isHinglish ? 'e.g. Delhi, Mumbai, Bengaluru...' : 'e.g. London, New York, Mumbai...'}
                    className="w-full pl-3.5 pr-8 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-300 focus:border-emerald-500 rounded-xl text-sm text-slate-900 font-medium placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                  {startingCity && (
                    <button
                      type="button"
                      onClick={() => setStartingCity('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center md:pt-5">
                <button
                  type="button"
                  onClick={handleSwapRoute}
                  title="Swap Origin and Destination"
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 text-slate-600 flex items-center justify-center transition-all shadow-2xs active:scale-95"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Destination */}
              <div className="space-y-1.5">
                <label htmlFor="dest-input" className="text-xs font-bold text-slate-600 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                  <span>{isHinglish ? 'Kahan jana hai (Destination):' : 'Where to (Destination):'}</span>
                </label>
                <div className="relative">
                  <input
                    id="dest-input"
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder={isHinglish ? 'e.g. Goa, Manali, Paris, Bali...' : 'e.g. Goa, Paris, Tokyo, Bali...'}
                    className="w-full pl-3.5 pr-8 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-300 focus:border-emerald-500 rounded-xl text-sm text-slate-900 font-medium placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    required
                  />
                  {destination && (
                    <button
                      type="button"
                      onClick={() => setDestination('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Origin Suggestions */}
            <div className="flex items-center flex-wrap gap-1.5 pt-1 text-xs">
              <span className="text-slate-400 font-medium">{isHinglish ? 'Popular Origins:' : 'Popular Origins:'}</span>
              {POPULAR_ORIGINS.slice(0, 6).map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setStartingCity(city)}
                  className={`px-2 py-0.5 rounded-md border text-[11px] font-medium transition-all ${
                    startingCity.toLowerCase() === city.toLowerCase()
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>

            {/* Quick Destination Suggestions */}
            <div className="pt-2">
              <div className="text-xs font-semibold text-slate-500 mb-2">
                {isHinglish ? '⚡ Popular Trending Destinations:' : '⚡ Trending Destinations:'}
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_DESTINATIONS.map((pop) => (
                  <button
                    key={pop.name}
                    type="button"
                    onClick={() => setDestination(pop.name)}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      destination.toLowerCase() === pop.name.toLowerCase()
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span>{pop.icon}</span>
                    <span className="font-semibold">{pop.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Duration & Budget Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
            {/* Days Stepper & Travel Date */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>{isHinglish ? '2. Kitne din & Kab jana hai?' : '2. Duration & Travel Date'}</span>
                </label>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Stepper */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setDays(Math.max(1, days - 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-base shadow-2xs active:scale-95 transition-all"
                    >
                      -
                    </button>
                    <div className="text-center">
                      <span className="text-lg font-extrabold text-slate-900">{days}</span>
                      <span className="text-[11px] font-semibold text-slate-500 ml-1">
                        {days === 1 ? (isHinglish ? 'Din' : 'Day') : (isHinglish ? 'Din' : 'Days')}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDays(Math.min(14, days + 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-base shadow-2xs active:scale-95 transition-all"
                    >
                      +
                    </button>
                  </div>

                  {/* Preset Days */}
                  <div className="flex items-center space-x-1">
                    {[3, 5, 7].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setDays(num)}
                        className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border transition-all ${
                          days === num
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {num}D
                      </button>
                    ))}
                  </div>
                </div>

                {/* Travel Start Date Input */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between">
                  <div className="w-full">
                    <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                      {isHinglish ? 'Trip Start Date' : 'Departure Date'}
                    </div>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
                      title="Select Travel Date"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Tier */}
            <div className="space-y-2.5">
              <label className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>{isHinglish ? '3. Aapka Budget kaisa hai?' : '3. What is your budget tier?'}</span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    id: 'budget' as BudgetTier,
                    labelEn: 'Budget',
                    labelHi: 'Budget-Friendly',
                    descEn: 'Hostels & Local transit',
                    descHi: 'Pocket-friendly',
                    emoji: '🏕️',
                  },
                  {
                    id: 'moderate' as BudgetTier,
                    labelEn: 'Moderate',
                    labelHi: 'Moderate',
                    descEn: 'Comfort hotels & Cafes',
                    descHi: 'Balanced & Cozy',
                    emoji: '🏨',
                  },
                  {
                    id: 'luxury' as BudgetTier,
                    labelEn: 'Luxury',
                    labelHi: 'Luxury',
                    descEn: 'Premium resorts & VIP',
                    descHi: 'VIP & High-end',
                    emoji: '👑',
                  },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setBudgetTier(tier.id)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      budgetTier === tier.id
                        ? 'bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-lg mb-1">{tier.emoji}</span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {isHinglish ? tier.labelHi : tier.labelEn}
                      </div>
                      <div className="text-[10px] text-slate-500 line-clamp-1">
                        {isHinglish ? tier.descHi : tier.descEn}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Companions & Travel Style */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>{isHinglish ? '4. Kiske sath jaa rahe hain?' : '4. Who are you traveling with?'}</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'solo' as TravelerType, labelEn: 'Solo Traveler', labelHi: 'Akela (Solo)', emoji: '🎒' },
                { id: 'couple' as TravelerType, labelEn: 'Couple / Romantic', labelHi: 'Couple / Romantic', emoji: '💑' },
                { id: 'friends' as TravelerType, labelEn: 'With Friends', labelHi: 'Doston ke sath', emoji: '🎉' },
                { id: 'family' as TravelerType, labelEn: 'Family with Kids', labelHi: 'Family / Parivar', emoji: '👨‍👩‍👧‍👦' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTravelerType(t.id)}
                  className={`p-3 rounded-xl border flex items-center space-x-2.5 transition-all ${
                    travelerType === t.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="text-lg">{t.emoji}</span>
                  <span className="text-xs font-bold">{isHinglish ? t.labelHi : t.labelEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Travel Vibes */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>{isHinglish ? '5. Kaisa travel experience pasand hai?' : '5. What are your main interests/vibes?'}</span>
              </label>
              <span className="text-xs text-slate-400">
                {isHinglish ? 'Multiple select karein' : 'Select multiple'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {VIBE_OPTIONS.map((vibe) => {
                const isSelected = vibes.includes(vibe.id);
                return (
                  <button
                    key={vibe.id}
                    type="button"
                    onClick={() => toggleVibe(vibe.id)}
                    className={`inline-flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300 ring-1 ring-emerald-400'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    <span className={isSelected ? 'text-emerald-700' : 'text-slate-400'}>
                      {vibe.icon}
                    </span>
                    <span>{isHinglish ? vibe.labelHi : vibe.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Optional Advanced Options */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {showAdvanced
                  ? (isHinglish ? 'Hide Special Notes' : 'Hide Custom Requests')
                  : (isHinglish ? '+ Special Requests / Dietary Notes (Optional)' : '+ Add Special Notes / Dietary Restrictions (Optional)')}
              </span>
            </button>

            {showAdvanced && (
              <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHinglish ? 'Special Notes (e.g. Pure Veg Food, Senior citizens, Scuba diving)' : 'Special Notes (e.g. Pure veg only, avoid high steps, photography focus)'}
                </label>
                <input
                  type="text"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder={isHinglish ? 'e.g., Pure vegetarian restaurants, relaxed pace, sunset spots' : 'e.g., Pure veg only, avoid high steps, photography focus'}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Submit Button & Loading State */}
          <div className="pt-4">
            <button
              id="generate-plan-btn"
              type="submit"
              disabled={isLoading || !destination.trim()}
              className="w-full py-4 px-6 rounded-xl font-bold text-white text-base bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:via-teal-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/25 active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="font-extrabold tracking-wide">
                    {isHinglish ? 'AI Route plan & budget bana raha hai...' : 'AI Route is generating your plan...'}
                  </span>
                </div>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-emerald-200" />
                  <span>
                    {isHinglish 
                      ? `${startingCity || 'Origin'} ➔ ${destination || 'Destination'} (${days} Days) Plan Banayein ✈️` 
                      : `Generate Plan: ${startingCity || 'Origin'} ➔ ${destination || 'Destination'} (${days} Days) ✈️`}
                  </span>
                  <ChevronRight className="w-5 h-5 text-emerald-200" />
                </>
              )}
            </button>

            {/* Dynamic facts while generating */}
            {isLoading && (
              <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <p className="text-xs font-medium text-emerald-900 animate-fade-in">
                  💡 {FUN_LOADING_FACTS[loadingFactIndex]}
                </p>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
