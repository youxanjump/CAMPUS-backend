const GoogleSpreadsheet = require('google-spreadsheet');
const merge = require('deepmerge');
const { promisify } = require('util');
const creds = require('../../../../../key_rootdir/smartcampus-1b31f-firebase-adminsdk-qamsd-a188096453.json');

function listOfIntentsAndQuestions(cells) {
  const questions = {};
  const intents = [];
  for (const cell of cells) {
    if (cell.col === 1) {
      intents.push(cell.value);
      questions[cell.value] = [];
    } else {
      questions[intents[intents.length - 1]].push(cell.value);
      /* console.log(
        `Parsing qustion '${
          questions[intents[intents.length - 1]][
            questions[intents[intents.length - 1]].length - 1
          ]
        }' to the intent '${intents[intents.length - 1]}'`
      ); */
    }
  }
  return { intents, questions };
}

const convert = async googleSheet => {
  const doc = new GoogleSpreadsheet(googleSheet);
  await promisify(doc.useServiceAccountAuth)(creds);
  const info = await promisify(doc.getInfo)();
  const sheetLength = info.worksheets.length;
  const sheet = info.worksheets;

  console.log('Start parsing Google Sheet...');
  const intents = [];
  let questions = {};

  for (let i = 0; i < sheetLength; i += 1) {
    const cells = await promisify(sheet[i].getCells)({
      'min-row': 2,
      'min-col': 1,
      'return-empty': false,
    });
    const listedIntentsAndQuestions = listOfIntentsAndQuestions(cells);
    questions = merge(questions, listedIntentsAndQuestions.questions);
    intents.push.apply(intents, listedIntentsAndQuestions.intents);
  }

  const model = {
    intents,
    questions,
  };
  console.log('parse done.');
  return model;
};

module.exports = convert;
