export const buildMealPlanPrompt = (userProfile) => {
  return `Act as an expert Indian Nutrition Coach. Create a personalized 7-day Indian meal plan based on the following user profile:
Name: ${userProfile.name}
Age: ${userProfile.age}
Weight: ${userProfile.weight} kg
Height: ${userProfile.height} cm
Diet Type: ${userProfile.dietType}
Region: ${userProfile.region}
Health Goal: ${userProfile.healthGoal}
Allergies: ${userProfile.allergies || 'None'}
Activity Level: ${userProfile.activityLevel}

You must respond STRICTLY with JSON matching this exact structure, with NO markdown formatting, NO extra text, and NO \`\`\`json blocks. Return ONLY the JSON object starting with { and ending with }:

{
  "days": [
    {
      "day": "Monday",
      "meals": {
        "breakfast": { "name": "", "calories": 0, "ingredients": [], "alternative": "" },
        "lunch": { "name": "", "calories": 0, "ingredients": [], "alternative": "" },
        "dinner": { "name": "", "calories": 0, "ingredients": [], "alternative": "" },
        "snacks": { "name": "", "calories": 0, "ingredients": [], "alternative": "" }
      },
      "totalCalories": 0,
      "macros": { "protein": 0, "carbs": 0, "fats": 0 }
    }
  ],
  "weeklyInsights": "A short engaging paragraph explaining why this plan works for them."
}`;
};

export const buildAdjustmentPrompt = (userProfile, currentDayPlan, userMessage) => {
  return `Act as an expert Indian Nutrition Coach. The user wants to adjust their meal plan for today.
User Profile Background: ${JSON.stringify(userProfile)}
Current Day Plan: ${JSON.stringify(currentDayPlan)}

User Message: "${userMessage}"

Read the user's message and adjust ONLY the remaining meals for today to compensate (e.g., if they skipped breakfast, redistribute calories. If they had heavy lunch, make dinner light. If they want to replace a dish, replace it).
Ensure the tone of your reasoning is warm and friendly.

You must respond STRICTLY with JSON matching this exact structure, with NO markdown formatting, NO extra text, and NO \`\`\`json blocks. Return ONLY the JSON object:

{
  "day": "Monday",
  "meals": {
    "breakfast": { "name": "", "calories": 0, "ingredients": [], "alternative": "" },
    "lunch": { "name": "", "calories": 0, "ingredients": [], "alternative": "" },
    "dinner": { "name": "", "calories": 0, "ingredients": [], "alternative": "" },
    "snacks": { "name": "", "calories": 0, "ingredients": [], "alternative": "" }
  },
  "totalCalories": 0,
  "macros": { "protein": 0, "carbs": 0, "fats": 0 },
  "agentReply": "A warm, friendly response explaining what changes were made and why, addressing the user's message directly."
}`;
};

export const buildRiskCheckPrompt = (userProfile, weeklyPlan) => {
  return `Act as a clinical Indian nutritionist checking for health risks.
User Profile: ${JSON.stringify(userProfile)}
Weekly Plan Overview: ${JSON.stringify(weeklyPlan.days.map(d => ({ day: d.day, calories: d.totalCalories, macros: d.macros })))}

Check for dangerous patterns (e.g., severely low calories for their weight/height, contradicting diet/health goals like high sugar for diabetes).

You must respond STRICTLY with JSON matching this exact structure, with NO markdown formatting, NO extra text, and NO \`\`\`json blocks. Return ONLY the JSON object:

{
  "hasRisk": false,
  "riskMessage": "Explanation if any risk found, else empty string",
  "severity": "low" // or "medium" or "high" or "none"
}`;
};

export const buildFestivalAdjustmentPrompt = (userProfile, currentDayPlan, festival) => {
  return `Act as an expert Indian Nutrition Coach. The user has a festival today and needs an adjusted plan.
User Profile Summary:
Name: ${userProfile.name}
Diet Type: ${userProfile.dietType}
Health Goal: ${userProfile.healthGoal}
Region: ${userProfile.region}
Allergies: ${userProfile.allergies || 'None'}

Current Day Plan Context: ${JSON.stringify(currentDayPlan)}

Today is: ${festival.name}
Festival Type: ${festival.type}
Fasting Rules / Festive Guidelines: ${festival.fastingRules || 'None specified'}

${festival.type === 'fast' 
  ? "CRITICAL INSTRUCTION: You must replace ALL meals strictly with fasting-compliant Indian food respecting the fasting rules exactly. No ingredient that violates fasting rules may appear anywhere."
  : "INSTRUCTION: Include traditional festive dishes for this festival while still respecting the user's health goal and diet type."}

You must respond STRICTLY with JSON matching this exact structure, representing ONLY this single day, with NO markdown formatting, NO extra text, and NO \`\`\`json blocks. Return ONLY the JSON object:

{
  "day": "${currentDayPlan.day}",
  "meals": {
    "breakfast": { "name": "", "calories": 0, "ingredients": [], "alternative": "" },
    "lunch": { "name": "", "calories": 0, "ingredients": [], "alternative": "" },
    "dinner": { "name": "", "calories": 0, "ingredients": [], "alternative": "" },
    "snacks": { "name": "", "calories": 0, "ingredients": [], "alternative": "" }
  },
  "totalCalories": 0,
  "macros": { "protein": 0, "carbs": 0, "fats": 0 }
}`;
};
