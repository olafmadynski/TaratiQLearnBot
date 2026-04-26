/**
 * Game logic tools
 * Handling game rules, determination of victory conditions, etc.
 */
import { PlayerColor } from '../constants/gameConstants';
import { BoardState, GameStatus, Position } from '../types';
import { getAdjacentPositions, hasValidMoves } from './moveValidation';

/**
 * Check if the game has ended and return the game status
 * @param board board state
 * @param nextPlayer nextPlayer
 * @returns game status
 */
export const checkGameStatus = (board: BoardState, nextPlayer: PlayerColor): GameStatus => {
  // The current player is the opponent of the next player.
  const currentPlayer = nextPlayer === PlayerColor.BLACK ? 
    PlayerColor.WHITE : PlayerColor.BLACK;
  
  // Check if the next player still has any pieces (Condition A for victory)
  const nextPlayerPieces = Object.values(board).filter(piece => piece.color === nextPlayer);
  if (nextPlayerPieces.length === 0) {
    // If the next player has no pieces left, then the current player wins.
    return currentPlayer === PlayerColor.BLACK ? 
      GameStatus.BLACK_WON : GameStatus.WHITE_WON;
  }
  
  // Check if the next player still has a legal move (condition B for victory)
  if (!hasValidMoves(board, nextPlayer)) {
    // If the next player does not make a legal move, then the current player wins.
    return currentPlayer === PlayerColor.BLACK ? 
      GameStatus.BLACK_WON : GameStatus.WHITE_WON;
  }
  
  // Check whether neither side can move (it's a tie)
  if (!hasValidMoves(board, nextPlayer) && !hasValidMoves(board, currentPlayer)) {
    return GameStatus.DRAW;
  }
  
  return GameStatus.ONGOING;
};

/**
 * Obtain the quantity of the specified color chess pieces
 * @param board boardstate
 * @param color piece color
 * @returns Number of chess pieces
 */
export const countPiecesByColor = (board: BoardState, color: PlayerColor): number => {
  return Object.values(board).filter(piece => piece.color === color).length;
};

/**
 * Obtain the positions of the chess pieces that may be eaten (change color) after moving
 * @param board The current state of the chessboard
 * @param position The current position that has been moved to
 * @param playerColor Current player's color
 * @returns The array of the positions of the enemy pieces that have been changed in color
 */
export const getAffectedPieces = (
  board: BoardState,
  position: Position,
  playerColor: PlayerColor
): Position[] => {
  const affectedPositions: Position[] = [];
  const oppositeColor = playerColor === PlayerColor.BLACK ? PlayerColor.WHITE : PlayerColor.BLACK;

  // Obtain all adjacent positions
  const adjacentPositions = getAdjacentPositions(position);
  
  // Check if there are enemy pieces in the adjacent positions
  adjacentPositions.forEach(adjPos => {
    // Make sure there is a piece at this position and it is an enemy piece.
    if (board[adjPos] && board[adjPos].color === oppositeColor) {
      affectedPositions.push(adjPos);
    }
  });
  
  return affectedPositions;
};

/**
 * Execute the color change of the chess pieces
 * @param board Chessboard state
 * @param positions The areas that need to change color
 * @param color The color that has changed
 * @returns Updated chessboard state
 */
export const flipPieces = (
  board: BoardState,
  positions: Position[],
  color: PlayerColor
): BoardState => {
  // Use deep copying to ensure that all changes are independent.
  const newBoard = JSON.parse(JSON.stringify(board));
  
  // The chess pieces affected by color change
  positions.forEach(pos => {
    if (newBoard[pos]) {
      console.log(`Color-changing chess pieces: ${pos} from ${newBoard[pos].color} Become ${color}`);
      newBoard[pos].color = color;
    } else {
      console.log(`Warning: Attempting to flip a non-existent piece in an invalid position: ${pos}`);
    }
  });
  
  return newBoard;
};

/**
 * Verify the movement rules after the chess pieces change color
 * This is an auxiliary function used to test whether the colored chess pieces move according to the expected rules after coloring.
 * @param board Chessboard state
 */
export const validateColorFlipRules = (board: BoardState): void => {

  
  // Check the colors and positions of all the pieces
  const blackPieces: Position[] = [];
  const whitePieces: Position[] = [];
  
  Object.entries(board).forEach(([pos, piece]) => {
    if (piece.color === PlayerColor.BLACK) {
      blackPieces.push(pos as Position);
    } else {
      whitePieces.push(pos as Position);
    }
  });
  
  
  // Verify whether the black pieces and the white pieces have valid moves
  const blackHasValidMoves = hasValidMoves(board, PlayerColor.BLACK);
  const whiteHasValidMoves = hasValidMoves(board, PlayerColor.WHITE);
  
}; 

/**
 * Debugging tool: Checks the state of the chessboard, displays the color and position of all pieces.
 * @param board boardstate
 */
export const debugBoardState = (board: BoardState): void => {

  // Obtain all the pieces
  const pieces = Object.entries(board);

  // Display the black pieces and the white pieces separately
  const blackPieces = pieces.filter(([_, piece]) => piece.color === PlayerColor.BLACK);
  const whitePieces = pieces.filter(([_, piece]) => piece.color === PlayerColor.WHITE);
  
  
  // Display all the pieces in the order of their positions
  // console.log("Detailed state of the chessboard:");
  pieces.sort(([a], [b]) => a.localeCompare(b)).forEach(([pos, piece]) => {
    //console.log(`${pos}: ${piece.color}`);
  });
  
}; 