import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
  playerX: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  playerO: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  board: {
    type: [[String]],
    default: [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ],
  },
  currentTurn: { type: String, enum: ["X", "O"], default: "X" },
  status: {
    type: String,
    enum: ["pending", "waiting", "in_progress", "finished", "draw", "rejected"],
    default: "waiting",
  },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  // spectators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const Game = mongoose.model("Game", gameSchema);
export default Game;
