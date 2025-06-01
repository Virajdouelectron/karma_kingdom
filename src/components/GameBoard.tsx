import React from 'react';
import { useGame } from '../context/GameContext';
import { Tile as TileType } from '../types/game';
import GameTile from './GameTile';
import PlayerToken from './PlayerToken';

const GameBoard: React.FC = () => {
  const { state, dispatch, canMove, isPlayerTurn, currentPlayer } = useGame();
  const { board, players } = state;
  
  const handleTileClick = (x: number, y: number, tile: TileType) => {
    if (!isPlayerTurn) return;
    
    if (canMove(x, y)) {
      // Move the player
      dispatch({ 
        type: 'MOVE', 
        playerId: currentPlayer?.id || '', 
        position: { x, y } 
      });
      
      // Collect karma if it's an event tile
      if (tile.type === 'event' && tile.karmaValue && currentPlayer) {
        dispatch({
          type: 'COLLECT_KARMA',
          playerId: currentPlayer.id,
          amount: tile.karmaValue
        });
      }
      
      // End turn after a short delay
      setTimeout(() => {
        dispatch({ type: 'NEXT_TURN' });
      }, 500);
    }
  };
  
  return (
    <div className="w-full max-w-lg mx-auto bg-gray-800 p-4 rounded-lg shadow-lg">
      <div className="grid grid-cols-5 gap-2 relative">
        {board.map((row, y) => 
          row.map((tile, x) => (
            <GameTile 
              key={`${x}-${y}`}
              tile={tile}
              position={{ x, y }}
              isValidMove={isPlayerTurn && canMove(x, y)}
              onClick={() => handleTileClick(x, y, tile)}
            />
          ))
        )}
        
        {/* Player tokens */}
        {players.map(player => (
          <PlayerToken 
            key={player.id}
            player={player}
            isCurrentPlayer={player.id === currentPlayer?.id}
          />
        ))}
      </div>
    </div>
  );
};

export default GameBoard;