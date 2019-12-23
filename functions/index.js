// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');

admin.initializeApp();

const apolloServer = require('./graphql_server/src');

console.log('hello');
exports.graphql = functions.https.onRequest(apolloServer({ admin }));
