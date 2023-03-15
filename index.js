import { addAccounts, addContacts, addCases, addOpportunities, getContacts, getAccounts, getCases, getOpportunities, updateAccountsLocally, getCounts } from "./database.js";
import { createFakeAccouts, createFakeBusinessAccount, createFakeContacts, createFakeCases, createFakeOpportunities } from "./fakeData.js";
import { insertAccounts, insertContacts, insertCases, insertOpportunities, getCasesFromSFFromStart } from "./jsforce.js";

const createAccountsLocally = (numberOfAccountsToCreate) => {
  let accounts = createFakeBusinessAccount(numberOfAccountsToCreate);
  addAccounts(accounts).then(() => {
    console.log('OK');
  }).catch((error) => {
    console.log(error);
  });
}
const createContactsForAccountsLocally = () => {
  getAccounts()
    .then((accounts) => {
      getContacts()
        .then((contacts) => {
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
            addContacts(contactsToCreate)
              .then((contacts) => {
                console.log(contacts);
              })
              .catch((error) => {
                console.log(error);
              });
          } else {
            console.log("No accounts without contacts to create");
          }
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .catch((error) => {
      console.log(error);
    });
}
const createCasesForAccountsLocally = () => {
  getAccounts()
    .then((accounts) => {
      getContacts()
        .then((contacts) => {
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
            let casesToAdd = createFakeCases(relatedAccountsInfo);
            addCases(casesToAdd)
            .then((cases) => {
              console.log(cases);
            })
            .catch((error) => {
              console.log(error);
            });
          } else {
            console.log('??');
          }
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .catch((error) => {
      console.log(error);
    });
}
const createOpportunitiesForAccountsLocally = () => {
  getAccounts()
    .then((accounts) => {
      getContacts()
        .then((contacts) => {
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
            let casesToAdd = createFakeOpportunities(relatedAccountsAndContactsInfo);
            addOpportunities(casesToAdd)
            .then((opportunities) => {
              console.log(opportunities);
            })
            .catch((error) => {
              console.log(error);
            });
          } else {
            console.log('??');
          }
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .catch((error) => {
      console.log(error);
    });
}
const upsertAccountsInSalesforce = () => {
  getAccounts()
    .then((accounts) => {
      insertAccounts(accounts)
        .then((result) => {
          console.log('Cuentas insertadas?');
        }).catch((error) => {
          console.log(error);
        });
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
  upsertAccountsInSalesforce,
  createContactsForAccountsLocally,
  upsertContactsInSalesforce,
  createCasesForAccountsLocally,
  upsertCasesInSalesforce,
  updateCasesLocally,
  getInfo,
  createOpportunitiesForAccountsLocally,
  upsertOpportunitiesInSalesforce
}