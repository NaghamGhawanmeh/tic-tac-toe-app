// models/Game.js
const mongoose = require("mongoose");

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
    enum: ["pending", "waiting", "in_progress", "finished"], // ✅ أضفنا "pending"
    default: "waiting",
  },

  winner: { type: String, enum: ["X", "O", "draw", null], default: null },
  spectators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const Game = mongoose.model("Game", gameSchema);
module.exports = Game;
