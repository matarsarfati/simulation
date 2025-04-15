import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import SurveyModal, { SurveyResponses } from './SurveyModal';
import SAAInputModal from './SAAInputModal';
import { SAALevel } from './SAADisplay';

// Type definitions
export type StatType = "points" | "assists" | "rebounds" | "turnovers" | "goodDecisions" | "badDecisions";
export type PlayerStatus = "On Court" | "Bench";

export type PlayerStatsByTimeline = {
  [timepoint: number]: Record<StatType, number>;
};

export type PlayerInfo = {
  name: string;
  age: number;
  jerseyNumber: number;
  status: PlayerStatus;
};

export type CompleteTimelineData = {
  timelinePoint: number;
  stats: Record<StatType, number>;
  surveyResponses: SurveyResponses | null;
  saaValue: number | null;
  saaLevel: SAALevel | null;
};

interface PlayerPanelProps {
  currentQuarter: number;
  currentTimelinePoint: number;
  onTimelineDataPush?: (data: CompleteTimelineData) => void;
}

const PlayerPanel = forwardRef<any, PlayerPanelProps>(({ currentQuarter, currentTimelinePoint, onTimelineDataPush }, ref) => {
  // Player information state
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo>({
    name: "Player 7",
    age: 22,
    jerseyNumber: 7,
    status: "On Court"
  });

  // Stats tracking state (now by timeline point instead of quarter)
  const [statsByTimeline, setStatsByTimeline] = useState<PlayerStatsByTimeline>({
    1: { points: 0, assists: 0, rebounds: 0, turnovers: 0, goodDecisions: 0, badDecisions: 0 },
    2: { points: 0, assists: 0, rebounds: 0, turnovers: 0, goodDecisions: 0, badDecisions: 0 },
    3: { points: 0, assists: 0, rebounds: 0, turnovers: 0, goodDecisions: 0, badDecisions: 0 },
    4: { points: 0, assists: 0, rebounds: 0, turnovers: 0, goodDecisions: 0, badDecisions: 0 },
    5: { points: 0, assists: 0, rebounds: 0, turnovers: 0, goodDecisions: 0, badDecisions: 0 },
    6: { points: 0, assists: 0, rebounds: 0, turnovers: 0, goodDecisions: 0, badDecisions: 0 },
    7: { points: 0, assists: 0, rebounds: 0, turnovers: 0, goodDecisions: 0, badDecisions: 0 }
  });

  // Modal states for data collection flow
  const [isSurveyOpen, setIsSurveyOpen] = useState<boolean>(false);
  const [isSAAInputOpen, setIsSAAInputOpen] = useState<boolean>(false);
  const [tempSurveyResponses, setTempSurveyResponses] = useState<SurveyResponses | null>(null);
  
  // For debugging
  useEffect(() => {
    console.log(`PlayerPanel received currentTimelinePoint: T${currentTimelinePoint}`);
  }, [currentTimelinePoint]);

  // Toggle player status
  const toggleStatus = () => {
    setPlayerInfo(prev => ({
      ...prev,
      status: prev.status === "On Court" ? "Bench" : "On Court"
    }));
  };

  // Set player status directly (for external components)
  const setPlayerStatus = (status: PlayerStatus) => {
    setPlayerInfo(prev => ({
      ...prev,
      status
    }));
  };

  // Log a new player action
  const logAction = (statType: StatType) => {
    setStatsByTimeline(prev => {
      const timelineStats = { ...prev[currentTimelinePoint] };
      timelineStats[statType] += 1;
      
      return {
        ...prev,
        [currentTimelinePoint]: timelineStats
      };
    });
  };

  // Start the save flow by opening the survey
  const startSaveFlow = () => {
    console.log("Starting save flow - opening survey modal");
    setIsSurveyOpen(true);
  };
  
  // Handle survey submission
  // This is the key part of PlayerPanel.tsx that needs fixing for survey data handling

// Handle survey submission
const handleSurveySubmit = (responses: SurveyResponses) => {
    console.log("Survey submitted with responses:", responses);
    
    // Store survey responses temporarily
    setTempSurveyResponses(responses);
    
    // Close survey modal
    setIsSurveyOpen(false);
    
    // Important: Open the sAA input modal AFTER closing the survey modal
    // Use setTimeout to ensure state updates have happened
    setTimeout(() => {
      console.log("Opening sAA input modal");
      setIsSAAInputOpen(true);
    }, 100);
  };
  
  // Handle sAA input submission
  const handleSAASubmit = (value: number, level: SAALevel) => {
    console.log(`sAA input submitted with value: ${value}, level: ${level}`);
    
    // Close sAA input modal
    setIsSAAInputOpen(false);
    
    // Get the current data for this timeline point
    const currentTimelineData = { ...statsByTimeline[currentTimelinePoint] };
    
    // Verify we have the survey data
    console.log("Survey data to be included:", tempSurveyResponses);
    
    // Create complete data package with all collected information
    const completeData: CompleteTimelineData = {
      timelinePoint: currentTimelinePoint,
      stats: currentTimelineData,
      surveyResponses: tempSurveyResponses,
      saaValue: value,
      saaLevel: level
    };
    
    console.log("Complete data package:", completeData);
    
    // Call the parent callback if provided
    if (onTimelineDataPush) {
      console.log(`Pushing complete data for T${currentTimelinePoint} to parent`);
      onTimelineDataPush(completeData);
    }
    
    // Reset the data for this timeline point
    setStatsByTimeline(prev => ({
      ...prev,
      [currentTimelinePoint]: { points: 0, assists: 0, rebounds: 0, turnovers: 0, goodDecisions: 0, badDecisions: 0 }
    }));
    
    // Reset temp survey data
    setTempSurveyResponses(null);
  };
  
  // Handle modal cancellation
  const handleCancel = () => {
    console.log("Workflow cancelled by user");
    setIsSurveyOpen(false);
    setIsSAAInputOpen(false);
    setTempSurveyResponses(null);
  };

  // Current timeline point's stats
  const currentStats = statsByTimeline[currentTimelinePoint];
  
  // Expose methods for parent components
  useImperativeHandle(ref, () => ({
    logAction,
    setPlayerStatus,
    getStatus: () => playerInfo.status,
    getStats: () => statsByTimeline,
    startSaveFlow
  }));

  // Determine if the save button should be disabled
  const isSaveDisabled = currentTimelinePoint >= 7;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full max-w-md">
      {/* Player Header */}
      <div className="flex justify-between items-center mb-4 border-b pb-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{playerInfo.name}</h2>
          <div className="text-gray-700 text-sm">
            #{playerInfo.jerseyNumber} • Age {playerInfo.age} • Q{currentQuarter}
          </div>
        </div>
        
        <div className="flex items-center">
          <span 
            className={`inline-flex px-3 py-1 rounded-full text-sm font-medium mr-2 
              ${playerInfo.status === "On Court" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          >
            {playerInfo.status}
          </span>
          <button 
            onClick={toggleStatus}
            className="bg-gray-200 hover:bg-gray-300 rounded-full p-1 text-xs text-gray-700"
          >
            Toggle
          </button>
        </div>
      </div>
      
      {/* Stats Display - Now based on Timeline segment */}
      <div className="mb-4">
        <h3 className="text-md font-semibold mb-2 bg-blue-600 px-2 py-1 rounded text-white">
          T{currentTimelinePoint} Stats
        </h3>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-100 p-2 rounded">
            <div className="text-center text-2xl font-bold text-gray-900">{currentStats.points}</div>
            <div className="text-center text-xs font-medium text-gray-800">Points</div>
          </div>
          <div className="bg-blue-100 p-2 rounded">
            <div className="text-center text-2xl font-bold text-gray-900">{currentStats.assists}</div>
            <div className="text-center text-xs font-medium text-gray-800">Assists</div>
          </div>
          <div className="bg-blue-100 p-2 rounded">
            <div className="text-center text-2xl font-bold text-gray-900">{currentStats.rebounds}</div>
            <div className="text-center text-xs font-medium text-gray-800">Rebounds</div>
          </div>
          <div className="bg-blue-100 p-2 rounded">
            <div className="text-center text-2xl font-bold text-gray-900">{currentStats.turnovers}</div>
            <div className="text-center text-xs font-medium text-gray-800">Turnovers</div>
          </div>
          <div className="bg-blue-100 p-2 rounded">
            <div className="text-center text-2xl font-bold text-gray-900">{currentStats.goodDecisions}</div>
            <div className="text-center text-xs font-medium text-gray-800">Good Dec.</div>
          </div>
          <div className="bg-blue-100 p-2 rounded">
            <div className="text-center text-2xl font-bold text-gray-900">{currentStats.badDecisions}</div>
            <div className="text-center text-xs font-medium text-gray-800">Bad Dec.</div>
          </div>
        </div>
      </div>
      
      {/* Save T# Stats Button - Starts the save flow */}
      <button
        onClick={startSaveFlow}
        disabled={isSaveDisabled}
        className={`w-full py-2 px-4 mb-4 ${
          isSaveDisabled 
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700'
        } text-white font-medium rounded transition-colors duration-150`}
      >
        {isSaveDisabled ? 'Timeline Complete' : `Save T${currentTimelinePoint} Stats`}
      </button>
      
      {/* Action Buttons */}
      <div>
        <h3 className="text-md font-semibold mb-2 text-gray-800">Record Actions</h3>
        
        <div className="grid grid-cols-2 gap-2 mb-2">
          <button 
            onClick={() => logAction("points")}
            className="py-1 px-3 bg-green-500 hover:bg-green-600 text-white rounded transition-colors duration-150 font-medium"
          >
            + Point
          </button>
          <button 
            onClick={() => logAction("assists")}
            className="py-1 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors duration-150 font-medium"
          >
            + Assist
          </button>
          <button 
            onClick={() => logAction("rebounds")}
            className="py-1 px-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors duration-150 font-medium"
          >
            + Rebound
          </button>
          <button 
            onClick={() => logAction("turnovers")}
            className="py-1 px-3 bg-red-500 hover:bg-red-600 text-white rounded transition-colors duration-150 font-medium"
          >
            + Turnover
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => logAction("goodDecisions")}
            className="py-1 px-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded transition-colors duration-150 font-medium"
          >
            + Good Decision
          </button>
          <button 
            onClick={() => logAction("badDecisions")}
            className="py-1 px-3 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors duration-150 font-medium"
          >
            + Bad Decision
          </button>
        </div>
      </div>
      
      {/* Survey Modal */}
      <SurveyModal 
        isOpen={isSurveyOpen}
        onClose={handleCancel}
        onSubmit={handleSurveySubmit}
      />
      
      {/* SAA Input Modal */}
      <SAAInputModal 
        isOpen={isSAAInputOpen}
        onClose={handleCancel}
        onSubmit={handleSAASubmit}
      />
    </div>
  );
});

export default PlayerPanel;