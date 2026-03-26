import React from 'react';
import { getTodaysFestivals, getUpcomingFestivals } from '../utils/festivalCalendar';

const FestivalBanner = ({ festivals, onAdjust }) => {
  if (!festivals || festivals.length === 0) return null;

  const todayFestivals = getTodaysFestivals(festivals);
  const upcomingFestivals = getUpcomingFestivals(festivals, 7).slice(0, 2);

  if (todayFestivals.length === 0 && upcomingFestivals.length === 0) return null;

  const getDaysUntil = (dateStr) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const festDate = new Date(dateStr);
    festDate.setHours(0,0,0,0);
    const diffTime = festDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="mx-4 mt-6 space-y-3">
      {todayFestivals.map((fest, idx) => (
        <div key={`today-${idx}`} className="bg-orange-50 border border-orange-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🪔</span>
            <span className="font-bold text-gray-800">{fest.name}</span>
            {fest.type === 'fast' && <span className="bg-orange-100 text-orange-700 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ml-1">Fasting Day</span>}
            {fest.type === 'festive' && <span className="bg-yellow-100 text-yellow-700 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ml-1">Festive Day</span>}
            {fest.type === 'holiday' && <span className="bg-gray-100 text-gray-500 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ml-1">Holiday</span>}
          </div>
          
          {fest.fastingRules && (
            <p className="text-[13px] text-gray-700 mb-3 opacity-90 leading-snug font-medium">
              {fest.fastingRules}
            </p>
          )}

          {fest.fastingRules && (
            <button 
              onClick={() => onAdjust(fest)}
              className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm active:scale-[0.98] mt-1"
            >
              ✨ Adjust Today's Plan for {fest.name}
            </button>
          )}
        </div>
      ))}

      {upcomingFestivals.map((fest, idx) => {
        const days = getDaysUntil(fest.date);
        return (
          <div key={`upcoming-${idx}`} className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">🗓️</span>
              <span className="text-sm font-medium text-gray-700">
                {fest.name} is in {days} {days === 1 ? 'day' : 'days'}
              </span>
            </div>
            {fest.fastingRules && (
              <button 
                onClick={() => onAdjust(fest)}
                className="bg-white border border-yellow-200 text-yellow-700 hover:bg-yellow-100 text-xs font-bold py-1.5 px-3 rounded-lg transition-colors shadow-sm ml-2 shrink-0"
              >
                Plan Ahead
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FestivalBanner;
