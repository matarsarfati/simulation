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
    onSubmit(responses);
    onClose();
  };

  // Create the options for the scale 1-9
  const renderOptions = (question: keyof SurveyResponses) => {
    return Array.from({ length: 9 }, (_, i) => i + 1).map(value => (
      <div key={value} className="flex items-center">
        <input
          type="radio"
          id={`${question}-${value}`}
          name={question}
          value={value}
          checked={responses[question] === value}
          onChange={() => handleChange(question, value)}
          className="mr-2"
        />
        <label htmlFor={`${question}-${value}`} className="text-sm">{value}</label>
      </div>
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Quick Survey</h2>
        <p className="text-sm text-gray-600 mb-4">Please answer these questions about your recent performance:</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <h3 className="font-semibold text-green-700">Emotional Arousal (IZOF)</h3>
            <p className="text-sm mb-2">To what extent was your emotional arousal optimal for performance?</p>
            <div className="flex justify-between px-2">
              <span className="text-xs">Not at all</span>
              <span className="text-xs">Very much</span>
            </div>
            <div className="flex justify-between">
              {renderOptions('emotionalArousal')}
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="font-semibold text-orange-600">Momentum</h3>
            <p className="text-sm mb-2">Did you feel 'on a roll'?</p>
            <div className="flex justify-between px-2">
              <span className="text-xs">Not at all</span>
              <span className="text-xs">Very much</span>
            </div>
            <div className="flex justify-between">
              {renderOptions('momentum')}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold text-blue-600">Flow</h3>
            <p className="text-sm mb-2">Were you fully immersed in the game?</p>
            <div className="flex justify-between px-2">
              <span className="text-xs">Not at all</span>
              <span className="text-xs">Very much</span>
            </div>
            <div className="flex justify-between">
              {renderOptions('flow')}
            </div>
          </div>
          
          <div className="flex justify-end">
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
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