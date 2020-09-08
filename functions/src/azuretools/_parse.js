const GoogleSpreadsheet = require('google-spreadsheet');
const merge = require('deepmerge');
const { promisify } = require('util');
const creds = require('../../../../../key_rootdir/smartcampus-1b31f-firebase-adminsdk-qamsd-a188096453.json');

function listOfIntents(rows) {
  const intents = [];
  rows.forEach( page => {
    page.forEach( faq => {
      const data = { ...faq };
      intents.push(data.intent);
    });
  });
  return intents;
}

function listOfQuestions(cells) {
  const trainRequestions = {};
  let intent;
  for (const cell of cells) {
    if (cell.col === 1) {
      intent = cell.value;
      trainRequestions[intent] = [];
    } else trainRequestions[intent].push(cell.value);
  }
  return trainRequestions;
}

const convert = async googleSheet => {
  const doc = new GoogleSpreadsheet(googleSheet);
  await promisify(doc.useServiceAccountAuth)(creds);
  const info = await promisify(doc.getInfo)();
  const sheetLength = info.worksheets.length;
  const sheet = info.worksheets;
  const rows = [];

  for (let i = 0; i < sheetLength; i += 1) {
    rows.push(
      await promisify(sheet[i].getRows)({
        offset: 1,
      })
    );
  }
  //Promise.all(rows);

  console.log('parse done');
  console.log(
    'JSON file should contain utterances. Next step is to create an app with the intents and entities it found.'
  );

  // intents is all the faq intent
  const intents = listOfIntents(rows);
  // questions is an object with format : 'intent': [all the train questions...]
  let questions = {};

  for (let i = 0; i < sheetLength; i += 1) {
    const cells = await promisify(sheet[i].getCells)({
      'min-row': 2,
      'min-col': 1,
      'return-empty': false,
    });
    questions = merge(questions, listOfQuestions(cells));
  }

  const model = {
    intents,
    questions,
  };
  return model;
};

module.exports = convert;
