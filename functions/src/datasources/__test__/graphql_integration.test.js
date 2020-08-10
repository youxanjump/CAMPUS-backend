/**
 * @jest-environment node
 */
const firebase = require('@firebase/testing');
const { createTestClient } = require('apollo-server-testing');
const gql = require('graphql-tag');

const apolloServer = require('../../index');
const {
  fakeDataId,
  fakeTagData,
  mockFirebaseAdmin,
  addFakeDatatoFirestore,
  fakeDetailFromTagData,
  clearFirestoreDatabase,
} = require('./testUtils');

const testProjectId = 'smartcampus-1b31f-graphql-test';

describe('test graphql query', () => {
  let queryClient;
  let firestore;
  beforeAll(async () => {
    // set up firebase admin
    const admin = mockFirebaseAdmin(testProjectId);

    // set up apollo server and test client
    const server = apolloServer({ admin });
    const { query } = createTestClient(server);
    queryClient = query;

    // set up fake data to firestore
    firestore = admin.firestore();
    await addFakeDatatoFirestore(firestore);
  });
  afterAll(async () => {
    await Promise.all(firebase.apps().map(app => app.delete()));
  });
  beforeEach(async () => {
    await clearFirestoreDatabase(testProjectId);

    // add data
    await addFakeDatatoFirestore(firestore);
  });

  test('test query tagRenderList', async () => {
    const queryTagRenderList = gql`
      query {
        tagRenderList {
          id
          locationName
          accessibility
          category {
            missionName
            subTypeName
            targetName
          }
          coordinates {
            latitude
            longitude
          }
        }
      }
    `;
    const result = await queryClient({ query: queryTagRenderList });
    const tagRenderListResult = result.data.tagRenderList;
    expect(tagRenderListResult).toEqual(expect.any(Array));
    // console.log(tagRenderListResult);
    expect(tagRenderListResult[0]).toMatchObject({
      id: fakeDataId,
      locationName: fakeTagData.locationName,
      accessibility: fakeTagData.accessibility,
      category: {
        missionName: expect.any(String),
        subTypeName: expect.any(String),
        targetName: expect.any(String),
      },
      coordinates: {
        latitude: expect.any(String),
        longitude: expect.any(String),
      },
    });
  });

  test('test query tagDetail', async () => {
    const queryTagDetail = gql`
      query testQueyDetail($id: ID!) {
        tagDetail(id: $id) {
          tagID
          createTime
          lastUpdateTime
          createUser {
            id
          }
          description
          imageUrl
        }
      }
    `;
    const result = await queryClient({
      query: queryTagDetail,
      variables: { id: fakeDataId },
    });
    const tagDetailResult = result.data.tagDetail;
    // console.log(tagDetailResult);
    expect(tagDetailResult).toMatchObject({
      tagID: fakeDataId,
      createTime: expect.any(String),
      lastUpdateTime: expect.any(String),
      createUser: {
        id: expect.any(String),
      },
      description: expect.any(String),
    });
    const dataInFirestore = (
      await firestore.collection('tagDetail').doc(fakeDataId).get()
    ).data();
    // console.log(dataInFirestore);
    expect(dataInFirestore).toMatchObject({
      createTime: expect.any(firebase.firestore.Timestamp),
      lastUpdateTime: expect.any(firebase.firestore.Timestamp),
    });
  });
});

describe('test graphql mutate', () => {
  let mutateClient;
  let firestore;
  beforeAll(() => {
    // set up firebase admin
    const admin = mockFirebaseAdmin(testProjectId);

    // set up apollo server and test client
    const server = apolloServer({ admin });
    const { mutate } = createTestClient(server);
    mutateClient = mutate;

    // set up fake data to firestore
    firestore = admin.firestore();
  });
  afterAll(async () => {
    await Promise.all(firebase.apps().map(app => app.delete()));
  });
  beforeEach(async () => {
    await clearFirestoreDatabase(testProjectId);
  });

  test('test mutate tag data', async () => {
    const mutateTag = gql`
      mutation tagUpdateTest($data: AddNewTagDataInput!) {
        addNewTagData(data: $data) {
          tag {
            id
            locationName
            category {
              missionName
              subTypeName
              targetName
            }
          }
          imageNumber
          imageUploadUrl
        }
      }
    `;
    const data = {
      ...fakeTagData,
      coordinates: {
        latitude: fakeDetailFromTagData.coordinates[1],
        longitude: fakeDetailFromTagData.coordinates[0],
      },
      description: fakeDetailFromTagData.description,
      imageNumber: 2,
      streetViewInfo: fakeDetailFromTagData.streetViewInfo,
    };
    const result = await mutateClient({
      mutation: mutateTag,
      variables: {
        data,
      },
    });
    // console.log(result.data);

    const responseData = result.data.addNewTagData;
    expect(responseData).toMatchObject({
      tag: {
        id: expect.any(String),
        locationName: data.locationName,
      },
      imageNumber: data.imageNumber,
      imageUploadUrl: expect.any(Array),
    });
    expect(responseData.imageUploadUrl.length).toEqual(data.imageNumber);

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
});
