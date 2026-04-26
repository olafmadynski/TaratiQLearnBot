/**
 * Game constant definition
 */

/**
 * Chess piece type enumeration
 */
export enum PieceType {
  NORMAL = 'NORMAL',
  ROCK = 'ROCK'

}

/**
 * Player color enumeration
 */
export enum PlayerColor {
  BLACK = 'BLACK',
  WHITE = 'WHITE'
}

/**
 * Initial board configuration
 * The black pieces are on the top (D3, D4, C7, C8), while the white pieces are on the bottom (D1, D2, C1, C2)
 */
export const INITIAL_POSITIONS = {
  BLACK_POSITIONS: ['D3', 'D4', 'C7', 'C8'],
  WHITE_POSITIONS: ['D1', 'D2', 'C1', 'C2']
};

/**
 * Chessboard hierarchical structure
 * Layer 1 (Absolute Center point): 1 node → [A1]
 * Layer 2 (Bridge points Inner Ring): 6 nodes, arranged clockwise → [B1] [B2] ... [B6]
 * Layer 3 (Circumference points outer ring): 12 nodes, arranged clockwise → [C1] [C2] ... [C12]
 * Layer 4 (Domestic points): 4 nodes → [D1] [D2] [D3] [D4]
 */
export const BOARD_LEVELS = {
  LEVEL1: ['A1'],
  LEVEL2: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'], // Clockwise: B1 (bottom) → B2 (lower right) → B3 (upper right) → B4 (top) → B5 (upper left) → B6 (lower left)
  LEVEL3: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10', 'C11', 'C12'], // Clockwise arrangement
  LEVEL4: ['D1', 'D2', 'D3', 'D4']
};

/**
 * All the chessboard positions
 */
export const ALL_POSITIONS = [
  ...BOARD_LEVELS.LEVEL1,
  ...BOARD_LEVELS.LEVEL2,
  ...BOARD_LEVELS.LEVEL3,
  ...BOARD_LEVELS.LEVEL4
];

/**
 * Node connection relationship
 * Key represents the position, and the value is an array of positions adjacent to that position.
 * Connection Rules:
 * - Node A1 is connected to all nodes of type B.
 * - The B nodes are connected in a ring (clockwise)
 * - Each B node is connected to 2 C nodes.
 * - The C nodes are connected in a ring (clockwise)
 * - D1 and D2 are at the bottom, while D3 and D4 are at the top.
 * 
 * Node sequence description:
 * - B node: B1 is at the bottom. In clockwise order, they are B2 (lower right), B3 (upper right), B4 (top), B5 (upper left), and B6 (lower left).
 * - C node: As shown in the picture, C1 is located at the bottom right, followed by C2, C3... in a clockwise direction. C12
 */
export const ADJACENCY_MAP: Record<string, string[]> = {
  // The central node A1 is connected to all the B nodes.
  'A1': ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'],
  
  // B node is connected in a ring + connected to A1 + connected to the corresponding C node
  // Clockwise connection: The first connection is the next node in the clockwise direction, and the second connection is the previous node in the counterclockwise direction.
  'B1': ['A1', 'B2', 'B6', 'C1', 'C2'],
  'B2': ['A1', 'B3', 'B1', 'C12', 'C11'],
  'B3': ['A1', 'B4', 'B2', 'C10', 'C9'],
  'B4': ['A1', 'B5', 'B3', 'C8', 'C7'],
  'B5': ['A1', 'B6', 'B4', 'C6', 'C5'],
  'B6': ['A1', 'B1', 'B5', 'C4', 'C3'],
  
  // C node is connected in a ring + connect the corresponding B node and D node
  // Clockwise connection: The first connection is the next node in the clockwise direction, and the second connection is the previous node in the counterclockwise direction.
  'C1': ['B1', 'C2', 'C12', 'D1'],
  'C2': ['B1', 'C3', 'C1', 'D2'],
  'C3': ['B6', 'C4', 'C2'],
  'C4': ['B6', 'C5', 'C3'],
  'C5': ['B5', 'C6', 'C4'],
  'C6': ['B5', 'C7', 'C5'],
  'C7': ['B4', 'C8', 'C6', 'D3'],
  'C8': ['B4', 'C9', 'C7', 'D4'],
  'C9': ['B3', 'C10', 'C8'],
  'C10': ['B3', 'C11', 'C9'],
  'C11': ['B2', 'C12', 'C10'],
  'C12': ['B2', 'C1', 'C11'],
  
  // D node (endpoint)
  'D1': ['C1', 'D2'],
  'D2': ['C2', 'D1'],
  'D3': ['C7', 'D4'],
  'D4': ['C8', 'D3']
}; 