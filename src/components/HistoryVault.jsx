import React, { useState, useEffect } from 'react';
import { getPlanHistory, deletePlanSnapshot } from '../utils/localStorageUtils';
import { Trash2, RotateCcw, ChevronDown, Clock, CheckCircle } from 'lucide-react';

const HistoryVault = ({ setView, setMealPlan, saveMealPlan }) => {
  const [history, setHistory] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    setHistory(getPlanHistory());
  }, []);

  const handleRestore = (plan) => {
    saveMealPlan(plan);
    setMealPlan(plan);
    setView('mealplan');
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    deletePlanSnapshot(id);
    setHistory(getPlanHistory());
    setConfirmDeleteId(null);
  };

  if (history.length === 0) {
    return (
      <div className="pb-24 max-w-md md:max-w-3xl lg:max-w-5xl mx-auto min-h-screen px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          📋 Meal History
        </h2>
        <div className="flex flex-col items-center justify-center mt-24 text-center space-y-3">
          <span className="text-6xl">🥗</span>
          <p className="text-gray-400 font-medium leading-relaxed">No saved plans yet.<br/>Generate your first plan to start your history!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 max-w-md md:max-w-3xl lg:max-w-5xl mx-auto min-h-screen px-4 py-8 relative">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        📋 Meal History
      </h2>

      <div className="space-y-4">
        {history.map((snapshot) => {
          const isExpanded = expandedId === snapshot.id;
          const isConfirming = confirmDeleteId === snapshot.id;
          
          return (
            <div key={snapshot.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transform transition-all duration-300">
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : snapshot.id)}
              >
                <div>
                  <h3 className="font-bold text-gray-800 text-lg leading-tight">{snapshot.label}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(snapshot.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  {snapshot.adjustments && snapshot.adjustments.length > 0 && (
                    <span className="bg-orange-100 text-orange-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-orange-200">
                      {snapshot.adjustments.length} {snapshot.adjustments.length === 1 ? 'edit' : 'edits'}
                    </span>
                  )}
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </div>

              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100 border-t border-gray-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-4 bg-gray-50/50">
                  
                  {/* Adjustment Timeline */}
                  {snapshot.adjustments && snapshot.adjustments.length > 0 ? (
                    <div className="mb-6 pl-2">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 ml-2">Edit Timeline</h4>
                      <div className="border-l-2 border-orange-200 space-y-5 ml-3">
                        {snapshot.adjustments.map((adj, idx) => (
                          <div key={idx} className="relative pl-5 w-full">
                            <span className="absolute -left-[5px] top-1.5 w-2 h-2 bg-orange-400 rounded-full ring-4 ring-white"></span>
                            <div className="text-xs text-gray-400 mb-0.5 font-medium">
                              {new Date(adj.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute:'2-digit' })} • {adj.changedDay}
                            </div>
                            <div className="text-sm text-gray-700 font-bold leading-snug">"{adj.userMessage}"</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic mb-4 px-2">No adjustments registered in this snapshot.</p>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRestore(snapshot.plan); }}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-4 rounded-xl flex justify-center items-center gap-2 transition-all shadow-sm active:scale-95 text-sm"
                    >
                      <RotateCcw className="w-4 h-4" /> Restore this plan
                    </button>
                    
                    {isConfirming ? (
                      <div className="flex gap-2 flex-1 items-center bg-red-50 p-1.5 rounded-xl border border-red-200" onClick={(e) => e.stopPropagation()}>
                        <span className="text-xs font-semibold text-red-600 ml-2 mr-1">Are you sure?</span>
                        <button onClick={(e) => handleDelete(snapshot.id, e)} className="flex-1 bg-red-500 hover:bg-red-600 transition-colors text-white text-xs font-bold py-1.5 rounded-lg active:scale-95">Confirm</button>
                        <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }} className="flex-1 bg-white text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200 text-xs font-bold py-1.5 rounded-lg active:scale-95">Cancel</button>
                      </div>
                    ) : (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(snapshot.id); }}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors active:scale-95 shrink-0 border border-transparent hover:border-red-100"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    )}
                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryVault;
