import jsforce from 'jsforce';
import { aureumTest } from './oauth.js';
import { updateRecordsWithoutId, updateRecordsLocally } from './database.js';

const currentSfEnv = aureumTest;
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
  const CRUDRecords = (sObjectName, CRUDOperation, records) => {
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
  const getRecordsByIdList = (sObjectName, idList, fields) => {
    return new Promise((resolve, reject) => {
		login().then((conn) => {
		  conn.sobject(sObjectName).find({Id: {$in: idList} }, fields).execute((err, records) => {
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
      CRUDRecords('Account', 'insert', accountsToinsert).then((results) => {
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
      CRUDRecords('Contact', 'insert', contactsToInsert).then((results) => {
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
      CRUDRecords('Case', 'insert', casesToInsert).then((results) => {
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
  const updateCases = (casesToUpdate) => {
    return new Promise((resolve, reject) => {
      CRUDRecords('Case', 'update', casesToUpdate).then((results) => {
		console.log(results);
        if (results.ids.length > 0) {
          let fields = {
			Id: 1,
			LastModifiedDate: 1,
			OwnerId: 1,
			Reason: 1,
			Priority: 1,
			Product__c: 1,
			Status: 1,
			IsStopped: 1,
			Type: 1,
			Description: 1
		  }
          let ids = results.ids.filter(id => id.Id);
          if (ids.length > 0) {
            getRecordsByIds('Case', ids, fields).then((records) => {
              if (records.length > 0) {
                updateRecordsLocally(records, 'cases', 'Id');
                resolve(results);
              }
            }).catch((err) => {
              reject(err);
            });
          } else {
            reject('There are not cases to look for');
          }
        } else if (results.ids.length == 0 && results.errors.length > 0){
			reject(results.errors);
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
      CRUDRecords('Opportunity', 'insert', opportunitiesToInsert).then((results) => {
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

export { insertAccounts, insertContacts, insertCases, insertOpportunities, updateCases, getRecordsByIds, getRecordsByIdList }