import { createRecords, getAllRecords, getCounts } from "./database.js";
import { createFakeBusinessAccount, createFakeContacts, createFakeCases, createFakeOpportunities } from "./fakeData.js";
import { insertAccounts, insertContacts, insertCases, insertOpportunities, getCasesFromSFFromStart } from "./jsforce.js";

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
          console.log(accountContacts);
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
            console.log('Created ' + results.length + '  cases');
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
        addOpportunities(opportunitiesToCreate).then((results) => {
          if (results.length > 0) {
            console.log('Created ' + results.length + '  cases');
          } else {
            console.log('No cases created');
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
const insertAccountsInSalesforce = () => {
  getAllRecords('accounts').then((accounts) => {
    let accountsToInsert = accounts.filter(account => !account.Id);
    if (accountsToInsert.length > 0) {
      insertAccounts(accountsToInsert).then((results) => {
        if (results.errors.length > 0) {
          results.errors.forEach(error => console.log("error:" + error.error));
        }
        console.log(results.ids.length + ' accounts inserted');
      }).catch((error) => {
        if (error && error.length > 0) {
          error.forEach(error => console.log(error));
        } else { console.log(error); }
      });
    } else {
      console.log('No accounts to insert in Salesforce');
    }
  }).catch((error) => {
    console.log(error);
  });
}
const upsertContactsInSalesforce = () => {
  getContacts()
    .then((contacts) => {
      insertContacts(contacts)
        .then((result) => {
          console.log('contactos insertados');
        }).catch((error) => {
          console.log(error);
        });
    }).catch((error) => {
      console.log(error);
    });
}
const upsertCasesInSalesforce = () => {
  getCases()
    .then((cases) => {
      insertCases(cases)
        .then((result) => {
          console.log('casos insertados');
        }).catch((error) => {
          console.log(error);
        });
    }).catch((error) => {
      console.log(error);
    });
}
const upsertOpportunitiesInSalesforce = () => {
  getOpportunities()
    .then((opportunities) => {
      insertOpportunities(opportunities)
      .then((result) => {
      console.log('opportunidades insertadas');
      }).catch((error) => {
      console.log(error);
      });
    }).catch((error) => {
    console.log(error);
    });
  }
const updateCasesLocally = () => {
  getCases()
    .then((cases) => {
      let idList = [];
      cases.forEach(localCase => {
        idList.push({Case_ExternalId__c: localCase.Case_ExternalId__c})
      });
      if (idList.length > 0) {
        getCasesFromSFFromStart(idList)
      }
    }).catch((error) => {
      console.log(error);
    });
}
const getInfo = () => {
  getCounts();
}
export {
  createAccountsLocally,
  insertAccountsInSalesforce,
  createContactsForAccountsLocally,
  upsertContactsInSalesforce,
  createCasesForAccountsLocally,
  upsertCasesInSalesforce,
  updateCasesLocally,
  getInfo,
  createOpportunitiesForAccountsLocally,
  upsertOpportunitiesInSalesforce
}