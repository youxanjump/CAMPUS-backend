const express = require('express');
const { ApolloServer } = require('apollo-server-express');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const FirestoreAPI = require('./datasources/firestore');



function apolloServer({ admin }) {
  // init express
  const app = express();

  const dataSources = () => ({
    firestoreAPI: new FirestoreAPI({ admin }),
  });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources,
    formatError: error => {
      console.log('error');
      console.log(error);
      return error;
    },
    introspection: true, // enables introspection of the schema
    playground: true, // enables the actual playground
  });

  server.applyMiddleware({ app, path: '/' });
  return app;
}

module.exports = apolloServer;
