import React from 'react';
import { Flame, Activity, Zap } from 'lucide-react';

const NutritionBreakdown = ({ userProfile, currentDayData }) => {
  if (!userProfile || !currentDayData) return null;

  const weight = parseFloat(userProfile.weight);
  const height = parseFloat(userProfile.height) / 100; // cm to m
  const bmi = (weight / (height * height)).toFixed(1);

  const macros = currentDayData.macros || { protein: 0, carbs: 0, fats: 0 };
  const calories = currentDayData.totalCalories || 0;

  // Simple approximations for percentages if totally arbitrary numbers are given structure
  const totalMacros = macros.protein + macros.carbs + macros.fats;
  const pRatio = totalMacros ? Math.round((macros.protein / totalMacros) * 100) : 30;
  const cRatio = totalMacros ? Math.round((macros.carbs / totalMacros) * 100) : 50;
  const fRatio = totalMacros ? Math.round((macros.fats / totalMacros) * 100) : 20;

  let bmiLabel = 'Healthy';
  let bmiColor = 'text-green-600';
  if (bmi < 18.5) { bmiLabel = 'Underweight'; bmiColor = 'text-blue-500'; }
  else if (bmi >= 25 && bmi < 29.9) { bmiLabel = 'Overweight'; bmiColor = 'text-yellow-600'; }
  else if (bmi >= 30) { bmiLabel = 'Obese'; bmiColor = 'text-red-500'; }

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 mb-6 mx-4 relative overflow-hidden">
      {/* Decorative bg shape */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-50 rounded-full blur-2xl opacity-50 pointer-events-none"></div>

      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-gray-500 text-sm font-medium mb-1 flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-400" /> Daily Target
          </h3>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-gray-800 tracking-tight">{calories}</span>
            <span className="text-gray-400 font-medium text-sm">kcal</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Current BMI</div>
          <div className="text-2xl font-bold text-gray-800">{bmi} <span className={`text-sm ${bmiColor} bg-opacity-20 px-2 py-0.5 rounded-full ml-1`}>{bmiLabel}</span></div>
        </div>
      </div>

      <div className="space-y-4 md:space-y-0 md:flex md:gap-6">
        {/* Protein */}
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1.5 font-medium text-gray-700">
            <span>Protein</span>
            <span className="text-gray-500">{macros.protein}g ({pRatio}%)</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div className="bg-indigo-500 h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${pRatio}%` }}></div>
          </div>
        </div>
        
        {/* Carbs */}
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1.5 font-medium text-gray-700">
            <span>Carbs</span>
            <span className="text-gray-500">{macros.carbs}g ({cRatio}%)</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div className="bg-orange-400 h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${cRatio}%` }}></div>
          </div>
        </div>

        {/* Fats */}
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1.5 font-medium text-gray-700">
            <span>Fats</span>
            <span className="text-gray-500">{macros.fats}g ({fRatio}%)</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div className="bg-yellow-400 h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${fRatio}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionBreakdown;
