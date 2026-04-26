import React, { useEffect, useRef, useState, useCallback } from 'react';
import Piece from '../Piece/Piece';
import { useGameContext } from '../../context/GameContext';
import { ALL_POSITIONS, ADJACENCY_MAP } from '../../constants/gameConstants';
import './Board.css';
import { Position } from '../../types';
//import { useTheme } from '../../context/ThemeContext';

/**
 * Chessboard component
 */
const Board: React.FC = () => {
  const { state, selectPiece, movePiece } = useGameContext();
  const { board, selectedPiece, currentPlayer } = state;
  const boardRef = useRef<HTMLDivElement>(null);
  const [isDrawingLines, setIsDrawingLines] = useState(false);
  //const { theme } = useTheme();

  // Draw connection lines
  const drawConnections = useCallback(() => {
    const boardElement = boardRef.current;
    if (!boardElement || isDrawingLines) return;
    
    setIsDrawingLines(true);
    
    // Remove the existing connection lines
    const existingLines = boardElement.querySelectorAll('.connection-line');
    existingLines.forEach(line => line.remove());
    
    // Create a new connection line
    Object.entries(ADJACENCY_MAP).forEach(([fromPos, adjacentPositions]) => {
      adjacentPositions.forEach(toPos => {
        // To avoid redundant drawing, only the connections with the smaller lexicographical order will be processed.
        if (fromPos < toPos) {
          const fromNode = boardElement.querySelector(`[data-position="${fromPos}"]`);
          const toNode = boardElement.querySelector(`[data-position="${toPos}"]`);
          
          if (fromNode && toNode) {
            const line = document.createElement('div');
            line.className = 'connection-line';
            line.setAttribute('data-from', fromPos);
            line.setAttribute('data-to', toPos);
            
            // Obtain the node position
            const fromRect = fromNode.getBoundingClientRect();
            const toRect = toNode.getBoundingClientRect();
            const boardRect = boardElement.getBoundingClientRect();
            
            // Calculate relative position - precise to the center of the node
            const fromX = fromRect.left + fromRect.width / 2 - boardRect.left;
            const fromY = fromRect.top + fromRect.height / 2 - boardRect.top;
            const toX = toRect.left + toRect.width / 2 - boardRect.left;
            const toY = toRect.top + toRect.height / 2 - boardRect.top;
            
            // Calculate distance and angle
            const dX = toX - fromX;
            const dY = toY - fromY;
            const distance = Math.sqrt(dX * dX + dY * dY);
            const angle = Math.atan2(dY, dX) * 180 / Math.PI;
            
            // Set the style of the connection line
            Object.assign(line.style, {
              width: `${distance}px`,
              left: `${fromX}px`,
              top: `${fromY}px`,
              transform: `rotate(${angle}deg)`,
              transformOrigin: '0 50%',
              zIndex: '1',
              pointerEvents: 'none',
              display: 'block'
            });
            
            boardElement.appendChild(line);
          }
        }
      });
    });
    
    setIsDrawingLines(false);
  }, [isDrawingLines]);
  
  // Initialize and redraw the connection lines
  useEffect(() => {
    const timer = setTimeout(drawConnections, 200);
    
    // Redraw the connection lines when the window size changes.
    window.addEventListener('resize', drawConnections);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', drawConnections);
    };
  }, [board, drawConnections]);

  /**
   * Handle the click event of the processing node
   */
  const handleNodeClick = useCallback((position: Position) => {
    // If there is a piece at that position
    if (board[position]) {
      // If it is the current player's piece, select it
      if (board[position].color === currentPlayer) {
        selectPiece(position);
      } 
      // Otherwise, if a piece has already been selected, try to move it to that position
      else if (selectedPiece) {
        movePiece(position);
      }
    } 
    // If there is no piece at this position and a piece has been selected, attempt to move.
    else if (selectedPiece) {
      movePiece(position);
    }
  }, [board, selectedPiece, currentPlayer, selectPiece, movePiece]);

  /**
   * Render the chessboard nodes
   */
  const renderNode = (position: Position) => {
    const piece = board[position];
    const isSelected = position === selectedPiece;
    
    return (
      <div 
        key={position} 
        className={`board-node ${isSelected ? 'selected' : ''}`}
        onClick={() => handleNodeClick(position)}
        data-position={position}
      >
        {piece && (
          <div className="piece-container">
            <Piece 
              key={`${position}-${piece.color}`}
              color={piece.color} 
              type={piece.type}
              isSelected={isSelected}
            />
          </div>
        )}
        <span className="node-label">{position}</span>
      </div>
    );
  };

  return (
     <div className="board-container">
       <div className="board" ref={boardRef}>
        {ALL_POSITIONS.map(renderNode)}
       </div>
     </div>
  );
};

export default Board; 