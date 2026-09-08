import React from 'react';
import { Plane, Compass, BookmarkCheck, Globe, Sparkles, Plus } from 'lucide-react';
import { SupportedLanguage, CurrencyCode } from '../types';

interface NavbarProps {
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  currency: CurrencyCode;
  onCurrencyChange: (curr: CurrencyCode) => void;
  savedTripsCount: number;
  onOpenSavedTrips: () => void;
  onNewPlan: () => void;
  hasActivePlan: boolean;
  onOpenConcierge: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  currency,
  onCurrencyChange,
  savedTripsCount,
  onOpenSavedTrips,
  onNewPlan,
  hasActivePlan,
  onOpenConcierge,
}) => {
  const isHinglish = language === 'hi_hinglish';

  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={onNewPlan}
          id="brand-logo"
          className="flex items-center space-x-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
            <Plane className="w-5 h-5 -rotate-12 group-hover:rotate-0 transition-transform" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-lg text-slate-900 tracking-tight">AI Travel Planner</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                AI Route
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {isHinglish ? 'Aapka smart AI safar saathi' : 'Smart customized travel itineraries'}
            </p>
          </div>
        </div>

        {/* Actions & Switches */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Language Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              id="lang-btn-en"
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                language === 'en'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
            <button
              id="lang-btn-hinglish"
              onClick={() => onLanguageChange('hi_hinglish')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                language === 'hi_hinglish'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hinglish
            </button>
          </div>

          {/* Currency Selector */}
          <select
            id="currency-select"
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
            className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg px-2.5 py-1.5 cursor-pointer outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
          >
            <option value="INR">₹ INR</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="GBP">£ GBP</option>
            <option value="AED">د.إ AED</option>
            <option value="THB">฿ THB</option>
          </select>

          {/* AI Assistant button */}
          <button
            id="open-concierge-btn"
            onClick={onOpenConcierge}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isHinglish ? 'AI Guide' : 'AI Concierge'}</span>
          </button>

          {/* Saved Trips */}
          <button
            id="saved-trips-btn"
            onClick={onOpenSavedTrips}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors relative"
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden xs:inline">{isHinglish ? 'Saved' : 'Saved Trips'}</span>
            {savedTripsCount > 0 && (
              <span className="w-4 h-4 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                {savedTripsCount}
              </span>
            )}
          </button>

          {/* New Trip button if active plan */}
          {hasActivePlan && (
            <button
              id="new-plan-header-btn"
              onClick={onNewPlan}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isHinglish ? 'Naya Plan' : 'New Plan'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
