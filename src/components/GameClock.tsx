import { useState, useEffect, useRef } from 'react';

// Type definitions
type PlaybackMode = 'live' | 'fast' | 'manual';

interface GameClockProps {
  onQuarterChange?: (quarter: number) => void;
}

interface GameClockState {
  currentQuarter: number;     // values 1-4
  timeRemaining: number;      // in seconds (e.g., 600 = 10:00)
  clockRunning: boolean;
  mode: PlaybackMode;
}

const GameClock: React.FC<GameClockProps> = ({ onQuarterChange }) => {
  // Constants
  const QUARTER_TIME = 600; // 10 minutes in seconds

  // State management
  const [clockState, setClockState] = useState<GameClockState>({
    currentQuarter: 1,
    timeRemaining: QUARTER_TIME,
    clockRunning: false,
    mode: 'live'
  });

  // Refs
  const timerRef = useRef<number | null>(null);

  // Derived values
  const minutes = Math.floor(clockState.timeRemaining / 60);
  const seconds = clockState.timeRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Notify parent about quarter changes
  useEffect(() => {
    if (onQuarterChange) {
      onQuarterChange(clockState.currentQuarter);
    }
  }, [clockState.currentQuarter, onQuarterChange]);

  // Timer tick logic based on mode
  useEffect(() => {
    if (!clockState.clockRunning) {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (clockState.mode === 'manual') {
      // Manual mode doesn't use a timer
      return;
    }

    // Clear any existing interval
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
    }

    // Set interval based on mode
    const intervalTime = clockState.mode === 'live' ? 1000 : 200; // 5x speed for fast mode
    
    timerRef.current = window.setInterval(() => {
      setClockState(prevState => {
        // Calculate time decrement based on mode
        const decrement = clockState.mode === 'live' ? 1 : 5; // 1 second in live mode, 5 seconds in fast mode
        
        if (prevState.timeRemaining <= 0) {
          // Stop the clock when time reaches zero
          if (timerRef.current !== null) {
            clearInterval(timerRef.current);
          }
          return { ...prevState, clockRunning: false };
        }
        
        return {
          ...prevState,
          timeRemaining: Math.max(0, prevState.timeRemaining - decrement)
        };
      });
    }, intervalTime);

    // Cleanup function
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [clockState.clockRunning, clockState.mode]);

  // Handler functions
  const startClock = () => {
    setClockState(prevState => ({
      ...prevState,
      clockRunning: true
    }));
  };

  const pauseClock = () => {
    setClockState(prevState => ({
      ...prevState,
      clockRunning: false
    }));
  };

  const nextQuarter = () => {
    setClockState(prevState => {
      const nextQuarterNum = prevState.currentQuarter >= 4 ? 4 : prevState.currentQuarter + 1;
      return {
        ...prevState,
        currentQuarter: nextQuarterNum,
        timeRemaining: QUARTER_TIME,
        clockRunning: false
      };
    });
  };

  const changeMode = (mode: PlaybackMode) => {
    setClockState(prevState => ({
      ...prevState,
      mode,
      clockRunning: false // Always pause when changing modes
    }));
  };

  const advanceManualTime = () => {
    if (clockState.mode === 'manual') {
      setClockState(prevState => ({
        ...prevState,
        timeRemaining: Math.max(0, prevState.timeRemaining - 30) // Advance by 30 seconds
      }));
    }
  };

  // Determine button availability
  const canStart = !clockState.clockRunning && clockState.timeRemaining > 0;
  const canPause = clockState.clockRunning;
  const canAdvance = clockState.mode === 'manual' && clockState.timeRemaining > 0;

  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md">
      {/* Quarter indicator */}
      <div className="text-2xl font-bold mb-2 bg-blue-600 text-white px-4 py-1 rounded">
        Q{clockState.currentQuarter}
      </div>
      
      {/* Clock display */}
      <div className="text-6xl font-mono font-bold mb-6 bg-black text-green-400 px-6 py-3 rounded-md shadow-inner">
        {formattedTime}
      </div>
      
      {/* Mode selector */}
      <div className="flex space-x-2 mb-4">
        <button 
          onClick={() => changeMode('live')}
          className={`px-3 py-1 rounded ${clockState.mode === 'live' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
        >
          Live
        </button>
        <button 
          onClick={() => changeMode('fast')}
          className={`px-3 py-1 rounded ${clockState.mode === 'fast' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
        >
          Fast
        </button>
        <button 
          onClick={() => changeMode('manual')}
          className={`px-3 py-1 rounded ${clockState.mode === 'manual' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
        >
          Manual
        </button>
      </div>
      
      {/* Clock controls */}
      <div className="flex space-x-3">
        <button 
          onClick={startClock}
          disabled={!canStart}
          className={`px-4 py-2 rounded font-semibold ${canStart ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'}`}
        >
          Start
        </button>
        <button 
          onClick={pauseClock}
          disabled={!canPause}
          className={`px-4 py-2 rounded font-semibold ${canPause ? 'bg-yellow-600 text-white hover:bg-yellow-700' : 'bg-gray-300 cursor-not-allowed'}`}
        >
          Pause
        </button>
        {clockState.mode === 'manual' && (
          <button 
            onClick={advanceManualTime}
            disabled={!canAdvance}
            className={`px-4 py-2 rounded font-semibold ${canAdvance ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-300 cursor-not-allowed'}`}
          >
            +30 sec
          </button>
        )}
        <button 
          onClick={nextQuarter}
          className="px-4 py-2 rounded font-semibold bg-blue-600 text-white hover:bg-blue-700"
        >
          Next Quarter
        </button>
      </div>

      {/* Timeline visualization scaffold */}
      <div className="mt-10 w-full bg-gray-200 p-4 rounded-lg">
        <div className="text-sm font-medium text-gray-700 mb-2">Timeline</div>
        <div className="flex justify-between items-center">
          {[1, 2, 3, 4, 5, 6, 7].map(marker => (
            <div key={marker} className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs">
                T{marker}
              </div>
              <div className="h-1 w-16 bg-gray-300 mt-2" style={{ display: marker === 7 ? 'none' : 'block' }}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameClock;