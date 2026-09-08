import React, { useState } from 'react';
import { Wallet, DollarSign, PieChart, TrendingDown, CheckCircle2, Users, Navigation, Plane, ArrowRight } from 'lucide-react';
import { BudgetEstimate, CurrencyCode, SupportedLanguage, RouteTransitInfo } from '../types';

interface BudgetSectionProps {
  budget: BudgetEstimate;
  routeTransit?: RouteTransitInfo;
  daysCount: number;
  travelerCount?: number;
  language: SupportedLanguage;
  currency: CurrencyCode;
}

export const BudgetSection: React.FC<BudgetSectionProps> = ({
  budget,
  routeTransit,
  daysCount,
  travelerCount = 2,
  language,
  currency,
}) => {
  const isHinglish = language === 'hi_hinglish';
  const [perPerson, setPerPerson] = useState(false);

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'INR': return '₹';
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'AED': return 'AED ';
      case 'THB': return '฿';
      default: return `${curr} `;
    }
  };

  const symbol = getCurrencySymbol(budget.currency || currency);
  const total = budget.totalEstimate || 1;
  const divisor = perPerson ? Math.max(1, travelerCount) : 1;

  const transitPerPerson = routeTransit?.estimatedTransitTotal || 0;
  const totalTransit = transitPerPerson * (perPerson ? 1 : Math.max(1, travelerCount));
  const destinationSpend = Math.round(budget.totalEstimate / divisor);
  const combinedGrandTotal = destinationSpend + (transitPerPerson ? (perPerson ? transitPerPerson : totalTransit) : 0);

  const items = [
    { 
      name: isHinglish ? 'Stays / Hotel & Resort' : 'Accommodation & Hotels', 
      amount: Math.round(budget.accommodation / divisor), 
      pct: Math.round((budget.accommodation / total) * 100),
      color: 'bg-emerald-500',
      bgLight: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800'
    },
    { 
      name: isHinglish ? 'Food, Dining & Cafes' : 'Food, Street Bites & Dining', 
      amount: Math.round(budget.foodDining / divisor), 
      pct: Math.round((budget.foodDining / total) * 100),
      color: 'bg-amber-500',
      bgLight: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800'
    },
    { 
      name: isHinglish ? 'Local Transport & Rentals' : 'Transit, Taxis & Scooter/Car', 
      amount: Math.round(budget.transport / divisor), 
      pct: Math.round((budget.transport / total) * 100),
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800'
    },
    { 
      name: isHinglish ? 'Sightseeing & Entry Tickets' : 'Activities, Tickets & Guides', 
      amount: Math.round(budget.activitiesTickets / divisor), 
      pct: Math.round((budget.activitiesTickets / total) * 100),
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-800'
    },
    { 
      name: isHinglish ? 'Shopping & Miscellaneous' : 'Shopping & Buffer Fund', 
      amount: Math.round(budget.miscellaneous / divisor), 
      pct: Math.round((budget.miscellaneous / total) * 100),
      color: 'bg-slate-400',
      bgLight: 'bg-slate-50',
      border: 'border-slate-200',
      text: 'text-slate-800'
    },
  ];

  const dailyAvg = Math.round((budget.totalEstimate / daysCount) / divisor);

  return (
    <div className="space-y-6">
      {/* Combined Grand Total Banner (Origin Route + Destination) */}
      {transitPerPerson > 0 && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-5 sm:p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                <Navigation className="w-3.5 h-3.5" />
                <span>{isHinglish ? 'Total Trip Budget (Route + Stay)' : 'Combined Grand Budget (Transit + Destination)'}</span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">
                {symbol}{combinedGrandTotal.toLocaleString()}
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {perPerson ? (isHinglish ? 'Per person estimated kharch' : 'Per traveler estimated cost') : (isHinglish ? `Total group (${travelerCount} log) ke liye kharch` : `Total cost for group of ${travelerCount}`)}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl p-3.5 space-y-1.5 text-xs">
              <div className="flex items-center justify-between space-x-4">
                <span className="text-slate-300">{isHinglish ? '✈️ Route Transit Fare:' : '✈️ Origin ➔ Destination Transit:'}</span>
                <span className="font-bold text-emerald-300">
                  {symbol}{(perPerson ? transitPerPerson : totalTransit).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between space-x-4">
                <span className="text-slate-300">{isHinglish ? '🏨 Destination Living Spend:' : '🏨 Destination Stay & Food:'}</span>
                <span className="font-bold text-white">
                  {symbol}{destinationSpend.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Destination Total Cost */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-5 shadow-md shadow-emerald-700/15">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
              {isHinglish ? 'Destination Living Cost' : 'Destination Living Cost'}
            </span>
            <Wallet className="w-5 h-5 text-emerald-200" />
          </div>
          <div className="text-3xl font-extrabold tracking-tight">
            {symbol}{Math.round(budget.totalEstimate / divisor).toLocaleString()}
          </div>
          <div className="text-xs text-emerald-100/90 mt-1">
            {perPerson ? (isHinglish ? 'Per person estimate' : 'Per traveler estimate') : (isHinglish ? 'Poore group ke liye total' : 'Total overall estimate')}
          </div>
        </div>

        {/* Daily Average */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {isHinglish ? 'Per Day Average' : 'Daily Average Spend'}
            </span>
            <TrendingDown className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {symbol}{dailyAvg.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ day</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {isHinglish ? `${daysCount} dinon ke hisab se` : `Across ${daysCount} active travel days`}
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              {isHinglish ? 'Calculation Mode' : 'View Breakdown'}
            </div>
            <p className="text-xs text-slate-600">
              {isHinglish ? 'Single person ya total group view dekhein' : 'Toggle between total trip cost vs per person'}
            </p>
          </div>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl mt-3">
            <button
              onClick={() => setPerPerson(false)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                !perPerson ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {isHinglish ? 'Total Trip' : 'Total Trip'}
            </button>
            <button
              onClick={() => setPerPerson(true)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                perPerson ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {isHinglish ? 'Per Person' : 'Per Person'}
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar Distribution */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-emerald-600" />
            <span>{isHinglish ? 'Kharchon ka Vibhajan (Expense Distribution)' : 'Category Breakdown'}</span>
          </h3>
          <span className="text-xs text-slate-400">100% Total</span>
        </div>

        {/* Multi-color Progress bar */}
        <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex">
          {items.map((item, idx) => (
            <div 
              key={idx} 
              className={`${item.color} h-full transition-all duration-500`} 
              style={{ width: `${Math.max(4, item.pct)}%` }}
              title={`${item.name}: ${item.pct}%`}
            />
          ))}
        </div>

        {/* Category List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {items.map((item, idx) => (
            <div key={idx} className={`p-3.5 rounded-xl border ${item.border} ${item.bgLight} flex items-center justify-between`}>
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="text-xs font-bold text-slate-900">{item.name}</span>
                </div>
                <div className="text-[11px] text-slate-500 pl-4.5">
                  {item.pct}% of budget
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-extrabold ${item.text}`}>
                  {symbol}{item.amount.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Budget Advice & Tips */}
      {budget.budgetAdvice && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 text-amber-900">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              💡
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-950 mb-1">
                {isHinglish ? 'AI Local Money-Saving Tips' : 'Smart Budget Saving Tips'}
              </h4>
              <p className="text-xs leading-relaxed text-amber-900">
                {budget.budgetAdvice}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

