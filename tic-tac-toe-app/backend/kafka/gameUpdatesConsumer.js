import mongoose from "mongoose";
import { Kafka } from "kafkajs";

const logSchema = new mongoose.Schema({
  type: String,
  data: Object,
  createdAt: { type: Date, default: Date.now },
});

const Log = mongoose.models.Log || mongoose.model("Log", logSchema);

const kafka = new Kafka({
  clientId: "game-updates-consumer",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "game-updates-group" });

const run = async () => {
  await mongoose.connect("mongodb://localhost:27017/tictactoe");
  console.log("✅ Connected to MongoDB");

  await consumer.connect();
  console.log("✅ gameUpdatesConsumer connected!");

  await consumer.subscribe({ topic: "game_updates", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const data = JSON.parse(message.value.toString());
      console.log("⚡️ [game_updates] Game updated:", data);

      await Log.create({
        type: "game_updates",
        data,
      });

      console.log("✅ Game update saved to logs collection");
    },
  });
};

run();
