import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

const RiskAlert = ({ riskData }) => {
  if (!riskData || !riskData.hasRisk) return null;

  const getStyles = () => {
    switch (riskData.severity?.toLowerCase()) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'low':
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };

  const getIconColor = () => {
    switch (riskData.severity?.toLowerCase()) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-orange-500';
      case 'low': default: return 'text-yellow-500';
    }
  };

  return (
    <div className={`mx-4 my-4 p-4 rounded-xl border ${getStyles()} flex items-start shadow-sm transition-all`}>
      <AlertTriangle className={`w-5 h-5 mr-3 shrink-0 mt-0.5 ${getIconColor()}`} />
      <div className="flex-1">
        <h4 className="font-medium text-sm mb-1 uppercase tracking-wider">
          Health Insight
        </h4>
        <p className="text-sm opacity-90 leading-relaxed mb-3">
          {riskData.riskMessage}
        </p>
        
        {riskData.severity?.toLowerCase() === 'high' && (
          <button className="bg-red-100 text-red-800 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium w-full flex items-center justify-center hover:bg-red-200 transition-colors">
            <Info className="w-4 h-4 mr-2" />
            Please Consult a Doctor
          </button>
        )}
      </div>
    </div>
  );
};

export default RiskAlert;
