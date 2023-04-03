import { join, dirname } from 'path';
import { Low, JSONFile } from 'lowdb';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

class Database {
  constructor (database) {
    this.database = database;
    this.file = join(__dirname, './db/'+ this.database + '.json');
    this.adapter = new JSONFile(this.file);
    this.db = new Low(this.adapter);
  }
  /** Methods */
  createRecords  = (recordsToAdd, tableName, idField) => {
    return new Promise((resolve, reject) => {
      let rejectMessage = 'There are no '+ tableName +' to add';
      if (!recordsToAdd || recordsToAdd.length === 0) { reject(rejectMessage) }
      this.db.read().then(() => {
      this.db.data ||= { tableName: [] }
      let records = this.db.data[tableName];
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
        this.db.write();
        resolve(recordsToAdd);
      } catch (error) {
        reject(error);
      }
      });
    });
  }
  getAllRecords = (tableName) => {
    return new Promise((resolve, reject) => {
      this.db.read().then(() => {
      const records = this.db.data[tableName];
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
  updateRecordsWithoutId = (recordsToUpdate, tableName, idField) => {
    this.db.read().then(() => {
      const records = this.db.data[tableName];
      let updatedRecords = records.map(record => {
        for (let i = 0 ; i < recordsToUpdate.length ; i++) {
          if (record[idField] === recordsToUpdate[i][idField] && !record.Id) {
          record = {...record,...recordsToUpdate[i]}
          break;
          }
        }
        return record;
      });
      this.db.data[tableName] = updatedRecords;
      this.db.write();
    }).catch(error => {
      console.log(error);
    });
  }
  updateRecordsLocally = (recordsToUpdate, tableName, idField) => {
    this.db.read().then(() => {
      const records = this.db.data[tableName];
      let updatedRecords = records.map(record => {
      for (let i = 0 ; i < recordsToUpdate.length ; i++) {
        if (record[idField] === recordsToUpdate[i][idField]) {
        record = {...record,...recordsToUpdate[i]}
        break;
        }
      }
      return record;
      });
      this.db.data[tableName] = updatedRecords;
      this.db.write();
    }).catch(error => {
      console.log(error);
    });
  }
  getCounts = () => {
    return new Promise((resolve, reject) => {
      this.db.read().then(() => {
      const { accounts, contacts, cases } = this.db.data;
      console.log("Accounts: " + accounts.length);
      console.log("Contacts: " + contacts.length);
      console.log("Cases: " + cases.length);
      }).catch(error => {console.log(error); reject(error)})
    });
  }
}
export { Database }