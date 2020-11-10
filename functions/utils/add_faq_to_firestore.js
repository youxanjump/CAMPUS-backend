// eslint-disable-line global-require
const GoogleSpreadsheet = require('google-spreadsheet');
const { promisify } = require('util');
const admin = require('firebase-admin');
const FirebaseAPI = require('../src/datasources/firebase');

const creds = require('../../../../key_rootdir/smartcampus-1b31f-firebase-adminsdk-qamsd-a188096453.json');

async function accessSpreadsheet() {
  const doc = new GoogleSpreadsheet(
    '1IFu5-BWDIfa5RaysQoUCzN4WJyU_Qg9bgZ356uexw4Y'
  );
  await promisify(doc.useServiceAccountAuth)(creds);
  const info = await promisify(doc.getInfo)();
  const sheet = info.worksheets;
  const sheetLength = info.worksheets.length;
  const firebaseAPIinstance = new FirebaseAPI({ admin });

  console.log('Start parsing Google Sheet...');

  for (let i = 0; i < sheetLength; i += 1) {
    const cells = await promisify(sheet[i].getCells)({
      'min-row': 2,
      'min-col': 1,
      'return-empty': false,
    });
    let intent, answer;
    for (const cell of cells) {
      let ifAnswerSetted = false;
      if (cell.col === 1) {
        intent = cell.value;
      } else if(cell.col === 2){
        answer = cell.value;
        ifAnswerSetted = true;
      }
      if(ifAnswerSetted){
        await firebaseAPIinstance.addNewIntent({intent, answer});
        console.log(`Success Add Intent : ${intent}\tAnswer : ${answer}\n`);
      }
    }
  }
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: 'gs://smartcampus-1b31f.appspot.com',
});

accessSpreadsheet();
