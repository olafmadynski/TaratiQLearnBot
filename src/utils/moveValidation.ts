/**
 * Move verification tool
 * Verify whether the movement of the chess piece is legal
 */
import { PlayerColor, ADJACENCY_MAP } from '../constants/gameConstants';
import { arePositionsAdjacent, isValidDirection } from './coordinates';
import { BoardState, Position } from '../types';
import { PieceType } from '../constants/gameConstants';

/**
 * Check move whether is vaild
 * @param boardState Current board state
 * @param fromPos Starting position
 * @param toPos Target location
 * @param currentPlayer CurrentPlayer
 * @returns Whether is vaild
 */
export const isValidMove = (
  boardState: BoardState,
  fromPos: Position,
  toPos: Position,
  currentPlayer: PlayerColor
): boolean => {

  const piece = boardState[fromPos];
  
  // Check if there are the current player's pieces at the starting position
  if (!boardState[fromPos] || boardState[fromPos].color !== currentPlayer) {
    console.log(`Move valid failed: ${fromPos} is not ${currentPlayer} piece`);
    return false;
  }

  // Check whether the target position is empty
  if (boardState[toPos]) {
    console.log(`Move valid failed: ${toPos} There are already pieces in that position.`);
    return false;
  }

  // Check if they are adjacent positions
  if (!arePositionsAdjacent(fromPos, toPos)) {
    console.log(`Move valid failed: ${fromPos} and ${toPos} Not adjacent`);
    return false;
  }

  
  if (piece.type === PieceType.ROCK) {
  return true;
  }

  // Check if the moving direction is correct (black pieces can only move downward, while white pieces can only move upward)
  const isBlack = currentPlayer === PlayerColor.BLACK;
  const pieceType = piece.type
  const directionValid = isValidDirection(fromPos, toPos, isBlack, pieceType);
  
  if (!directionValid) {
    console.log(`Move valid failed: ${currentPlayer} from ${fromPos} to ${toPos} direction is not valid`);
  }
  
  return directionValid;
};

/**
 * Obtain the positions of the chess pieces that may be eaten (change color) after moving
 * @param boardState Current board state
 * @param position The current position that has been moved to
 * @param playerColor Current player's color
 * @returns The array of the positions of the enemy pieces that have been changed in color
 */
export const getAffectedPieces = (
  boardState: BoardState,
  position: Position,
  playerColor: PlayerColor
): Position[] => {
  const affectedPositions: Position[] = [];
  const oppositeColor = playerColor === PlayerColor.BLACK ? PlayerColor.WHITE : PlayerColor.BLACK;

  // Obtain all adjacent positions
  const adjacentPositions = getAdjacentPositions(position);
  
  // Check if there are enemy pieces in the adjacent positions
  adjacentPositions.forEach(adjPos => {
    if (boardState[adjPos] && boardState[adjPos].color === oppositeColor) {
      affectedPositions.push(adjPos);
    }
  });
  
  return affectedPositions;
};

/**
 * Obtain all adjacent positions of the specified location
 * @param position Specified location
 * @returns Adjacent position array
 */
export const getAdjacentPositions = (position: Position): Position[] => {
  return ADJACENCY_MAP[position] || [];
};

/**
 * Check whether the specified player has a feasible move
 * @param boardState current boardstate
 * @param playerColor PlayerColor
 * @returns Is there a valid way to move?
 */
export const hasValidMoves = (
  boardState: BoardState, 
  playerColor: PlayerColor
): boolean => {
  // Obtain the positions of all the pieces of this player
  const playerPieces = Object.entries(boardState)
    .filter(([_, piece]) => piece && piece.color === playerColor)
    .map(([pos]) => pos as Position);
  
  // console.log(`Check${playerColor}The possible moves of the chess pieces, in total, are${playerPieces.length} piece: ${playerPieces.join(', ')}`);
  
  // Check to see if each piece has a valid move.
  for (const piecePos of playerPieces) {
    const adjacentPositions = getAdjacentPositions(piecePos);
    
    for (const adjPos of adjacentPositions) {
      // Check if this position is empty
      if (!boardState[adjPos]) {
        // Check whether the movement direction is valid
        const isBlack = playerColor === PlayerColor.BLACK;
        const pieceType = boardState[piecePos].type
        const directionValid = isValidDirection(piecePos, adjPos, isBlack, pieceType);
        
        if (directionValid) {
          // console.log(`Discover valid movement: ${piecePos} -> ${adjPos}`);
          return true;
        }
      }
    }
  }
  
  console.log(`${playerColor}No Valid Movement`);
  return false;
}; 