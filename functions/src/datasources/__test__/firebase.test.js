/**
 * @jest-environment node
 */
const firebase = require('@firebase/testing');
const FirebaseAPI = require('../firebase');
const {
  mockFirebaseAdmin,
  fakeTagData,
  fakeDetailFromTagData,
  fakeStatusData,
  fakeIntent,
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
    const data = { ...fakeTagData };

    const docData = await firebaseAPIinstance.addTagDataToFirestore({ data });

    // console.log(data);
    expect(docData).toMatchObject({
      id: expect.any(String),
      locationName: data.locationName,
      accessibility: data.accessibility,
      coordinates: data.coordinates,
      category: data.category,
      status: {
        statusName: fakeStatusData.statusName,
        createTime: expect.any(firebase.firestore.Timestamp),
      },
      statusHistory: [
        {
          statusName: fakeStatusData.statusName,
          createTime: expect.any(firebase.firestore.Timestamp),
        },
      ],
    });
  });
  test('test `addNewIntent`', async () => {
    const data = { ...fakeIntent };

    const docData = await firebaseAPIinstance.addNewIntent({ data });
    expect(docData).toMatchObject({
      userintent: data.userintent,
      useranswer: data.useranswer,
    });
  });
  test('test `setTagDetailToFirestore` with description', async () => {
    const tagID = 'test-tag-id';
    const data = { ...fakeDetailFromTagData };

    await firebaseAPIinstance.setTagDetailToFirestore({
      tagID,
      data,
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
      description: data.description,
      streetViewInfo: data.streetViewInfo,
    });
  });
  test('test `setTagDetailToFirestore` with no description', async () => {
    const tagID = 'test-tag-id-no-description';
    const data = { ...fakeDetailFromTagData };
    delete data.description;

    await firebaseAPIinstance.setTagDetailToFirestore({
      tagID,
      data,
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
      streetViewInfo: data.streetViewInfo,
    });
  });
  test('test `addNewTagData`', async () => {
    const responseData = await addFakeDatatoFirestore(firebaseAPIinstance);

    expect(responseData.tag).toMatchObject({
      id: expect.any(String),
      locationName: fakeTagData.locationName,
      accessibility: fakeTagData.accessibility,
      category: fakeTagData.category,
      coordinates: expect.any(firebase.firestore.GeoPoint),
      status: {
        statusName: fakeStatusData.statusName,
        createTime: expect.any(firebase.firestore.Timestamp),
      },
      statusHistory: [
        {
          statusName: fakeStatusData.statusName,
          createTime: expect.any(firebase.firestore.Timestamp),
        },
      ],
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
  beforeAll(async () => {
    const admin = mockFirebaseAdmin(testProjectId);
    firebaseAPIinstance = new FirebaseAPI({ admin });
  });
  afterAll(async () => {
    await Promise.all(firebase.apps().map(app => app.delete()));
  });
  beforeEach(async () => {
    await clearFirestoreDatabase(testProjectId);

    // add data
    await addFakeDatatoFirestore(firebaseAPIinstance);
  });

  test('test `getTagList`', async () => {
    const tagDataList = await firebaseAPIinstance.getTagList();
    // console.log(tagDataList);
    expect(tagDataList).toEqual(expect.any(Array));

    // if use `toEqual`, the f field must included in the test object
    expect(tagDataList[0]).toMatchObject({
      id: expect.any(String),
      locationName: fakeTagData.locationName,
      accessibility: fakeTagData.accessibility,
      category: {
        missionName: expect.any(String),
        subTypeName: expect.any(String),
        targetName: expect.any(String),
      },
      coordinates: expect.any(firebase.firestore.GeoPoint),
      status: {
        statusName: fakeStatusData.statusName,
        createTime: expect.any(firebase.firestore.Timestamp),
      },
    });
  });
});
