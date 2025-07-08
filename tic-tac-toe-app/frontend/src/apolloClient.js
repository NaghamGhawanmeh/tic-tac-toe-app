import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "http://localhost:4000/graphql", // رابط الـ backend
  cache: new InMemoryCache(),
});

export default client;
