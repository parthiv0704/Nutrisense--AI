import React from 'react';

const LoadingSkeleton = () => {
  return (
    <div className="w-full max-w-md md:max-w-3xl lg:max-w-5xl mx-auto p-4 animate-pulse">
      <div className="h-8 bg-green-200 rounded w-3/4 mb-6 md:w-1/2"></div>
      
      <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-5 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
          <div className="mt-4 flex gap-2">
            <div className="h-6 bg-green-100 rounded-full w-16"></div>
            <div className="h-6 bg-green-100 rounded-full w-20"></div>
            <div className="h-6 bg-green-100 rounded-full w-14"></div>
          </div>
        </div>
      ))}
      </div>
      <div className="mt-8">
        <div className="h-32 bg-gray-200 rounded-lg w-full"></div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
