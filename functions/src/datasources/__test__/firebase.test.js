/**
 * @jest-environment node
 */
const firebase = require('@firebase/testing');
const FirebaseAPI = require('../firebase');
const {
  mockFirebaseAdmin,
  fakeTagData,
  fakeDetailFromTagData,
} = require('./mockFirebaseAdmin');

// start the firestore emulator
// port 8080
const testProjectId = 'smartcampus-1b31f-test';

describe('test data add operation', () => {
  let firebaseAPIinstance;
  let firestore;
  beforeAll(() => {
    const admin = mockFirebaseAdmin(testProjectId);
    firebaseAPIinstance = new FirebaseAPI({ admin });
    firestore = admin.firestore();
  });
  afterAll(async () => {
    await Promise.all(firebase.apps().map(app => app.delete()));
  });
  test('test `addTagDataToFirestore`', async () => {
    const tagData = { ...fakeTagData };

    const data = await firebaseAPIinstance.addTagDataToFirestore({ tagData });

    // console.log(data);
    expect(data).toMatchObject({
      id: expect.any(String),
      accessibility: tagData.accessibility,
      missionID: tagData.missionID,
      discoveryIDs: tagData.discoveryIDs,
      coordinates: tagData.coordinates,
    });
  });
  test('test `setTagDetailToFirestore` with description', async () => {
    const tagID = 'test-tag-id';
    const detailFromTagData = { ...fakeDetailFromTagData };

    await firebaseAPIinstance.setTagDetailToFirestore({
      tagID,
      detailFromTagData,
    });

    // get data from firestore
    const detailDataSnap = await firestore
      .collection('tagDetail')
      .doc(tagID)
      .get();

    const detailData = detailDataSnap.data();

    expect(detailData).toMatchObject({
      createTime: expect.any(firebase.firestore.Timestamp),
      lastUpdateTime: expect.any(firebase.firestore.Timestamp),
      createUserID: expect.any(String),
      location: {
        geoInfo: {
          type: 'Point',
          coordinates: detailFromTagData.coordinates,
        },
      },
      description: detailFromTagData.description,
    });
  });
  test('test `setTagDetailToFirestore` with no description', async () => {
    const tagID = 'test-tag-id-no-description';
    const detailFromTagData = { ...fakeDetailFromTagData };
    delete detailFromTagData.description;

    await firebaseAPIinstance.setTagDetailToFirestore({
      tagID,
      detailFromTagData,
    });

    // get data from firestore
    const detailDataSnap = await firestore
      .collection('tagDetail')
      .doc(tagID)
      .get();

    const detailData = detailDataSnap.data();

    // console.log(data);
    expect(detailData).toMatchObject({
      createTime: expect.any(firebase.firestore.Timestamp),
      lastUpdateTime: expect.any(firebase.firestore.Timestamp),
      location: {
        geoInfo: {
          type: 'Point',
          coordinates: detailFromTagData.coordinates,
        },
      },
      description: '',
    });
  });
  test('test `addNewTagData`', async () => {
    const data = {
      title: 'test',
      accessibility: 5,
      missionID: 'mission-test',
      discoveryIDs: ['discovery-test'],
      coordinates: {
        latitude: 1.0,
        longitude: 1.0,
      },
      description: 'description-test',
      imageNumber: 2,
    };

    const responseData = await firebaseAPIinstance.addNewTagData({ data });

    expect(responseData.tag).toMatchObject({
      id: expect.any(String),
      accessibility: data.accessibility,
      missionID: data.missionID,
      discoveryIDs: data.discoveryIDs,
      coordinates: data.coordinates,
    });
    expect(responseData.imageNumber).toEqual(responseData.imageNumber);
    expect(responseData.imageUploadUrl.length).toEqual(
      responseData.imageNumber
    );
    expect(responseData.imageUploadUrl).toContain('http://signed.url');
  });
}); // end describe

/*
describe.skip('test data read operation', () => {
  let firebaseAPIinstance;
  let firestore;
  beforeAll(() => {
    const admin = mockFirebaseAdmin(testProjectId);
    firebaseAPIinstance = new FirebaseAPI({ admin });
    firestore = admin.firestore();

    // add data
    // await firestore.collection()
  });
  afterAll(async () => {
    await Promise.all(firebase.apps().map(app => app.delete()));
  });

  test.skip('test if it can read variable in beforeEach', async () => {
    // const a = await firebaseAPIinstance.getTagList();
    // console.log(a);
  });
}); */
