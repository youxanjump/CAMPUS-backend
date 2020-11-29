const { v4: uuidv4 } = require('uuid');
const { ForbiddenError } = require('apollo-server');

function generateFileName(imageNumber, tagID) {
  return [...new Array(imageNumber)].map(
    () => `${tagID}/${uuidv4().substr(0, 8)}`
  );
}

// TODO
/**
 * Generate Singed URL to let front end upload images in a tag to firebase storage
 * The file name on the storage will looks like: `tagID/(8 digits uuid)`
 * reference from: https://github.com/googleapis/nodejs-storage/blob/master/samples/generateV4UploadSignedUrl.js
 * @param {Int} imageNumber
 * @param {String} tagID
 * @returns {Promise[]} an array contain singed urls with length `imageNumber`
 */
function getImageUploadUrls(bucket, imageNumber, tagID) {
  // These options will allow temporary uploading of the file with outgoing
  // Content-Type: application/octet-stream header.
  const options = {
    version: 'v4',
    action: 'write',
    expires: Date.now() + 5 * 60 * 1000, // 5 minutes
    contentType: 'application/octet-stream',
  };

  const fileNameArray = generateFileName(imageNumber, tagID);

  return fileNameArray.map(async name => {
    const [url] = await bucket.file(name).getSignedUrl(options);
    return url;
  });
}

function getDefaultStatus(missionName) {
  switch (missionName) {
    case '設施任務':
      return '存在';
    case '問題任務':
      return '待處理';
    case '動態任務':
      return '人少';
    default:
      return '';
  }
}

/**
 * Get latest status of current tag document `status` collection
 * @param {DocumentReference} docRef The document we want to get the latest
 *   status
 * @param {data} Boolean if true, return data, else return DocumentSnapshot
 */
async function getLatestStatus(docRef) {
  const statusDocSnap = await docRef
    .collection('status')
    .orderBy('createTime', 'desc')
    .limit(1)
    .get();
  if (statusDocSnap.empty) {
    throw Error('No status document!');
  }
  const statusRes = [];
  statusDocSnap.forEach(doc => {
    statusRes.push({
      statusDocRef: doc.ref,
      ...doc.data(),
    });
  });
  const [currentStatus] = statusRes;
  return currentStatus;
}

/**
 * Extract data from tag document reference
 * @param {DocumentReference} docRef The document we want to get the data
 */
async function getDataFromTagDocRef(docRef) {
  const { statusDocRef: _, ...status } = await getLatestStatus(docRef);
  const data = {
    id: docRef.id,
    status,
    // move to resolver
    // statusHistory: await getStatusHistory(docRef),
    ...(await docRef.get()).data(),
  };
  return data;
}

/**
 * Get User's intent and its answer
 */
async function getIntentFromDocRef(docRef) {
  let data;
  await docRef.get().then(function (doc) {
    if (doc.exists) {
      data = {
        userintent: doc.data().userintent,
        useranswer: doc.data().useranswer,
      };
      // console.log(data);
    }
  });
  return data;
}

/**
 * Check if user is log in. If not, raise ForbiddenError
 * @param {Boolean} logIn logIn status
 */
function checkUserLogIn(logIn) {
  if (!logIn) {
    // TODO: anonymous user data or throw authorize error
    throw new ForbiddenError('User is not login');
  }
}

exports.getImageUploadUrls = getImageUploadUrls;
exports.getDefaultStatus = getDefaultStatus;
exports.getLatestStatus = getLatestStatus;
exports.getDataFromTagDocRef = getDataFromTagDocRef;
exports.getIntentFromDocRef = getIntentFromDocRef;
exports.checkUserLogIn = checkUserLogIn;
