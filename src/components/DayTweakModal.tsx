import React, { useState } from 'react';
import { Sparkles, X, Wand2 } from 'lucide-react';
import { DayPlan, SupportedLanguage } from '../types';

interface DayTweakModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayPlan: DayPlan | null;
  destination: string;
  onApplyTweak: (dayNumber: number, tweakInstruction: string) => Promise<void>;
  language: SupportedLanguage;
}

export const DayTweakModal: React.FC<DayTweakModalProps> = ({
  isOpen,
  onClose,
  dayPlan,
  destination,
  onApplyTweak,
  language,
}) => {
  const isHinglish = language === 'hi_hinglish';
  const [instruction, setInstruction] = useState('');
  const [isTweakLoading, setIsTweakLoading] = useState(false);

  if (!isOpen || !dayPlan) return null;

  const quickPrompts = isHinglish ? [
    'Is din ko thoda zyada relaxed banayein',
    'Water sports aur beach activities add karein',
    'Historical monuments aur museums include karein',
    'Nightlife aur party clubs add karein',
    'Local shopping aur flea markets include karein',
  ] : [
    'Make this day more relaxed and chill',
    'Add adventure & water sports activities',
    'Focus on museums & historic heritage',
    'Include vibrant nightlife & cocktail lounges',
    'Add shopping bazaars & souvenir markets',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim() || isTweakLoading) return;
    setIsTweakLoading(true);
    try {
      await onApplyTweak(dayPlan.dayNumber, instruction.trim());
      setInstruction('');
      onClose();
    } finally {
      setIsTweakLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {isHinglish ? `Day ${dayPlan.dayNumber} ko AI se Tweak karein` : `Customize Day ${dayPlan.dayNumber} with AI`}
              </h3>
              <p className="text-[11px] text-slate-500 line-clamp-1">{dayPlan.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            {isHinglish 
              ? 'Aap is din me kya change karna chahte hain? AI activities aur timings ko automatically re-adjust kar dega.' 
              : 'What would you like to modify for this day? Gemini will intelligently rebalance the activities and timings.'}
          </p>

          {/* Quick chips */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {isHinglish ? 'Quick Ideas' : 'Quick Suggestions'}:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInstruction(p)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition-colors text-left"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <textarea
            rows={3}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder={isHinglish ? 'e.g., Afternoon me scuba diving add karein aur sunset ke waqt rooftop cafe...' : 'e.g., Replace the museum with a coastal hike and add a sunset seafood dinner...'}
            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-emerald-500 focus:bg-white resize-none"
            required
          />

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isTweakLoading}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl"
            >
              {isHinglish ? 'Cancel' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isTweakLoading || !instruction.trim()}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs flex items-center space-x-2 transition-all"
            >
              {isTweakLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isHinglish ? 'Updating...' : 'Regenerating Day...'}</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>{isHinglish ? 'Apply AI Tweak' : 'Apply AI Tweak'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
