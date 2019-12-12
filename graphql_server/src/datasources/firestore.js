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
    if (!doc.exists) {
      return null;
    }
    return {
      tagID: doc.id,
      ...doc.data(),
    };
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
   * get all mission from collection "discovery_list"
   */
  async getDiscoveryList() {
    const discoveryList = await this.getList('discoveryList');
    return discoveryList;
  }

  /**
   * get discovery detail with specific id
   */
  async getDiscoveriesById({ ids }) {
    let discoveryList = {};
    try {
      const docRefList = ids.map(id => ({
        id,
        docSnap: this.firestore
          .collection('discoveryList').doc(id),
      }));
      const discoveriesAsync = docRefList.map(async ({ id, docSnap }) => {
        let discovery = {};
        const doc = await docSnap.get();
        if (!doc.exists) {
          console.log(`can't get document: ${id}`);
          discovery = { message: `no such document: ${id}` };
          return discovery;
        }
        discovery = {
          id: doc.id,
          ...doc.data(),
        };
        return discovery;
      });
      discoveryList = await Promise.all(discoveriesAsync);
      console.log(discoveryList);
    } catch (err) {
      console.log(`${err} `);
    }
    return discoveryList;
  }

  /**
   * get all mission from collection "discovery_list"
   */
  async getDiscoveriesOfAMission({ missionID }) {
    try {
      const discoveryList = [];
      const querySnapshot = await this.firestore
        .collection('discoveryList').where('missionID', '==', missionID)
        .get();
      querySnapshot.forEach(doc => {
        discoveryList.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return discoveryList;
    } catch (err) {
      console.log('error: ', err);
      return [];
    }
  }
}

module.exports = FirestoreAPI;
