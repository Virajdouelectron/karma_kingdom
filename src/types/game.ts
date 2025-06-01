export interface Player {
  id: string;
  name: string;
  avatar: string;
  position: Position;
  karma: number;
  abilities: {
    doubleMove: number;
    teleport: number;
    steal: number;
  };
}

export interface Position {
  x: number;
  y: number;
}

export type TileType = 'event' | 'steal' | 'safe' | 'start';

export interface Tile {
  type: TileType;
  karmaValue?: number;
  description?: string;
}

export interface GameState {
  board: Tile[][];
  players: Player[];
  currentPlayerId: string;
  gameWeek: number;
  lastMoveTime: number;
}

export type GameAction = 
  | { type: 'MOVE'; playerId: string; position: Position }
  | { type: 'USE_ABILITY'; playerId: string; ability: 'doubleMove' | 'teleport' | 'steal'; targetPosition?: Position; targetPlayerId?: string }
  | { type: 'COLLECT_KARMA'; playerId: string; amount: number }
  | { type: 'NEXT_TURN'; }
  | { type: 'RESET_GAME'; };