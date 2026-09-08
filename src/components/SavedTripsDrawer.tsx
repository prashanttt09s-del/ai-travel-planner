import React from 'react';
import { BookmarkCheck, X, Trash2, Calendar, MapPin, ArrowRight, Download, Share2 } from 'lucide-react';
import { TravelPlan, SupportedLanguage } from '../types';

interface SavedTripsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedTrips: TravelPlan[];
  onSelectTrip: (plan: TravelPlan) => void;
  onDeleteTrip: (id: string) => void;
  language: SupportedLanguage;
}

export const SavedTripsDrawer: React.FC<SavedTripsDrawerProps> = ({
  isOpen,
  onClose,
  savedTrips,
  onSelectTrip,
  onDeleteTrip,
  language,
}) => {
  const isHinglish = language === 'hi_hinglish';

  if (!isOpen) return null;

  const exportAll = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedTrips, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `saved-travel-plans-${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {isHinglish ? 'Aapke Saved Travel Plans' : 'Saved Travel Plans'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {savedTrips.length} {savedTrips.length === 1 ? 'trip saved' : 'trips saved'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {savedTrips.length > 0 && (
              <button
                onClick={exportAll}
                title="Export all as JSON"
                className="p-1.5 text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-slate-200 text-xs flex items-center"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List of Plans */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedTrips.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <BookmarkCheck className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">
                {isHinglish ? 'Abhi koi saved trip nahi hai' : 'No Saved Trips Yet'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                {isHinglish 
                  ? 'Koi itinerary generate karein aur "Save Trip" button dabayein taaki aap kabhi bhi offline dekh sakein.' 
                  : 'Generate any itinerary and click "Save Trip" to keep it handy for future reference.'}
              </p>
            </div>
          ) : (
            savedTrips.map((plan) => (
              <div
                key={plan.id}
                className="bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all group relative"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base flex items-center space-x-1.5">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{plan.destination}</span>
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {plan.tagline}
                    </p>
                  </div>
                  <span className="text-xs font-extrabold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200">
                    {plan.daysCount}D / {plan.budgetTier}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2 border-t border-slate-100">
                  <span>{new Date(plan.createdAt).toLocaleDateString()}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onDeleteTrip(plan.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                      title="Delete trip"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        onSelectTrip(plan);
                        onClose();
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center space-x-1 shadow-2xs transition-colors"
                    >
                      <span>{isHinglish ? 'View Plan' : 'View Plan'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
