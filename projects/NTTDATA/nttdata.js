import { OAuth2 } from './oauth.js';
import { JSForce } from '../../jsForce/jsforce.js';
import fs from 'fs'

const oauht2 = new OAuth2();
const jsForceUnamerDev = new JSForce(oauht2.unamerDev);
const jsForceUnamerUAT = new JSForce(oauht2.unamerUAT);

const copyContacts = () => {
    jsForceUnamerUAT.getRecordsByQuery('SELECT Id, Name, Email, Phone FROM Contact LIMIT 10')
      .then(contacts => {
        console.log(contacts)
        fs.writeFileSync('contactsFromUAT.json', JSON.stringify(contacts))
      })
      .catch(err => console.log(err))
}
const countFieldsOnData = () => {
    let fields = {};
    let counter = 0;
    let stringTo = '';
    let defaultOrSystemFields = [

    ]
0;
    data.forEach(record => {
        stringTo += 'Record ' + counter + '\n';
        Object.keys(record).forEach(key => {
            stringTo += '\t' + key + ', ' + record[key] + '\n';
            if (record[key] && fields[key]) {
                fields[key] = fields[key] + 1;
            } else if (record[key] && !fields[key]) {
                fields[key] = 1;
            } else {
                fields[key] = 0;
            }
        })
        counter++;
        console.log('counter: ' + counter);
    })
    console.log(fields);
    let notEmptyfields = {};
    Object.keys(fields).forEach(key => {
        if (fields[key] !== 0) {
            notEmptyfields[key] = fields[key];
        }
    })
    let results = JSON.stringify(fields);
    fs.writeFileSync('results2.txt', results)
    fs.writeFileSync('stringTo.txt', stringTo);
    fs.writeFileSync('notEmptyfields.txt', JSON.stringify(notEmptyfields));
}

export {
  countFieldsOnData,
  copyContacts
}
