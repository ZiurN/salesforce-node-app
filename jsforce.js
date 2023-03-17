import jsforce from 'jsforce';
import { ziurfreelance } from './oauth.js';
import { updateRecordsWithoutId } from './database.js';

const currentSfEnv = ziurfreelance;
/*
* General Salesforce API methods
*/
  const login = () => {
    return new Promise((resolve, reject) => {
      const conn = new jsforce.Connection(currentSfEnv.oauth2);
      conn.login(currentSfEnv.username, currentSfEnv.password, function(err, userInfo) {
        if (err) { return reject(err); }
        console.log(conn.accessToken);
        console.log(conn.instanceUrl);
        console.log("User ID: " + userInfo.id);
        console.log("Org ID: " + userInfo.organizationId);
        resolve(conn);
      });
    });
  }
  const insertRecords = (sObjectName, CRUDOperation, records) => {
    return new Promise((resolve, reject) => {
      login().then((conn) => {
        let results = {};
        let ids = [];
        let errors = [];
        conn.bulk.pollTimeout = 250000; // Bulk timeout can be specified globally on the connection object
        conn.bulk.load(sObjectName, CRUDOperation, records, function(err, rets) {
          if (err) { reject(console.error(err)); }
          for (var i=0; i < rets.length; i++) {
            let queryObj = {};
            if (rets[i].success) {
              queryObj.Id = rets[i].id;
              ids.push(queryObj);
            } else {
              queryObj.error = "#" + (i+1) + " error occurred, message = " + rets[i].errors.join(', ');
              errors.push(queryObj);
            }
          }
          results = {ids, errors};
          resolve(results);
        });
      }).catch((err) => {
        reject(err);
      });
    });
  }
  const getRecordsByIds = (sObjectName, ids, fields) => {
    return new Promise((resolve, reject) => {
      login().then((conn) => {
        conn.sobject(sObjectName).find({$or: ids}, fields).execute((err, records) => {
          if (err) { reject(console.error(err)); }
          resolve(records);
        });
      }).catch((err) => {
        reject(err);
      });
    });
  }
/*
* Account CRUD methods
*/
  const insertAccounts = (accountsToinsert) => {
    return new Promise((resolve, reject) => {
      insertRecords('Account', 'insert', accountsToinsert).then((results) => {
        if (results.ids.length > 0) {
          let fields = { Id: 1, au_External_ID__c: 1 }
          let ids = results.ids.filter(id => id.Id);
          if (ids.length > 0) {
            getRecordsByIds('Account', ids, fields).then((records) => {
              if (records.length > 0) {
                console.log(records);
                updateRecordsWithoutId(records, 'accounts', 'au_External_ID__c');
                resolve(results);
              }
            }).catch((err) => {
              reject(err);
            });
          } else {
            reject('There are not accounts to look for');
          }
        } else if (results.ids.length == 0 && results.errors.length > 0) {
          reject(results.errors);
        }
      }).catch((err) => {
        reject(err);
      });
    });
  }
/*
* Contact CRUD methods
*/
  const insertContacts = (contactsToInsert) => {
    return new Promise((resolve, reject) => {
      insertRecords('Contact', 'insert', contactsToInsert).then((results) => {
        if (results.ids.length > 0) {
          let fields = { Id: 1, au_External_ID__c: 1 }
          let ids = results.ids.filter(id => id.Id);
          if (ids.length > 0) {
            getRecordsByIds('Contact', ids, fields).then((records) => {
              if (records.length > 0) {
                updateRecordsWithoutId(records, 'contacts', 'au_External_ID__c');
                resolve(results);
              }
            }).catch((err) => {
              reject(err);
            });
          } else {
            reject('There are not contacts to look for');
          }
        } else if (results.ids.length == 0 && results.errors.length > 0) {
          reject(results.errors);
        }
      }).catch((err) => {
        reject(err);
      });
    });
  }
/*
* Case CRUD methods
*/
  const insertCases = (casesToInsert) => {
    return new Promise((resolve, reject) => {
      insertRecords('Case', 'insert', casesToInsert).then((results) => {
        if (results.ids.length > 0) {
          let fields = { Id: 1, Case_ExternalId__c: 1 }
          let ids = results.ids.filter(id => id.Id);
          if (ids.length > 0) {
            getRecordsByIds('Case', ids, fields).then((records) => {
              if (records.length > 0) {
                updateRecordsWithoutId(records, 'cases', 'Case_ExternalId__c');
                resolve(results);
              }
            }).catch((err) => {
              reject(err);
            });
          } else {
            reject('There are not cases to look for');
          }
        }
      }).catch((err) => {
        reject(err);
      });
    });
  }
/*
* Opportunity CRUD methods
*/
  const insertOpportunities = (opportunitiesToInsert) => {
    return new Promise((resolve, reject) => {
      insertRecords('Opportunity', 'insert', opportunitiesToInsert).then((results) => {
        if (results.ids.length > 0) {
          let fields = { Id: 1, TrackingNumber__c: 1 }
          let ids = results.ids.filter(id => id.Id);
          if (ids.length > 0) {
            getRecordsByIds('Opportunity', ids, fields).then((records) => {
              if (records.length > 0) {
                updateRecordsWithoutId(records, 'opportunities', 'TrackingNumber__c');
                resolve(results);
              }
            }).catch((err) => {
              reject(err);
            });
          } else {
            reject('There are not cases to look for');
          }
        }
      }).catch((err) => {
        reject(err);
      });
    });
  }

const getCasesFromSF = (conn, ids) => {
  console.log(ids);
  return new Promise((resolve, reject) => {
    conn.sobject('Case').find(
      {$or: ids},
      { Id: 1, Case_ExternalId__c: 1 }).execute((err, cases) => {
        if (err) { reject(console.error(err)); }
        updateCasesCreatedLocally(cases).them((result) => {
          console.log('result');
          console.log(result);
        }).catch((error) => {
          console.log('error');
          console.log(error);
        });
      });
  })
}
const getOpportunitiesFromSF = (conn, ids) => {
  console.log(ids);
  return new Promise((resolve, reject) => {
    conn.sobject('Opportunity').find(
    {$or: ids},
    { Id: 1, TrackingNumber__c: 1 }).execute((err, opportunities) => {
      if (err) { reject(console.error(err)); }
      updateOpportunitiesCreatedLocally(opportunities).them((result) => {
      console.log('result');
      }).catch((error) => {
      console.log('error');
      console.log(error);
      });
    });
  })
}
const getCasesFromSFFromStart = (ids) => {
  return new Promise((resolve, reject) => {
    var conn = new jsforce.Connection(currentSfEnv.oauth2);
    conn.login(currentSfEnv.username, currentSfEnv.password, function(err, userInfo) {
      if (err) { return console.error(err); }
      // Now you can get the access token and instance URL information.
      // Save them to establish connection next time.
      console.log(conn.accessToken);
      console.log(conn.instanceUrl);
      // logged in user property
      console.log("User ID: " + userInfo.id);
      console.log("Org ID: " + userInfo.organizationId);
      getCasesFromSF(conn, ids).then(result => {resolve(result);}).catch(error => {reject(error)});
      });
  });
}

export { insertAccounts, insertContacts, insertCases, insertOpportunities, getCasesFromSFFromStart }