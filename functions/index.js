// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');

admin.initializeApp();

const { express: voyagerMiddleware } = require('graphql-voyager/middleware');
const apolloServer = require('./graphql_server/src');

console.log('hello');

const app = apolloServer({ admin });

// vaoyager will ues `endpointUrl` to get schema
// make sure its path is where the scehema locate
// use in local emulator
// app.use('/voyager', voyagerMiddleware({ endpointUrl: '/smartcampus-1b31f/us-central1/graphql/graphql' }));

// use in production
app.use('/voyager', voyagerMiddleware({ endpointUrl: '/graphql/graphql' }));

exports.graphql = functions.https.onRequest(app);
