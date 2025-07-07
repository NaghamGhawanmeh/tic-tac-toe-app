import { useState } from "react";
import "./App.css";

function App() {
  const emptyBoard = Array(3)
    .fill(null)
    .map(() => Array(3).fill(""));

  const [board, setBoard] = useState(emptyBoard);
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [winner, setWinner] = useState(null);

  const handleClick = (row, col) => {
    if (board[row][col] !== "" || winner) return;

    const updatedBoard = board.map((r, i) =>
      r.map((cell, j) => (i === row && j === col ? currentPlayer : cell))
    );

    setBoard(updatedBoard);

    const win = checkWinner(updatedBoard);
    if (win) {
      setWinner(win);
    } else {
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    }
  };

  const checkWinner = (board) => {
    // Check rows
    for (let row of board) {
      if (row[0] && row.every((cell) => cell === row[0])) return row[0];
    }
    // Check columns
    for (let col = 0; col < 3; col++) {
      if (board[0][col] && board.every((row) => row[col] === board[0][col]))
        return board[0][col];
    }
    // Check diagonals
    if (board[0][0] && board.every((row, i) => row[i] === board[0][0]))
      return board[0][0];
    if (board[0][2] && board.every((row, i) => row[2 - i] === board[0][2]))
      return board[0][2];

    return null;
  };

  const resetGame = () => {
    setBoard(emptyBoard);
    setCurrentPlayer("X");
    setWinner(null);
  };

  return (
    <div className="App">
      <h1>Tic Tac Toe</h1>
      {winner ? <h2>Winner: {winner}</h2> : <h2>Next: {currentPlayer}</h2>}
      <div className="board">
        {board.map((row, i) => (
          <div key={i} className="row">
            {row.map((cell, j) => (
              <button
                key={j}
                className="cell"
                onClick={() => handleClick(i, j)}
              >
                {cell}
              </button>
            ))}
          </div>
        ))}
      </div>
      <button onClick={resetGame}>Restart</button>
    </div>
  );
}

export default App;
