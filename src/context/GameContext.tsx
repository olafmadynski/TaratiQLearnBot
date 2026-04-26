import React, { useState, createContext, useReducer, useContext, useEffect } from 'react';
import { 
  GameState, 
  GameStatus, 
  Position, 
  BoardState, 
  MoveRecord 
} from '../types';
import { PlayerColor, PieceType, INITIAL_POSITIONS, ALL_POSITIONS, ADJACENCY_MAP } from '../constants/gameConstants';
import { isValidMove, hasValidMoves } from '../utils/moveValidation';
import { getAffectedPieces, flipPieces, validateColorFlipRules, debugBoardState } from '../utils/gameLogic';

// Define Action type
enum ActionType {
  SELECT_PIECE = 'SELECT_PIECE',
  MOVE_PIECE = 'MOVE_PIECE',
  RESET_GAME = 'RESET_GAME',
  LOAD_HISTORY = 'LOAD_HISTORY',
  CHECK_GAME_STATUS = 'CHECK_GAME_STATUS',
  RESTORE_BOARD = 'RESTORE_BOARD' 
}

// Define the GameAction interface
interface GameAction {
  type: ActionType;
  payload?: any;
}

//Save game state (for persistence)
interface SavedGameState {
  board: BoardState;
  currentPlayer: PlayerColor;
  gameStatus: GameStatus;
  moveHistory: MoveRecord[];
  timestamp: number;
}

//Save the complete game state to localStorage
const saveGameState = (state: GameState): void => {
  try {
    const savedState: SavedGameState = {
     board: state.board,
     currentPlayer: state.currentPlayer,
     gameStatus: state.gameStatus,
     moveHistory: state.moveHistory,
     timestamp: Date.now()
    };

    localStorage.setItem('chess-game-state', JSON.stringify(savedState));
    // console.log('Game state has been saved.');
    } catch (e) {
      console.error('Failed to save game state:', e);
      }
};

//Load the complete game state from localStorage
const loadGameState = (): SavedGameState | null => {
  try {
    const savedData = localStorage.getItem('chess-game-state');
    if (savedData) {
      const parsedState = JSON.parse(savedData) as SavedGameState;
      //Verify data integrity
      if (!parsedState.board || !parsedState.currentPlayer) {
        console.error('The saved game board state data is incomplete:', parsedState);
      }
      // console.log('Game state has been loaded.');
      return parsedState;
      }
    } catch (e) {
      console.error('Failed to load game state', e);
    }
    return null;
};

//clear game state
const clearGameState = (): void => {
  try {
    localStorage.removeItem('chess-game-state');
    // console.log('chess-game-state has been cleared.');
    } catch (e) {
      console.error('Failed to remove chess-game-state:', e);
    }
};

// save board state
const saveBoardState = (board: BoardState): void => {
  try {
    localStorage.setItem('chess-board-state', JSON.stringify(board));
    // console.log('chess-board-state has been saved.');
  } catch (error) {
    console.error('Failed to save chess-board-state:', error);
    }
  };

// Restore the game board state from local storage
const loadBoardState = (): BoardState | null => {
  try {
    const savedBoard = localStorage.getItem('chess-board-state');
    if (savedBoard) {
      const parsedBoard = JSON.parse(savedBoard);
      // console.log('Restore the game board state from local storage:', parsedBoard);
      return parsedBoard;
      }
    } catch (error) {
      console.warn('Failed to Restore the game board state，Use the default initial state:', error);
    }
    return null;
};


// load chess move history
const loadMoveHistoryFromStorage = (): MoveRecord[] => {
  try {
    const savedHistory = localStorage.getItem('chess-move-history');
    if (savedHistory) {
      return JSON.parse(savedHistory);
    }
  } catch (e) {
    console.error('Failed to load chess-move-history:', e);
  }
  return [];
};

// Create the initial state of the chessboard
const createInitialBoard = (): BoardState => {
  // First, attempt to restore from local storage.
  const savedBoard = loadBoardState();
  if (savedBoard) {
    return savedBoard;
    }
  const board: BoardState = {};
  
  // Place the black pieces
  INITIAL_POSITIONS.BLACK_POSITIONS.forEach(pos => {
    board[pos] = {
      type: PieceType.NORMAL,
      color: PlayerColor.BLACK
    };
  });
  
  // Place the white pieces
  INITIAL_POSITIONS.WHITE_POSITIONS.forEach(pos => {
    board[pos] = {
      type: PieceType.NORMAL,
      color: PlayerColor.WHITE
    };
  });
  
  return board;
};

