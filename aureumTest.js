import { Database } from "./database.js";
import { OAuht2 } from "./oauth.js";
import { JSForce } from "./jsforce.js";
import { AureumFakeData } from "./fakeData/aureumTest.js";
import { CASE, OPPORTUNITY } from "./metadata/aureumTest.js";

const today = new Date();
const oauth2 = new OAuht2();
const jsForce = new JSForce(oauth2.aureumTest);
const fakeData = new AureumFakeData();
const database = new Database('aureumTest');
const metadata = {
  Case: CASE,
  Opportunity: OPPORTUNITY
}
/*
  * Local Actions - Create Records Locally
*/
  const createAccountsLocally = (numberOfAccountsToCreate) => {
    let accountsToCreate = fakeData.createFakeBusinessAccount(numberOfAccountsToCreate);
    database.createRecords(accountsToCreate, 'Account', 'au_External_Id__c').then((results) => {
      if (results.length > 0) {
        console.log('Created ' + results.length + ' accounts');
      } else {
        console.log('No accounts created');
      }
    }).catch((error) => {
      console.log(error);
    });
  }
  const createContactsForAccountsLocally = () => {
    database.getAllRecords('Account').then((accounts) => {
    database.getAllRecords('Contact').then((contacts) => {
        let accountsWhichContactAreGoingToBeCreated = accounts.filter(account => {
          let accountHasNotContacts = false;
          if (account.Id && contacts && contacts.length > 0) {
            let filteredContacts = contacts.filter(contact => {
              contact.AccountId == account.Id
            });
            accountHasNotContacts = !(filteredContacts.length > 0);
          } else if (account.Id) {
            accountHasNotContacts = true;
          }
          return accountHasNotContacts;
        });
        if (accountsWhichContactAreGoingToBeCreated.length > 0) {
          let relatedAccountsInfo = new Map();
          accounts.forEach(account => {
            relatedAccountsInfo.set(account.Id, Math.floor(Math.random()*4) + 1);
          });
          let contactsToCreate = fakeData.createFakeContacts(relatedAccountsInfo);
          database.createRecords(contactsToCreate, 'Contact', 'au_External_Id__c').then((results) => {
            if (results.length > 0) {
              console.log('Created ' + results.length + ' contacts');
            } else {
              console.log('No contacts created');
            }
          }).catch((error) => {
            console.log(error);
          });
        } else {
          console.log("No accounts without contacts to create");
        }
      }).catch((error) => {
        console.log(error);
      });
    })
    .catch((error) => {
      console.log(error);
    });
  }
  const createCasesForAccountsLocally = () => {
    database.getAllRecords('Account').then((accounts) => {
    database.getAllRecords('Contact').then((contacts) => {
        let relatedAccountsInfo = [];
        accounts.forEach((account) => {
          if (account.Id) {
            let accountContacts = contacts.filter((contact) => {
              return contact.AccountId == account.Id
            });
            if (accountContacts && accountContacts.length > 0) {
              let relatedAccountInfo = {};
              relatedAccountInfo.accountId = account.Id;
              let relatedContactsInfo = new Map();
              accountContacts.forEach(contact => {
                relatedContactsInfo.set(contact.Id, Math.floor(Math.random()*4) + 1);
              });
              relatedAccountInfo.relatedContactsInfo = relatedContactsInfo;
              relatedAccountsInfo.push(relatedAccountInfo);
            }
          }
        });
        if (relatedAccountsInfo.length > 0) {
          let casesToCreate = createFakeCases(relatedAccountsInfo);
          createRecords(casesToCreate, 'cases', 'Case_ExternalId__c').then((results) => {
            if (results.length > 0) {
              console.log('Created ' + results.length + ' cases');
            } else {
              console.log('No cases created');
            }
          }).catch((error) => {
            console.log(error);
          });
        } else {
          console.log('There are no related accounts or contacts to create cases for');
        }
      }).catch((error) => {
        console.log(error);
      });
    }).catch((error) => {
      console.log(error);
    });
  }
  const createOpportunitiesForAccountsLocally = () => {
    database.getAllRecords('Account').then((accounts) => {
    database.getAllRecords('Contact').then((contacts) => {
        let relatedAccountsAndContactsInfo = [];
        accounts.forEach((account) => {
          if (account.Id) {
            let accountContacts = contacts.filter((contact) => {
              return contact.AccountId == account.Id
            });
            if (accountContacts && accountContacts.length > 0) {
              accountContacts.forEach(contact => {
                let relatedAccountAndContactInfo = {
                  account,
                  contact,
                  numberOfOpportunities: Math.floor(Math.random()*4) + 1
                };
                relatedAccountsAndContactsInfo.push(relatedAccountAndContactInfo);
              });
            }
          }
        });
        if (relatedAccountsAndContactsInfo.length > 0) {
          let opportunitiesToCreate = fakeData.createFakeOpportunities(relatedAccountsAndContactsInfo);
          database.createRecords(opportunitiesToCreate, 'opportunities', 'TrackingNumber__c').then((results) => {
            if (results.length > 0) {
              console.log('Created ' + results.length + ' opportunities');
            } else {
              console.log('No Opportunities created');
            }
          })
          .catch((error) => {
            console.log(error);
          });
        } else {
          console.log('There are no related accounts or contacts to create opportunities for');
        }
      }).catch((error) => {
        console.log(error);
      });
    }).catch((error) => {
      console.log(error);
    });
  }
