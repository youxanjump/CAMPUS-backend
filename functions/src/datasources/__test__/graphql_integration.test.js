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
} = require('./mockFirebaseAdmin');

const testProjectId = 'smartcampus-1b31f-graphql-test';

describe('test graphql query', () => {
  let queryClient;
  let mutateClient;
  let firestore;
  beforeAll(() => {
    // set up firebase admin
    const admin = mockFirebaseAdmin(testProjectId);

    // set up apollo server and test client
    const server = apolloServer({ admin });
    const { query, mutate } = createTestClient(server);
    queryClient = query;
    mutateClient = mutate;

    // set up fake data to firestore
    firestore = admin.firestore();
    addFakeDatatoFirestore(firestore);
  });
  afterAll(async () => {
    await Promise.all(firebase.apps().map(app => app.delete()));
  });

  test('test query tagRenderList', async () => {
    const queryTagRenderList = gql`
      query {
        tagRenderList {
          id
          title
          accessibility
          mission {
            id
            name
          }
          discoveries {
            id
            name
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
    expect(tagRenderListResult).toContainEqual({
      id: fakeDataId,
      title: fakeTagData.title,
      accessibility: fakeTagData.accessibility,
      mission: {
        id: expect.any(String),
        name: expect.any(String),
      },
      discoveries: expect.any(Array),
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
          location {
            geoInfo
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
      location: {
        geoInfo: {
          type: 'Point',
          coordinates: fakeDetailFromTagData.coordinates,
        },
      },
      description: expect.any(String),
    });
    const dataInFirestore = (
      await firestore.collection('tagDetail').doc(fakeDataId).get()
    ).data();
    console.log(dataInFirestore);
    expect(dataInFirestore).toMatchObject({
      createTime: expect.any(firebase.firestore.Timestamp),
      lastUpdateTime: expect.any(firebase.firestore.Timestamp),
    });
  });
  test('test mutate tag data', async () => {
    const mutateTag = gql`
      mutation tagUpdateTest($data: AddNewTagDataInput!) {
        addNewTagData(data: $data) {
          tag {
            id
            title
          }
          imageNumber
          imageUploadUrl
        }
      }
    `;
    const data = {
      title: 'mutation test',
      accessibility: 4,
      missionID: 'mission-test',
      discoveryIDs: ['discovery-test'],
      coordinates: {
        latitude: '24.787257',
        longitude: '120.997634',
      },
      description: 'graphql mutation test',
      imageNumber: 2,
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
        title: data.title,
      },
      imageNumber: data.imageNumber,
      imageUploadUrl: expect.any(Array),
    });
    expect(responseData.imageUploadUrl.length).toEqual(data.imageNumber);
  });
});