// Initial game state
const initialState: GameState = {
  board: createInitialBoard(),
  currentPlayer: PlayerColor.WHITE, // White goes first
  selectedPiece: null,
  gameStatus: GameStatus.ONGOING,
  moveHistory: []
};

// Initial game state
const initialSavedGameState: SavedGameState = {
  board: createInitialBoard(),
  currentPlayer: PlayerColor.WHITE, // White goes first
  gameStatus: GameStatus.ONGOING,
  moveHistory: [],
  timestamp: Date.now()
};


// Calculate the current player (based on the movement history)
const calculateCurrentPlayer = (history: MoveRecord[]): PlayerColor => {
  if (history.length === 0) {
    return PlayerColor.WHITE; // White goes first
  }
  
  // The player making the last move is the previous player, so the current player is the opponent.
  const lastMove = history[history.length - 1];
  return lastMove.player === PlayerColor.BLACK ? PlayerColor.WHITE : PlayerColor.BLACK;
};

// Check Game Status
const checkGameStatus = (board: BoardState, currentPlayer: PlayerColor): GameStatus => {
  // Check if the current player still has any pieces left.
  const currentPlayerPieces = Object.entries(board)
    .filter(([_, piece]) => piece && piece.color === currentPlayer);
  
  if (currentPlayerPieces.length === 0) {
    // If the current player has no pieces left, the opponent wins.
    return currentPlayer === PlayerColor.BLACK ? GameStatus.WHITE_WON : GameStatus.BLACK_WON;
  }
  
  // Check if the current player still has a valid move available.
  if (!hasValidMoves(board, currentPlayer)) {
    console.log(`${currentPlayer}Without valid movement, the game is over.`);
    // If the current player is unable to move, the opponent wins.
    return currentPlayer === PlayerColor.BLACK ? GameStatus.WHITE_WON : GameStatus.BLACK_WON;
  }
  
  return GameStatus.ONGOING;
};