/*
  * Salesforce Actions - Insert IN Salesforce
*/
  const insertRecordsInSalesforce = (tableName, promise, IdField) => {
    database.getAllRecords(tableName).then((records) => {
      let recordsToInsert = records.filter(record => !record.Id);
      if (recordsToInsert.length > 0) {
        promise(tableName, 'insert', recordsToInsert).then((results) => {
          if (results.ids.length > 0) {
            let fields = {};
            fields['Id'] = 1;
            fields[IdField]
            let ids = results.ids.filter(id => id.Id);
            if (ids.length > 0) {
              jsForce.getRecordsByIds(tableName, ids, fields).then((records) => {
                if (records.length > 0) {
                  console.log(records);
                  database.updateRecordsWithoutId(records, tableName, IdField);
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
      } else {
        console.log('No ' + tableName + ' to insert in Salesforce');
      }
    }).catch((error) => {
      console.log(error);
    });
  }
  const insertAccountsInSalesforce = () => {
    insertRecordsInSalesforce('Account', jsForce.CRUDRecords, 'au_External_Id__c');
  }
  const insertContactsInSalesforce = () => {
    insertRecordsInSalesforce('Contact', jsForce.CRUDRecords, 'au_External_Id__c');
  }
  const insertCasesInSalesforce = () => {
    insertRecordsInSalesforce('Case', jsForce.CRUDRecords, 'Case_ExternalId__c');
  }
  const insertOpportunitiesInSalesforce = () => {
    insertRecordsInSalesforce('Opportunity', jsForce.CRUDRecords,'TrackingNumber__c');
  }
/*
  * Salesforce Actions - Update FROM Salesforce
*/
  const updateRecordsFromSalesforce = (sObjectName, recordsToUpdate) => {
    let ids = [];
    recordsToUpdate.forEach((recordToUpdate) => {
      ids.push(recordToUpdate.Id);
    });
    let fields = {
      LastModifiedDate: 1
    }
    metadata[sObjectName].tracked_fields.forEach(field => {
      fields[field] = 1
    });
    fields.Id = 1
    jsForce.getRecordsByIdList(sObjectName, ids, fields).then((records) => {
      database.updateRecordsLocally(records, sObjectName, 'Id');
    }).catch((error) => {
      console.log(error);
    });
  }
  const updateAllRecordsFromSalesforce = (sObjectName) => {
    database.getAllRecords(sObjectName).then((localRecords) => {
      updateRecordsFromSalesforce(sObjectName, localRecords);
    }).catch((error) => {
      console.log(error);
    })
  }
  const updateAllCasesFromSalesforce = () => {
    updateAllRecordsFromSalesforce('Case');
  }
  const updateAllOpportunitiesFromSalesforce = () => {
    database.getAllRecords('Opportunity').then((localRecords) => {
      let numberOfBatches = Math.floor(localRecords.length/300) + 1;
      let batches = [];
      for (let i = 0; i < numberOfBatches; i++) {
        batches.push(localRecords.slice(i*300, (i+1)*300));
      }
      if (batches.length > 0) {
        batches.forEach(batch => {
          updateRecordsFromSalesforce('Opportunity', batch);
        });
      }
    });
  }
/*
  * Salesforce Actions - Update IN Salesforce
*/
  const updateRecordsRandomly = (tableName, promise, fakeFunction, quantity, fields) => {
    database.getAllRecords(tableName).then((records) => {
      let recordsToUpdate = records.filter(record => {
        let lastModifiedDate = new Date(record.LastModifiedDate);
        let yesteday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
        return yesteday >= lastModifiedDate;
      });
      if (recordsToUpdate
          && recordsToUpdate.length > 0
          && recordsToUpdate.length > quantity) {
        recordsToUpdate = recordsToUpdate.slice(0, quantity);
      }
      if (recordsToUpdate && recordsToUpdate.length > 0) {
        let updatedRecords = fakeFunction(recordsToUpdate);
        if (updatedRecords && updatedRecords.length > 0) {
          console.log(updatedRecords);
          promise(tableName, 'update', updatedRecords).then((results) => {
            if (results.ids.length > 0) {
              let ids = results.ids.filter(id => id.Id);
              if (ids.length > 0) {
                jsForce.getRecordsByIds(tableName, ids, fields).then((records) => {
                  if (records.length > 0) {
                    console.log(records);
                    database.updateRecordsLocally(records, tableName, 'Id');
                    console.log('Updated ' + records.length + ' records of the ' + tableName + ' table');
                  }
                }).catch((err) => {
                  console.log(err);
                });
              } else {
                console.log(err);
              }
            } else if (results.ids.length == 0 && results.errors.length > 0){
              console.log(results.errors);
            }
          }).catch((error) => {
            console.log(error);
          });
        }
      } else {
        console.log(`No ${tableName} to updated`);
      }
    }).catch((error) => {
      console.log(error);
    })
  }
  const updateCasesRandomly = (quantity) => {
    let fields = {Id: 1};
    metadata.Case.tracked_fields.forEach(field => {
      fields[field] = 1;
    });
    updateRecordsRandomly('Case', jsForce.CRUDRecords, fakeData.fakeUpdateCases, quantity, fields);
  }
  const updateOpportunitiesRandomly = (quantity) => {
    let fields = {Id: 1};
    metadata.Opportunity.tracked_fields.forEach(field => {
      fields[field] = 1;
    });
    updateRecordsRandomly('Opportunity', jsForce.CRUDRecords, fakeData.fakeUpdateOpportunities, quantity, fields);
  }
export {
  createAccountsLocally,
  createContactsForAccountsLocally,
  createCasesForAccountsLocally,
  createOpportunitiesForAccountsLocally,
  insertAccountsInSalesforce,
  insertContactsInSalesforce,
  insertCasesInSalesforce,
  insertOpportunitiesInSalesforce,
  updateAllCasesFromSalesforce,
  updateAllOpportunitiesFromSalesforce,
  updateCasesRandomly,
  updateOpportunitiesRandomly
}