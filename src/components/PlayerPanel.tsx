import { useState, useEffect } from 'react';

// Type definitions
export type StatType = "points" | "assists" | "rebounds" | "turnovers" | "goodDecisions" | "badDecisions";
export type PlayerStatus = "On Court" | "Bench";

export type PlayerStatsByQuarter = {
  [quarter: number]: Record<StatType, number>;
};

export type PlayerInfo = {
  name: string;
  age: number;
  jerseyNumber: number;
  status: PlayerStatus;
};

interface PlayerPanelProps {
  currentQuarter: number;
}

const PlayerPanel: React.FC<PlayerPanelProps> = ({ currentQuarter }) => {
  // Player information state
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo>({
    name: "Player 7",
    age: 22,
    jerseyNumber: 7,
    status: "On Court"
  });

  // Stats tracking state
  const [statsByQuarter, setStatsByQuarter] = useState<PlayerStatsByQuarter>({
    1: { points: 0, assists: 0, rebounds: 0, turnovers: 0, goodDecisions: 0, badDecisions: 0 },
    2: { points: 0, assists: 0, rebounds: 0, turnovers: 0, goodDecisions: 0, badDecisions: 0 },
    3: { points: 0, assists: 0, rebounds: 0, turnovers: 0, goodDecisions: 0, badDecisions: 0 },
    4: { points: 0, assists: 0, rebounds: 0, turnovers: 0, goodDecisions: 0, badDecisions: 0 }
  });

  // Toggle player status
  const toggleStatus = () => {
    setPlayerInfo(prev => ({
      ...prev,
      status: prev.status === "On Court" ? "Bench" : "On Court"
    }));
  };

  // Log a new player action
  const logAction = (statType: StatType) => {
    setStatsByQuarter(prev => {
      const quarterStats = { ...prev[currentQuarter] };
      quarterStats[statType] += 1;
      
      return {
        ...prev,
        [currentQuarter]: quarterStats
      };
    });
  };

  // Current quarter's stats
  const currentStats = statsByQuarter[currentQuarter];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full max-w-md">
      {/* Player Header */}
      <div className="flex justify-between items-center mb-4 border-b pb-3">
        <div>
          <h2 className="text-xl font-bold">{playerInfo.name}</h2>
          <div className="text-gray-600 text-sm">
            #{playerInfo.jerseyNumber} • Age {playerInfo.age}
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
      
      {/* Stats Display */}
      <div className="mb-4">
        <h3 className="text-md font-semibold mb-2 bg-blue-100 px-2 py-1 rounded">
          Quarter {currentQuarter} Stats
        </h3>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 p-2 rounded">
            <div className="text-center text-2xl font-bold">{currentStats.points}</div>
            <div className="text-center text-xs text-gray-700">Points</div>
          </div>
          <div className="bg-blue-50 p-2 rounded">
            <div className="text-center text-2xl font-bold">{currentStats.assists}</div>
            <div className="text-center text-xs text-gray-700">Assists</div>
          </div>
          <div className="bg-blue-50 p-2 rounded">
            <div className="text-center text-2xl font-bold">{currentStats.rebounds}</div>
            <div className="text-center text-xs text-gray-700">Rebounds</div>
          </div>
          <div className="bg-blue-50 p-2 rounded">
            <div className="text-center text-2xl font-bold">{currentStats.turnovers}</div>
            <div className="text-center text-xs text-gray-700">Turnovers</div>
          </div>
          <div className="bg-blue-50 p-2 rounded">
            <div className="text-center text-2xl font-bold">{currentStats.goodDecisions}</div>
            <div className="text-center text-xs text-gray-700">Good Dec.</div>
          </div>
          <div className="bg-blue-50 p-2 rounded">
            <div className="text-center text-2xl font-bold">{currentStats.badDecisions}</div>
            <div className="text-center text-xs text-gray-700">Bad Dec.</div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div>
        <h3 className="text-md font-semibold mb-2">Record Actions</h3>
        
        <div className="grid grid-cols-2 gap-2 mb-2">
          <button 
            onClick={() => logAction("points")}
            className="py-1 px-3 bg-green-500 hover:bg-green-600 text-white rounded transition-colors duration-150"
          >
            + Point
          </button>
          <button 
            onClick={() => logAction("assists")}
            className="py-1 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors duration-150"
          >
            + Assist
          </button>
          <button 
            onClick={() => logAction("rebounds")}
            className="py-1 px-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors duration-150"
          >
            + Rebound
          </button>
          <button 
            onClick={() => logAction("turnovers")}
            className="py-1 px-3 bg-red-500 hover:bg-red-600 text-white rounded transition-colors duration-150"
          >
            + Turnover
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => logAction("goodDecisions")}
            className="py-1 px-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded transition-colors duration-150"
          >
            + Good Decision
          </button>
          <button 
            onClick={() => logAction("badDecisions")}
            className="py-1 px-3 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors duration-150"
          >
            + Bad Decision
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerPanel;