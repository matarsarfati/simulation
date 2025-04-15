import React from 'react';
import GameClock from './components/GameClock';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-blue-600 mb-8">Basketball Game Simulation</h1>
      <GameClock />
    </div>
  );
}

export default App;