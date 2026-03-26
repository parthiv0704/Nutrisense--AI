import React, { useState, useEffect } from 'react';
import { Home, CalendarDays, MessageCircle, Clock } from 'lucide-react';

import OnboardingForm from './components/OnboardingForm';
import MealPlanDisplay from './components/MealPlanDisplay';
import ChatAdjustment from './components/ChatAdjustment';
import NutritionBreakdown from './components/NutritionBreakdown';
import RiskAlert from './components/RiskAlert';
import LoadingSkeleton from './components/LoadingSkeleton';
import HistoryVault from './components/HistoryVault';
import FestivalBanner from './components/FestivalBanner';

import { getUserProfile, getMealPlan, saveMealPlan } from './utils/localStorageUtils';
import { checkRisks, adjustMealPlanForFestival } from './utils/geminiApi';
import { loadFestivalsOnAppStart } from './utils/festivalCalendar';

const App = () => {
  const [view, setView] = useState('onboarding');
  const [isLoading, setIsLoading] = useState(false);
  
  const [userProfile, setUserProfile] = useState(null);
  const [mealPlan, setMealPlan] = useState(null);
  const [riskData, setRiskData] = useState({ hasRisk: false, riskMessage: "", severity: "none" });
  const [festivals, setFestivals] = useState([]);

  useEffect(() => {
    loadFestivalsOnAppStart().then(events => setFestivals(events));
  }, []);

  useEffect(() => {
    // Initial Load
    const profile = getUserProfile();
    const plan = getMealPlan();

    if (profile && plan) {
      setUserProfile(profile);
      setMealPlan(plan);
      setView('mealplan');
      
      // Re-run risk check in background just in case
      checkRisks(profile, plan).then(r => setRiskData(r));
    }
  }, []);

  const renderContent = () => {
    switch (view) {
      case 'onboarding':
        return (
          <OnboardingForm 
            setView={setView} 
            setIsLoading={setIsLoading} 
            setMealPlan={(plan) => setMealPlan(plan)}
            setRiskData={setRiskData}
          />
        );
      case 'mealplan':
        const refreshPlan = () => { setMealPlan(getMealPlan()); };
        return (
          <div className="pb-20 animate-in fade-in zoom-in-95 duration-300">
            <FestivalBanner 
              festivals={festivals} 
              onAdjust={(festival) => adjustMealPlanForFestival(userProfile || getUserProfile(), mealPlan?.days?.[0], festival, refreshPlan)} 
            />
            <RiskAlert riskData={riskData} />
            <NutritionBreakdown 
              userProfile={userProfile || getUserProfile()} 
              currentDayData={mealPlan?.days?.[0]} 
            />
            <MealPlanDisplay 
              mealPlan={mealPlan} 
              setView={setView} 
            />
          </div>
        );
      case 'chat':
        return (
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-300">
            <ChatAdjustment 
              setView={setView} 
              setMealPlan={setMealPlan}
              setIsLoadingGlobal={setIsLoading}
            />
          </div>
        );
      case 'history':
        return (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <HistoryVault setView={setView} setMealPlan={(plan) => setMealPlan(plan)} saveMealPlan={saveMealPlan} />
          </div>
        );
      default:
        return <OnboardingForm setView={setView} setIsLoading={setIsLoading} setMealPlan={setMealPlan} setRiskData={setRiskData}/>;
    }
  };

  return (
    <div className="bg-white min-h-screen text-gray-800 font-sans selection:bg-green-200">
      <div className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto relative min-h-screen bg-gray-50 shadow-2xl overflow-x-hidden border-x border-gray-100">
        
        {/* Main Content Area */}
        {renderContent()}

        {/* Bottom Navigation Navbar */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 pb-safe z-50 rounded-t-[30px] lg:rounded-t-none lg:border-x lg:border-b-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] md:shadow-sm max-w-md md:max-w-3xl lg:max-w-5xl mx-auto">
          <div className="flex justify-around md:justify-center md:gap-16 items-center">
            
            <button 
              onClick={() => setView('onboarding')}
              className={`flex flex-col items-center p-2 transition-all duration-300 ${view === 'onboarding' ? 'text-green-500 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <div className={`p-1.5 rounded-2xl ${view === 'onboarding' ? 'bg-green-50' : 'bg-transparent'}`}>
                <Home className="w-5 h-5" strokeWidth={view === 'onboarding' ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-semibold mt-1">Profile</span>
            </button>

            <button 
              onClick={() => {
                if(getMealPlan()) setView('mealplan');
                else alert("Please complete setup first!");
              }}
              className={`flex flex-col items-center p-2 transition-all duration-300 ${view === 'mealplan' ? 'text-green-500 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <div className={`p-1.5 rounded-2xl ${view === 'mealplan' ? 'bg-green-50' : 'bg-transparent'}`}>
                <CalendarDays className="w-5 h-5" strokeWidth={view === 'mealplan' ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-semibold mt-1">Meal Plan</span>
            </button>

            <button 
              onClick={() => {
                if(getMealPlan()) setView('chat');
                else alert("Please complete setup first!");
              }}
              className={`flex flex-col items-center p-2 transition-all duration-300 ${view === 'chat' ? 'text-green-500 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <div className={`p-1.5 rounded-2xl ${view === 'chat' ? 'bg-green-50' : 'bg-transparent'}`}>
                <MessageCircle className="w-5 h-5" strokeWidth={view === 'chat' ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-semibold mt-1">Coach</span>
            </button>

            <button 
              onClick={() => {
                if(getMealPlan()) setView('history');
                else alert("Please complete setup first!");
              }}
              className={`flex flex-col items-center p-2 transition-all duration-300 ${view === 'history' ? 'text-green-500 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <div className={`p-1.5 rounded-2xl ${view === 'history' ? 'bg-green-50' : 'bg-transparent'}`}>
                <Clock className="w-5 h-5" strokeWidth={view === 'history' ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-semibold mt-1">History</span>
            </button>

          </div>
        </nav>
      </div>
    </div>
  );
}

export default App;
