import React from 'react';
import { PlayerColor } from '../../constants/gameConstants';
import './Piece.css';
import { PieceType } from '../../constants/gameConstants';

interface PieceProps {
  color: PlayerColor;
  type: PieceType;
  isSelected?: boolean;
}

/**
 * Chess piece component - Pure display component
 */
const Piece: React.FC<PieceProps> = ({ color, type , isSelected = false }) => {
  const colorClass = color === PlayerColor.BLACK ? 'black' : 'white';
  var rockcolor = 'rock';

  if(colorClass === 'black')
  {
     rockcolor = 'blackrock'
  }


  if(colorClass === 'white')
  {
     rockcolor = 'whiterock'
  }

  const typeClass = type === PieceType.ROCK ? rockcolor : 'normal';
  const selectedClass = isSelected ? 'selected' : '';
  
  return (
    <div className={`piece ${colorClass} ${typeClass} ${selectedClass}`} />
  );
};

export default Piece; 