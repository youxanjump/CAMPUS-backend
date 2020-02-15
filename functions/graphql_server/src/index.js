/** @module src/index */
const express = require('express');
const { ApolloServer } = require('apollo-server-express');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const FirebaseAPI = require('./datasources/firebase');

/**
 * Apollo server instance
 * @param {object} {admin} firebase admin SDK
 * @returns {Express} express server instance running apollo graphql server 
 */
function apolloServer({ admin }) {
  // init express
  const app = express();

  const dataSources = () => ({
    firebaseAPI: new FirebaseAPI({ admin }),
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
      const me = await dataSources().firebaseAPI.getToken(req);
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
