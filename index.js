import { createRecords, getAllRecords, updateRecordsLocally } from "./database.js";
import { createFakeBusinessAccount, createFakeContacts, createFakeCases, createFakeOpportunities, fakeUpdateCases } from "./fakeData.js";
import { insertAccounts, insertContacts, insertCases, insertOpportunities, updateCases, getRecordsByIdList } from "./jsforce.js";
import { CASE, OPPORTUNITY } from "./sfMetadata.js";

const today = new Date();
const metadata = {
  Case: CASE,
  Opportunity: OPPORTUNITY
}
/*
  * Local Actions - Create Records Locally
*/
  const createAccountsLocally = (numberOfAccountsToCreate) => {
    let accountsToCreate = createFakeBusinessAccount(numberOfAccountsToCreate);
    createRecords(accountsToCreate, 'accounts', 'au_External_Id__c').then((results) => {
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
    getAllRecords('accounts').then((accounts) => {
      getAllRecords('contacts').then((contacts) => {
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
          let contactsToCreate = createFakeContacts(relatedAccountsInfo);
          createRecords(contactsToCreate, 'contacts', 'au_External_Id__c').then((results) => {
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
    getAllRecords('accounts').then((accounts) => {
      getAllRecords('contacts').then((contacts) => {
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
    getAllRecords('accounts').then((accounts) => {
      getAllRecords('contacts').then((contacts) => {
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
          let opportunitiesToCreate = createFakeOpportunities(relatedAccountsAndContactsInfo);
          createRecords(opportunitiesToCreate, 'opportunities', 'TrackingNumber__c').then((results) => {
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
  const insertRecordsInSalesforce = (tableName, promise) => {
    getAllRecords(tableName).then((records) => {
      let recordsToInsert = records.filter(record => !record.Id);
      if (recordsToInsert.length > 0) {
        promise(recordsToInsert).then((results) => {
          if (results.errors.length > 0) {
            results.errors.forEach(error => console.log("error:" + error.error));
          }
          console.log(`${results.ids.length} ${tableName} inserted`);
        }).catch((error) => {
          if (error && error.length > 0) {
            error.forEach(error => console.log(error.error));
          } else { console.log(error); }
        });
      } else {
        console.log('No ' + tableName + ' to insert in Salesforce');
      }
    }).catch((error) => {
      console.log(error);
    });
  }
  const insertAccountsInSalesforce = () => {
    insertRecordsInSalesforce('accounts', insertAccounts);
  }
  const insertContactsInSalesforce = () => {
    insertRecordsInSalesforce('contacts', insertContacts);
  }
  const insertCasesInSalesforce = () => {
    insertRecordsInSalesforce('cases', insertCases);
  }
  const insertOpportunitiesInSalesforce = () => {
    insertRecordsInSalesforce('opportunities', insertOpportunities);
  }
/*
  * Salesforce Actions - Update FROM Salesforce
*/
  const updateRecordsFromSalesforce = (tableName, sObjectName, recordsToUpdate) => {
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
    getRecordsByIdList(sObjectName, ids, fields).then((records) => {
      updateRecordsLocally(records, tableName, 'Id');
    }).catch((error) => {
      console.log(error);
    });
  }
  const updateAllRecordsFromSalesforce = (tableName, sObjectName) => {
    getAllRecords(tableName).then((localRecords) => {
      updateRecordsFromSalesforce(tableName, sObjectName, localRecords);
    }).catch((error) => {
      console.log(error);
    })
  }
  const updateAllCasesFromSalesforce = () => {
    updateAllRecordsFromSalesforce('cases', 'Case');
  }
  const updateAllOpportunitiesFromSalesforce = () => {
    getAllRecords('opportunities').then((localRecords) => {
      let numberOfBatches = Math.floor(localRecords.length/300) + 1;
      let batches = [];
      for (let i = 0; i < numberOfBatches; i++) {
        batches.push(localRecords.slice(i*300, (i+1)*300));
      }
      if (batches.length > 0) {
        batches.forEach(batch => {
          updateRecordsFromSalesforce('opportunities', 'Opportunity', batch);
        });
      }
    });
  }
/*
  * Salesforce Actions - Update IN Salesforce
*/
  const updateCasesRandomly = (quantity) => {
    getAllRecords('cases').then((records) => {
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
        let updatedRecords = fakeUpdateCases(recordsToUpdate);
        if (updatedRecords && updatedRecords.length > 0) {
          updateCases(updatedRecords).then((results) => {
            if (results.errors.length > 0) {
              results.errors.forEach(error => console.log("error:" + error.error));
            }
            console.log(`${results.ids.length} cases updated`);
          }).catch((error) => {
            if (error && error.length > 0) {
              error.forEach(error => console.log(error.error));
            } else { console.log(error); }
          });
        }
      } else {
        console.log('No cases to update');
      }
    }).catch((error) => {
      console.log(error);
    })
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
  updateCasesRandomly
}