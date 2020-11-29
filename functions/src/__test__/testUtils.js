const firebase = require('@firebase/testing');
const axios = require('axios').default;

const fakeDataId = 'test-fakedata-id';

const fakeCategory = {
  missionName: '設施任務',
  subTypeName: '無障礙設施',
  targetName: '無障礙坡道',
};

const fakeStreetViewData = {
  povHeading: 52.16330308370064,
  povPitch: -14.148336578552815,
  panoID: '0pq7qRZQvlQ8rzUrnZLk2g',
  cameraLatitude: 24.7872616,
  cameraLongitude: 120.9969249,
};

// the fake data will input from front end
const fakeTagData = {
  locationName: 'test',
  accessibility: 5,
  category: { ...fakeCategory },
  coordinates: new firebase.firestore.GeoPoint(
    24.786671229129603,
    120.99745541810988
  ),
  coordinatesString: {
    longitude: '120.99745541810988',
    latitude: '24.786671229129603',
  },
  description: 'test-description',
  // [longitude, latitude]
  streetViewInfo: { ...fakeStreetViewData },
};

const fakeStatusData = {
  statusName: '存在',
  createTime: firebase.firestore.FieldValue.serverTimestamp(),
};

const fakeUserInfo = {
  logIn: true,
  uid: 'test-uid',
  email: 'test-uid@test.com',
  displayName: 'test-display-name',
};
const fakeIntent = {
  userintent: '肚子餓',
  useranswer: '吃東西',
};

/**
 * Mock firebase admin instance
 * @param {String} projectId The projectId to initiate firebase admin
 * @returns {FirebaseError.app.App} the mock and initiate firebase app instance
 */
function mockFirebaseAdmin(projectId) {
  const admin = firebase.initializeAdminApp({ projectId });
  // mock auth
  const mockAuthVerifyIdToken = jest.fn(_token => ({
    uid: fakeUserInfo.uid,
    email: fakeUserInfo.email,
  }));
  const mockAuthGetUser = jest.fn(_uid => ({
    displayName: fakeUserInfo.displayName,
    email: fakeUserInfo.email,
  }));
  admin.auth = jest.fn(() => ({
    verifyIdToken: mockAuthVerifyIdToken,
    getUser: mockAuthGetUser,
  }));

  // mock storage
  const mockBuckeFile = jest.fn(_ => ({
    getSignedUrl: jest.fn(__ => {
      return ['http://signed.url'];
    }),
  }));
  const mockBucketGetFiles = jest.fn(options => {
    const { directory } = options;
    return [
      [
        {
          metadata: { mediaLink: `http://${directory}.medialink` },
        },
      ],
    ];
  });
  const mockBucket = jest.fn(() => ({
    file: mockBuckeFile,
    getFiles: mockBucketGetFiles,
  }));
  admin.storage = jest.fn(() => ({
    bucket: mockBucket,
  }));
  admin.firestore.GeoPoint = firebase.firestore.GeoPoint;
  admin.firestore.FieldValue = firebase.firestore.FieldValue;
  return admin;
}

/**
 * Add fakeData to firestore
 * @param {FirebaseAPI} firestore Firestore instance to add fake data
 * @param {Boolean} testNumberOfUpVote true if we want to add fake data to test
 *   numberOfUpVote
 * @return {AddNewTagResponse} Contain the upload tag information, and image
 */
async function addFakeDataToFirestore(
  firebaseAPIinstance,
  testNumberOfUpVote = false
) {
  const hasNumberOfUpVoteCategory = {
    missionName: '問題任務',
    subTypeName: '',
    targetName: '',
  };
  const data = {
    ...fakeTagData,
    imageNumber: 2,
  };
  if (testNumberOfUpVote) {
    data.category = { ...hasNumberOfUpVoteCategory };
  }

  return firebaseAPIinstance.addNewTagData({ data, userInfo: fakeUserInfo });
}

/**
 * clear database
 * ref: https://firebase.google.com/docs/emulator-suite/connect_firestore#clear_your_database_between_tests
 * or use `clearFirestoreData({ projectId: string }) => Promise`
 * ref: https://firebase.google.com/docs/rules/unit-tests#test_sdk_methods
 * @param {String} databaseID the id of the firestore emulator
 */
async function clearFirestoreDatabase(databaseID) {
  const clearURL = `http://localhost:8080/emulator/v1/projects/${databaseID}/databases/(default)/documents`;
  await axios.delete(clearURL);
  // console.log('clear response:', res.status);
}

exports.mockFirebaseAdmin = mockFirebaseAdmin;
exports.addFakeDataToFirestore = addFakeDataToFirestore;
exports.fakeTagData = fakeTagData;
exports.fakeDataId = fakeDataId;
exports.fakeCategory = fakeCategory;
exports.fakeStatusData = fakeStatusData;
exports.fakeUserInfo = fakeUserInfo;
exports.fakeIntent = fakeIntent;
exports.clearFirestoreDatabase = clearFirestoreDatabase;
