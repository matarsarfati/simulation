import React, { useState } from 'react';
import { SAALevel } from './SAADisplay';

interface SAAInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: number, level: SAALevel) => void;
}

const SAAInputModal: React.FC<SAAInputModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [saaValue, setSaaValue] = useState<string>('');
  const [isInvalid, setIsInvalid] = useState<boolean>(false);
  
  if (!isOpen) return null;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setSaaValue(value);
      setIsInvalid(false);
    }
  };
  
  const generateRandomValue = () => {
    // Generate a random sAA value between 35-160 U/mL
    const randomValue = Math.floor(Math.random() * (160 - 35 + 1)) + 35;
    setSaaValue(randomValue.toString());
    setIsInvalid(false);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!saaValue) {
      setIsInvalid(true);
      return;
    }
    
    const numericValue = parseInt(saaValue, 10);
    
    // Determine sAA level based on value
    let level: SAALevel = 'moderate';
    if (numericValue < 50) level = 'low';
    else if (numericValue > 80) level = 'high';
    
    onSubmit(numericValue, level);
    
    // Reset the form for next time
    setSaaValue('');
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Salivary Alpha-Amylase (sAA) Measurement</h2>
        <p className="text-sm text-gray-600 mb-4">Please enter a sAA value or generate a random one:</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="saa-input" className="block text-sm font-medium text-gray-700 mb-1">
              sAA Value (U/mL):
            </label>
            <div className="flex">
              <input
                type="text"
                id="saa-input"
                value={saaValue}
                onChange={handleChange}
                placeholder="Enter value (35-160)"
                className={`block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                  isInvalid 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              <button
                type="button"
                onClick={generateRandomValue}
                className="ml-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Random
              </button>
            </div>
            {isInvalid && (
              <p className="mt-1 text-sm text-red-600">
                Please enter a valid sAA value or generate a random one.
              </p>
            )}
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

export default SAAInputModal;