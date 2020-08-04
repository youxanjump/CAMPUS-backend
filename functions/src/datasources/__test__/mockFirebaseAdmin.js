const firebase = require('@firebase/testing');
const { GeoFirestore } = require('geofirestore');

const fakeDataId = 'test-fakedata-id';

const fakeCategory = {
  missionName: '設施任務',
  subTypeName: '無障礙設施',
  targetName: '無障礙坡道',
};

const fakeTagData = {
  title: 'test',
  accessibility: 5,
  category: { ...fakeCategory },
  coordinates: new firebase.firestore.GeoPoint(
    24.786671229129603,
    120.99745541810988
  ),
};

const fakeDetailFromTagData = {
  description: 'test-description',
  // [longitude, latitude]
  coordinates: ['120.99745541810988', '24.786671229129603'],
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
 * @param {Firestore} firestore Firestore instance to add fake data
 */
async function addFakeDatatoFirestore(firestore) {
  await firestore.collection('missionList').doc('mission-test').set({
    name: '無障礙設施',
  });
  await firestore.collection('discoveryList').doc('discovery-test').set({
    missionID: 'mission-test',
    name: '障礙物',
  });

  const geofirestore = new GeoFirestore(firestore);
  await geofirestore.collection('tagData').doc(fakeDataId).set(fakeTagData);

  const fakeTagDetailData = {
    createTime: firebase.firestore.FieldValue.serverTimestamp(),
    lastUpdateTime: firebase.firestore.FieldValue.serverTimestamp(),
    createUserID: 'test',
    location: {
      geoInfo: {
        type: 'Point',
        coordinates: fakeDetailFromTagData.coordinates,
      },
    },
    description: fakeDetailFromTagData.description || '',
  };
  await firestore
    .collection('tagDetail')
    .doc(fakeDataId)
    .set(fakeTagDetailData);
}

exports.mockFirebaseAdmin = mockFirebaseAdmin;
exports.addFakeDatatoFirestore = addFakeDatatoFirestore;
exports.fakeTagData = fakeTagData;
exports.fakeDetailFromTagData = fakeDetailFromTagData;
exports.fakeDataId = fakeDataId;
exports.fakeCategory = fakeCategory;
