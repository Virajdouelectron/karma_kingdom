import React from 'react';
import { Player } from '../types/game';

interface PlayerTokenProps {
  player: Player;
  isCurrentPlayer: boolean;
}

const PlayerToken: React.FC<PlayerTokenProps> = ({ player, isCurrentPlayer }) => {
  const { position, avatar, name } = player;
  
  return (
    <div
      className={`
        absolute w-8 h-8 rounded-full overflow-hidden border-2
        transition-all duration-500 ease-in-out z-10
        ${isCurrentPlayer ? 'border-yellow-400 shadow-lg shadow-yellow-300/50' : 'border-white'}
      `}
      style={{
        left: `calc(${position.x * 20}% + 6%)`,
        top: `calc(${position.y * 20}% + 6%)`,
        transform: isCurrentPlayer ? 'scale(1.2)' : 'scale(1)',
      }}
    >
      <img 
        src={avatar} 
        alt={name} 
        className="w-full h-full object-cover" 
      />
      {isCurrentPlayer && (
        <div className="absolute inset-0 bg-yellow-400 opacity-20 animate-pulse rounded-full" />
      )}
    </div>
  );
};

export default PlayerToken;