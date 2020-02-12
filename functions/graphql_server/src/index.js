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
    context: async ({ req }) => {
      const me = await dataSources().firestoreAPI.getToken(req);
      return {
        me,
      };
    },
    introspection: true, // enables introspection of the schema
    playground: true, // enables the actual playground
  });

  server.applyMiddleware({ app, path: '/graphql' });
  return app;
}

module.exports = apolloServer;
