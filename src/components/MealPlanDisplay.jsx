import React, { useState } from 'react';
import { ChefHat, Flame, MessageCircle, AlertCircle, ArrowRight, RefreshCw, ChevronDown, Loader2 } from 'lucide-react';

const MEALS_ORDER = ['breakfast', 'lunch', 'snacks', 'dinner'];

const RecipeDropdown = ({ day, mealType, meal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [recipe, setRecipe] = useState('');

  const formattedDay = day.toLowerCase().replace(/\s+/g, '_');
  const formattedMeal = mealType.toLowerCase().replace(/\s+/g, '_');
  const cacheKey = `nutrisense_recipe_${formattedDay}_${formattedMeal}`;

  const fetchRecipe = async () => {
    if (recipe) return;
    
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setRecipe(cached);
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key missing");

      const mealName = meal.name || 'dish';
      const ingredients = meal.ingredients?.join(', ') || 'standard ingredients';
      
      const prompt = `Write a warm, friendly, easy-to-follow cooking guide for "${mealName}" — 
a popular Indian dish made with ${ingredients}.

Write it as ONE flowing paragraph (4–6 sentences). Cover:
- How to prepare or pre-soak any key ingredients
- The main cooking steps in order
- One practical tip that makes the dish taste better

Tone: like a helpful Indian home cook explaining to a friend. 
No bullet points, no markdown, plain text only.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) throw new Error('Invalid response from AI');

      const cleanText = text.replace(/```.*?```/gs, '').trim(); 
      setRecipe(cleanText);
      localStorage.setItem(cacheKey, cleanText);
    } catch (err) {
      console.error("Recipe fetch error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && !recipe && !loading && !error) {
      fetchRecipe();
    }
  };

  return (
    <div className="mt-4 pt-3 border-t border-gray-100">
      <div className="flex justify-start">
        <button 
          onClick={toggle}
          className="flex items-center text-sm font-semibold text-green-600 hover:text-green-700 transition-colors"
        >
          <span>{isOpen ? 'Hide instructions' : '🍳 How to make it'}</span>
          <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'}`}
      >
        {loading && (
          <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-center justify-center space-x-2 text-green-700 text-sm">
            <Loader2 className="w-4 h-4 animate-spin text-green-500" />
            <span>Fetching recipe…</span>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex flex-col items-start">
            <p className="text-red-600 text-sm mb-2 font-medium">Couldn't load instructions.</p>
            <button 
              onClick={(e) => { e.stopPropagation(); fetchRecipe(); }}
              className="px-4 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded-full hover:bg-red-200 transition-colors mt-2"
            >
              Retry
            </button>
          </div>
        )}

        {recipe && !loading && !error && (
          <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{recipe}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const MealPlanDisplay = ({ mealPlan, setView }) => {
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  if (!mealPlan || !mealPlan.days || mealPlan.days.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-6">
        <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-gray-500 font-medium">No meal plan found. Let's create one!</p>
        <button 
          onClick={() => setView('onboarding')}
          className="mt-6 px-6 py-2 bg-green-500 text-white rounded-full font-medium shadow-sm hover:bg-green-600 transition-colors"
        >
          Go to Setup
        </button>
      </div>
    );
  }

  const days = mealPlan.days;
  const currentDay = days[activeDayIndex] || days[0];

  return (
    <div className="pb-24 max-w-md md:max-w-3xl lg:max-w-5xl mx-auto relative min-h-screen">
      
      {/* Scrollable Days Navigation */}
      <div className="sticky top-0 z-20 bg-gray-50/90 backdrop-blur-md pt-4 pb-2 border-b border-gray-100 px-4">
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
          {days.map((day, index) => {
            const shortDay = day.day.substring(0, 3); // "Mon", "Tue"
            const isActive = index === activeDayIndex;
            return (
              <button
                key={index}
                onClick={() => setActiveDayIndex(index)}
                className={`flex flex-col items-center min-w-[3.5rem] py-2 px-1 rounded-2xl transition-all duration-300 ${
                  isActive 
                  ? 'bg-green-500 text-white shadow-md shadow-green-500/30 scale-105' 
                  : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-100'
                }`}
              >
                <span className="text-xs font-semibold uppercase tracking-wide">{shortDay}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Week Insights Banner */}
      {mealPlan.weeklyInsights && activeDayIndex === 0 && (
        <div className="mx-4 mt-6 mb-2 p-4 bg-green-50 border border-green-100 rounded-2xl">
          <h4 className="flex items-center text-green-800 font-semibold text-sm mb-1 gap-1">
            <ChefHat className="w-4 h-4" /> Coach Note
          </h4>
          <p className="text-sm text-green-700 leading-relaxed opacity-90">
            {mealPlan.weeklyInsights}
          </p>
        </div>
      )}

      <div className="flex justify-between items-center px-6 mt-6 mb-4">
        <h2 className="text-xl font-bold tracking-tight text-gray-800">{currentDay.day}'s Meals</h2>
        <div className="text-sm px-3 py-1 bg-gray-200 text-gray-700 font-bold rounded-full">{currentDay.totalCalories} cals</div>
      </div>

      <div className="px-4 space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4">
        {MEALS_ORDER.map((mealType) => {
          const meal = currentDay.meals[mealType];
          if (!meal) return null;

          return (
            <div key={mealType} className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-50 to-transparent rounded-bl-full -z-10 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
              
              <div className="flex justify-between items-start mb-3">
                <span className="uppercase text-[10px] font-bold tracking-widest text-green-500 bg-green-50 px-2 py-0.5 rounded-md">
                  {mealType}
                </span>
                <span className="flex items-center text-xs font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                  <Flame className="w-3 h-3 mr-1" />
                  {meal.calories}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-800 leading-tight mb-2 pr-4">{meal.name}</h3>

              <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
                {meal.ingredients && meal.ingredients.length > 0 ? (
                  meal.ingredients.map((ing, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded flex items-center shadow-sm">
                      {ing}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400 italic">No specific ingredients listed</span>
                )}
              </div>

              {meal.alternative && (
                <div className="mt-3 pt-3 border-t border-dashed border-gray-200 flex items-start">
                  <RefreshCw className="w-3.5 h-3.5 text-gray-400 mr-2 mt-0.5" />
                  <p className="text-[13px] text-gray-500 italic">
                    <span className="font-semibold not-italic text-gray-600">Swap:</span> {meal.alternative}
                  </p>
                </div>
              )}

              <RecipeDropdown day={currentDay.day.toLowerCase()} mealType={mealType.toLowerCase()} meal={meal} />
            </div>
          );
        })}
      </div>

      {/* Floating Action Button for Agentic Chat */}
      <button 
        onClick={() => setView('chat')}
        className="fixed bottom-24 right-6 bg-gray-900 text-white p-4 rounded-full shadow-lg shadow-gray-900/30 hover:scale-105 active:scale-95 transition-all z-30 group flex items-center justify-center border-4 border-gray-50"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border border-white"></span>
        </span>
      </button>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default MealPlanDisplay;
