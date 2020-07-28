const firebase = require('@firebase/testing');
const FirebaseAPI = require('../firebase');

// start the firestore emulator
// port 4400
const projectId = 'smartcampus-1b31f-test';

describe('test `firebase.js` firestore data operation', () => {
  let firebaseAPIinstance;
  beforeEach(() => {
    const admin = firebase.initializeAdminApp({ projectId });
    admin.auth = jest.fn();
    admin.storage = jest.fn(() => ({ bucket: jest.fn() }));
    firebaseAPIinstance = new FirebaseAPI({ admin });
  });
  afterAll(async () => {
    await Promise.all(firebase.apps().map(app => app.delete()));
  });
  test('test if it can read variable in beforeEach', () => {
    firebaseAPIinstance.getTagList();
  });
});
