import React from 'react';

export type SAALevel = 'low' | 'moderate' | 'high';

interface SAADisplayProps {
  value: number;
  level: SAALevel;
  isVisible: boolean;
}

const SAADisplay: React.FC<SAADisplayProps> = ({ value, level, isVisible }) => {
  if (!isVisible) return null;

  // Determine the background color based on level
  const bgColor = 
    level === 'low' ? 'bg-green-100 text-green-800 border-green-300' :
    level === 'moderate' ? 'bg-orange-100 text-orange-800 border-orange-300' :
    'bg-red-100 text-red-800 border-red-300';

  return (
    <div className={`mt-4 p-4 rounded-lg border ${bgColor} animate-fade-in`}>
      <h3 className="font-bold mb-1 text-lg">Salivary Alpha-Amylase (sAA) Result</h3>
      <p className="text-sm mb-2">Biological stress marker measurement:</p>
      <div className="flex justify-center">
        <div className="text-4xl font-bold">{value} <span className="text-base font-normal">U/mL</span></div>
      </div>
      <div className="text-center mt-2">
        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-50">
          {level.charAt(0).toUpperCase() + level.slice(1)} Level
        </span>
      </div>
    </div>
  );
};

export default SAADisplay;