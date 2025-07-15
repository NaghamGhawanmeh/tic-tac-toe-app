import mongoose from "mongoose";
import { Kafka } from "kafkajs";
import User from "../models/User.js";
//  Schema
const logSchema = new mongoose.Schema({
  type: String,
  data: Object,
  createdAt: { type: Date, default: Date.now },
});

const Log = mongoose.models.Log || mongoose.model("Log", logSchema);

//  Kafka
const kafka = new Kafka({
  clientId: "user-status-consumer",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "user-status-group" });

const run = async () => {
  await mongoose.connect("mongodb://localhost:27017/tictactoe");
  console.log("Connected to MongoDB");

  await consumer.connect();
  console.log(" userStatusConsumer connected!");

  await consumer.subscribe({ topic: "user_status", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const data = JSON.parse(message.value.toString());
      console.log(" [user_status] New status update:", data);
      await User.findByIdAndUpdate(data.userId, { status: data.status });

      await Log.create({
        type: "user_status",
        data,
      });

      console.log(" Event saved to logs collection");
    },
  });
};

run();
