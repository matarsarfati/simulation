import React, { useState } from 'react';

export type SurveyResponses = {
  emotionalArousal: number;
  momentum: number;
  flow: number;
};

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (responses: SurveyResponses) => void;
}

const SurveyModal: React.FC<SurveyModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [responses, setResponses] = useState<SurveyResponses>({
    emotionalArousal: 5,
    momentum: 5,
    flow: 5,
  });

  if (!isOpen) return null;

  const handleChange = (question: keyof SurveyResponses, value: number) => {
    setResponses(prev => ({
      ...prev,
      [question]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Survey responses being submitted:", responses);
    onSubmit(responses);
  };

  // Render a scale from 1-9
  const renderScale = (question: keyof SurveyResponses) => {
    return (
      <div className="flex justify-between items-center mt-1">
        {Array.from({ length: 9 }, (_, i) => i + 1).map(value => (
          <div key={value} className="flex flex-col items-center">
            <label 
              htmlFor={`${question}-${value}`} 
              className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 cursor-pointer
                ${responses[question] === value 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              {value}
            </label>
            <input
              type="radio"
              id={`${question}-${value}`}
              name={question}
              value={value}
              checked={responses[question] === value}
              onChange={() => handleChange(question, value)}
              className="sr-only" // Visually hidden, using label styling instead
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Quick Survey</h2>
        <p className="text-sm text-gray-600 mb-4">Please answer these questions about your recent performance:</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h3 className="font-semibold text-green-700">Emotional Arousal (IZOF)</h3>
            <p className="text-sm mb-2">To what extent was your emotional arousal optimal for performance?</p>
            <div className="flex justify-between px-2 text-xs text-gray-500">
              <span>Not at all</span>
              <span>Very much</span>
            </div>
            {renderScale('emotionalArousal')}
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold text-orange-600">Momentum</h3>
            <p className="text-sm mb-2">Did you feel 'on a roll'?</p>
            <div className="flex justify-between px-2 text-xs text-gray-500">
              <span>Not at all</span>
              <span>Very much</span>
            </div>
            {renderScale('momentum')}
          </div>
          
          <div className="mb-8">
            <h3 className="font-semibold text-blue-600">Flow</h3>
            <p className="text-sm mb-2">Were you fully immersed in the game?</p>
            <div className="flex justify-between px-2 text-xs text-gray-500">
              <span>Not at all</span>
              <span>Very much</span>
            </div>
            {renderScale('flow')}
          </div>
          
          <div className="flex justify-between">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SurveyModal;