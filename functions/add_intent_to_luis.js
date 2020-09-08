const parse = require('./src/azuretools/_parse');
// const createApp = require('./src/azuretools/_create');
// const addIntents = require('./src/azuretools/_intents');
const upload = require('./src/azuretools/_upload');

// Change these values
const LUISauthoringKey = '6da613deaa9042beae670f765936fda3';
// const LUISappName = 'Luis-FAQ-test';
const LUISendpoint = 'https://westus.api.cognitive.microsoft.com/';
// const LUISappCulture = 'en-us';
const LUISversionId = '0.1';

// The app ID is returned from LUIS when your app is created
let LUISappId = 'default_id'; // default app ID
let intents = [];
let questions = [];

/* add utterances parameters */
const configAddUtterances = {
  LUISSubscriptionKey: LUISauthoringKey,
  LUISappId,
  LUISversionId,
  questions,
  intents,
  uri: `${LUISendpoint}luis/api/v2.0/apps/${LUISappId}/versions/${LUISversionId}/examples`,
};

/* create app parameters */
/* const configCreateApp = {
  LUISSubscriptionKey: LUISauthoringKey,
  LUISversionId,
  appName: LUISappName,
  culture: LUISappCulture,
  uri: `${LUISendpoint}luis/api/v2.0/apps/`,
};

/* add intents parameters */
const configAddIntents = {
  LUISSubscriptionKey: LUISauthoringKey,
  LUISappId,
  LUISversionId,
  intentList: intents,
  uri: `${LUISendpoint}luis/api/v2.0/apps/${LUISappId}/versions/${LUISversionId}/intents`,
};

// Parse CSV, parameter is the address of the google sheet
parse('1mLBmZctIw_MA6V_zD3yIjkYoKZDGS0seKnSkKjIdvxI')
  .then(model => {
    // Save intent and entity names from parse
    intents = model.intents;
    questions = model.questions;
    // console.log({...intents});
    // Create the LUIS app
    console.log(intents.length);
    // return createApp(configCreateApp);
  })
  .then(appId => {
    // Add intents
    LUISappId = '9edbd98e-e481-44d2-abc9-3cdba937c5b4';
    configAddIntents.LUISappId = appId;
    configAddIntents.intentList = intents;
    // return addIntents(configAddIntents);
  })
  .then(() => {
    // Add example utterances to the intents in the app
    configAddUtterances.LUISappId = LUISappId;
    configAddUtterances.intents = intents;
    configAddUtterances.questions = questions;
    return upload(configAddUtterances);
  })
  .catch(err => {
    console.log(err.message);
  });
