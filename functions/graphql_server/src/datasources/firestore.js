const { DataSource } = require('apollo-datasource');
const { AuthenticationError } = require('apollo-server-express');
// geofirestore
const { GeoFirestore } = require('geofirestore');

class FirestoreAPI extends DataSource {
  constructor({ admin }) {
    super();

    // Create a GeoFirestore reference
    this.admin = admin;
    this.firestore = admin.firestore();
    this.geofirestore = new GeoFirestore(this.firestore);

    // for authentication
    this.auth = admin.auth();
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
   * Authentication
   */

  /**
   * get token from reqeust header and verify
   * @param {object} - request
   * @returns {DecodedIdToken} - have `uid` properity which specify
   *  the uid of the user.
   */
  async getToken(req) {
    const { authorization } = req.headers;

    if (authorization) {
      const token = authorization.replace('Bearer ', '');
      try {
        return await this.auth.verifyIdToken(token);
      } catch (e) {
        throw new AuthenticationError(e);
      }
    }
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
   * get tag createUser"
   * @param {string} tagID - tagID of the document with detailed info.
   */
  async getTagCreateUser({ tagID }) {
    const doc = await this.firestore
      .collection('tagDetail').doc(tagID).get();
    if (!doc.exists) {
      return null;
    }
    return {
      tagID: doc.id,
      createUser: doc.data().createUser,
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

  async getUserName({ uid }) {
    const { displayName } = await this.auth.getUser(uid);
    return displayName;
  }

  // TODO: if id is null, add data, else update data and udptetime
  // check if user, discovery and task id are existed
  // TODO: refactor this function. Extract the verification process
  // to resolver
  async updateTagData({ data, me }) {
    // TODO: add tagData to firebase using geofirestore
    try {
      const tagGeoRef = this.geofirestore.collection('tagData');
      const tagDetailRef = this.firestore.collection('tagDetail');
      const response = {
        success: true,
        message: '',
        tag: null,
      };
      if (!data.modify) {
        // add new data
        const {
          // tag data
          title,
          accessibility,
          missionID,
          discoveryIDs,
          coordinates,
          // tag detail data
          description,
          imageUrl,
        } = data;
        const tagData = {
          title,
          accessibility,
          missionID,
          discoveryIDs,
          coordinates:
            new this.admin.firestore.GeoPoint(
              parseFloat(coordinates.latitude),
              parseFloat(coordinates.longitude)
            ),
        };
        // TODO: add tagData to firebase using geofirestore
        // collection reference
        //const discoveryListRef = this.firestore.collection('discoveryList');
        const missionListRef = this.firestore.collection('missionList');

        // validation
        const refToMissionDoc = await missionListRef.doc(missionID).get();
        if (!refToMissionDoc.exists) {
          response.success = false;
          response.message = `no such missionID: ${missionID}`;
          return response;
        }
        // TODO: how to do validation to an array(discoveryList)
        // TODO: validate user

        // add tagData to server
        const refAfterTagAdd = await tagGeoRef.add(tagData);

        // add tagDetail to server
        const tagDetail = {
          createTime: this.admin.firestore.FieldValue.serverTimestamp(),
          lastUpdateTime: this.admin.firestore.FieldValue.serverTimestamp(),
          createUserID: me.uid,
          location: {
            geoInfo: {
              type: 'Point',
              coordinates,
            },
          },
          description: description || '',
          imageUrl,
        };

        tagDetailRef.doc(refAfterTagAdd.id).set(tagDetail);

        const afterTagAddSnap = await tagGeoRef
          .doc(refAfterTagAdd.id).get();

        response.tag = {
          id: refAfterTagAdd.id,
          ...afterTagAddSnap.data().d,
        };
      } else {
        // update existed data
        response.success = false;
        response.message = 'currently can not update data on the firestore';
      }
      response.message = 'Add data successfully.';
      return response;
    } catch (err) {
      return {
        success: false,
        message: err,
        tag: null,
      };
    }
  }// function async updateTagData
} // class FirestoreAPI

module.exports = FirestoreAPI;
