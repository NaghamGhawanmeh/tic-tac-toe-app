// index.js
const express = require("express");
const mongoose = require("mongoose");
const { ApolloServer } = require("apollo-server-express");
const typeDefs = require("./graphql/schema");
const resolvers = require("./graphql/resolvers");
const { producer } = require("./kafka/kafkaClient");

const startServer = async () => {
  const app = express();

  // اتصال MongoDB
  await mongoose.connect("mongodb://localhost:27017/tictactoe");

  // Kafka Producer
  await producer.connect();

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () => {
    console.log(
      `🚀 Server ready at http://localhost:4000${server.graphqlPath}`
    );
  });
};

startServer();
