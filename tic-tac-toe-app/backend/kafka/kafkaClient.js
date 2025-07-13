import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "tic-tac-toe-app",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "game-group" });

export { kafka, producer, consumer };
