// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');

const { express: voyagerMiddleware } = require('graphql-voyager/middleware');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: 'smartcampus-1b31f.appspot.com',
});

const apolloServer = require('./src');

// Start our server if we're not in a test env.
// if we're in a test env, we'll manually start it in a test
if (process.env.NODE_ENV !== 'test') {
  apolloServer({ admin })
    .use('/voyager', voyagerMiddleware({ endpointUrl: '/graphql' }))
    .listen({ port: 4001 }, () => console.log('app running at port 4001'));
}
