/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Messenger Platform Quick Start Tutorial
 *
 * This is the completed code for the Messenger Platform quick start tutorial
 *
 * https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start/
 *
 * To run this code, you must do the following:
 *
 * 1. Deploy this code to a server running Node.js
 * 2. Run `npm install`
 * 3. Update the VERIFY_TOKEN
 * 4. Add your PAGE_ACCESS_TOKEN to your environment vars
 *
 */

// YOUR-APP-ID: The App ID GUID found on the www.luis.ai Application Settings page.
const LUISappId = '211d2292-7bc4-49bd-b4fc-06a5c96445d1';

// YOUR-PREDICTION-KEY: Your LUIS authoring key, 32 character value. for test: '9c5c12b84a98428294d6d4c0ee01b73a'
const LUISPredictionKey = '';

// YOUR-AUTHORING-KEY: Starter_Key, for testing '9c5c12b84a98428294d6d4c0ee01b73a'
// const LUISAuthoringKey = '';

// YOUR-PREDICTION-ENDPOINT: Replace this with your authoring key endpoint
const LUISPriditionEndpoint = 'https://westus.api.cognitive.microsoft.com/';

// YOUR-API-ENDPOINT: Starter_Key
// const LUISEndpoint = 'https://westus.api.cognitive.microsoft.com/';

// const LUISversionId = '0.1';

const admin = require('firebase-admin');

// if you dont know what it is, check 'https://wcc723.github.io/javascript/2017/12/15/javascript-use-strict/'
// ('use strict');

// const PAGE_ACCESS_TOKEN =
//  'EAAFN87dRCNgBAATZALMk4B8Pw7ZCrdyXsPY3AjPMGcVVFPmGrUjJF8WoIXdhRRRelZBLT51UTHrLzxLPvoMdex5CpvrOVAduquIZCngXzEfMtzDgjUDIFZA0hZBFyAG73pQr8rqwV9WjhiqbtiwfdvBQ4byon1sInBADulnegcZBwZDZD';
const express = require('express');
const bodyParser = require('body-parser');
// const axios = require('axios');
const requestPromise = require('request-promise');
const queryString = require('querystring');
const verifyWebhook = require('./src/verify-webhook');
const FirebaseAPI = require('./src/datasources/firebase');

/* add utterances parameters */
/* const configAddUtterances = {
  LUISSubscriptionKey: LUISAuthoringKey,
  LUISappId,
  LUISversionId,
  question: '',
  intent: '',
  uri: `${LUISEndpoint}luis/authoring/v3.0-preview/apps/${LUISappId}/versions/${LUISversionId}/examples`,
}; */

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/messengerwebhook', verifyWebhook);

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: 'gs://smartcampus-1b31f.appspot.com',
});

// Accepts POST requests at /messengerwebhook endpoint
app.post('/messengerwebhook', (req, res) => {
  const firebaseAPIinstance = new FirebaseAPI({ admin });

  // Parse the request body from the POST
  const { body } = req;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {
    body.entry.forEach(async function (entry) {
      // Gets the body of the webhook event
      const webhookEvent = entry.messaging[0];

      const utterance = webhookEvent.message.text;
      console.log(`Recieved message '${utterance}'`);

      // Get the sender PSID
      const senderPsid = webhookEvent.sender.id;
      console.log(`Sender ID: ${senderPsid}`);

      // Create query string
      const queryParams = {
        'show-all-intents': true,
        verbose: true,
        query: utterance,
        'subscription-key': LUISPredictionKey,
      };

      // Create the URI for the REST call.
      const pridictionUri = `${LUISPriditionEndpoint}luis/prediction/v3.0/apps/${LUISappId}/slots/production/predict?${queryString.stringify(
        queryParams
      )}`;

      // Analyze a string utterance.
      // const getPrediction = async () => {
      // console.log(`get prediction`);
      // Send the REST call.
      const response = await requestPromise(pridictionUri);
      // console.log(`got prediction`);
      // Get the topIntent
      const intent = JSON.parse(response).prediction.topIntent;
      const answer = await firebaseAPIinstance.getAnswer(intent);

      // Display the response from the REST call.
      console.log(`top intent: ${intent}`);
      console.log(`answer: ${answer}`);
      // };

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhookEvent.message) {
        // handleMessage(senderPsid, webhookEvent.message);
      } else if (webhookEvent.postback) {
        // handlePostback(senderPsid, webhookEvent.postback);
      }
    });
    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

app.listen(5000, () => console.log('Express server is listening on port 5000'));
