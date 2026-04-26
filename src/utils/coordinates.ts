/**
 * Coordinate Conversion Tool
 * Provide the conversion function between chessboard coordinates and indices
 */
import { ADJACENCY_MAP, BOARD_LEVELS } from '../constants/gameConstants';
import { Position } from '../types';
import { PieceType } from '../constants/gameConstants';

/**
 * Convert string coordinates (such as "A1", "C7") to array indices
 * @param position String coordinates, such as "A1", "C7"
 * @returns The corresponding array index is [row, col]
 */
export const positionToIndices = (position: Position): [number, number] => {
  if (position.length < 2) {
    throw new Error('Invalid coordinate format');
  }
  
  const col = position.charCodeAt(0) - 'A'.charCodeAt(0);
  const row = parseInt(position.substring(1)) - 1;
  
  if (isNaN(row) || col < 0) {
    throw new Error('Invalid coordinate format');
  }
  
  return [row, col];
};

/**
 * Convert array indices to string coordinates (such as "A1", "C7")
 * @param row row Indexing
 * @param col col Indexing
 * @returns Corresponding string coordinates, such as "A1", "C7"
 */
export const indicesToPosition = (row: number, col: number): Position => {
  const colChar = String.fromCharCode('A'.charCodeAt(0) + col);
  const rowNum = row + 1;
  return `${colChar}${rowNum}`;
};

/**
 * Check whether the two coordinates are adjacent to each other
 * @param pos1 The first coordinate
 * @param pos2 The second coordinate
 * @returns Are they adjacent?
 */
export const arePositionsAdjacent = (pos1: Position, pos2: Position): boolean => {
  return ADJACENCY_MAP[pos1]?.includes(pos2) || ADJACENCY_MAP[pos2]?.includes(pos1) || false;
};

/**
 * Obtain the level where the location is located
 * @param position position
 * @returns Level (1-4)
 */
export const getPositionLevel = (position: Position): number => {
  if (BOARD_LEVELS.LEVEL1.includes(position)) return 1;
  if (BOARD_LEVELS.LEVEL2.includes(position)) return 2;
  if (BOARD_LEVELS.LEVEL3.includes(position)) return 3;
  if (BOARD_LEVELS.LEVEL4.includes(position)) return 4;
  return 0;
};

/**
 * Check whether the movement direction is valid
 * Rule Explanation:
 * 1. White pieces can only move upwards, while black pieces can only move downwards.
 * 2. The "up-down" direction is determined by the visual position of the nodes in the picture, rather than strictly based on hierarchy.
 * 3. No lateral movement is permitted.
 * 
 * @param fromPos Starting position
 * @param toPos Target location
 * @param isBlack Is it black chess?
 * @returns Is the movement direction valid?
 */
export const isValidDirection = (fromPos: Position, toPos: Position, isBlack: boolean, pieceType: PieceType ): boolean => {
  // Obtain the vertical positions of the starting point and the target point in the figure
  const fromY = getVisualYPosition(fromPos);
  const toY = getVisualYPosition(toPos);
  
  if (pieceType === PieceType.ROCK)
  {
    return true;
  }


  // No lateral movement is allowed; the vertical positions must be different.
  if (fromY === toY) {
    console.log(`Move Direction Verification：${fromPos} -> ${toPos} It is a lateral transfer, and it is not allowed.`);
    return false;
  }
  
  // Black pieces can only move downward, while white pieces can only move upward.
  if (isBlack) {
    // Black pieces move downward (visually, the y value increases)
    const valid = toY > fromY;
    if (!valid) {
      console.log(`Move Direction Verification：Black Piece From${fromPos}(y=${fromY}) -> ${toPos}(y=${toY})，It is not allowed to move downward.`);
    }
    return valid;
  } else {
    // The white pieces moves upwards (visually, the y value decreases)
    const valid = toY < fromY;
    if (!valid) {
      console.log(`Move Direction Verification：White Piece From${fromPos}(y=${fromY}) -> ${toPos}(y=${toY})，Not moving upwards. Not allowed.`);
    }
    return valid;
  }
};

/**
 * Obtain the visual vertical position (y-coordinate) of the location shown in the figure
 * The smaller the value is, the higher it is; the larger the value is, the lower it is.
 * @param position position
 * @returns yCoordinate values(0-100)
 */
const getVisualYPosition = (position: Position): number => {
  // Determine the vertical position based on the "top" value set in the chessboard CSS.
  // These values are in line with the settings in Board.css.
  const yPositions: Record<Position, number> = {
    // Center point
    'A1': 50,
    
    // Inner Ring - Clockwise
    'B1': 65, // Up
    'B2': 58, // Right Down
    'B3': 42, // Right Up
    'B4': 35, // Up
    'B5': 42, // Left Up
    'B6': 58, // Left Down
    
    // Outer Ring - Clockwise
    'C1': 80, // Bottom right side
    'C2': 80, // Bottom left side
    'C3': 70, // left down
    'C4': 58, // left middle down
    'C5': 42, // left middle up
    'C6': 30, // left up
    'C7': 20, // Top left side
    'C8': 20, // Top right side
    'C9': 30, // right up
    'C10': 42, // right middle up
    'C11': 58, // right middle down
    'C12': 70, // right down
    
    // Endpoint
    'D1': 93, // Bottom right
    'D2': 93, // Bottom left
    'D3': 7,  // Top left
    'D4': 7   // Top right
  };
  
  return yPositions[position] || 50;  // Default return to the middle position
}; 