const { DataSource } = require('apollo-datasource');

// geofirestore
const { GeoFirestore } = require('geofirestore');

class FirestoreAPI extends DataSource {
  constructor({ admin }) {
    super();

    // Create a GeoFirestore reference
    this.firestore = admin.firestore();
    this.geofirestore = new GeoFirestore(this.firestore);
  }

  /**
   * This is a function that gets called by ApolloServer when being setup.
   * This function gets called with the datasource config including things
   * like caches and context. We'll assign this.context to the request context
   * here, so we can know about the user making requests
   */
  initialize(config) {
    this.context = config.context;
  }

  /**
   * get all objects from specific collection
   * @param {string} collectionName - Collection name of firestore.
   */
  async getList(collectionName) {
    const list = [];
    try {
      const querySnapshot = await this.firestore.collection(collectionName).get();
      querySnapshot.forEach(doc => {
        const data = doc.data();
        list.push({
          id: doc.id,
          ...data,
        });
      });
      return list;
    } catch (err) {
      console.log(collectionName, ' error: ', err);
      return [];
    }
  }

  /**
   * get all tags from collection "tag_data"
   */
  async getTagList() {
    const tagList = await this.getList('tagData');
    const unpackTagList = tagList.map(({ id, d }) => (
      { id, ...d }
    ));

    return unpackTagList;
  }

  /**
   * get tag detail from collection "tag_detail"
   * @param {string} tagID - tagID of the document with detailed info.
   */
  async getTagDetail({ tagID }) {
    const doc = await this.firestore
      .collection('tagDetail').doc(tagID).get();
    if (!doc) {
      return {
        id: doc.id,
        ...doc.data(),
      };
    }
    return null;
  }

  /**
   * get all mission from collection "mission_list"
   */
  async getMissionList() {
    const missionList = await this.getList('missionList');
    return missionList;
  }

  /**
   * get mission detail with specific id
   */
  async getMissionById({ id }) {
    let mission = {};
    try {
      const docRef = this.firestore
        .collection('missionList').doc(id);
      const doc = await docRef.get();
      if (!doc.exists) {
        console.log(`can't get document: ${id}`);
        mission = { message: `no such document: ${id}` };
      }
      mission = {
        id: doc.id,
        ...doc.data(),
      };
    } catch (err) {
      console.log(`can't get document: ${id}, ${err} `);
    }
    return mission;
  }

  /**
   * get all mission from collection "finding_list"
   */
  async getFindingList() {
    const findingList = await this.getList('findingList');
    return findingList;
  }

  /**
   * get finding detail with specific id
   */
  async getFindingById({ id }) {
    let finding = {};
    try {
      const docRef = this.firestore
        .collection('findingList').doc(id);
      const doc = await docRef.get();
      if (!doc.exists) {
        console.log(`can't get document: ${id}`);
        finding = { message: `no such document: ${id}` };
      }
      finding = {
        id: doc.id,
        ...doc.data(),
      };
    } catch (err) {
      console.log(`can't get document: ${id}, ${err} `);
    }
    return finding;
  }
 

  /**
   * get all mission from collection "finding_list"
   */
  async getFindingsOfAMission({ missionID }) {
    try {
      const findingList = [];
      const querySnapshot = await this.firestore
        .collection('findingList').where('missionID', '==', missionID)
        .get();
      querySnapshot.forEach(doc => {
        findingList.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return findingList;
    } catch (err) {
      console.log('error: ', err);
      return [];
    }
  }
}

module.exports = FirestoreAPI;
