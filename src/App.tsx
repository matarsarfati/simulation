import { useState } from 'react';
import GameClock from './components/GameClock';
import PlayerPanel from './components/PlayerPanel';
import './App.css';

function App() {
  const [currentQuarter, setCurrentQuarter] = useState<number>(1);

  // Callback to track quarter changes from GameClock
  const handleQuarterChange = (quarter: number) => {
    setCurrentQuarter(quarter);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-blue-600 mb-8 text-center">Basketball Game Simulation</h1>
      
      <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto">
        {/* Left column: Player Panel */}
        <div className="w-full md:w-1/3">
          <PlayerPanel currentQuarter={currentQuarter} />
        </div>
        
        {/* Right column: Game Clock */}
        <div className="w-full md:w-2/3">
          <GameClock onQuarterChange={handleQuarterChange} />
        </div>
      </div>
    </div>
  );
}

export default App;