/** @module src/index */
const { ApolloServer } = require('apollo-server-express');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const FirebaseAPI = require('./datasources/firebase');

/**
 * Apollo server instance
 * @param {object} {admin} firebase admin SDK
 * @returns {ApolloServer} ApolloServer with config
 */
function apolloServer({ admin }) {
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
      const userInfo = await dataSources().firebaseAPI.getUserInfoFromToken(
        req
      );
      return {
        userInfo,
      };
    },
    introspection: true, // enables introspection of the schema
    playground: true, // enables the actual playground
  });

  // server.applyMiddleware({ app, path: '/' });
  return server;
}

module.exports = apolloServer;
