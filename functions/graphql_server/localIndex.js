// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const apolloServer = require('./src');

// Start our server if we're not in a test env.
// if we're in a test env, we'll manually start it in a test
if (process.env.NODE_ENV !== 'test') {
  apolloServer({ admin })
    .listen({ port: 4001 }, () =>
      console.log('app running at port 4001')
    );
}