// Game state update reducer
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {

    case ActionType.RESTORE_BOARD: {
      const savedState = action.payload as SavedGameState;
      console.log('Restore game state:', savedState);

      if(savedState.gameStatus === 1 || savedState.gameStatus === 2 || savedState.gameStatus === 3){
          localStorage.removeItem('chess-move-history');
          localStorage.removeItem('chess-board-state');
          clearGameState(); //The new complete state
      
          return {
                  ...initialState,
                  board: createInitialBoard(), // Create a new chessboard state
                  moveHistory: [] // Clear the history of move operations
                  };
        }

      return {
        board: savedState.board,
        currentPlayer: savedState.currentPlayer,
        selectedPiece: null, //Reset the selected state
        gameStatus: savedState.gameStatus, //savedState.gameStatus,
        moveHistory: savedState.moveHistory
      };

    }

    case ActionType.SELECT_PIECE: {
      const position = action.payload as Position;
      const piece = state.board[position];
      
      // If the game is over, no more pieces can be selected.
      if (state.gameStatus !== GameStatus.ONGOING) {
        return {
          ...state,
          selectedPiece: null
        };
      }
      
      // If the selected object is the current player's piece, then select it
      if (piece && piece.color === state.currentPlayer) {
        return {
          ...state,
          selectedPiece: position
        };
      }
      
      return {
        ...state,
        selectedPiece: null
      };
    }
      
    case ActionType.MOVE_PIECE: {
      const toPosition = action.payload as Position;
      
      // If no piece is selected or the game has ended, the move will not be executed.
      if (!state.selectedPiece || state.gameStatus !== GameStatus.ONGOING) {
        return {
          ...state,
          selectedPiece: null // Cancel selection
        };
      }
      
      // Check whether the movement is valid
      if (!isValidMove(state.board, state.selectedPiece, toPosition, state.currentPlayer)) {
        return {
          ...state,
          selectedPiece: null // Cancel selection
        };
      }
      
      // Carry out the movement
      let newBoard = { ...state.board };
      const movingPiece = { ...newBoard[state.selectedPiece] }; // Deeply copy the moved chess pieces
      
      // Remove the chess piece from its original position
      delete newBoard[state.selectedPiece];
      
      // Place in the new location
      newBoard[toPosition] = movingPiece;
      
      // Check if any pieces need to be changed in color
      // The color-changing rule is triggered when a piece moves to an adjacent position of an enemy piece.
      let affectedPieces = getAffectedPieces(newBoard, toPosition, state.currentPlayer);
      // console.log(`Piece from${state.selectedPiece}move to${toPosition}，The affected pieces:：${affectedPieces.join(', ')}`);

      const movedPieceInfo = newBoard[toPosition]; // `to` It is the target position of the movement.

      //Check: Determine if there is a piece at the moved-to position, whether that piece is a "white piece", and whether that position is 'C7' || 'C8' || 'D3' || 'D4'
      if (movedPieceInfo && movedPieceInfo.color === PlayerColor.WHITE)
      {
        if (movedPieceInfo.type === PieceType.NORMAL && (toPosition === 'C7' || toPosition === 'C8' || toPosition === 'D3' || toPosition === 'D4' ) )
        {
          //Meet the requirements! Proceed with the promotion.
          newBoard[toPosition] = { ...movedPieceInfo, type: PieceType.ROCK };
          saveBoardState(newBoard);
          
        }
        
         // Check if any pieces need to be changed in color
         // The color-changing rule is triggered when a piece moves to an adjacent position of an enemy piece.
          affectedPieces = getAffectedPieces(newBoard, toPosition, state.currentPlayer);
          // console.log(`Piece from${state.selectedPiece}move to${toPosition}，The affected pieces：${affectedPieces.join(', ')}`);
      
         // The chess pieces affected by color change
          if (affectedPieces.length > 0) 
              {
               
               debugBoardState(newBoard);
        
               newBoard = flipPieces(newBoard, affectedPieces, state.currentPlayer);

               affectedPieces.forEach(adjacentPos =>{
                if (adjacentPos === 'C7' || adjacentPos === 'C8' || adjacentPos === 'D3' || adjacentPos === 'D4' )
                {
                  const affectedPiecesInfo = newBoard[adjacentPos]
                  newBoard[adjacentPos] = { ...affectedPiecesInfo, type: PieceType.ROCK };
                  saveBoardState(newBoard);
                  
                }

                });
        
               
               debugBoardState(newBoard);
        
               // Verify the movement rules after color change
               validateColorFlipRules(newBoard);
                 
         }
    }

      //Check: Determine if there is a piece at the moved-to position, whether that piece is a "black piece", and whether that position is A. 'C1' || 'C2' || 'D1' || 'D2'
      if (movedPieceInfo && movedPieceInfo.color === PlayerColor.BLACK)
      {
        if (movedPieceInfo.type === PieceType.NORMAL && (toPosition === 'C1' || toPosition === 'C2' || toPosition === 'D1' || toPosition === 'D2') )
        {
          //Meet the requirements! Proceed with the promotion.
          newBoard[toPosition] = { ...movedPieceInfo, type: PieceType.ROCK };
          saveBoardState(newBoard);
          
        }
        
         // Check if any pieces need to be changed in color
         // The color-changing rule is triggered when a piece moves to an adjacent position of an enemy piece.
          affectedPieces = getAffectedPieces(newBoard, toPosition, state.currentPlayer);
          // console.log(`Piece from${state.selectedPiece}move to${toPosition}，The affected pieces：${affectedPieces.join(', ')}`);
      
         //The chess pieces affected by color change
            if (affectedPieces.length > 0) 
              {
               
               debugBoardState(newBoard);
        
               newBoard = flipPieces(newBoard, affectedPieces, state.currentPlayer);

               affectedPieces.forEach(adjacentPos =>{
                if (adjacentPos === 'C1' || adjacentPos === 'C2' || adjacentPos === 'D1' || adjacentPos === 'D2' )
                {
                  const affectedPiecesInfo = newBoard[adjacentPos]
                  newBoard[adjacentPos] = { ...affectedPiecesInfo, type: PieceType.ROCK };
                  saveBoardState(newBoard);
                  
                }

                });
        
               
               debugBoardState(newBoard);
        
               // Verify the movement rules after color change
               validateColorFlipRules(newBoard);
               
              }
    }

      // Create move records
      const moveRecord: MoveRecord = {
        player: state.currentPlayer,
        from: state.selectedPiece,
        to: toPosition,
        capturedPositions: affectedPieces,
        timestamp: Date.now()
      };
      
      // Switch player
      const nextPlayer = state.currentPlayer === PlayerColor.BLACK ? 
        PlayerColor.WHITE : PlayerColor.BLACK;
      
      // Check the game state
      
      // 1. Check if the opponent still has any pieces (Victory Condition A)
      const nextPlayerPieces = Object.entries(newBoard)
        .filter(([_, piece]) => piece && piece.color === nextPlayer);
      
      if (nextPlayerPieces.length === 0) {
        // If the opponent runs out of pieces, the current player wins.
        const newGameStatus = state.currentPlayer === PlayerColor.BLACK ? 
          GameStatus.BLACK_WON : GameStatus.WHITE_WON;

        const newState = {
          board: newBoard,
          currentPlayer: state.currentPlayer,
          selectedPiece: null,
          gameStatus: newGameStatus,
          moveHistory: [ ...state.moveHistory, moveRecord]
          };

        //Save the complete game state (instead of only saving the movement history)
        saveGameState(newState);
          
        // Save the history of move to local storage
        try {
          localStorage.setItem('chess-move-history', JSON.stringify(newState.moveHistory));
        } catch (e) {
          console.error('Failed to save the history of move:', e);
        }

        saveBoardState(newBoard);

        return newState;

      }
      
      // 2. Check if the opponent still has a valid move (condition B for victory)
      if (!hasValidMoves(newBoard, nextPlayer)) {
        console.log(`${nextPlayer}Without valid movement, the game is over.`);
        // If the opponent is unable to move, the current player wins.
        const newGameStatus = state.currentPlayer === PlayerColor.BLACK ? 
          GameStatus.BLACK_WON : GameStatus.WHITE_WON;
          
        const newState = {
          board: newBoard,
          currentPlayer: state.currentPlayer,
          selectedPiece: null,
          gameStatus: newGameStatus,
          moveHistory: [ ...state.moveHistory, moveRecord]
          };

        //Save the complete game state (instead of only saving the movement history)
        saveGameState(newState);
          
        // Save the history of move to local storage
        try {
          localStorage.setItem('chess-move-history', JSON.stringify(newState.moveHistory));
        } catch (e) {
          console.error('Failed to save the history of move:', e);
        }

        saveBoardState(newBoard);

        return newState;
      }
      
      // The game continues. Switch to the next player.
      // Save the history of move to local storage
      const newState = {
          board: newBoard,
          currentPlayer: nextPlayer,
          selectedPiece: null,
          gameStatus: GameStatus.ONGOING,
          moveHistory: [ ...state.moveHistory, moveRecord]
          };

      //Save the complete game state (instead of only saving the movement history)
      saveGameState(newState);

      // Save the history of move to local storage
      try {
          localStorage.setItem('chess-move-history', JSON.stringify(newState.moveHistory));
        } catch (e) {
          console.error('Failed to save the history of move:', e);
        }

      saveBoardState(newBoard);

      return newState;
    }
      
    case ActionType.RESET_GAME:
      // Clear the game history and board state stored locally
      localStorage.removeItem('chess-move-history');
      localStorage.removeItem('chess-board-state');
      clearGameState(); //The new complete state
      
      return {
        ...initialState,
        board: createInitialBoard(), // Create a new chessboard state
        moveHistory: [] // Clear the history of move
      };
    
    case ActionType.LOAD_HISTORY: {
      const history = action.payload as MoveRecord[];
      
      if (history.length === 0) {
        return initialState;
      }

      const board = loadBoardState();
      const currentPlayer = calculateCurrentPlayer(history);
      
      return {
        board: createInitialBoard(), //The chessboard is reset to its initial state.
        currentPlayer: PlayerColor.WHITE,
        selectedPiece: null,
        gameStatus: GameStatus.ONGOING,
        moveHistory: history
      };
    }
    
    case ActionType.CHECK_GAME_STATUS: {
      // Check the current game status
      const gameStatus = checkGameStatus(state.board, state.currentPlayer);
      
      if (gameStatus !== state.gameStatus) {
        return {
          ...state,
          gameStatus
        };
      }
      
      return state;
    }
      
    default:
      return state;
  }
};

