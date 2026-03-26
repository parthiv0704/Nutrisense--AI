import React, { useState } from 'react';
import { Leaf, User, Scale, Ruler, Activity, Target } from 'lucide-react';
import { generateMealPlan, checkRisks } from '../utils/geminiApi';
import { saveUserProfile, saveMealPlan, savePlanSnapshot } from '../utils/localStorageUtils';
import LoadingSkeleton from './LoadingSkeleton';

const OnboardingForm = ({ setView, setIsLoading, setMealPlan, setRiskData }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    weight: '',
    height: '',
    dietType: 'Vegetarian',
    region: 'North Indian',
    healthGoal: 'General Wellness',
    allergies: '',
    activityLevel: 'Sedentary'
  });
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.age || !formData.weight || !formData.height) {
      setError('Please fill out all required fields.');
      return;
    }

    try {
      setError('');
      setIsGenerating(true);
      // Save profile immediately
      saveUserProfile(formData);

      const plan = await generateMealPlan(formData);
      saveMealPlan(plan);
      savePlanSnapshot(plan);
      setMealPlan(plan);

      // Perform background risk check
      const risks = await checkRisks(formData, plan);
      setRiskData(risks);
      
      // Navigate ONLY on success
      setView('mealplan');
    } catch (err) {
      setError(err.message || 'Failed to generate meal plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="pt-8 min-h-screen bg-gray-50">
        <div className="px-6 text-center mb-6 mt-12">
          <h2 className="text-2xl font-bold text-gray-800 animate-pulse">Designing your custom plan...</h2>
          <p className="text-gray-500 text-sm mt-2">Analyzing your health goals and regional preferences.</p>
          <p className="text-green-600 text-xs mt-1 font-medium">This usually takes about 5-10 seconds via Gemini AI.</p>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto min-h-screen px-6 py-10 pb-32 relative overflow-hidden">
      {/* Sleek Decorative header */}
      <div className="absolute top-0 left-0 right-0 h-[26rem] bg-gradient-to-br from-green-900 via-green-700 to-emerald-600 rounded-b-[40px] md:rounded-b-[80px] z-0 shadow-xl border-b border-green-800/30"></div>
      
      <div className="text-center mb-8 pt-6 relative z-10">
        <h1 className="text-4xl font-extrabold text-white mb-3 flex items-center justify-center gap-3 drop-shadow-2xl">
          <Leaf className="w-10 h-10 text-green-300 drop-shadow-lg" /> NutriSense AI
        </h1>
        <p className="text-green-50 backdrop-blur-md bg-black/20 inline-block px-5 py-2 rounded-full font-semibold border border-white/10 shadow-lg text-sm sm:text-base">
          Your Personal Indian Nutrition Coach
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/50 p-6 md:p-8 space-y-6 flex flex-col items-stretch relative z-10 mt-4">
        <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-2 flex items-center gap-2">
          <User className="w-5 h-5 text-green-500" /> Tell us about you
        </h2>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-4 md:space-y-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-sm"
              placeholder="e.g. Rahul Sharma"
              required
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Age *</label>
              <input 
                type="number" 
                name="age" 
                value={formData.age} 
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm"
                placeholder="Years"
                required
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Scale className="w-4 h-4 text-gray-400"/> Weight *</label>
              <input 
                type="number" 
                name="weight" 
                value={formData.weight} 
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm"
                placeholder="kg"
                required
                min="1"
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Ruler className="w-4 h-4 text-gray-400"/> Height *</label>
              <input 
                type="number" 
                name="height" 
                value={formData.height} 
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm"
                placeholder="in cm (e.g. 170)"
                required
                min="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diet Type *</label>
              <div className="relative">
                <select name="dietType" value={formData.dietType} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none text-sm transition-all">
                  <option>Vegetarian</option>
                  <option>Non-Vegetarian</option>
                  <option>Vegan</option>
                  <option>Jain</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Region *</label>
              <select name="region" value={formData.region} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none text-sm transition-all">
                <option>North Indian</option>
                <option>South Indian</option>
                <option>East Indian</option>
                <option>West Indian</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Target className="w-4 h-4 text-gray-400"/> Health Goal *</label>
              <select name="healthGoal" value={formData.healthGoal} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none text-sm font-medium text-green-700 transition-all">
                <option>Weight Loss</option>
                <option>Muscle Gain</option>
                <option>Manage Diabetes</option>
                <option>General Wellness</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Activity className="w-4 h-4 text-gray-400"/> Activity Level *</label>
              <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none text-sm transition-all">
                <option>Sedentary</option>
                <option>Lightly Active</option>
                <option>Very Active</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Allergies (Optional)</label>
            <input 
              type="text" 
              name="allergies" 
              value={formData.allergies} 
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm"
              placeholder="e.g. Peanuts, Dairy"
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 active:scale-[0.98] mt-6 flex justify-center items-center transition-all duration-300"
        >
          ✨ Generate My Personal Plan
        </button>
      </form>
    </div>
  );
};

export default OnboardingForm;
