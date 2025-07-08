// kafka/kafkaClient.js
const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "tic-tac-toe-app",
  brokers: ["localhost:9092"], // غيرها حسب الإعدادات
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "game-group" });

module.exports = { kafka, producer, consumer };
