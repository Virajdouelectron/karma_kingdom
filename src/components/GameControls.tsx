import React from 'react';
import { useGame } from '../context/GameContext';
import { Zap, ArrowRight, Compass } from 'lucide-react';

const GameControls: React.FC = () => {
  const { state, dispatch, isPlayerTurn, currentPlayer } = useGame();
  
  const handleSkipTurn = () => {
    if (isPlayerTurn) {
      dispatch({ type: 'NEXT_TURN' });
    }
  };
  
  const handleUseAbility = (ability: 'doubleMove' | 'teleport' | 'steal') => {
    if (!isPlayerTurn || !currentPlayer) return;
    
    // Check if player has the ability
    if (currentPlayer.abilities[ability] <= 0) return;
    
    // For this simplified version, we'll just handle teleport and doubleMove
    if (ability === 'teleport') {
      alert('Select a tile to teleport to (not implemented in prototype)');
      // In a full version, we'd enable a teleport selection mode
    } else if (ability === 'doubleMove') {
      alert('You can make an extra move after your turn (not fully implemented in prototype)');
    } else if (ability === 'steal') {
      alert('Select a player to steal from (not implemented in prototype)');
    }
    
    // For now, just use up the ability
    dispatch({ 
      type: 'USE_ABILITY', 
      playerId: currentPlayer.id, 
      ability 
    });
  };
  
  if (!currentPlayer) return null;
  
  return (
    <div className="mt-4 bg-gray-800 p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold">Game Controls</h3>
        <div className="text-orange-400 flex items-center gap-1">
          <Zap size={16} />
          <span>{currentPlayer.karma} Karma</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button 
          className={`
            px-2 py-1 rounded text-xs flex flex-col items-center justify-center
            ${currentPlayer.abilities.doubleMove > 0 && isPlayerTurn
              ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
          `}
          disabled={currentPlayer.abilities.doubleMove === 0 || !isPlayerTurn}
          onClick={() => handleUseAbility('doubleMove')}
        >
          <ArrowRight size={14} />
          <span>Double Move ({currentPlayer.abilities.doubleMove})</span>
        </button>
        
        <button 
          className={`
            px-2 py-1 rounded text-xs flex flex-col items-center justify-center
            ${currentPlayer.abilities.teleport > 0 && isPlayerTurn
              ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
          `}
          disabled={currentPlayer.abilities.teleport === 0 || !isPlayerTurn}
          onClick={() => handleUseAbility('teleport')}
        >
          <Compass size={14} />
          <span>Teleport ({currentPlayer.abilities.teleport})</span>
        </button>
        
        <button 
          className={`
            px-2 py-1 rounded text-xs flex flex-col items-center justify-center
            ${currentPlayer.abilities.steal > 0 && isPlayerTurn
              ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
          `}
          disabled={currentPlayer.abilities.steal === 0 || !isPlayerTurn}
          onClick={() => handleUseAbility('steal')}
        >
          <Zap size={14} />
          <span>Steal ({currentPlayer.abilities.steal})</span>
        </button>
      </div>
      
      {isPlayerTurn && (
        <button 
          className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md shadow transition-colors"
          onClick={handleSkipTurn}
        >
          End Turn
        </button>
      )}
      
      {!isPlayerTurn && (
        <div className="text-center text-orange-300 animate-pulse">
          {state.players.find(p => p.id === state.currentPlayerId)?.name}'s turn...
        </div>
      )}
    </div>
  );
};

export default GameControls;