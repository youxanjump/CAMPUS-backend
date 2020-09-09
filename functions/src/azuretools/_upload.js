// node 7.x
// uses async/await - promises

const request = require('requestretry');

// time delay between requests
const delayMS = 5000;

// retry recount
const maxRetry = 50;

// retry request if error or 429 received
const retryStrategy = function (err, response) {
  const shouldRetry = err || response.statusCode === 429;
  if (shouldRetry) console.log('retrying add examples...');
  return shouldRetry;
};

// send json batch as post.body to API
const sendBatchToApi = async options => {
  const response = await request(options);
  // return {page: options.body, response:response};
  return { response };
};

// main function to call
const upload = async config => {
  // break items into pages to fit max batch size
  const pages = [];
  let page = [];
  let exampleId = 0;

  console.log('Starting adding Questions...');

  // 批次，每100個為一個批次，每一百個送一個request出去
  config.intents.forEach(intent => {
    // console.log('enter intents for each');
    config.questions[intent].forEach(question => {
      // console.log('    enter question for each');
      page.push({
        text: question,
        intentName: intent,
        entityLabels: [],
        ExampleId: (exampleId += 1),
      });
      if (exampleId % 100 === 0) {
        pages.push(page);
        page = [];
      }
    });
  });

  if (page !== []) {
    pages.push(page);
    page = [];
  }

  // console.log(pages);

  const uploadPromises = [];
  const url = config.uri.replace('default_id', config.LUISappId);

  // load up promise array
  pages.forEach(_page => {
    const pagePromise = sendBatchToApi({
      url,
      fullResponse: false,
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': config.LUISSubscriptionKey,
      },
      json: true,
      body: _page,
      maxAttempts: maxRetry,
      retryDelay: delayMS,
      retryStrategy,
    });

    uploadPromises.push(pagePromise);
  });

  // execute promise array

  await Promise.all(uploadPromises);
  // console.log(`\n\nResults of all promises = ${JSON.stringify(results)}`);
  console.log('upload done');
};

module.exports = upload;
