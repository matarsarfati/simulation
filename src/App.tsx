import { useState, useRef, useEffect } from 'react';
import GameClock from './components/GameClock';
import PlayerPanel, { StatType, PlayerStatus } from './components/PlayerPanel';
import EventBlockGenerator, { EventData } from './components/EventBlockGenerator';
import PerformanceTable from './components/PerformanceTable';
import CorrelationDashboard from './components/CorrelationDashboard';
import './App.css';

function App() {
  const [currentQuarter, setCurrentQuarter] = useState<number>(1);
  const [timelineEvents, setTimelineEvents] = useState<EventData[]>([]);
  const [nextTimelinePoint, setNextTimelinePoint] = useState<number>(1);
  
  // Refs to access component methods
  const gameClockRef = useRef<any>(null);
  const playerPanelRef = useRef<{
    logAction: (statType: StatType) => void;
    setPlayerStatus: (status: PlayerStatus) => void;
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
    setTimelineEvents(prev => [...prev, eventData]);
    setNextTimelinePoint(prev => Math.min(prev + 1, 7));
  };
  
  // Register refs when components mount
  const registerPlayerPanelRef = (methods: any) => {
    playerPanelRef.current = methods;
  };
  
  const registerGameClockRef = (methods: any) => {
    gameClockRef.current = methods;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-blue-700 mb-8 text-center">Basketball Game Simulation</h1>
      
      <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
        {/* Left column: Player Panel and Event Generator */}
        <div className="w-full lg:w-1/3">
          <PlayerPanel 
            currentQuarter={currentQuarter} 
            ref={registerPlayerPanelRef}
          />
          
          <EventBlockGenerator
            currentQuarter={currentQuarter}
            logAction={logPlayerAction}
            setPlayerStatus={setPlayerStatus}
            advanceGameTime={advanceGameTime}
            onEventGenerated={handleEventGenerated}
            timelinePoint={nextTimelinePoint}
          />
        </div>
        
        {/* Right column: Game Clock, Performance Table, and Correlation Dashboard */}
        <div className="w-full lg:w-2/3">
          <GameClock 
            onQuarterChange={handleQuarterChange}
            ref={registerGameClockRef}
          />
          
          {/* Performance summary table - updated to use timeline events */}
          <div className="mt-6">
            <PerformanceTable 
              timelineEvents={timelineEvents}
              currentQuarter={currentQuarter}
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