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
  getLatestStatus,
  getIntentFromDocRef,
  checkUserLogIn,
} = require('./firebaseUtils');

const { upVoteActionName, cancelUpVoteActionName } = require('./constants');

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
   * Verify token from reqeust header and return user object
   * @async
   * @param {object} - request
   * @returns {DecodedIdToken} - have `uid` properity which specify
   *  the uid of the user.
   */
  async getUserInfoFromToken(req) {
    const { authorization } = req.headers;

    if (authorization) {
      const token = authorization.replace('Bearer ', '');
      try {
        // verifyIdToken return DecodedIdToken
        // https://firebase.google.com/docs/reference/admin/node/admin.auth.DecodedIdToken
        const { uid, email } = await this.auth.verifyIdToken(token);
        // getUser return UserRecord
        // https://firebase.google.com/docs/reference/admin/node/admin.auth.UserRecord
        const { displayName } = await this.auth.getUser(uid);
        return {
          logIn: true,
          uid,
          email,
          displayName: displayName || uid,
        };
      } catch (e) {
        throw new AuthenticationError(e);
      }
    }
    return {
      logIn: false,
      uid: 'anonymous',
      displayName: 'anonymous',
    };
  }

  /**
   * Get user's name from uid
   * @param {uid} the uid of the user
   * @returns {string} user's name of the uid
   */
  async getUserName({ uid }) {
    try {
      const { displayName, email } = await this.auth.getUser(uid);
      return { displayName, email };
    } catch (error) {
      console.log('Error fetching user data:', error);
      return null;
    }
  }

  /** *** storage *** */

  /**
   * Get image urls of specific tag
   * @param {object} param
   * @param {string} param.tagID the ID of the tag
   * @returns {string[]} the image links of the current tag
   */
  async getImageUrls({ tagID }) {
    const options = {
      directory: tagID,
    };
    const [files] = await this.bucket.getFiles(options);

    return files.map(file => file.metadata.mediaLink);
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
   * Return data list from collection `tagData` of the specific user
   * @async
   * @param {object} param
   * @param {string} param.uid User id of the specific user.
   * @returns {object} Data with id
   */
  async getUserAddTagHistory({ uid }) {
    const list = [];
    const querySnapshot = await this.firestore
      .collection('tagData')
      .where('createUserId', '==', uid)
      .orderBy('createTime', 'desc')
      .get();
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
  async getTagData({ id }) {
    const doc = await this.firestore.collection('tagData').doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return {
      id: doc.id,
      ...doc.data(),
    };
  }

  /**
   * TODO: add paginate function
   * Get status history of current tag document `status` collection
   * @param {DocumentReference} docRef The document we want to get the latest
   *   status
   */
  async getStatusHistory({ tagID }) {
    const docRef = await this.firestore.collection('tagData').doc(tagID);
    const statusDocSnap = await docRef
      .collection('status')
      .orderBy('createTime', 'desc')
      .get();
    const statusRes = [];
    statusDocSnap.forEach(doc => {
      statusRes.push(doc.data());
    });
    return statusRes;
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
   * Add tag data to collection `tagData` in firestore
   * @param {object} param
   * @param {object} param.tagData contain the necessary filed should
   *  be added to tagData document
   */
  async addTagDataToFirestore({ data, uid }) {
    const {
      locationName,
      accessibility,
      coordinates,
      category,
      description,
      streetViewInfo,
    } = data;
    const tagData = {
      locationName,
      accessibility,
      category,
      coordinates: new this.admin.firestore.GeoPoint(
        parseFloat(coordinates.latitude),
        parseFloat(coordinates.longitude)
      ),
      // originally tagDetail
      createTime: this.admin.firestore.FieldValue.serverTimestamp(),
      lastUpdateTime: this.admin.firestore.FieldValue.serverTimestamp(),
      createUserId: uid,
      description: description || '',
      streetViewInfo: streetViewInfo || null,
    };
    const defaultStatus = {
      statusName: getDefaultStatus(category.missionName),
      createTime: this.admin.firestore.FieldValue.serverTimestamp(),
      createUserId: uid,
      numberOfUpVote: category.missionName === '問題任務' ? 0 : null,
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
  async addNewTagData({ data, userInfo }) {
    // check user status
    const { logIn, uid } = userInfo;
    checkUserLogIn(logIn);
    // add tagData to firestore
    const tagDataDocumentData = await this.addTagDataToFirestore({ data, uid });

    // retrieve id of new added tag document
    const { id: tagDataDocumentID } = tagDataDocumentData;

    const { imageNumber } = data;
    return {
      tag: tagDataDocumentData,
      imageNumber,
      imageUploadUrl: await Promise.all(
        getImageUploadUrls(this.bucket, imageNumber, tagDataDocumentID)
      ),
    };
  } // function async updateTagData

  /**
   * Insert latest status to the history
   * @param {object} param
   * @param {String} param.tagId the id of the tag document we want to update
   *  status
   * @param {String} param.statusName the latest status name we want to update
   * @return {object} the latest status data
   */
  async updateTagStatus({ tagId, statusName, description, userInfo }) {
    const { logIn, uid } = userInfo;
    checkUserLogIn(logIn);

    const statusData = {
      statusName,
      description,
      createTime: this.admin.firestore.FieldValue.serverTimestamp(),
      createUserId: uid,
    };
    const docRef = await this.firestore
      .collection('tagData')
      .doc(tagId)
      .collection('status')
      .add(statusData);

    return (await docRef.get()).data();
  }

  /**
   * Update user's upvote status to specific tag. Update the numberOfUpVote and
   * record the user has upvoted.
   * @param {object} param
   * @param {String} param.tagId the id of the tag document we want to update
   *  status
   * @param {String} param.action upvote or cancel upvote
   * @return {object} the latest status data
   */
  async updateNumberOfUpVote({ tagId, action, userInfo }) {
    const { logIn, uid } = userInfo;
    checkUserLogIn(logIn);
    const tagDocRef = this.firestore.collection('tagData').doc(tagId);

    const {
      statusDocRef: tagStatusDocRef,
      numberOfUpVote,
    } = await getLatestStatus(tagDocRef);
    // if there is no status or the numberOfUpVote is null, raise error
    if (!tagStatusDocRef) {
      throw Error('No status in this tag.');
    }
    if (!numberOfUpVote && numberOfUpVote !== 0) {
      throw Error('No need to use NumberOfUpVote in this status.');
    }

    const tagStatusUpVoteUserRef = tagStatusDocRef
      .collection('UpVoteUser')
      .doc(uid);
    await this.firestore.runTransaction(async t => {
      const tagStatusUpVoteUserSnap = await t.get(tagStatusUpVoteUserRef);
      if (action === upVoteActionName && !tagStatusUpVoteUserSnap.exists) {
        t.update(tagStatusDocRef, {
          numberOfUpVote: this.admin.firestore.FieldValue.increment(1),
        });
        t.set(tagStatusUpVoteUserRef, { hasUpVote: true });
      } else if (
        action === cancelUpVoteActionName &&
        tagStatusUpVoteUserSnap.exists
      ) {
        t.update(tagStatusDocRef, {
          numberOfUpVote: this.admin.firestore.FieldValue.increment(-1),
        });
        t.delete(tagStatusUpVoteUserRef);
      }
    });
  }

  /**
   * Add user's FAQ or some other question and answer
   * @param {String} param.userintent
   * @param {String} param.useranswer
   */
  async addNewIntent(data) {
    const { intent, answer } = data;
    const intentRef = await this.firestore.collection('intent');
    let retData;
    await intentRef
      .add({
        intent,
        answer,
      })
      .then(docRef => {
        retData = getIntentFromDocRef(intentRef.doc(docRef.id));
        console.log(`\nfinish add new intent\nintent: ${intent}\nanswer ${answer}`);
      })
      .catch(error => {
        console.error('error add document: ', error);
      });
    return retData;
  }

  /**
   * Add user's question to certain intent
   * @param {String} param.userintent
   * @param {String} param.userquestion
   */
  async addNewQuestion(data) {
    const { userintent, userquestion } = data;
    const intentRef = await this.firestore.collection('intent');
    const querySnapshot = await intentRef
      .where('userintent', '==', userintent)
      .get();

    let docRef;
    querySnapshot.forEach(doc => {
      docRef = doc._ref;
    });

    docRef
      .collection('questions')
      .where('userquestion', '==', userquestion)
      .get()
      .then(async question => {
        let _doc;
        question.forEach(doc => {
          _doc = doc;
        });
        if (_doc.data().userquestion === userquestion) {
          console.log(`the question '${userquestion}' has been asked before `);
          question.forEach(async _question => {
            const questionaskedtimes = _question.data().questionaskedtimes + 1;
            await _question._ref
              .set({
                userquestion,
                questionaskedtimes,
              })
              .then(() => {
                console.log(`finish modify the question times`);
              })
              .catch(error => {
                console.error(error);
              });
          });
        } else {
          console.log(`add new question '${userquestion}'...`);
          await docRef
            .collection('questions')
            .add({
              userquestion,
              questionaskedtimes: 1,
            })
            .then(() => {
              console.log(
                `finish add the question to the intent '${userintent}'`
              );
            })
            .catch(error => {
              console.error(error);
            });
        }
      });
  }
} // class FirebaseAPI

module.exports = FirebaseAPI;
