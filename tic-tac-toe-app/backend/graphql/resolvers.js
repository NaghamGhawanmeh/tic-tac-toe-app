const User = require("../models/User");
const Game = require("../models/Game");
const { producer } = require("../kafka/kafkaClient");
const checkWinner = (board) => {
  const lines = [
    [
      [0, 0],
      [0, 1],
      [0, 2],
    ],
    [
      [1, 0],
      [1, 1],
      [1, 2],
    ],
    [
      [2, 0],
      [2, 1],
      [2, 2],
    ],
    [
      [0, 0],
      [1, 0],
      [2, 0],
    ],
    [
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [0, 2],
      [1, 2],
      [2, 2],
    ],
    [
      [0, 0],
      [1, 1],
      [2, 2],
    ],
    [
      [0, 2],
      [1, 1],
      [2, 0],
    ],
  ];

  for (const line of lines) {
    const [a, b, c] = line;
    if (
      board[a[0]][a[1]] &&
      board[a[0]][a[1]] === board[b[0]][b[1]] &&
      board[a[0]][a[1]] === board[c[0]][c[1]]
    ) {
      return board[a[0]][a[1]]; // "X" أو "O"
    }
  }

  return null;
};

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

      // تحقق من الفائز
      const winner = checkWinner(game.board);

      if (winner) {
        game.status = "finished";
        game.winner = winner;
      } else {
        // تحقق من التعادل
        const isDraw = game.board.flat().every((cell) => cell !== "");
        if (isDraw) {
          game.status = "draw";
        } else {
          // إذا لا يوجد فائز ولا تعادل، تابع اللعب
          game.currentTurn = currentSymbol === "X" ? "O" : "X";
        }
      }

      await game.save();

      await producer.send({
        topic: "game_updates",
        messages: [
          {
            value: JSON.stringify({
              gameId,
              board: game.board,
              status: game.status,
              winner: game.winner,
            }),
          },
        ],
      });

      return game.populate("playerX playerO spectators");
    },
  },
};

module.exports = resolvers;
