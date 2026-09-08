import React, { useState } from 'react';
import { 
  Plane, 
  Train, 
  Bus, 
  Car, 
  Navigation, 
  Sparkles, 
  Clock, 
  Wallet, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  ArrowRight,
  TrendingUp,
  Tag,
  ShieldCheck,
  Fuel
} from 'lucide-react';
import { RouteTransitInfo, TransitOption, SupportedLanguage, CurrencyCode } from '../types';
import { RouteMap } from './RouteMap';

interface RouteTransitSectionProps {
  routeTransit?: RouteTransitInfo;
  origin?: string;
  destination: string;
  travelerCount?: number;
  language: SupportedLanguage;
  currency: CurrencyCode;
}

export const RouteTransitSection: React.FC<RouteTransitSectionProps> = ({
  routeTransit,
  origin = 'Delhi',
  destination,
  travelerCount = 2,
  language,
  currency,
}) => {
  const isHinglish = language === 'hi_hinglish';

  const [selectedMode, setSelectedMode] = useState<string | 'all'>('all');

  const getCurrencySymbol = (curr?: string) => {
    switch (curr || currency) {
      case 'INR': return '₹';
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'AED': return 'AED ';
      case 'THB': return '฿';
      default: return `${curr || currency} `;
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'flight':
        return <Plane className="w-4 h-4 text-sky-600" />;
      case 'train':
        return <Train className="w-4 h-4 text-emerald-600" />;
      case 'bus':
        return <Bus className="w-4 h-4 text-amber-600" />;
      case 'road_trip':
        return <Car className="w-4 h-4 text-indigo-600" />;
      default:
        return <Navigation className="w-4 h-4 text-slate-600" />;
    }
  };

  const getModeBadge = (mode: string) => {
    switch (mode) {
      case 'flight':
        return { label: 'Flight', bg: 'bg-sky-50 text-sky-700 border-sky-200' };
      case 'train':
        return { label: 'Superfast Train', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'bus':
        return { label: 'Volvo / Bus', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'road_trip':
        return { label: 'Road Trip / Cab', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      default:
        return { label: mode, bg: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  if (!routeTransit || !routeTransit.transitOptions || routeTransit.transitOptions.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
        <Navigation className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-800">
          {isHinglish ? `${origin} se ${destination} ka route calculate ho raha hai...` : `Route transit information between ${origin} and ${destination}`}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {isHinglish ? 'Flights, Trains aur Road routes jald hi available honge.' : 'Direct transit comparison will appear with your next plan generation.'}
        </p>
      </div>
    );
  }

  const filteredOptions = selectedMode === 'all' 
    ? routeTransit.transitOptions 
    : routeTransit.transitOptions.filter(o => o.mode === selectedMode);

  return (
    <div className="space-y-6">
      {/* Live road map, distance and suggested stops */}
      <RouteMap
        origin={routeTransit.origin || origin}
        destination={routeTransit.destination || destination}
        stops={routeTransit.pitstopsOrScenicHighlights || []}
      />

      {/* Route Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-5">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">
              <Navigation className="w-3.5 h-3.5" />
              <span>{isHinglish ? 'Route & Travel Journey' : 'Origin to Destination Route'}</span>
              {routeTransit.distanceEstimate && (
                <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  {routeTransit.distanceEstimate}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
              <span className="text-white">{routeTransit.origin || origin}</span>
              <ArrowRight className="w-6 h-6 text-emerald-400 animate-pulse" />
              <span className="text-emerald-300">{routeTransit.destination || destination}</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl p-3 text-right">
            <span className="text-[11px] text-slate-300 block">
              {isHinglish ? 'AI Recommended Transit Mode' : 'AI Recommended Transit'}
            </span>
            <span className="text-sm font-bold text-emerald-300 flex items-center justify-end space-x-1.5 mt-0.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{routeTransit.bestTravelMode || 'Fastest Route'}</span>
            </span>
          </div>
        </div>

        {/* AI Route Recommendation Reasoning */}
        {routeTransit.recommendedModeReason && (
          <div className="mt-4 flex items-start space-x-2.5 bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-3.5 text-xs text-emerald-100">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-300 mr-1">
                {isHinglish ? 'AI Transit Advice:' : 'AI Route Reasoning:'}
              </span>
              <span>{routeTransit.recommendedModeReason}</span>
            </div>
          </div>
        )}

        {/* Best Time to Book Advice */}
        {routeTransit.bestTimeToBookAdvice && (
          <div className="mt-3 flex items-center space-x-2 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong className="text-amber-300">{isHinglish ? 'Booking Hack: ' : 'Booking Window Tip: '}</strong>
              {routeTransit.bestTimeToBookAdvice}
            </span>
          </div>
        )}
      </div>

      {/* Transit Mode Filters */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedMode === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {isHinglish ? 'Sabhi Modes' : 'All Modes'} ({routeTransit.transitOptions.length})
          </button>
          {['flight', 'train', 'bus', 'road_trip'].map((mode) => {
            const hasOption = routeTransit.transitOptions.some(o => o.mode === mode);
            if (!hasOption) return null;
            const badge = getModeBadge(mode);
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setSelectedMode(mode)}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  selectedMode === mode
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {getModeIcon(mode)}
                <span>{badge.label}</span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          {isHinglish ? 'Per Person Fare Estimates' : 'Estimated fares per person'}
        </div>
      </div>

      {/* Transit Option Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOptions.map((opt, idx) => {
          const badge = getModeBadge(opt.mode);
          const symbol = getCurrencySymbol(opt.costCurrency);
          const totalFareForGroup = opt.approxCostPerPerson * Math.max(1, travelerCount);

          return (
            <div
              key={idx}
              className={`rounded-2xl border bg-white p-5 flex flex-col justify-between transition-all hover:shadow-md ${
                opt.isRecommended
                  ? 'border-emerald-500/80 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-slate-200 shadow-2xs'
              }`}
            >
              <div>
                {/* Header: Mode Badge + Recommended Tag */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${badge.bg}`}>
                    {getModeIcon(opt.mode)}
                    <span>{badge.label}</span>
                  </div>

                  {opt.isRecommended && (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>{isHinglish ? 'AI Recommended' : 'Top Recommendation'}</span>
                    </span>
                  )}
                </div>

                {/* Title */}
                <h4 className="text-base font-bold text-slate-900 mb-1.5">
                  {opt.title}
                </h4>

                {/* Duration & Estimated Cost */}
                <div className="flex items-center flex-wrap gap-3 my-2 text-xs">
                  <div className="flex items-center space-x-1.5 text-slate-700 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{opt.duration}</span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-emerald-800 font-extrabold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                    <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {symbol}{opt.approxCostPerPerson.toLocaleString()} <span className="text-[10px] font-normal text-emerald-700">/ person</span>
                    </span>
                  </div>

                  {travelerCount > 1 && (
                    <div className="text-[11px] text-slate-500 font-medium">
                      (~{symbol}{totalFareForGroup.toLocaleString()} for {travelerCount} travelers)
                    </div>
                  )}
                </div>

                {/* Summary */}
                <p className="text-xs text-slate-600 leading-relaxed my-2.5">
                  {opt.summary}
                </p>

                {/* Hubs */}
                {(opt.departureHub || opt.arrivalHub) && (
                  <div className="my-2.5 bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-[11px] space-y-1 text-slate-600">
                    {opt.departureHub && (
                      <div className="flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span className="font-semibold text-slate-700">{isHinglish ? 'Departure Hub:' : 'Dep:'}</span>
                        <span>{opt.departureHub}</span>
                      </div>
                    )}
                    {opt.arrivalHub && (
                      <div className="flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        <span className="font-semibold text-slate-700">{isHinglish ? 'Arrival Hub:' : 'Arr:'}</span>
                        <span>{opt.arrivalHub}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Booking Tip / Hack Footer */}
              {opt.bookingTip && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-start space-x-2 text-[11px] text-slate-500">
                  <Tag className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-700 mr-1">
                      {isHinglish ? 'Pro-Tip:' : 'Tip:'}
                    </span>
                    <span>{opt.bookingTip}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Scenic Pitstops & Highway Highlights */}
      {routeTransit.pitstopsOrScenicHighlights && routeTransit.pitstopsOrScenicHighlights.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center space-x-2 mb-3">
            <Fuel className="w-4 h-4 text-amber-700" />
            <span>{isHinglish ? 'Scenic Pitstops & Route Highlights' : 'Scenic Pitstops & Enroute Highlights'}</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {routeTransit.pitstopsOrScenicHighlights.map((highlight, idx) => (
              <div key={idx} className="bg-white border border-amber-200 rounded-xl p-3 flex items-start space-x-2 text-xs text-amber-950 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
