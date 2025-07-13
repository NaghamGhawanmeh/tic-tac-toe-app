import { gql } from "apollo-server-express";

const typeDefs = gql`
  type User {
    id: ID!
    userName: String!
    email: String!
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
    winner: User
    spectators: [User!]!
  }

  type Query {
    getAllPlayers: [User!]!
    getGame(id: ID!): Game
    getPendingRequests(userId: ID!): [Game!]!
    getUserByUsername(userName: String!): User
    getMyGames(userId: ID!): [Game!]!
    getActiveGames: [Game!]! # 👈 أضف هذا
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Mutation {
    signup(userName: String!, email: String!, password: String!): User
    login(email: String!, password: String!): AuthPayload
    updateUserStatus(userId: ID!, status: String!): User!
    sendGameRequest(fromId: ID!, toId: ID!): Boolean!
    acceptGameRequest(gameId: ID!): Game!
    rejectGameRequest(gameId: ID!): Boolean!
    makeMove(gameId: ID!, x: Int!, y: Int!): Game!
  }

  type Subscription {
    userStatusChanged: User!
    gameRequestReceived(userId: ID!): Game!
    gameUpdated(gameId: ID!): Game!
  }
`;

export default typeDefs;
