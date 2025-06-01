import React from 'react';
import { Tile, Position } from '../types/game';
import { Trophy, Zap, Shield } from 'lucide-react';

interface GameTileProps {
  tile: Tile;
  position: Position;
  isValidMove: boolean;
  onClick: () => void;
}

const GameTile: React.FC<GameTileProps> = ({ tile, position, isValidMove, onClick }) => {
  // Determine tile background color based on type
  const getTileColor = () => {
    switch (tile.type) {
      case 'event': return 'bg-orange-100 hover:bg-orange-200';
      case 'steal': return 'bg-red-100 hover:bg-red-200';
      case 'safe': return 'bg-green-100 hover:bg-green-200';
      case 'start': return 'bg-blue-100 hover:bg-blue-200';
      default: return 'bg-gray-100 hover:bg-gray-200';
    }
  };
  
  // Determine tile icon based on type
  const getTileIcon = () => {
    switch (tile.type) {
      case 'event': return <Trophy className="text-orange-500\" size={16} />;
      case 'steal': return <Zap className="text-red-500" size={16} />;
      case 'safe': return <Shield className="text-green-500" size={16} />;
      case 'start': return <Shield className="text-blue-500" size={16} />;
      default: return null;
    }
  };
  
  return (
    <div
      className={`
        aspect-square flex flex-col items-center justify-center p-1
        rounded-md text-xs border-2 relative transition-all duration-300
        ${getTileColor()}
        ${isValidMove ? 'border-blue-500 animate-pulse cursor-pointer' : 'border-transparent cursor-default'}
      `}
      onClick={isValidMove ? onClick : undefined}
      data-x={position.x}
      data-y={position.y}
    >
      <div className="absolute top-1 left-1">
        {getTileIcon()}
      </div>
      
      {tile.karmaValue && (
        <div className="text-center font-bold text-orange-600">
          +{tile.karmaValue}
        </div>
      )}
      
      <div className="text-[8px] text-center text-gray-600 mt-1 line-clamp-2">
        {tile.description}
      </div>
    </div>
  );
};

export default GameTile;