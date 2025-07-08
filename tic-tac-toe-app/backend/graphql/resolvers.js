const User = require("../models/User");
const Game = require("../models/Game");
const { producer } = require("../kafka/kafkaClient");

const resolvers = {
  Query: {
    getAllPlayers: async () => {
      return await User.find();
    },
    getGame: async (_, { id }) => {
      return await Game.findById(id).populate("playerX playerO spectators");
    },
    getPendingRequests: async (_, { userId }) => {
      return await Game.find({
        status: "pending",
        playerO: userId,
      }).populate("playerX playerO spectators");
    },
    getUserByUsername: async (_, { username }) => {
      return await User.findOne({ username });
    },
    getMyGames: async (_, { userId }) => {
      return await Game.find({
        $or: [{ playerX: userId }, { playerO: userId }],
      }).populate("playerX playerO spectators");
    },
  },

  Mutation: {
    registerUser: async (_, { username }) => {
      const existing = await User.findOne({ username });
      if (existing) throw new Error("Username already exists");

      const user = await User.create({ username, status: "online" });

      await producer.send({
        topic: "user_status",
        messages: [
          { value: JSON.stringify({ userId: user.id, status: "online" }) },
        ],
      });

      return user;
    },

    updateUserStatus: async (_, { userId, status }) => {
      const user = await User.findByIdAndUpdate(
        userId,
        { status },
        { new: true }
      );

      await producer.send({
        topic: "user_status",
        messages: [{ value: JSON.stringify({ userId, status }) }],
      });

      return user;
    },

    sendGameRequest: async (_, { fromId, toId }) => {
      const game = await Game.create({
        playerX: fromId,
        playerO: toId,
        board: Array(3)
          .fill()
          .map(() => Array(3).fill("")),
        currentTurn: "X",
        status: "pending",
        spectators: [],
      });

      await producer.send({
        topic: "game_requests",
        messages: [
          { value: JSON.stringify({ gameId: game.id, fromId, toId }) },
        ],
      });

      return true;
    },

    acceptGameRequest: async (_, { gameId }) => {
      const game = await Game.findById(gameId);
      if (!game) throw new Error("Game not found");

      game.status = "in_progress";
      await game.save();

      await producer.send({
        topic: "game_updates",
        messages: [
          { value: JSON.stringify({ gameId, status: "in_progress" }) },
        ],
      });

      return game.populate("playerX playerO spectators");
    },

    rejectGameRequest: async (_, { gameId }) => {
      await producer.send({
        topic: "game_requests",
        messages: [{ value: JSON.stringify({ gameId, rejected: true }) }],
      });
      return true;
    },

    makeMove: async (_, { gameId, x, y }) => {
      const game = await Game.findById(gameId);
      if (!game) throw new Error("Game not found");
      if (game.board[x][y] !== "") throw new Error("Cell already occupied");

      const currentSymbol = game.currentTurn;
      game.board[x][y] = currentSymbol;
      game.currentTurn = currentSymbol === "X" ? "O" : "X";

      // منطق التحقق من الفوز يضاف لاحقًا

      await game.save();

      await producer.send({
        topic: "game_updates",
        messages: [{ value: JSON.stringify({ gameId, board: game.board }) }],
      });

      return game.populate("playerX playerO spectators");
    },
  },
};

module.exports = resolvers;
