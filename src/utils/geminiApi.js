import { buildMealPlanPrompt, buildAdjustmentPrompt, buildRiskCheckPrompt, buildFestivalAdjustmentPrompt } from './promptBuilder';
import { saveMealPlan, getMealPlan, logAdjustment } from './localStorageUtils';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const cleanJsonResponse = (text) => {
  let cleaned = text.trim();
  // Try to find a JSON object or array within the text using regex
  const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  } else {
    // If no curly braces found, try strips
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.substring(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.substring(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }
  }
  
  try {
    return JSON.parse(cleaned.trim());
  } catch (e) {
    console.error("Raw text was:", text);
    throw new Error("Failed to parse AI response as JSON. Please try again.");
  }
};

const callGemini = async (prompt) => {
  if (!API_KEY) {
    throw new Error("Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your environment variables.");
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Gemini API Error details:", errorData);
    const errorMessage = errorData?.error?.message || response.statusText;
    throw new Error(`API Error: ${errorMessage}`);
  }

  const data = await response.json();
  
  if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
    console.error("Unknown response structure:", data);
    throw new Error("Invalid response format from Gemini API. Check your API key and quota.");
  }

  return cleanJsonResponse(data.candidates[0].content.parts[0].text);
};

export const generateMealPlan = async (userProfile) => {
  try {
    const prompt = buildMealPlanPrompt(userProfile);
    return await callGemini(prompt);
  } catch (error) {
    console.error("Error generating meal plan:", error);
    throw new Error("Could not generate meal plan. " + error.message);
  }
};

export const adjustMealPlan = async (userProfile, currentDayPlan, userMessage) => {
  try {
    const prompt = buildAdjustmentPrompt(userProfile, currentDayPlan, userMessage);
    return await callGemini(prompt);
  } catch (error) {
    console.error("Error adjusting meal plan:", error);
    throw new Error("Could not adjust meal plan. " + error.message);
  }
};

export const checkRisks = async (userProfile, weeklyPlan) => {
  try {
    const prompt = buildRiskCheckPrompt(userProfile, weeklyPlan);
    return await callGemini(prompt);
  } catch (error) {
    console.error("Error checking risks:", error);
    // If risk check fails, we don't want to break the whole app, so return safe default
    return { hasRisk: false, riskMessage: "", severity: "none" };
  }
};

export const adjustMealPlanForFestival = async (userProfile, currentDayPlan, festival, onUpdate) => {
  try {
    const prompt = buildFestivalAdjustmentPrompt(userProfile, currentDayPlan, festival);
    
    if (!API_KEY) throw new Error("Gemini API key is not configured.");

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!response.ok) {
      throw new Error("API Error fetching festival adjustment.");
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!rawText) throw new Error("Invalid response format from Gemini API.");

    let cleanText = rawText.trim();
    if (cleanText.startsWith('\`\`\`json')) cleanText = cleanText.substring(7);
    else if (cleanText.startsWith('\`\`\`')) cleanText = cleanText.substring(3);
    if (cleanText.endsWith('\`\`\`')) cleanText = cleanText.substring(0, cleanText.length - 3);

    const updatedDay = JSON.parse(cleanText.trim());

    const currentWeeklyPlan = getMealPlan();
    if (currentWeeklyPlan && currentWeeklyPlan.days) {
      const dayIndex = currentWeeklyPlan.days.findIndex(d => d.day === currentDayPlan.day);
      if (dayIndex !== -1) {
        currentWeeklyPlan.days[dayIndex] = updatedDay;
        saveMealPlan(currentWeeklyPlan);
        logAdjustment("Festival adjustment: " + festival.name, currentDayPlan.day);
        if (onUpdate) onUpdate();
      }
    }
    return updatedDay;
  } catch (error) {
    console.error("Error adjusting meal plan for festival:", error);
    throw new Error("We couldn't adjust the plan for the festival right now. Please try again.");
  }
};
