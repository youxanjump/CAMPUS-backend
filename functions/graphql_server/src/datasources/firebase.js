/** @module Firebase */
const { DataSource } = require('apollo-datasource');
const { AuthenticationError } = require('apollo-server-express');
// geofirestore
const { GeoFirestore } = require('geofirestore');

/** Handle action with firebase
 *  @todo Rewrite this class name
 *  @todo refactor
 */
class FirebaseAPI extends DataSource {
  /**
   * Use admin to construct necessary entity of communication
   * @param {object} param
   * @param {object} param.admin firebase admin config
   */
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
   * @async
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
    throw new AuthenticationError('no authorization info in header');
  }

  /**
   * Get all objects from specific collection.
   * @async
   * @param {string} collectionName Collection name of firestore.
   * @returns {object[]} Array of document data in the collection `collectionName`
   */
  async getList(collectionName) {
    const list = [];
    const querySnapshot = await this.firestore.collection(collectionName).get();
    querySnapshot.forEach(doc => {
      const data = doc.data();
      list.push({
        id: doc.id,
        ...data,
      });
    });
    return list;
  }

  /**
   * Geofirestore will store not geo-related data in field `d`.
   * This function get field `d` data from collection `tagData`
   * @async
   * @returns {object} Object with id and `d` unpacked data of document
   * in collection `tagData`
   */
  async getTagList() {
    const tagList = await this.getList('tagData');
    const unpackTagList = tagList.map(({ id, d }) => ({ id, ...d }));

    return unpackTagList;
  }

  /**
   * get tag detail from collection `tag_detail`
   * @async
   * @param {object} param
   * @param {string} param.tagID tagID of the document with detailed info.
   * @returns {object|null} Object of document data in collection `tagDetail`
   */
  async getTagDetail({ tagID }) {
    const doc = await this.firestore
      .collection('tagDetail')
      .doc(tagID)
      .get();
    if (!doc.exists) {
      return null;
    }
    return {
      tagID: doc.id,
      ...doc.data(),
    };
  }

  /**
   * get mission detail with specific id
   * @async
   * @param {object} param
   * @param {string} param.id get mission data of the id
   * @returns {missionObject} mission data
   */
  async getMissionById({ id }) {
    let mission = {};
    const docRef = this.firestore.collection('missionList').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new Error(`can't get document: ${id}`);
    }
    mission = {
      id: doc.id,
      ...doc.data(),
    };

    return mission;
  }

  /**
   * get discovery detail with specific id
   * @async
   * @param {object} param
   * @param {string[]} param.ids Array of discovery id
   * @returns {discoveryObject[]} Array of discovery data
   */
  async getDiscoveriesById({ ids }) {
    let discoveryList = {};
    const docRefList = ids.map(id => ({
      id,
      docSnap: this.firestore.collection('discoveryList').doc(id),
    }));
    const discoveriesAsync = docRefList.map(async ({ id, docSnap }) => {
      let discovery = {};
      const doc = await docSnap.get();
      if (!doc.exists) {
        throw new Error(`can't get document: ${id}`);
      }
      discovery = {
        id: doc.id,
        ...doc.data(),
      };
      return discovery;
    }); // discoveriesAsync

    discoveryList = await Promise.all(discoveriesAsync);

    return discoveryList;
  }

  /**
   * get all discovery belong to specific mission
   * from collection `discoveryList`.
   * @async
   * @param {object} param
   * @param {string} param.missionID
   * @returns {discoveryObject[]}
   *
   */
  async getDiscoveriesOfAMission({ missionID }) {
    const discoveryList = [];
    const querySnapshot = await this.firestore
      .collection('discoveryList')
      .where('missionID', '==', missionID)
      .get();
    querySnapshot.forEach(doc => {
      discoveryList.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return discoveryList;
  }

  async getUserName({ uid }) {
    const { displayName } = await this.auth.getUser(uid);
    return displayName;
  }

  // TODO: if id is null, add data, else update data and udptetime
  // check if user, discovery and task id are existed
  // TODO: refactor this function. Extract the verification process
  // to resolver
  /**
   * Add or update tag data. Currently not implement updata function.
   * @param {object} param
   * @param {AddNewTagDataInputObject} param.data `AddNewTagDataInput` data
   * @param {DecodedIdToken} param.me have `uid` properity which specify
   *  the uid of the user.
   * @returns {TagObject} Contain the message of this operation
   */
  async addNewTagData({ data, me }) {
    // TODO: add tagData to firebase using geofirestore
    try {
      const tagGeoRef = this.geofirestore.collection('tagData');
      const tagDetailRef = this.firestore.collection('tagDetail');
      const missionListRef = this.firestore.collection('missionList');

      const {
        // tag data
        title,
        accessibility,
        missionID,
        discoveryIDs,
        coordinates,
        // tag detail data
        description,
      } = data;

      const tagData = {
        title,
        accessibility,
        missionID,
        discoveryIDs,
        coordinates: new this.admin.firestore.GeoPoint(
          parseFloat(coordinates.latitude),
          parseFloat(coordinates.longitude)
        ),
      };

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
      };

      // validation
      const refToMissionDoc = await missionListRef.doc(missionID).get();
      if (!refToMissionDoc.exists) {
        return null;
      }
      // TODO: how to do validation to an array(discoveryList)
      // TODO: validate user

      // add tagData to server
      const refAfterTagAdd = await tagGeoRef.add(tagData);

      // add tagDetail to server
      tagDetailRef.doc(refAfterTagAdd.id).set(tagDetail);

      // get tag snapshot data and return
      const afterTagAddSnap = await tagGeoRef.doc(refAfterTagAdd.id).get();
      return {
        id: refAfterTagAdd.id,
        ...afterTagAddSnap.data().d,
      };
    } catch (err) {
      return null;
    }
  } // function async updateTagData
} // class FirebaseAPI

module.exports = FirebaseAPI;
