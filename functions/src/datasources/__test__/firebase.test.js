/**
 * @jest-environment node
 */
const firebase = require('@firebase/testing');
const FirebaseAPI = require('../firebase');
const {
  mockFirebaseAdmin,
  fakeTagData,
  fakeDetailFromTagData,
  fakeDataId,
  addFakeDatatoFirestore,
  clearFirestoreDatabase,
} = require('./testUtils');

// start the firestore emulator
// port 8080
const testProjectId = 'smartcampus-test';

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
  beforeEach(async () => {
    await clearFirestoreDatabase(testProjectId);
  });
  test('test `addTagDataToFirestore`', async () => {
    const tagData = { ...fakeTagData };

    const data = await firebaseAPIinstance.addTagDataToFirestore({ tagData });

    // console.log(data);
    expect(data).toMatchObject({
      id: expect.any(String),
      locationName: tagData.locationName,
      accessibility: tagData.accessibility,
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
      description: detailFromTagData.description,
      streetViewInfo: detailFromTagData.streetViewInfo,
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
      description: '',
      streetViewInfo: detailFromTagData.streetViewInfo,
    });
  });
  test('test `addNewTagData`', async () => {
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

    const responseData = await firebaseAPIinstance.addNewTagData({ data });

    expect(responseData.tag).toMatchObject({
      id: expect.any(String),
      locationName: data.locationName,
      accessibility: data.accessibility,
      category: data.category,
      coordinates: expect.any(firebase.firestore.GeoPoint),
    });
    expect(responseData.imageNumber).toEqual(responseData.imageNumber);
    expect(responseData.imageUploadUrl.length).toEqual(
      responseData.imageNumber
    );
    expect(responseData.imageUploadUrl).toContain('http://signed.url');

    // check detail collection data
    const detailDocData = (
      await firestore.collection('tagDetail').doc(responseData.tag.id).get()
    ).data();
    // console.log(detailDoc);
    expect(detailDocData).toMatchObject({
      createTime: expect.any(firebase.firestore.Timestamp),
      lastUpdateTime: expect.any(firebase.firestore.Timestamp),
      description: fakeDetailFromTagData.description,
      streetViewInfo: fakeDetailFromTagData.streetViewInfo,
    });
  });
}); // end describe

describe('test data read operation', () => {
  let firebaseAPIinstance;
  let firestore;
  beforeAll(async () => {
    const admin = mockFirebaseAdmin(testProjectId);
    firebaseAPIinstance = new FirebaseAPI({ admin });
    firestore = admin.firestore();
  });
  afterAll(async () => {
    await Promise.all(firebase.apps().map(app => app.delete()));
  });
  beforeEach(async () => {
    await clearFirestoreDatabase(testProjectId);

    // add data
    await addFakeDatatoFirestore(firestore);
  });

  test('test `getTagList`', async () => {
    const tagDataList = await firebaseAPIinstance.getTagList();
    // console.log(tagDataList);
    expect(tagDataList).toEqual(expect.any(Array));

    // if use `toEqual`, the f field must included in the test object
    expect(tagDataList[0]).toMatchObject({
      id: fakeDataId,
      locationName: fakeTagData.locationName,
      accessibility: fakeTagData.accessibility,
      category: {
        missionName: expect.any(String),
        subTypeName: expect.any(String),
        targetName: expect.any(String),
      },
      coordinates: expect.any(firebase.firestore.GeoPoint),
    });
  });
});
