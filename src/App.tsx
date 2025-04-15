import { useState, useRef, useEffect } from 'react';
import GameClock from './components/GameClock';
import PlayerPanel, { StatType, PlayerStatus, CompleteTimelineData } from './components/PlayerPanel';
import EventBlockGenerator, { EventData } from './components/EventBlockGenerator';
import PerformanceTable from './components/PerformanceTable';
import CorrelationDashboard from './components/CorrelationDashboard';
import './App.css';

function App() {
  const [currentQuarter, setCurrentQuarter] = useState<number>(1);
  const [timelineEvents, setTimelineEvents] = useState<EventData[]>([]);
  const [currentTimelinePoint, setCurrentTimelinePoint] = useState<number>(1);
  // Refs to access component methods
  const gameClockRef = useRef<any>(null);
  const playerPanelRef = useRef<{
    logAction: (statType: StatType) => void;
    setPlayerStatus: (status: PlayerStatus) => void;
    startSaveFlow: () => void;
  } | null>(null);

  // Callback to track quarter changes from GameClock
  const handleQuarterChange = (quarter: number) => {
    setCurrentQuarter(quarter);
  };
  
  // Function to log player actions
  const logPlayerAction = (statType: StatType) => {
    if (playerPanelRef.current) {
      playerPanelRef.current.logAction(statType);
    }
  };
  
  // Function to set player status
  const setPlayerStatus = (status: PlayerStatus) => {
    if (playerPanelRef.current) {
      playerPanelRef.current.setPlayerStatus(status);
    }
  };
  
  // Function to advance game time
  const advanceGameTime = (seconds: number) => {
    if (gameClockRef.current) {
      gameClockRef.current.advanceTime(seconds);
    }
  };
  
  // Handle event block generation completion
  const handleEventGenerated = (eventData: EventData) => {
    console.log("Event block generated:", eventData);
    setTimelineEvents(prev => [...prev, eventData]);
    advanceTimelinePoint();
  };
  
  // Advance to the next timeline point
  const advanceTimelinePoint = () => {
    setCurrentTimelinePoint(prev => {
      const nextPoint = Math.min(prev + 1, 7);
      console.log(`Advancing timeline point from T${prev} to T${nextPoint}`);
      return nextPoint;
    });
  };
  
  // Handle the enhanced timeline data push with complete data
  // This is the key part of App.tsx that handles the complete timeline data push

// Handle the enhanced timeline data push with complete data
const handleCompleteTimelineDataPush = (completeData: CompleteTimelineData) => {
  console.log("Received complete data from PlayerPanel:", completeData);
  const { timelinePoint, stats, surveyResponses, saaValue, saaLevel } = completeData;
  
  // Convert stats object to array of actions for the EventData format
  const actions: StatType[] = [];
  
  // Convert stats object to array of actions
  Object.entries(stats).forEach(([type, count]) => {
    for (let i = 0; i < count; i++) {
      actions.push(type as StatType);
    }
  });
  
  // Verify we have the survey data
  console.log("Survey responses being passed to EventData:", surveyResponses);
  
  // Create a new event data entry with all collected data
  const newEventData: EventData = {
    timelinePoint: timelinePoint,
    quarter: currentQuarter,
    timestamp: new Date(),
    actions: actions,
    surveyResponses: surveyResponses,
    saaValue: saaValue,
    saaLevel: saaLevel
  };
  
  console.log("Creating new EventData with survey responses:", newEventData);
  
  // Add the new event data to the timeline events
  setTimelineEvents(prev => {
    const updated = [...prev, newEventData];
    console.log("Updated timeline events:", updated);
    return updated;
  });
  
  // Important: Ensure the setState has completed before advancing the timeline
  setTimeout(() => {
    // Advance to next timeline point
    advanceTimelinePoint();
  }, 100);
};
  
  // Register refs when components mount
  const registerPlayerPanelRef = (methods: any) => {
    playerPanelRef.current = methods;
  };
  
  const registerGameClockRef = (methods: any) => {
    gameClockRef.current = methods;
  };

  // For debugging
  useEffect(() => {
    console.log(`Current timeline point in App: T${currentTimelinePoint}`);
  }, [currentTimelinePoint]);

  // Log timeline events changes
  useEffect(() => {
    console.log("Timeline events updated:", timelineEvents);
  }, [timelineEvents]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-blue-700 mb-8 text-center">Basketball Game Simulation</h1>
      
      <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
        {/* Left column: Player Panel and Event Generator */}
        <div className="w-full lg:w-1/3">
          <PlayerPanel 
            currentQuarter={currentQuarter} 
            currentTimelinePoint={currentTimelinePoint}
            onTimelineDataPush={handleCompleteTimelineDataPush}
            ref={registerPlayerPanelRef}
          />
          
          <EventBlockGenerator
            currentQuarter={currentQuarter}
            logAction={logPlayerAction}
            setPlayerStatus={setPlayerStatus}
            advanceGameTime={advanceGameTime}
            onEventGenerated={handleEventGenerated}
            timelinePoint={currentTimelinePoint}
          />
        </div>
        
        {/* Right column: Game Clock, Performance Table, and Correlation Dashboard */}
        <div className="w-full lg:w-2/3">
          <GameClock 
            onQuarterChange={handleQuarterChange}
            currentTimelinePoint={currentTimelinePoint} 
            ref={registerGameClockRef}
          />
          
          {/* Performance summary table - updated to use timeline events */}
          <div className="mt-6">
            <PerformanceTable 
              timelineEvents={timelineEvents}
              currentTimelinePoint={currentTimelinePoint}
            />
          </div>
          
          {/* Correlation Dashboard */}
          <CorrelationDashboard 
            timelineEvents={timelineEvents}
          />
        </div>
      </div>
    </div>
  );
}

export default App;