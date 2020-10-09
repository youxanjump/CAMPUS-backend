// node 7.x
// uses async/await - promises

const rp = require('request-promise');

// Send JSON as the body of the POST request to the API
const callCreateApp = async options => {
  console.log('enter callCreateApp');
  let response;
  if (options.method === 'POST') {
    console.log(`ready to post to ${options.uri}`);
    response = await rp.post(options);
    console.log('finish post');
  } else if (options.method === 'GET') {
    // TODO: There's no GET for create app
    response = await rp.get(options);
  }
  // response from successful create should be the new app ID
  return { response };
};

// main function to call
// Call Apps_Create
const createApp = async config => {
  try {
    console.log('\nenter creatApp try');
    // JSON for the request body
    // { "name": MyAppName, "culture": "en-us"}
    const jsonBody = {
      name: config.appName,
      culture: config.culture,
    };

    // Create a LUIS app
    const createAppPromise = callCreateApp({
      uri: config.uri,
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': config.LUISSubscriptionKey,
      },
      json: true,
      body: jsonBody,
    });

    const results = await createAppPromise;

    // Create app returns an app ID
    const appId = results.response;
    console.log(`Called createApp, created app with ID ${appId}`);
    return appId;
  } catch (err) {
    console.log(`Error creating app:  ${err.message} `);
    throw err;
  }
};

module.exports = createApp;
