/**
 * Game type definition
 */
import { PieceType, PlayerColor } from './constants/gameConstants';

/**
 * Location type (for example, 'A1', 'C7')
 */
export type Position = string;

/**
 * Type of chess piece
 */
export interface Piece {
  type: PieceType;
  color: PlayerColor;
}

/**
 * Board state type
 * Key represents the position (such as 'A1', 'C7'), and the value is the chess piece at that position.
 */
export interface BoardState {
  [position: Position]: Piece;
}

/**
 * Game state type
 */
export interface GameState {
  board: BoardState;
  currentPlayer: PlayerColor;
  selectedPiece: Position | null;
  gameStatus: GameStatus;
  moveHistory: MoveRecord[];
}

/**
 * Game state enumeration
 */
export enum GameStatus {
  ONGOING,
  BLACK_WON,
  WHITE_WON,
  DRAW
}

/**
 * Move Record Type
 */
export interface MoveRecord {
  player: PlayerColor;
  from: Position;
  to: Position;
  capturedPositions: Position[];
  timestamp: number;
} 