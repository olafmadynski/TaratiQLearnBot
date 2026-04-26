import React from 'react';
import './App.css';
import Board from './components/Board/Board';
import GameInfo from './components/GameInfo/GameInfo';
import { GameProvider } from './context/GameContext';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Tarati</h1>
      </header>
      <main>
        <GameProvider>
          <div className="game-container">
            <div className="game-left-panel">
             <GameInfo />
            </div>
            <div className="game-board-container">
              <Board />
            </div>
            <div className="game-right-panel">
             <div className="game-instructions">
                <p>Tarati is a board game developed by George Spencer-Brown.</p>
                <p>At the beginning of the Tarati game, all the pieces could only move forward.</p>
                <p>When a piece is located in the "Domestic point" area of the opponent, the piece will be promoted.
                   The promoted piece can move in any direction.</p>
                <p>When a piece moves to a position adjacent to an opponent's piece, this action is called "capture".
                   The captured piece will change color to that of the opposing side, and the opponent will take control.
                   The winning condition of the Tarati game is to capture all the pieces of the opponent, or to force the opponent to be stagnated.</p>
             </div>
            </div>
          </div>
        </GameProvider>
      </main>
      <footer className="App-footer">
        <p>Tarati is a board game developed by George Spencer-Brown.</p>
      </footer>
    </div>
  );
}

export default App; 