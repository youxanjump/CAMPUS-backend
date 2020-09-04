/** @module Firebase */
const { DataSource } = require('apollo-datasource');
const { AuthenticationError } = require('apollo-server-express');
// geofirestore
const { GeoFirestore } = require('geofirestore');
// firebaseUtil
const {
  getImageUploadUrls,
  getDefaultStatus,
  getDataFromTagDocRef,
  getIntentFromDocRef,
} = require('./firebaseUtils');

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

    // for storage bucket
    this.bucket = admin.storage().bucket();
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
   * Get user's name from uid
   * @param {uid} the uid of the user
   * @returns {string} user's name of the uid
   */
  async getUserName({ uid }) {
    const { displayName } = await this.auth.getUser(uid);
    return displayName;
  }

  /** *** firestore *** */

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
   * Return data list from collection `tagData`
   * (Geofirestore `d` field is removed from verson 4)
   * @async
   * @returns {object} Data with id
   */
  async getTagList() {
    const list = [];
    const querySnapshot = await this.firestore.collection('tagData').get();
    querySnapshot.forEach(doc => {
      list.push(getDataFromTagDocRef(doc.ref));
    });
    return Promise.all(list);
  }

  /**
   * get tag detail from collection `tag_detail`
   * @async
   * @param {object} param
   * @param {string} param.tagID tagID of the document with detailed info.
   * @returns {object|null} Object of document data in collection `tagDetail`
   */
  async getTagDetail({ tagID }) {
    const doc = await this.firestore.collection('tagDetail').doc(tagID).get();
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

  /**
   * get the answer of the user's question
   * @param {String} param.userintent the intent that user's question meaning
   */
  async getAnswer(userintent) {
    const intentRef = await this.firestore.collection('intent');
    let queryIntent;
    const querySnapshot = await intentRef
      .where('userintent', '==', userintent)
      .get();
    querySnapshot.forEach(doc => {
      queryIntent = doc.data();
    });
    return queryIntent.useranswer;
  }

  /**
   * Add tag detail data to collection `tagDetailData` in firestore
   * @param {object} param
   * @param {String} param.tagID the id of the tag
   * @param {object} param.detailFromTagData contain the necessary filed should
   *  be added to tagDetail document
   * @return {undefined}
   */
  async setTagDetailToFirestore({ tagID, data }) {
    const tagDetailRef = this.firestore.collection('tagDetail');

    const { description, streetViewInfo } = data;

    const tagDetail = {
      createTime: this.admin.firestore.FieldValue.serverTimestamp(),
      lastUpdateTime: this.admin.firestore.FieldValue.serverTimestamp(),
      createUserID: 'test',
      description: description || '',
      streetViewInfo: streetViewInfo || null,
    };
    // add tagDetail to server
    return tagDetailRef.doc(tagID).set(tagDetail);
  }

  /**
   * Add tag data to collection `tagData` in firestore
   * @param {object} param
   * @param {object} param.tagData contain the necessary filed should
   *  be added to tagData document
   */
  async addTagDataToFirestore({ data }) {
    const { locationName, accessibility, coordinates, category } = data;
    const tagData = {
      locationName,
      accessibility,
      category,
      coordinates: new this.admin.firestore.GeoPoint(
        parseFloat(coordinates.latitude),
        parseFloat(coordinates.longitude)
      ),
    };
    const defaultStatus = {
      statusName: getDefaultStatus(category.missionName),
      createTime: this.admin.firestore.FieldValue.serverTimestamp(),
    };

    const tagGeoRef = this.geofirestore.collection('tagData');

    // add tagData to server
    const refAfterTagAdd = await tagGeoRef.add(tagData);

    // add tag default status, need to use original CollectionReference
    await refAfterTagAdd.collection('status').native.add(defaultStatus);

    return getDataFromTagDocRef(refAfterTagAdd.native);
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
   * @return {AddNewTagResponse} Contain the upload tag information, and image
   *  related information
   */
  async addNewTagData({ data, _me }) {
    const { imageNumber } = data;
    const tagDataDocumentData = await this.addTagDataToFirestore({ data });

    const { id: tagDataDocumentID } = tagDataDocumentData;

    // add tagDetail to server
    await this.setTagDetailToFirestore({
      tagID: tagDataDocumentID,
      data,
    });

    return {
      tag: tagDataDocumentData,
      imageNumber,
      imageUploadUrl: await Promise.all(
        getImageUploadUrls(this.bucket, imageNumber, tagDataDocumentID)
      ),
    };
  } // function async updateTagData

  /**
   * Update new status to new the new platform
   * @param {object} param
   * @param {String} param.tagId the id of the tag document we want to update
   *  status
   * @param {String} param.statusName the latest status name we want to update
   * @return {object} the latest status data
   */
  async updateTagStatus({ tagId, statusName }) {
    const statusData = {
      statusName,
      createTime: this.admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await this.firestore
      .collection('tagData')
      .doc(tagId)
      .collection('status')
      .add(statusData);

    return (await docRef.get()).data();
  }

  /**
   * Add user's FAQ or some other question and answer
   * @param {String} param.userintent
   * @param {String} param.useranswer
   */
  async addNewIntent({ data }) {
    const { userintent, useranswer } = data;
    const intentRef = await this.firestore.collection('intent');
    let retData;
    await intentRef
      .add({
        userintent,
        useranswer,
      })
      .then(function (docRef) {
        retData = getIntentFromDocRef(intentRef.doc(docRef.id));
        console.log(`finish add new intent`);
      })
      .catch(function (error) {
        console.error('error add document: ', error);
      });
    return retData;
  }
} // class FirebaseAPI

module.exports = FirebaseAPI;
