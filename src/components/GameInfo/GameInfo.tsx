import React, { useEffect, useState } from 'react';
import { useGameContext } from '../../context/GameContext';
import { PlayerColor } from '../../constants/gameConstants';
import { GameStatus, MoveRecord } from '../../types';
import './GameInfo.css';
//import { useTheme } from '../../context/ThemeContext';

/**
 * Game Information Component
 */

const GameInfo: React.FC = () => {
  const { state, resetGame, undoMove, toggleAIBlack, toggleAIWhite, aiBlack, aiWhite } = useGameContext();
  const { currentPlayer, gameStatus, moveHistory } = state;
  const [showHistory, setShowHistory] = useState(true);
  const [autoReset, setAutoReset] = useState(false);
  //const { theme, setTheme } = useTheme();

  // When components are mounted and their movement history is updated, the data is saved to local storage.
  useEffect(() => {
    if (moveHistory.length > 0) {
      localStorage.setItem('chess-move-history', JSON.stringify(moveHistory));
    }
  }, [moveHistory]);

  useEffect(() => {
    if (autoReset && gameStatus !== GameStatus.ONGOING) {
      /*const timer = setTimeout(() => {
        resetGame();
      }, 200);
      return () => clearTimeout(timer); */
      resetGame();
    }
  }, [gameStatus, autoReset, resetGame]);

  // Obtain the current player's text
  const getCurrentPlayerText = () => {
    return currentPlayer === PlayerColor.BLACK ? 'BLACK' : 'WHITE';
  };

  // Obtain the game status text
  const getGameStatusText = () => {
    switch (gameStatus) {
      case GameStatus.BLACK_WON:
        return 'Black Win !';
      case GameStatus.WHITE_WON:
        return 'White Win !';
      case GameStatus.DRAW:
        return 'Draw !';
      default:
        return `Current Turn: ${getCurrentPlayerText()}`;
    }
  };

  // Format the move records into readable text
  const formatMoveRecord = (record: MoveRecord, index: number): string => {
    const playerText = record.player === PlayerColor.BLACK ? 'Black' : 'White';
    const captureText = record.capturedPositions.length > 0 
      ? `, Capture: ${record.capturedPositions.join(', ')}` 
      : '';
    
    return `${index + 1}. ${playerText} ${record.from} → ${record.to}${captureText}`;
  };

  // Determine whether the game has ended
  const isGameOver = gameStatus !== GameStatus.ONGOING;

  // Switch to display history records
  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  return (
    <div className="game-info">
      <div className={`game-status ${isGameOver ? 'game-over' : ''}`}>
        {getGameStatusText()}
      </div>
      
      {!isGameOver && (
        <div className="current-player">
          <div 
            className={`player-indicator ${currentPlayer === PlayerColor.BLACK ? 'black' : 'white'}`}
          />
          <span>{getCurrentPlayerText()}</span>
        </div>
      )}
      <div className="controls-container">
        <div className="toggle-wrapper">
          <input
            type="checkbox"
            id="ai-black-toggle"
            checked={aiBlack}
            onChange={toggleAIBlack}
          />
          <label htmlFor="ai-black-toggle" className="toggle-label">
            <span className="toggle-text">AI as Black</span>
          </label>
        </div>

        <div className="toggle-wrapper">
          <input
            type="checkbox"
            id="ai-white-toggle"
            checked={aiWhite}
            onChange={toggleAIWhite}
          />
          <label htmlFor="ai-white-toggle" className="toggle-label">
            <span className="toggle-text">AI as White</span>
          </label>
        </div>

        <div className="toggle-wrapper">
          <input
            type="checkbox"
            id="auto-reset-toggle"
            checked={autoReset}
            onChange={() => setAutoReset(prev => !prev)}
          />
          <label htmlFor="auto-reset-toggle" className="toggle-label">
            <span className="toggle-text">Auto Reset</span>
          </label>
        </div>
      </div>

      {/* Show/Hide History Record Button */}
      <div className="history-controls">
        <button className="history-toggle" onClick={toggleHistory}>
          {showHistory ? 'Hide History' : 'Show History'}
        </button>
        <button className="reset-button" onClick={resetGame}>
          Reset
        </button>
      </div>
      
      {/* Move history records */}
      {showHistory && (
        <div className="move-history">
          <h3>Game Record</h3>
          {moveHistory.length === 0 ? (
            <p>No Record</p>
          ) : (
            <ul className="move-list">
              {moveHistory.map((record, index) => (
                <li key={index} className="move-item">
                  {formatMoveRecord(record, index)}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
              <button className="small-button-undo" onClick={undoMove}>
           Undo
        </button>
    </div>
  );
};

export default GameInfo; 