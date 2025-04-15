import React, { useState } from 'react';
import { StatType } from './PlayerPanel';
import { SurveyResponses } from './SurveyModal';
import SurveyModal from './SurveyModal';
import SAADisplay, { SAALevel } from './SAADisplay';

export type EventData = {
  timelinePoint: number;
  quarter: number;
  timestamp: Date;
  actions: StatType[];
  surveyResponses: SurveyResponses | null;
  saaValue: number | null;
  saaLevel: SAALevel | null;
};

interface EventBlockGeneratorProps {
  currentQuarter: number;
  logAction: (statType: StatType) => void;
  setPlayerStatus: (status: 'On Court' | 'Bench') => void;
  advanceGameTime: (seconds: number) => void;
  onEventGenerated: (eventData: EventData) => void;
  timelinePoint: number;
}

const EventBlockGenerator: React.FC<EventBlockGeneratorProps> = ({
  currentQuarter,
  logAction,
  setPlayerStatus,
  advanceGameTime,
  onEventGenerated,
  timelinePoint
}) => {
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [showSAA, setShowSAA] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(2.5); // Default 2.5 minutes
  const [saaData, setSaaData] = useState<{ value: number, level: SAALevel } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentEventData, setCurrentEventData] = useState<Partial<EventData> | null>(null);
  
  // Generate random player actions
  const generateRandomActions = (): StatType[] => {
    const possibleActions: StatType[] = ['points', 'assists', 'rebounds', 'turnovers', 'goodDecisions', 'badDecisions'];
    const weights = [0.3, 0.2, 0.2, 0.1, 0.1, 0.1]; // Probability weights
    
    // Determine number of actions (between 3-5)
    const numActions = Math.floor(Math.random() * 3) + 3;
    
    const selectedActions: StatType[] = [];
    
    for (let i = 0; i < numActions; i++) {
      // Use weighted random selection
      const randomValue = Math.random();
      let cumulativeWeight = 0;
      
      for (let j = 0; j < possibleActions.length; j++) {
        cumulativeWeight += weights[j];
        if (randomValue <= cumulativeWeight) {
          selectedActions.push(possibleActions[j]);
          break;
        }
      }
    }
    
    return selectedActions;
  };
  
  // Calculate sAA value based on survey responses
  const calculateSAAValue = (responses: SurveyResponses): { value: number, level: SAALevel } => {
    const baseValue = 30; // Base sAA value
    
    // Add contribution from each survey response
    const arousalContribution = responses.emotionalArousal * 2; // 2-18 contribution
    const momentumContribution = responses.momentum * 1.5; // 1.5-13.5 contribution
    const flowContribution = responses.flow * 3; // 3-27 contribution
    
    // Calculate total with some randomness
    const randomFactor = Math.random() * 10 - 5; // -5 to +5 random adjustment
    const calculatedValue = Math.round(baseValue + arousalContribution + momentumContribution + flowContribution + randomFactor);
    
    // Determine level based on value
    let level: SAALevel = 'moderate';
    if (calculatedValue < 50) level = 'low';
    else if (calculatedValue > 80) level = 'high';
    
    return {
      value: calculatedValue,
      level
    };
  };
  
  // Handle the complete event block generation
  const generateEventBlock = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    
    // Create timestamp at the start - this fixes the scope issue
    const eventTimestamp = new Date();
    
    // Store event data
    const actions = generateRandomActions();
    
    setCurrentEventData({
      timelinePoint,
      quarter: currentQuarter,
      timestamp: eventTimestamp,
      actions
    });
    
    // Process the actions with delays
    for (const action of actions) {
      logAction(action);
      // Short delay between actions
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Transition player to bench
    setPlayerStatus('Bench');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Open the survey
    setIsSurveyOpen(true);
  };
  
  // Handle survey submission
  const handleSurveySubmit = (responses: SurveyResponses) => {
    // Update current event data
    setCurrentEventData(prev => ({
      ...prev,
      surveyResponses: responses
    }));
    
    // Calculate and display sAA value
    const saaResult = calculateSAAValue(responses);
    setSaaData(saaResult);
    setShowSAA(true);
    
    // Update event data with sAA
    setCurrentEventData(prev => ({
      ...prev,
      saaValue: saaResult.value,
      saaLevel: saaResult.level
    }));
    
    // Advance game time after a delay
    setTimeout(() => {
      // Convert minutes to seconds
      const timeAdvancement = Math.round(selectedDuration * 60);
      advanceGameTime(timeAdvancement);
      
      // Complete the event
      if (currentEventData) {
        const finalEventData: EventData = {
          timelinePoint,
          quarter: currentQuarter, 
          timestamp: currentEventData.timestamp!, // Use the timestamp from current event data
          actions: currentEventData.actions || [],
          surveyResponses: responses,
          saaValue: saaResult.value,
          saaLevel: saaResult.level
        };
        
        onEventGenerated(finalEventData);
      }
      
      // Reset states after a delay
      setTimeout(() => {
        setShowSAA(false);
        setIsGenerating(false);
      }, 2000);
    }, 2000);
  };
  
  return (
    <div className="my-4">
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold mb-4">Event Block Generator</h2>
        
        {/* Duration selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Simulation Duration (minutes):
          </label>
          <select 
            value={selectedDuration}
            onChange={(e) => setSelectedDuration(parseFloat(e.target.value))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
            disabled={isGenerating}
          >
            <option value={1}>1.0</option>
            <option value={1.5}>1.5</option>
            <option value={2}>2.0</option>
            <option value={2.5}>2.5</option>
            <option value={3}>3.0</option>
            <option value={3.5}>3.5</option>
          </select>
        </div>
        
        {/* Generate button */}
        <button
          onClick={generateEventBlock}
          disabled={isGenerating}
          className={`w-full py-3 px-4 rounded-md text-white font-bold text-lg ${
            isGenerating 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-purple-600 hover:bg-purple-700 transition-colors'
          }`}
        >
          {isGenerating ? 'Generating...' : 'Generate Event Block'}
        </button>
        
        {/* SAA Display */}
        {saaData && (
          <SAADisplay 
            value={saaData.value} 
            level={saaData.level} 
            isVisible={showSAA} 
          />
        )}
      </div>
      
      {/* Survey Modal */}
      <SurveyModal 
        isOpen={isSurveyOpen}
        onClose={() => setIsSurveyOpen(false)}
        onSubmit={handleSurveySubmit}
      />
    </div>
  );
};

export default EventBlockGenerator;