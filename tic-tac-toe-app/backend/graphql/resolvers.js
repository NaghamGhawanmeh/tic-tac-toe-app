import { PubSub } from "graphql-subscriptions";
import User from "../models/User.js";
import Game from "../models/Game.js";
import { producer } from "../kafka/kafkaClient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const JWT_SECRET = "supersecret_key";

const pubsub = new PubSub();
const GAME_REQUEST_RECEIVED = "GAME_REQUEST_RECEIVED";
const GAME_UPDATED = "GAME_UPDATED";

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
      return board[a[0]][a[1]];
    }
  }
  return null;
};

const resolvers = {
  Query: {
    getAllPlayers: async () => await User.find(),
    getGame: async (_, { id }) =>
      await Game.findById(id).populate("playerX playerO spectators winner"),
    getPendingRequests: async (_, { userId }) => {
      return await Game.find({
        status: "pending",
        playerO: userId,
      }).populate("playerX playerO spectators");
    },
    getUserByUsername: async (_, { userName }) =>
      await User.findOne({ userName }),
    getMyGames: async (_, { userId }) => {
      return await Game.find({
        $or: [{ playerX: userId }, { playerO: userId }],
      }).populate("playerX playerO spectators winner");
    },
    getActiveGames: async () => {
      return await Game.find({ status: "in_progress" }).populate(
        "playerX playerO spectators winner"
      );
    },
  },

  Mutation: {
    signup: async (_, { email, password, userName }) => {
      const exist = await User.findOne({ email });
      if (exist) throw new Error("Email already in use");
      const hashed = await bcrypt.hash(password, 10);
      const user = new User({
        userName,
        email,
        password: hashed,
        score: 0,
        status: "offline",
      });

      await user.save();
      return user;
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("Invalid credentials");
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) throw new Error("Invalid credentials");
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: "60m",
      });
      user.status = "online";
      await user.save();

      await producer.send({
        topic: "user_status",
        messages: [
          { value: JSON.stringify({ userId: user._id, status: "online" }) },
        ],
      });

      return { token, user };
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

      await pubsub.publish("USER_STATUS_CHANGED", {
        userStatusChanged: user,
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

      await pubsub.publish(GAME_REQUEST_RECEIVED, {
        gameRequestReceived: await Game.findById(game.id).populate(
          "playerX playerO spectators"
        ),
      });

      return true;
    },

    acceptGameRequest: async (_, { gameId }) => {
      const game = await Game.findById(gameId);
      if (!game) throw new Error("Game not found");

      game.status = "in_progress";

      // ✅ تحديث حالة اللاعبين
      await User.findByIdAndUpdate(game.playerX, { status: "playing" });
      await User.findByIdAndUpdate(game.playerO, { status: "playing" });

      await game.save();

      // ✅ إرسال تحديثات الحالة (Kafka & pubsub)
      await producer.send({
        topic: "user_status",
        messages: [
          {
            value: JSON.stringify({ userId: game.playerX, status: "playing" }),
          },
          {
            value: JSON.stringify({ userId: game.playerO, status: "playing" }),
          },
        ],
      });

      await pubsub.publish("USER_STATUS_CHANGED", {
        userStatusChanged: await User.findById(game.playerX),
      });
      await pubsub.publish("USER_STATUS_CHANGED", {
        userStatusChanged: await User.findById(game.playerO),
      });

      const populatedGame = await Game.findById(gameId).populate(
        "playerX playerO spectators winner"
      );

      await pubsub.publish(GAME_UPDATED, { gameUpdated: populatedGame });

      return populatedGame;
    },

    rejectGameRequest: async (_, { gameId }) => {
      const game = await Game.findById(gameId);
      if (!game) throw new Error("Game not found");

      game.status = "rejected";
      await game.save();

      await producer.send({
        topic: "game_requests",
        messages: [{ value: JSON.stringify({ gameId, rejected: true }) }],
      });

      await pubsub.publish(GAME_UPDATED, {
        gameUpdated: await Game.findById(gameId).populate(
          "playerX playerO spectators winner"
        ),
      });

      return true;
    },

    makeMove: async (_, { gameId, x, y }) => {
      const game = await Game.findById(gameId);
      if (!game) throw new Error("Game not found");

      // ✅ شرط خاص إذا كان تمرير الدور
      if (x === -1 && y === -1) {
        // مرر التيرن فقط، بدون تعديل البورد
        game.currentTurn = game.currentTurn === "X" ? "O" : "X";
        await game.save();

        await producer.send({
          topic: "game_updates",
          messages: [
            {
              value: JSON.stringify({
                gameId,
                board: game.board,
                status: game.status,
              }),
            },
          ],
        });

        const populatedGame = await Game.findById(gameId).populate(
          "playerX playerO spectators winner"
        );

        await pubsub.publish("GAME_UPDATED", { gameUpdated: populatedGame });

        return populatedGame;
      }

      // ✅ باقي منطق الحركة العادية
      if (game.board[x][y] !== "") throw new Error("Cell already occupied");

      const currentSymbol = game.currentTurn;
      game.board[x][y] = currentSymbol;

      const winner = checkWinner(game.board);

      if (winner) {
        game.status = "finished";

        if (winner === "X") {
          game.winner = game.playerX;
          await User.findByIdAndUpdate(game.playerX, {
            $inc: { score: 1 },
            status: "online",
          });
          await User.findByIdAndUpdate(game.playerO, {
            $inc: { score: -1 },
            status: "online",
          });
        } else if (winner === "O") {
          game.winner = game.playerO;
          await User.findByIdAndUpdate(game.playerO, {
            $inc: { score: 1 },
            status: "online",
          });
          await User.findByIdAndUpdate(game.playerX, {
            $inc: { score: -1 },
            status: "online",
          });
        }

        await producer.send({
          topic: "user_status",
          messages: [
            {
              value: JSON.stringify({ userId: game.playerX, status: "online" }),
            },
            {
              value: JSON.stringify({ userId: game.playerO, status: "online" }),
            },
          ],
        });

        await pubsub.publish("USER_STATUS_CHANGED", {
          userStatusChanged: await User.findById(game.playerX),
        });
        await pubsub.publish("USER_STATUS_CHANGED", {
          userStatusChanged: await User.findById(game.playerO),
        });
      } else if (game.board.flat().every((cell) => cell !== "")) {
        game.status = "draw";

        await User.findByIdAndUpdate(game.playerX, { status: "online" });
        await User.findByIdAndUpdate(game.playerO, { status: "online" });

        await producer.send({
          topic: "user_status",
          messages: [
            {
              value: JSON.stringify({ userId: game.playerX, status: "online" }),
            },
            {
              value: JSON.stringify({ userId: game.playerO, status: "online" }),
            },
          ],
        });

        await pubsub.publish("USER_STATUS_CHANGED", {
          userStatusChanged: await User.findById(game.playerX),
        });
        await pubsub.publish("USER_STATUS_CHANGED", {
          userStatusChanged: await User.findById(game.playerO),
        });
      } else {
        game.currentTurn = currentSymbol === "X" ? "O" : "X";
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
            }),
          },
        ],
      });

      const populatedGame = await Game.findById(gameId).populate(
        "playerX playerO spectators winner"
      );

      await pubsub.publish("GAME_UPDATED", { gameUpdated: populatedGame });

      return populatedGame;
    },
  },

  Subscription: {
    gameRequestReceived: {
      subscribe: (_, { userId }) =>
        pubsub.asyncIterableIterator(GAME_REQUEST_RECEIVED),
    },
    gameUpdated: {
      subscribe: (_, { gameId }) => pubsub.asyncIterableIterator(GAME_UPDATED),
    },
    userStatusChanged: {
      subscribe: () => pubsub.asyncIterableIterator("USER_STATUS_CHANGED"),
    },
  },
};

export default resolvers;