/**
 * Carry out the move inspection
 */
const checkMoveAndDebug = (
  position: Position,
  dispatch: React.Dispatch<GameAction>,
  state: GameState
) => {
  // console.log("The current state of the chessboard:");
  debugBoardState(state.board);
  
  dispatch({ type: ActionType.MOVE_PIECE, payload: position });
};

// Establish a context
interface GameContextType {
  state: GameState;
  selectPiece: (position: Position) => void;
  movePiece: (position: Position) => void;
  resetGame: () => void;
  loadHistory: () => void;
  checkGameStatus: () => void;
  undoMove: () => void;
  toggleAIBlack: () => void;
  toggleAIWhite: () => void;
  aiBlack: boolean;
  aiWhite: boolean;
}

// Set default values
const defaultContextValue: GameContextType = {
  state: initialState,
  selectPiece: () => {},
  movePiece: () => {},
  resetGame: () => {},
  loadHistory: () => {},
  checkGameStatus: () => {},
  undoMove: () => {},
  toggleAIBlack: () => {},
  toggleAIWhite: () => {},
  aiBlack: false,
  aiWhite: false,
};

// Create Context
const GameContext = createContext<GameContextType>(defaultContextValue);

// Provide the Provider component
interface GameProviderProps {
  children: React.ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [state_history, setState_history] = useState<{
    board: BoardState;
    currentPlayer: PlayerColor;
    gameStatus: GameStatus;
    moveHistory: MoveRecord[];
    timestamp: number;
  }[]>([]);

