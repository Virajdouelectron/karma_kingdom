import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { GameState, GameAction, Player, Tile } from '../types/game';
import { generateBoard } from '../utils/boardGenerator';
import { useRedditAuth } from '../hooks/useRedditAuth';

const AI_PLAYERS: Player[] = [
  {
    id: 'ai1',
    name: 'KarmaBot',
    avatar: 'https://www.redditstatic.com/avatars/avatar_default_07_FF8717.png',
    position: { x: 4, y: 0 },
    karma: 0,
    abilities: {
      doubleMove: 0,
      teleport: 0,
      steal: 0
    }
  },
  {
    id: 'ai2',
    name: 'UpvoteLord',
    avatar: 'https://www.redditstatic.com/avatars/avatar_default_15_94E044.png',
    position: { x: 0, y: 4 },
    karma: 0,
    abilities: {
      doubleMove: 0,
      teleport: 0,
      steal: 0
    }
  }
];

// Game reducer to handle all game actions
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'INITIALIZE_PLAYER': {
      const humanPlayer: Player = {
        id: 'player1',
        name: action.playerName,
        avatar: action.playerAvatar,
        position: { x: 0, y: 0 },
        karma: 0,
        abilities: {
          doubleMove: 0,
          teleport: 0,
          steal: 0
        }
      };

      return {
        ...state,
        players: [humanPlayer, ...AI_PLAYERS],
        currentPlayerId: humanPlayer.id
      };
    }
    
    case 'MOVE': {
      const updatedPlayers = state.players.map(player => {
        if (player.id === action.playerId) {
          return {
            ...player,
            position: action.position
          };
        }
        return player;
      });
      
      // Get the tile at the new position
      const tile = state.board[action.position.y][action.position.x];
      
      // Process tile effects
      if (tile.type === 'event' && tile.karmaValue) {
        const playerIndex = updatedPlayers.findIndex(p => p.id === action.playerId);
        if (playerIndex !== -1) {
          updatedPlayers[playerIndex] = {
            ...updatedPlayers[playerIndex],
            karma: updatedPlayers[playerIndex].karma + (tile.karmaValue || 0)
          };
        }
      }

      return {
        ...state,
        players: updatedPlayers,
        lastMoveTime: Date.now()
      };
    }
    
    case 'USE_ABILITY': {
      const updatedPlayers = [...state.players];
      const playerIndex = updatedPlayers.findIndex(p => p.id === action.playerId);
      
      if (playerIndex === -1) return state;
      
      const player = updatedPlayers[playerIndex];
      
      // Check if player has the ability
      if (player.abilities[action.ability] <= 0) return state;
      
      // Process ability effects
      switch (action.ability) {
        case 'doubleMove':
          // Handled in the UI by allowing another move
          break;
          
        case 'teleport':
          if (action.targetPosition) {
            updatedPlayers[playerIndex] = {
              ...player,
              position: action.targetPosition,
              abilities: {
                ...player.abilities,
                teleport: player.abilities.teleport - 1
              }
            };
          }
          break;
          
        case 'steal':
          if (action.targetPlayerId) {
            const targetPlayerIndex = updatedPlayers.findIndex(p => p.id === action.targetPlayerId);
            if (targetPlayerIndex !== -1) {
              const targetPlayer = updatedPlayers[targetPlayerIndex];
              const stealAmount = Math.min(10, targetPlayer.karma);
              
              updatedPlayers[playerIndex] = {
                ...player,
                karma: player.karma + stealAmount,
                abilities: {
                  ...player.abilities,
                  steal: player.abilities.steal - 1
                }
              };
              
              updatedPlayers[targetPlayerIndex] = {
                ...targetPlayer,
                karma: targetPlayer.karma - stealAmount
              };
            }
          }
          break;
      }
      
      return {
        ...state,
        players: updatedPlayers
      };
    }
    
    case 'COLLECT_KARMA': {
      const updatedPlayers = state.players.map(player => {
        if (player.id === action.playerId) {
          const newKarma = player.karma + action.amount;
          
          // Award abilities based on karma thresholds
          const abilities = {...player.abilities};
          
          if (newKarma >= 50 && player.karma < 50) {
            abilities.doubleMove += 1;
          }
          
          if (newKarma >= 100 && player.karma < 100) {
            abilities.teleport += 1;
          }
          
          if (newKarma >= 200 && player.karma < 200) {
            abilities.steal += 1;
          }
          
          return {
            ...player,
            karma: newKarma,
            abilities
          };
        }
        return player;
      });
      
      return {
        ...state,
        players: updatedPlayers
      };
    }
    
    case 'NEXT_TURN': {
      // Find index of current player
      const currentIndex = state.players.findIndex(p => p.id === state.currentPlayerId);
      const nextIndex = (currentIndex + 1) % state.players.length;
      
      return {
        ...state,
        currentPlayerId: state.players[nextIndex].id,
        lastMoveTime: Date.now()
      };
    }
    
    case 'RESET_GAME': {
      return {
        ...state,
        board: generateBoard(5, 5),
        gameWeek: state.gameWeek + 1,
        players: state.players.map(player => ({
          ...player,
          karma: 0,
          abilities: {
            doubleMove: 0,
            teleport: 0,
            steal: 0
          },
          position: player.id === 'player1' ? { x: 0, y: 0 } :
                   player.id === 'ai1' ? { x: 4, y: 0 } : { x: 0, y: 4 }
        }))
      };
    }
    
    default:
      return state;
  }
};

