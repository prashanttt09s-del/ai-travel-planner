import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PlannerForm } from './components/PlannerForm';
import { ItineraryView } from './components/ItineraryView';
import { ConciergeDrawer } from './components/ConciergeDrawer';
import { SavedTripsDrawer } from './components/SavedTripsDrawer';
import { TravelPlan, TravelPlanRequest, SupportedLanguage, CurrencyCode } from './types';
import { Sparkles, Compass, AlertCircle, Plane, CheckCircle2 } from 'lucide-react';

const SAVED_TRIPS_STORAGE_KEY = 'ai_travel_planner_saved_trips';

export default function App() {
  const [language, setLanguage] = useState<SupportedLanguage>('hi_hinglish');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [currentPlan, setCurrentPlan] = useState<TravelPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Drawers
  const [isSavedTripsOpen, setIsSavedTripsOpen] = useState(false);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [savedTrips, setSavedTrips] = useState<TravelPlan[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load saved trips on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SAVED_TRIPS_STORAGE_KEY);
      if (stored) {
        setSavedTrips(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load saved trips from localStorage', e);
    }
  }, []);

  // Save trips helper
  const saveTripsToStorage = (trips: TravelPlan[]) => {
    setSavedTrips(trips);
    try {
      localStorage.setItem(SAVED_TRIPS_STORAGE_KEY, JSON.stringify(trips));
    } catch (e) {
      console.error('Failed to save trips to localStorage', e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleGenerate = async (request: TravelPlanRequest) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate itinerary (Status: ${response.status})`);
      }

      const plan: TravelPlan = await response.json();
      setCurrentPlan(plan);
      showToast(
        language === 'hi_hinglish'
          ? `🎉 ${plan.destination} ka itinerary taiyyar hai!`
          : `🎉 Itinerary for ${plan.destination} is ready!`
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Error generating plan:', err);
      setErrorMsg(
        language === 'hi_hinglish'
          ? 'Itinerary generate karne me koi dikkat aayi. Kripya dobara try karein.'
          : 'Failed to generate itinerary. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTrip = (plan: TravelPlan) => {
    const exists = savedTrips.some((t) => t.id === plan.id);
    let updated: TravelPlan[];
    if (exists) {
      updated = savedTrips.filter((t) => t.id !== plan.id);
      showToast(language === 'hi_hinglish' ? 'Trip saved list se hata diya gaya' : 'Trip removed from saved');
    } else {
      updated = [plan, ...savedTrips];
      showToast(language === 'hi_hinglish' ? 'Trip safalta-purvak save ho gaya! 📌' : 'Trip saved successfully! 📌');
    }
    saveTripsToStorage(updated);
  };

  const handleDeleteSavedTrip = (id: string) => {
    const updated = savedTrips.filter((t) => t.id !== id);
    saveTripsToStorage(updated);
    showToast(language === 'hi_hinglish' ? 'Trip delete ho gaya' : 'Trip deleted');
  };

  const handleApplyDayTweak = async (dayNumber: number, tweakInstruction: string) => {
    if (!currentPlan) return;
    const currentDay = currentPlan.days.find((d) => d.dayNumber === dayNumber);
    if (!currentDay) return;

    try {
      const response = await fetch('/api/customize-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: currentPlan.destination,
          dayNumber,
          currentDayPlan: currentDay,
          tweakInstruction,
          language,
          currency: currentPlan.budget.currency,
        }),
      });

      if (!response.ok) throw new Error('Failed to tweak day');
      const modifiedDay = await response.json();

      const updatedDays = currentPlan.days.map((d) => 
        d.dayNumber === dayNumber ? modifiedDay : d
      );

      const updatedPlan = { ...currentPlan, days: updatedDays };
      setCurrentPlan(updatedPlan);

      // If already saved, update saved storage too
      if (savedTrips.some((t) => t.id === currentPlan.id)) {
        saveTripsToStorage(savedTrips.map((t) => t.id === currentPlan.id ? updatedPlan : t));
      }

      showToast(
        language === 'hi_hinglish'
          ? `Day ${dayNumber} AI dwara update kar diya gaya!`
          : `Day ${dayNumber} successfully tweaked!`
      );
    } catch (e) {
      console.error(e);
      showToast(
        language === 'hi_hinglish'
          ? 'Day tweak karne me error aayi.'
          : 'Failed to tweak day. Please try again.'
      );
    }
  };

  const isCurrentPlanSaved = currentPlan ? savedTrips.some((t) => t.id === currentPlan.id) : false;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        currency={currency}
        onCurrencyChange={setCurrency}
        savedTripsCount={savedTrips.length}
        onOpenSavedTrips={() => setIsSavedTripsOpen(true)}
        onNewPlan={() => {
          setCurrentPlan(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        hasActivePlan={!!currentPlan}
        onOpenConcierge={() => setIsConciergeOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-red-500 hover:text-red-800 font-bold px-2 py-1"
            >
              ✕
            </button>
          </div>
        )}

        {!currentPlan ? (
          <PlannerForm
            onGenerate={handleGenerate}
            isLoading={isLoading}
            language={language}
            currency={currency}
          />
        ) : (
          <ItineraryView
            plan={currentPlan}
            onSaveTrip={handleSaveTrip}
            isSaved={isCurrentPlanSaved}
            onBackToPlanner={() => setCurrentPlan(null)}
            onOpenConcierge={() => setIsConciergeOpen(true)}
            onApplyDayTweak={handleApplyDayTweak}
            onUpdatePlan={(updated) => {
              setCurrentPlan(updated);
              if (savedTrips.some((t) => t.id === updated.id)) {
                saveTripsToStorage(savedTrips.map((t) => t.id === updated.id ? updated : t));
              }
            }}
            language={language}
            currency={currency}
          />
        )}
      </main>

      {/* Floating Concierge Trigger (on bottom right when plan is active) */}
      {currentPlan && (
        <button
          onClick={() => setIsConciergeOpen(true)}
          className="no-print fixed bottom-6 right-6 z-40 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-xl shadow-emerald-600/30 flex items-center space-x-2 font-bold text-xs group hover:scale-105 active:scale-95 transition-all"
        >
          <Sparkles className="w-4 h-4 text-emerald-200 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="hidden sm:inline">
            {language === 'hi_hinglish' ? `Ask AI (${currentPlan.destination})` : `Ask AI Concierge`}
          </span>
        </button>
      )}

      {/* AI Concierge Assistant Drawer */}
      <ConciergeDrawer
        isOpen={isConciergeOpen}
        onClose={() => setIsConciergeOpen(false)}
        plan={currentPlan}
        language={language}
      />

      {/* Saved Trips Drawer */}
      <SavedTripsDrawer
        isOpen={isSavedTripsOpen}
        onClose={() => setIsSavedTripsOpen(false)}
        savedTrips={savedTrips}
        onSelectTrip={(plan) => setCurrentPlan(plan)}
        onDeleteTrip={handleDeleteSavedTrip}
        language={language}
      />

      {/* Footer */}
      <footer className="no-print border-t border-slate-200 bg-white/70 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Plane className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-700">AI Travel Planner</span>
            <span>• Powered by Google Gemini 3.7</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {language === 'hi_hinglish' 
              ? 'Shubh Yatra! Aapka safar sukhad aur yaadgar rahe.' 
              : 'Happy travels! Enjoy your personalized adventure.'}
          </p>
        </div>
      </footer>
    </div>
  );
}
