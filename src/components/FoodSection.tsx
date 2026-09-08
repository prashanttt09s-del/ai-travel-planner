import React from 'react';
import { Utensils, MapPin, Tag, Sparkles } from 'lucide-react';
import { FoodRecommendation, SupportedLanguage } from '../types';

interface FoodSectionProps {
  foods: FoodRecommendation[];
  destination: string;
  language: SupportedLanguage;
}

export const FoodSection: React.FC<FoodSectionProps> = ({
  foods,
  destination,
  language,
}) => {
  const isHinglish = language === 'hi_hinglish';

  const getTypeBadge = (type: FoodRecommendation['type']) => {
    switch (type) {
      case 'veg':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Vegetarian</span>
          </span>
        );
      case 'non-veg':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
            <span>Non-Veg</span>
          </span>
        );
      case 'vegan':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-lime-100 text-lime-800 border border-lime-300">
            <span>🌱 Vegan</span>
          </span>
        );
      case 'sweet':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-pink-100 text-pink-800 border border-pink-300">
            <span>🍰 Dessert / Sweet</span>
          </span>
        );
      case 'drink':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-300">
            <span>🥤 Beverage / Drink</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
          <Utensils className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-amber-950 text-base">
            {isHinglish ? `${destination} ke Must-Try Zayke & Dishes` : `Signature Culinary Highlights of ${destination}`}
          </h3>
          <p className="text-xs text-amber-900/80">
            {isHinglish 
              ? 'Local authentic taste aur street food spots jo har traveler ko zaroor try karne chahiye.' 
              : 'Authentic regional gastronomy, iconic street food stalls, and traditional secret recipes.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {foods.map((food, idx) => (
          <div 
            key={idx}
            className="bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-slate-900 text-base tracking-tight">
                  {food.name}
                </h4>
                {getTypeBadge(food.type)}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {food.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              {food.bestPlaceToTry && (
                <div className="flex items-center space-x-1 text-slate-700 font-medium truncate">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{food.bestPlaceToTry}</span>
                </div>
              )}
              {food.priceRange && (
                <div className="text-slate-500 font-semibold bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 self-start sm:self-auto">
                  {food.priceRange}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
