import React from 'react';
import { ShieldCheck, PhoneCall, AlertTriangle, BookOpenCheck } from 'lucide-react';
import { EmergencyAndEtiquette, SupportedLanguage } from '../types';

interface SafetySectionProps {
  data: EmergencyAndEtiquette;
  destination: string;
  language: SupportedLanguage;
}

export const SafetySection: React.FC<SafetySectionProps> = ({
  data,
  destination,
  language,
}) => {
  const isHinglish = language === 'hi_hinglish';

  return (
    <div className="space-y-6">
      {/* Emergency Contacts */}
      <div className="bg-red-50/70 border border-red-200/80 rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-red-950 text-base">
              {isHinglish ? 'Emergency Helplines & Contacts' : 'Emergency Assistance & Hotlines'}
            </h3>
            <p className="text-xs text-red-800/80">
              {isHinglish ? 'Kisi bhi aapatkaal ki sthiti me in numbers par call karein' : 'Keep these numbers saved offline during your trip'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {data.emergencyNumbers.map((num, idx) => (
            <div key={idx} className="bg-white p-3 rounded-xl border border-red-200 text-xs font-bold text-red-900 shadow-2xs flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              <span className="truncate">{num}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cultural Etiquette */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <BookOpenCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {isHinglish ? 'Local Maryada & Cultural Etiquette' : 'Local Customs & Cultural Etiquette'}
            </h3>
            <p className="text-xs text-slate-500">
              {isHinglish ? 'Sthanik culture aur parampraon ka samman kaise karein' : 'Respecting local heritage, dress codes, and social norms'}
            </p>
          </div>
        </div>

        <ul className="space-y-2.5">
          {data.culturalTips.map((tip, idx) => (
            <li key={idx} className="flex items-start space-x-3 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-emerald-600 font-bold text-sm shrink-0">✓</span>
              <span className="leading-relaxed">{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Scams to Avoid */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-amber-950 text-base">
              {isHinglish ? 'Common Tourist Scams se Savdhan Rahe' : 'Tourist Scams & Traps to Watch Out For'}
            </h3>
            <p className="text-xs text-amber-800/80">
              {isHinglish ? 'Fraud aur mehnge brokers se bachne ke tips' : 'Avoid overpaying, fake tour guides, and counterfeit offers'}
            </p>
          </div>
        </div>

        <ul className="space-y-2.5">
          {data.scamsToAvoid.map((scam, idx) => (
            <li key={idx} className="flex items-start space-x-3 text-xs text-amber-900 bg-white/90 p-3 rounded-xl border border-amber-200">
              <span className="text-amber-600 font-bold text-sm shrink-0">⚠️</span>
              <span className="leading-relaxed">{scam}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
