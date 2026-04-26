/**
 * Chessboard utility functions
 */

import { ADJACENCY_MAP, PlayerColor } from '../constants/gameConstants';
import { Position, BoardState } from '../types';

/**
 * Calculate the style of the connection line between two nodes
 * @param from Starting node position
 * @param to Target node position
 * @returns The style object of the connection line
 */
export const calculateLineStyle = (from: HTMLElement, to: HTMLElement) => {
  // Obtain the center coordinates of the two nodes
  const fromRect = from.getBoundingClientRect();
  const toRect = to.getBoundingClientRect();
  const boardRect = from.closest('.board')?.getBoundingClientRect();
  
  if (!boardRect) return null;
  
  const fromX = fromRect.left + fromRect.width / 2 - boardRect.left;
  const fromY = fromRect.top + fromRect.height / 2 - boardRect.top;
  const toX = toRect.left + toRect.width / 2 - boardRect.left;
  const toY = toRect.top + toRect.height / 2 - boardRect.top;
  
  // Calculate the distance
  const dx = toX - fromX;
  const dy = toY - fromY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Calculate the angle
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  
  // Return the style object
  return {
    width: `${distance}px`,
    transform: `rotate(${angle}deg)`,
    top: `${fromY}px`,
    left: `${fromX}px`,
    display: 'block'
  };
};

/**
 * Draw all the connecting lines
 */
export const drawAllConnections = () => {
  // Traverse all adjacency relationships
  Object.entries(ADJACENCY_MAP).forEach(([pos1, adjacentPositions]) => {
    adjacentPositions.forEach((pos2) => {
      // To avoid redundant drawing, only draw the lines connecting positions in lexicographical order from the smaller ones to the larger ones.
      if (pos1 < pos2) {
        const fromEl = document.querySelector(`[data-position="${pos1}"]`);
        const toEl = document.querySelector(`[data-position="${pos2}"]`);
        const lineEl = document.querySelector(`[data-from="${pos1}"][data-to="${pos2}"]`);
        
        if (fromEl && toEl && lineEl) {
          const style = calculateLineStyle(
            fromEl as HTMLElement,
            toEl as HTMLElement
          );
          
          if (style) {
            // Fix the type error
            const lineHtmlEl = lineEl as HTMLElement;
            Object.assign(lineHtmlEl.style, style);
          }
        }
      }
    });
  });
};

/**
 * Initialize the connection lines of the chessboard
 * Create connection line elements for all adjacent nodes
 */
export const initializeBoardConnections = () => {
  const board = document.querySelector('.board');
  if (!board) return;
  
  // Remove the existing connection lines
  document.querySelectorAll('.connection-line').forEach(el => el.remove());
  
  // Create a new connection line
  Object.entries(ADJACENCY_MAP).forEach(([pos1, adjacentPositions]) => {
    adjacentPositions.forEach((pos2) => {
      // To avoid redundant drawing, only draw the lines connecting positions in lexicographical order from the smaller ones to the larger ones.
      if (pos1 < pos2) {
        const line = document.createElement('div');
        line.className = 'connection-line';
        line.setAttribute('data-from', pos1);
        line.setAttribute('data-to', pos2);
        board.appendChild(line);
      }
    });
  });
  
  // Draw all the connecting lines
  setTimeout(drawAllConnections, 0);
};

/**
 * Redraw the connection lines when the window size is changed
 */
export const setupResizeListener = () => {
  window.addEventListener('resize', drawAllConnections);
};

/**
 * Clean up resources
 */
export const cleanupResizeListener = () => {
  window.removeEventListener('resize', drawAllConnections);
};

/**
 * Obtain the quantity of the specified color chess pieces
 * @param board Chessboard state
 * @param color Color of the chess pieces
 * @returns Number of chess pieces
 */
export const countPiecesByColor = (board: BoardState, color: PlayerColor): number => {
  return Object.values(board).filter(piece => piece.color === color).length;
};