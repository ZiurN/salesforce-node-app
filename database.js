import { join, dirname } from 'path';
import { Low, JSONFile } from 'lowdb';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Use JSON file for storage
const file = join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

const createRecords  = (recordsToAdd, tableName, idField) => {
  return new Promise((resolve, reject) => {
    let rejectMessage = 'There are no '+ tableName +' to add';
    if (!recordsToAdd || recordsToAdd.length === 0) { reject(rejectMessage) }
      db.read().then(() => {
      db.data ||= { tableName: [] }
      let records = db.data[tableName];
      if (records.length > 0) {
        recordsToAdd = recordsToAdd.filter((recordToAdd => {
          let isValid = true;
          for (let i = 0 ; i < records.length ; i++) {
            if (records[i][idField] === recordToAdd[idField]) {
              isValid = false;
              break;
            }
            return isValid;
          }
        }));
      }
      if (recordsToAdd && recordsToAdd.length > 0) {
        records.push(...recordsToAdd);
      } else {
        reject(rejectMessage);
      }
      try {
        db.write()
        resolve(recordsToAdd);
      } catch (error) {
        reject(error);
      }
      });
  });
}
const getAllRecords = (tableName) => {
  return new Promise((resolve, reject) => {
    db.read().then(() => {
      const records = db.data[tableName];
      if (records && records.length > 0) {
        resolve(records);
      } else {
        resolve([]);
      }
    }).catch(error => {
      console.log(error); reject(error)
    });
  });
}
const updateRecordsWithoutId = (recordsToUpdate, tableName, idField) => {
  db.read().then(() => {
    const records = db.data[tableName];
    let updatedRecords = records.map(record => {
      for (let i = 0 ; i < recordsToUpdate.length ; i++) {
        if (record[idField] === recordsToUpdate[i][idField] && !record.Id) {
          record = {...record,...recordsToUpdate[i]}
          break;
        }
      }
      return record;
    });
    db.data[tableName] = updatedRecords;
    db.write();
  }).catch(error => {
    console.log(error);
  });
}
const getCounts = () => {
  return new Promise((resolve, reject) => {
    db.read().then(() => {
      const { accounts, contacts, cases } = db.data;
      console.log("Accounts: " + accounts.length);
      console.log("Contacts: " + contacts.length);
      console.log("Cases: " + cases.length);
    }).catch(error => {console.log(error); reject(error)})
  });
}
export { createRecords, getAllRecords, updateRecordsWithoutId, getCounts }