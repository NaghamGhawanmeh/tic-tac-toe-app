import mongoose from "mongoose";
import { Kafka } from "kafkajs";

const logSchema = new mongoose.Schema({
  type: String,
  data: Object,
  createdAt: { type: Date, default: Date.now },
});

const Log = mongoose.models.Log || mongoose.model("Log", logSchema);

const kafka = new Kafka({
  clientId: "game-requests-consumer",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "game-requests-group" });

const run = async () => {
  await mongoose.connect("mongodb://localhost:27017/tictactoe");
  console.log("✅ Connected to MongoDB");

  await consumer.connect();
  console.log("✅ gameRequestsConsumer connected!");

  await consumer.subscribe({ topic: "game_requests", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const data = JSON.parse(message.value.toString());
      console.log("🎮 [game_requests] New game request:", data);

      await Log.create({
        type: "game_requests",
        data,
      });

      console.log("✅ Game request saved to logs collection");
    },
  });
};

run();
