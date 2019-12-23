// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');

admin.initializeApp();

const apolloServer = require('./src');

console.log('hello');

apolloServer({ admin }).listen({ port: 80 }, () => {
  console.log('Apollo Server start');
});