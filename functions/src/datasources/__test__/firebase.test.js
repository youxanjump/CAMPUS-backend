// const firebase = require('@firebase/testing');
const admin = require('firebase-admin');
const serviceAccount = require('D:/peaceful-nature-268409-8bb978d93c80.json');
const FirebaseAPI = require('../firebase');

// start the firestore emulator
// port 4400
// const projectId = 'smartcampus-1b31f-test';
const EMULATOR_URL = 'localhost:8080';

let firebaseAPIinstance;
function initial() {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  admin.firestore().settings({
    host: EMULATOR_URL,
    ssl: false,
  });
  firebaseAPIinstance = new FirebaseAPI({ admin });
}
function addData() {
  admin.firestore().collection('discoveryList').doc('discovery_1').set({
    missionID: 'mission_1',
    name: '下雨濕滑',
  })
  admin.firestore().collection('discoveryList').doc('discovery_2').set({
    missionID: 'mission_1',
    name: '障礙物',
  })
  admin.firestore().collection('missionList').doc('mission_1').set({
    name: '道路障礙',
  })
  // admin.firestore().collection('missionList').doc('mission_2').set({
  //     name: '無障礙設施',
  // })
  admin.firestore().collection('tagData').doc('tagData_1').set({
    d: {
      accessibility: 4,
      coordinates: ['24.78658951085373° N', '120.9955623378204° E'],
      discoveryIDs: ['discovery_1'],
      missionID: 'mission_1',
      title: 'TEST'
    },
    g: 'wsqj12622g',
    l: ['24.78658951085373° N', '120.9955623378204° E'],
  })
  admin.firestore().collection('tagData').doc('tagData_2').set({
    d: {
      accessibility: 2,
      coordinates: ['24.78630703751725° N', '120.997289680426° E'],
      discoveryIDs: ['discovery_1'],
      missionID: 'mission_1',
      title: 'TEST'
    },
    g: 'wsqj12622g',
    l: ['24.78630703751725° N', '120.997289680426° E'],
  })
  admin.firestore().collection('tagData').doc('tagData_3').set({
    d: {
      accessibility: 0,
      coordinates: ['24.7872616° N', '120.9969249° E'],
      discoveryIDs: ['discovery_2'],
      missionID: 'mission_1',
      title: 'TEST'
    },
    g: 'wsqj12622g',
    l: ['24.7872616° N', '120.9969249° E'],
  })
  admin.firestore().collection('tagDetail').doc('tagData_1').set({
    createTime: 'June 29, 2020 at 4:01:05 PM UTC+8',
    createUserID: 'NO_USER',
    description: '',
    imageUrl: [],
    lastUpdateTime: 'June 29, 2020 at 4:01:05 PM UTC+8',
    location: {
      geoInfo: {
        coordinates: {
          latitude: '24.78658951085373',
          longitutde: '120.9955623378204',
        },
        type: 'Point',
      }
    }
  })
  admin.firestore().collection('tagDetail').doc('tagData_2').set({
    createTime: 'May 19, 2020 at 4:22:12 PM UTC+8',
    createUserID: 'NO_USER',
    description: '',
    imageUrl: [],
    lastUpdateTime: 'May 19, 2020 at 4:22:12 PM UTC+8',
    location: {
      geoInfo: {
        coordinates: {
          latitude: '24.78630703751725',
          longitutde: '120.997289680426',
        },
        type: 'Point',
      }
    }
  })
  admin.firestore().collection('tagDetail').doc('tagData_3').set({
    createTime: 'June 1, 2020 at 1:27:51 AM UTC+8',
    createUserID: 'NO_USER',
    description: '',
    imageUrl: [],
    lastUpdateTime: 'June 1, 2020 at 1:27:51 AM UTC+8',
    location: {
      geoInfo: {
        coordinates: {
          latitude: '24.7872616',
          longitutde: '120.9969249',
        },
        type: 'Point',
      }
    }
  })
}
async function clearCollection(collectionName) {
  const batch = admin.firestore().batch();
  // console.log("delete collection ----------------------------------------------->",collectionName)
  const snapshot = await admin.firestore().collection(collectionName).get();
  if (!snapshot.empty) {
    snapshot.forEach(doc => {
      // console.log("...delete document ----------------------------------------------->", doc.id)
      batch.delete(doc.ref);
    })
  }
  await batch.commit();
}
async function clearAll() {
  // await admin.firestore().listCollections().then(collections => {
  //     for (let collection of collections) {
  //         console.log(collection.id)
  //         clear_collection(collection.id)
  //     }
  // })
  let collectionName = ['discoveryList', 'missionList', 'tagData', 'tagDetail']
  for (let index = 0; index < collectionName.length; index++) {
    await clearCollection(collectionName[index])
  }
}
beforeAll(() => {
  // const admin = firebase.initializeAdminApp({ projectId });
  // admin.auth = jest.fn();
  // admin.storage = jest.fn(() => ({ bucket: jest.fn() }));
  // firebaseAPIinstance = new FirebaseAPI({ admin });
  return initial();
});
afterAll(async () => {
  // await Promise.all(firebase.apps().map(app => app.delete()));
});
describe('Initialization on local emulator', () => {
  it('clearing previous data', async () => {
    await clearAll();
  });
  it('add data', async () => {
    await addData();
  });
});
describe('Test functions', () => {
  it('getList: discoveryList', async () => {
    const discoveryList = await firebaseAPIinstance.getList('discoveryList');
    // console.log('--------------------------------------',discoveryList.length)
    expect(discoveryList).not.toBeNull();
    expect(discoveryList).toBeDefined();
    expect(discoveryList).toMatchObject([
      { id: 'discovery_1' },
      { id: 'discovery_2' },
    ]);
    expect(discoveryList).toHaveLength(2);
  });
  it('getList: missionList', async () => {
    const missionList = await firebaseAPIinstance.getList('missionList');
    expect(missionList).not.toBeNull();
    expect(missionList).toBeDefined();
    expect(missionList).toMatchObject([{ id: 'mission_1' }]);
    expect(missionList).toHaveLength(1);
  });
  it('getTagList', async () => {
    const tagList = await firebaseAPIinstance.getTagList();
    expect(tagList).not.toBeNull();
    expect(tagList).toBeDefined();
    expect(tagList).toMatchObject([
      { accessibility: 4 },
      { accessibility: 2 },
      { accessibility: 0 },
    ]);
    expect(tagList).toHaveLength(3);
  });
  it('getTagDetail', async () => {
    const tagDetail = await firebaseAPIinstance.getTagDetail({
      tagID: 'tagData_1',
    });
    expect(tagDetail).not.toBeNull();
    expect(tagDetail).toBeDefined();
    expect(tagDetail).toMatchObject({
      lastUpdateTime: 'June 29, 2020 at 4:01:05 PM UTC+8',
    });
    const noTagDetail = await firebaseAPIinstance.getTagDetail({
      tagID: 'invalid',
    });
    expect(noTagDetail).toBeNull();
  });
  it('getMissionById', async () => {
    const mission = await firebaseAPIinstance.getMissionById({ id: 'mission_1' });
    expect(mission).not.toBeNull();
    expect(mission).toBeDefined();
    expect(mission).toMatchObject({ name: '道路障礙' });
    async function noMission() {
      await firebaseAPIinstance.getMissionById({ id: 'invalid' }, admin);
    }
    await expect(noMission).rejects.toThrowError(
      new Error(`can't get document: invalid`)
    );
  });
});