  const [aiBlack, setAiBlack] = useState<boolean>(false);
  const [aiWhite, setAiWhite] = useState<boolean>(false);

  // When mounting the component, an attempt is made to load the history record from the local storage.
  useEffect(() => {
    loadHistory();
  }, []);
  
  // Check the game status after each status update
  useEffect(() => {
    console.log('state length changed ->', state_history.length);
    if (state.gameStatus === GameStatus.ONGOING) {
      checkGameStatus();
    }
    if (state.gameStatus !== GameStatus.ONGOING && (aiBlack || aiWhite)) {
      const winner = state.gameStatus === GameStatus.BLACK_WON ? "BLACK" : 
                     state.gameStatus === GameStatus.WHITE_WON ? "WHITE" : "DRAW";

      fetch("http://127.0.0.1:5000/game-end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winner })
      })
    }

    const aiTurn =
      (state.currentPlayer === PlayerColor.BLACK && aiBlack) ||
      (state.currentPlayer === PlayerColor.WHITE && aiWhite);

    if (aiTurn && state.gameStatus === GameStatus.ONGOING) {
      // const timer = setTimeout(doAIMove, 100);
      doAIMove();
      // return () => clearTimeout(timer);
    }

  }, [state.board, state.currentPlayer, aiBlack, aiWhite, state.gameStatus]);
  
  const selectPiece = (position: Position) => {
    dispatch({ type: ActionType.SELECT_PIECE, payload: position });
  };
  
  const movePiece = (position: Position) => {
    // Wrap the movement operation with the debugging function
    checkMoveAndDebug(position, dispatch, state);


    const savedState = loadGameState();

    if (savedState) {
     setState_history(prev => [ ...prev, savedState]);
    }
    // If there is no storage state of the chessboard at the beginning of the game, then assign the initial state of the chessboard.
    if (!savedState) {
        const initialsavedState = initialSavedGameState;
        setState_history(prev => [ ...prev, initialsavedState]);
    }
  };

  const undoMove = () => {

    if (state_history.length > 0)
    {
      const newState_history = [ ... state_history];
      const lastState_history = state_history.pop();
      
      if (lastState_history)
      {
      //Save the complete game state (instead of only saving the movement history)
      try {
          localStorage.setItem('chess-game-state', JSON.stringify(lastState_history));
      } catch (e) {
          console.error('Failed to save the game state:', e);
      }
      // Save the history of move to local storage
      try {
          localStorage.setItem('chess-move-history', JSON.stringify(lastState_history?.moveHistory));
      } catch (e) {
          console.error('Failed to save the history of move:', e);
      }
      try {
          localStorage.setItem('chess-board-state', JSON.stringify(lastState_history?.board));
      } catch (e) {
          console.error('Failed to save the board state:', e);
      }
      dispatch({ type: ActionType.RESTORE_BOARD, payload: lastState_history });
    }
    if (!lastState_history)
    {
      dispatch({ type: ActionType.RESET_GAME });
      // Clear history state
      setState_history([]);
      setState_history(prevHistory => []); // Equivalent to directly passing []
      if (aiBlack || aiWhite) {
        fetch("http://127.0.0.1:5000/game-start", { method: "POST" });
      }
    }
    }

    if (state_history.length === 0)
    {
      dispatch({ type: ActionType.RESET_GAME });
      // Clear history state
      setState_history([]);
      setState_history(prevHistory => []); // Equivalent to directly passing []
      if (aiBlack || aiWhite) {
        fetch("http://127.0.0.1:5000/game-start", { method: "POST" });
      }
    }
  };

  const toggleAIBlack = () => {
    setAiBlack(prev => !prev);
    fetch("http://127.0.0.1:5000/game-start", { method: "POST" });
  };

  const toggleAIWhite = () => {
    setAiWhite(prev => !prev);
    fetch("http://127.0.0.1:5000/game-start", { method: "POST" });
  };
  
  const resetGame = () => {
    dispatch({ type: ActionType.RESET_GAME });
    // Clear history state
    setState_history([]);
    setState_history(prevHistory => []); // Equivalent to directly passing []
    if (aiBlack || aiWhite) {
      fetch("http://127.0.0.1:5000/game-start", { method: "POST" });
    }
  };
  
  const loadHistory = () => {
    //Prioritize the attempt to load the complete game state
    const savedState = loadGameState();
    const history = loadMoveHistoryFromStorage();
    if (savedState) {
      dispatch({ type: ActionType.RESTORE_BOARD, payload: savedState });
      return;
      }
    
    dispatch({ type: ActionType.RESET_GAME });
  };
  
  const checkGameStatus = () => {
    dispatch({ type: ActionType.CHECK_GAME_STATUS });
  };

  const doAIMove = async () => {
    console.log("yo");
    const aiColour = state.currentPlayer;

    if (
      state.gameStatus !== GameStatus.ONGOING ||
      (aiColour === PlayerColor.BLACK && !aiBlack) ||
      (aiColour === PlayerColor.WHITE && !aiWhite)
    ) {
      return;
    }

    console.log("yo2");
    const pieces: Position[] = [];
    Object.entries(state.board).forEach(([pos, piece]) => {
      if (piece?.color === aiColour) {
        pieces.push(pos as Position);
        }
    });

    console.log("yo3");
    const validMoves: {from: Position, to: Position}[] = [];

    for (const fromPos of pieces) {
      console.log("yo4");
      const neighbors = ADJACENCY_MAP[fromPos] || [];
      for (const toPos of neighbors) {
        if (isValidMove(state.board, fromPos, toPos, aiColour)) {
            validMoves.push({from: fromPos, to: toPos});
            }
          }
        }
    if (validMoves.length > 0) {
      console.log("yo5");
      try {
        const response = await fetch("http://127.0.0.1:5000/ai-move", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            board: state.board,
            possible_moves: validMoves,
            ai_colour: aiColour,
          }),
        });
        if (!response.ok) {
          console.log("yoERROR1");
          console.error("AI API error:", response.statusText);
          return;
        }

        const aiMove = await response.json();
        console.log("yo6");
        console.log("AI move from Flask:", aiMove);
        const { from, to } = aiMove;
        if (from && to) {
          selectPiece(from);
          //setTimeout(() => movePiece(to), 100);
          movePiece(to);
        } else {
          console.log("yoERROR2");
          console.warn("AI did not return a valid move");
        }
      } catch (error) {
        console.log("yoERROR3");
        console.error("Failed to fetch AI move:", error);
      }
    }
  };
  
  return (
    <GameContext.Provider value={{ state, selectPiece, movePiece, resetGame, loadHistory, checkGameStatus, undoMove, toggleAIBlack, toggleAIWhite, aiBlack, aiWhite}}>
      {children}
    </GameContext.Provider>
  );
}

// Provide a Hook to facilitate the use of the context
export const useGameContext = (): GameContextType => {
  const context = useContext(GameContext);
  return context;
}; 