const initialState: GameState = {
  board: generateBoard(5, 5),
  players: [],
  currentPlayerId: '',
  gameWeek: 1,
  lastMoveTime: Date.now()
};

type GameContextType = {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  isPlayerTurn: boolean;
  currentPlayer: Player | null;
  canMove: (x: number, y: number) => boolean;
};

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { user, isAuthenticated } = useRedditAuth();
  
  // Initialize player when Reddit user is available
  useEffect(() => {
    if (isAuthenticated && user && state.players.length === 0) {
      dispatch({
        type: 'INITIALIZE_PLAYER',
        playerName: user.name,
        playerAvatar: user.icon_img?.replace(/&amp;/g, '&') || 'https://www.redditstatic.com/avatars/avatar_default_02_FF4500.png'
      });
    }
  }, [isAuthenticated, user, state.players.length]);
  
  // Determine if it's the player's turn
  const isPlayerTurn = state.currentPlayerId === 'player1';
  
  // Get the current player
  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId) || null;
  
  // Check if a move is valid (adjacent to current position)
  const canMove = (x: number, y: number): boolean => {
    const player = state.players.find(p => p.id === state.currentPlayerId);
    if (!player) return false;
    
    const { position } = player;
    
    // Check if position is on the board
    if (x < 0 || x >= 5 || y < 0 || y >= 5) return false;
    
    // Check if position is adjacent or diagonal to current position
    const xDiff = Math.abs(x - position.x);
    const yDiff = Math.abs(y - position.y);
    
    // Allow moving to adjacent tiles (including diagonals)
    return xDiff <= 1 && yDiff <= 1 && !(xDiff === 0 && yDiff === 0);
  };
  
  // AI player logic
  useEffect(() => {
    // If it's an AI player's turn, make a move after a short delay
    if (!isPlayerTurn && state.players.length > 0) {
      const timeoutId = setTimeout(() => {
        const aiPlayer = state.players.find(p => p.id === state.currentPlayerId);
        if (!aiPlayer) return;
        
        // Generate valid moves
        const validMoves = [];
        for (let y = 0; y < 5; y++) {
          for (let x = 0; x < 5; x++) {
            if (canMove(x, y)) {
              validMoves.push({ x, y });
            }
          }
        }
        
        // Select a random valid move
        if (validMoves.length > 0) {
          const move = validMoves[Math.floor(Math.random() * validMoves.length)];
          
          // Make the move
          dispatch({ type: 'MOVE', playerId: aiPlayer.id, position: move });
          
          // AI collects karma from the tile
          const tile = state.board[move.y][move.x];
          if (tile.karmaValue) {
            dispatch({ type: 'COLLECT_KARMA', playerId: aiPlayer.id, amount: tile.karmaValue });
          }
          
          // End AI turn
          setTimeout(() => {
            dispatch({ type: 'NEXT_TURN' });
          }, 500);
        }
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [state.currentPlayerId, isPlayerTurn, state.players.length]);
  
  return (
    <GameContext.Provider value={{ state, dispatch, isPlayerTurn, currentPlayer, canMove }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};