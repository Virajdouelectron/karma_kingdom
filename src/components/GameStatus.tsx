import React from 'react';
import { useGame } from '../context/GameContext';
import { Trophy, Clock } from 'lucide-react';

const GameStatus: React.FC = () => {
  const { state } = useGame();
  const { players, gameWeek } = state;
  
  // Sort players by karma (highest first)
  const sortedPlayers = [...players].sort((a, b) => b.karma - a.karma);
  
  // Calculate time since last move
  const timeSinceLastMove = Math.floor((Date.now() - state.lastMoveTime) / 1000);
  
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-4 text-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">Karma Kingdom - Week {gameWeek}</h3>
        <div className="flex items-center gap-1 text-xs text-gray-300">
          <Clock size={12} />
          <span>{formatTime(timeSinceLastMove)} since last move</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-sm font-semibold flex items-center gap-1 text-orange-300 mb-2">
          <Trophy size={14} />
          <span>Leaderboard</span>
        </h4>
        
        {sortedPlayers.map((player, index) => (
          <div 
            key={player.id} 
            className={`
              flex items-center gap-2 text-sm p-2 rounded
              ${index === 0 ? 'bg-gradient-to-r from-orange-600/30 to-transparent' : ''}
            `}
          >
            <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
              <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
            </div>
            <span className="font-medium">{player.name}</span>
            <span className="ml-auto text-orange-400">{player.karma} karma</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to format time
const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
};

export default GameStatus;