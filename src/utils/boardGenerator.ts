import { Tile, TileType } from '../types/game';

// Probability weights for different tile types
const TILE_WEIGHTS = {
  event: 60,
  steal: 20,
  safe: 20
};

// Karma values for event tiles
const EVENT_KARMA_VALUES = [5, 10, 15, 20, 25];

// Descriptions for tiles
const TILE_DESCRIPTIONS = {
  event: [
    'Found a trending post! Gain karma.',
    'Your comment was awarded gold! Collect karma.',
    'Your meme went viral! Karma boost!',
    'Community liked your post! Karma earned.',
    'Quality contribution recognized! Extra karma.'
  ],
  steal: [
    'Opportunity to steal karma!',
    'Another player\'s karma is vulnerable!',
    'Chance to heist some karma!',
    'Sneaky karma stealing possible!',
    'Plan your karma heist here!'
  ],
  safe: [
    'Safe haven. Rest here.',
    'Karma sanctuary. Protected zone.',
    'No stealing allowed here.',
    'Secure your karma here.',
    'Peaceful rest spot.'
  ],
  start: [
    'Starting position. Begin your journey!',
    'Karma journey begins here!',
    'Your quest for karma starts here!',
    'Starting point for your adventure!'
  ]
};

/**
 * Generates a random tile based on weighted probabilities
 */
const generateRandomTile = (): Tile => {
  const totalWeight = Object.values(TILE_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  let tileType: TileType = 'safe';
  
  // Determine tile type based on random value and weights
  for (const [type, weight] of Object.entries(TILE_WEIGHTS)) {
    if (random < weight) {
      tileType = type as TileType;
      break;
    }
    random -= weight;
  }
  
  // Generate tile properties based on type
  switch (tileType) {
    case 'event':
      return {
        type: tileType,
        karmaValue: EVENT_KARMA_VALUES[Math.floor(Math.random() * EVENT_KARMA_VALUES.length)],
        description: TILE_DESCRIPTIONS.event[Math.floor(Math.random() * TILE_DESCRIPTIONS.event.length)]
      };
      
    case 'steal':
      return {
        type: tileType,
        description: TILE_DESCRIPTIONS.steal[Math.floor(Math.random() * TILE_DESCRIPTIONS.steal.length)]
      };
      
    case 'safe':
      return {
        type: tileType,
        description: TILE_DESCRIPTIONS.safe[Math.floor(Math.random() * TILE_DESCRIPTIONS.safe.length)]
      };
      
    default:
      return {
        type: 'safe',
        description: TILE_DESCRIPTIONS.safe[0]
      };
  }
};

/**
 * Generates a game board with specified dimensions
 */
export const generateBoard = (width: number, height: number): Tile[][] => {
  const board: Tile[][] = [];
  
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      // Set start positions for players
      if ((x === 0 && y === 0) || (x === width - 1 && y === 0) || (x === 0 && y === height - 1)) {
        row.push({
          type: 'start',
          description: TILE_DESCRIPTIONS.start[Math.floor(Math.random() * TILE_DESCRIPTIONS.start.length)]
        });
      } else {
        row.push(generateRandomTile());
      }
    }
    board.push(row);
  }
  
  return board;
};