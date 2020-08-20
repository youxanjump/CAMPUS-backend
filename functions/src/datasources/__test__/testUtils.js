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
  latitude: 24.7872616,
  longitude: 120.9969249,
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
};

// the fake data will input from front end
const fakeDetailFromTagData = {
  description: 'test-description',
  // [longitude, latitude]
  coordinates: ['120.99745541810988', '24.786671229129603'],
  streetViewInfo: { ...fakeStreetViewData },
};

const fakeStatusData = {
  statusName: '存在',
  createTime: firebase.firestore.FieldValue.serverTimestamp(),
};

/**
 * Mock firebase admin instance
 * @param {String} projectId The projectId to initiate firebase admin
 * @returns {FirebaseError.app.App} the mock and initiate firebase app instance
 */
function mockFirebaseAdmin(projectId) {
  const admin = firebase.initializeAdminApp({ projectId });
  // mock auth
  // TODO: convert this block to a function
  admin.auth = jest.fn();
  const mockBucket = jest.fn(() => {
    return {
      file: jest.fn(_ => {
        return {
          getSignedUrl: jest.fn(__ => {
            return ['http://signed.url'];
          }),
        };
      }),
      getFiles: jest.fn(options => {
        const { directory } = options;
        return [
          [
            {
              metadata: { mediaLink: `http://${directory}.medialink` },
            },
          ],
        ];
      }),
    };
  });
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
 * @return {AddNewTagResponse} Contain the upload tag information, and image
 */
async function addFakeDatatoFirestore(firebaseAPIinstance) {
  const data = {
    ...fakeTagData,
    coordinates: {
      latitude: fakeDetailFromTagData.coordinates[1],
      longitude: fakeDetailFromTagData.coordinates[0],
    },
    description: fakeDetailFromTagData.description,
    streetViewInfo: fakeDetailFromTagData.streetViewInfo,
    imageNumber: 2,
  };

  return firebaseAPIinstance.addNewTagData({ data });
}

/**
 * clear database
 * ref: https://firebase.google.com/docs/emulator-suite/connect_firestore#clear_your_database_between_tests
 * @param {String} databaseID the id of the firestore emulator
 */
async function clearFirestoreDatabase(databaseID) {
  const clearURL = `http://localhost:8080/emulator/v1/projects/${databaseID}/databases/(default)/documents`;
  await axios.delete(clearURL);
  // console.log('clear response:', res.status);
}

exports.mockFirebaseAdmin = mockFirebaseAdmin;
exports.addFakeDatatoFirestore = addFakeDatatoFirestore;
exports.fakeTagData = fakeTagData;
exports.fakeDetailFromTagData = fakeDetailFromTagData;
exports.fakeDataId = fakeDataId;
exports.fakeCategory = fakeCategory;
exports.fakeStatusData = fakeStatusData;
exports.clearFirestoreDatabase = clearFirestoreDatabase;
