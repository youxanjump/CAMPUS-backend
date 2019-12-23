// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');

admin.initializeApp();

const apolloServer = require('./src');

// Start our server if we're not in a test env.
// if we're in a test env, we'll manually start it in a test
if (process.env.NODE_ENV !== 'test') {
  apolloServer
    .listen({ port: 4001 })
    .then(({ url }) => console.log(`app running at ${url}`));
}