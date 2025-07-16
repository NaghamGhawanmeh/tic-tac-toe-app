import express from "express";
import mongoose from "mongoose";
import { ApolloServer } from "apollo-server-express";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";
import typeDefs from "./graphql/schema.js";
import resolvers from "./graphql/resolvers.js";
import { producer } from "./kafka/kafkaClient.js";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";
import "./kafka/userStatusConsumer.js";
import "./kafka/gameRequestsConsumer.js";
import "./kafka/gameUpdatesConsumer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.argv[1] !== __filename) {
  console.log(
    "Skipping API server startup because this file was imported elsewhere"
  );
  process.exit();
}

const startServer = async () => {
  const app = express();
  app.use(cors());

  await mongoose.connect("mongodb://localhost:27017/tictactoe");
  await producer.connect();

  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const httpServer = createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  useServer({ schema }, wsServer);

  const server = new ApolloServer({
    schema,
  });

  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  httpServer.listen(4000, () => {
    console.log(
      `🚀 Server ready at http://localhost:4000${server.graphqlPath}`
    );
    console.log(
      `🚀 Subscriptions ready at ws://localhost:4000${server.graphqlPath}`
    );
  });
};

startServer();
