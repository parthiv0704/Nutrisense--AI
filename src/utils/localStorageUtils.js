const PROFILE_KEY = 'userProfile';
const MEAL_PLAN_KEY = 'mealPlan';
const CHAT_HISTORY_KEY = 'chatHistory';

export const saveUserProfile = (profile) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const getUserProfile = () => {
  const profile = localStorage.getItem(PROFILE_KEY);
  return profile ? JSON.parse(profile) : null;
};

export const saveMealPlan = (plan) => {
  localStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(plan));
};

export const getMealPlan = () => {
  const plan = localStorage.getItem(MEAL_PLAN_KEY);
  return plan ? JSON.parse(plan) : null;
};

export const saveChatHistory = (history) => {
  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
};

export const getChatHistory = () => {
  const history = localStorage.getItem(CHAT_HISTORY_KEY);
  return history ? JSON.parse(history) : [];
};

export const clearAll = () => {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(MEAL_PLAN_KEY);
  localStorage.removeItem(CHAT_HISTORY_KEY);
};

const HISTORY_KEY = 'nutrisense_plan_history';

export const savePlanSnapshot = (mealPlan) => {
  const history = getPlanHistory();
  const date = new Date();
  
  const id = `plan_${date.getTime()}`;
  const label = `Week of ${date.toLocaleString('en-US', { month: 'short', day: 'numeric' })}`;
  
  const snapshot = {
    id,
    createdAt: date.toISOString(),
    label,
    plan: mealPlan,
    adjustments: []
  };
  
  // Add to beginning to keep newest first
  history.unshift(snapshot);
  
  // Limit to maximum 10 snapshots
  if (history.length > 10) {
    history.length = 10;
  }
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

export const getPlanHistory = () => {
  const history = localStorage.getItem(HISTORY_KEY);
  return history ? JSON.parse(history) : [];
};

export const deletePlanSnapshot = (id) => {
  const history = getPlanHistory();
  const updated = history.filter(item => item.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
};

export const logAdjustment = (userMessage, changedDay) => {
  const history = getPlanHistory();
  if (history.length === 0) return;
  
  const entry = {
    timestamp: new Date().toISOString(),
    userMessage,
    changedDay
  };
  
  // Appends to most recent snapshot
  history[0].adjustments.push(entry);
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

export const getAdjustmentLog = () => {
  const history = getPlanHistory();
  let all = [];
  
  history.forEach(snapshot => {
    // Reverse individual snapshot adjustments since they were appended (pushed)
    const recentFirst = [...(snapshot.adjustments || [])].reverse();
    all = all.concat(recentFirst);
  });
  
  return all;
};
