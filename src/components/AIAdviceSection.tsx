import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Lightbulb, 
  PiggyBank, 
  ShieldAlert, 
  Compass, 
  Key,
  Star,
  Flame
} from 'lucide-react';
import { AISmartAdvice, SupportedLanguage } from '../types';

interface AIAdviceSectionProps {
  advice?: AISmartAdvice;
  destination: string;
  origin?: string;
  language: SupportedLanguage;
}

export const AIAdviceSection: React.FC<AIAdviceSectionProps> = ({
  advice,
  destination,
  origin,
  language,
}) => {
  const isHinglish = language === 'hi_hinglish';

  if (!advice) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
        <Sparkles className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-800">
          {isHinglish ? 'AI Travel Advice & Smart Tips' : 'AI Smart Travel Advice'}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {isHinglish ? 'Personalized advice and pro-hacks will be generated with your itinerary.' : 'Custom route hacks and local tips will appear here.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Overall Verdict Banner */}
      {advice.overallVerdict && (
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white rounded-2xl p-6 shadow-md shadow-emerald-800/15">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-200 uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
            <span>{isHinglish ? 'AI Expert Verdict' : 'AI Travel Specialist Verdict'}</span>
          </div>
          <p className="text-base sm:text-lg font-bold leading-relaxed text-white">
            "{advice.overallVerdict}"
          </p>
        </div>
      )}

      {/* 2. Top Smart Travel Hacks */}
      {advice.topTips && advice.topTips.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-4">
            <Flame className="w-4 h-4 text-emerald-600" />
            <span>{isHinglish ? 'Top 5 AI Smart Travel Hacks' : 'Essential AI Smart Travel Hacks'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {advice.topTips.map((tip, idx) => (
              <div 
                key={idx}
                className="flex items-start space-x-3 p-3.5 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/80 hover:border-emerald-200 transition-all text-xs text-slate-800"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                  {idx + 1}
                </div>
                <span className="leading-relaxed font-medium">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Do's and Don'ts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Must Do */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-900 mb-3.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{isHinglish ? 'Zaroor Karein (Must Do)' : 'Definite Must-Dos'}</span>
          </div>
          <ul className="space-y-2.5 text-xs text-emerald-950 font-medium">
            {(advice.thingsToDo || []).map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2 bg-white/80 border border-emerald-100 rounded-xl p-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Avoid */}
        <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-rose-900 mb-3.5">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>{isHinglish ? 'Yeh Galtiyan Na Karein (Avoid)' : 'Common Pitfalls to Avoid'}</span>
          </div>
          <ul className="space-y-2.5 text-xs text-rose-950 font-medium">
            {(advice.thingsToAvoid || []).map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2 bg-white/80 border border-rose-100 rounded-xl p-3">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. Money Saving Budget Hacks */}
      {advice.moneySavingHacks && advice.moneySavingHacks.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-900 mb-3">
            <PiggyBank className="w-4 h-4 text-amber-600" />
            <span>{isHinglish ? 'Paise Bachane Ke Pro Hacks (Money-Saving Tips)' : 'Budget Maximizer & Savings Hacks'}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {advice.moneySavingHacks.map((hack, idx) => (
              <div key={idx} className="bg-white border border-amber-200 rounded-xl p-3 text-xs text-amber-950 font-medium flex items-start space-x-2">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{hack}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Secret Local Insider Tip */}
      {advice.localInsiderSecret && (
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">
            <Key className="w-4 h-4 text-amber-300" />
            <span>{isHinglish ? 'Secret Local Insider Hack 🤫' : 'Secret Local Insider Hack 🤫'}</span>
          </div>
          <p className="text-sm font-semibold text-purple-100 leading-relaxed">
            {advice.localInsiderSecret}
          </p>
        </div>
      )}
    </div>
  );
};
