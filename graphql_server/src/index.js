const { ApolloServer } = require('apollo-server');
const admin = require('firebase-admin');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const FirestoreAPI = require('./datasources/firestore');

const firestoreURL = 'https://smartcampus-1b31f.firebaseio.com';

// initialize firebase only once
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: firestoreURL,
});


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
  formatResponse: response => {
    //console.log('response');
    //console.log(response);
    return response;
  },
});

// Start our server if we're not in a test env.
// if we're in a test env, we'll manually start it in a test
if (process.env.NODE_ENV !== 'test') {
  server
    .listen({ port: 4001 })
    .then(({ url }) => console.log(`🎉 app running at ${url}`));
}

// export all the important pieces for tests to use
module.exports = {
  server,
  typeDefs,
  resolvers,
  dataSources,
};
