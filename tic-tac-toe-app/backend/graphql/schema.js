const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    status: String!
    score: Int!
  }

  type Game {
    id: ID!
    playerX: User!
    playerO: User!
    board: [[String!]!]!
    currentTurn: String!
    status: String!
    winner: String
    spectators: [User!]!
  }

  type Query {
    getAllPlayers: [User!]!
    getGame(id: ID!): Game
    getPendingRequests(userId: ID!): [Game!]!
    getUserByUsername(username: String!): User
    getMyGames(userId: ID!): [Game!]!
  }

  type Mutation {
    registerUser(username: String!): User!
    updateUserStatus(userId: ID!, status: String!): User!
    sendGameRequest(fromId: ID!, toId: ID!): Boolean!
    acceptGameRequest(gameId: ID!): Game!
    rejectGameRequest(gameId: ID!): Boolean!
    makeMove(gameId: ID!, x: Int!, y: Int!): Game!
  }
`;

module.exports = typeDefs;
