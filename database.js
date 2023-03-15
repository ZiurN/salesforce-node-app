import { join, dirname } from 'path';
import { Low, JSONFile } from 'lowdb';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Use JSON file for storage
const file = join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

const addAccounts = (accountsToAdd) => {
    return new Promise((resolve, reject) => {
      if (!accountsToAdd || accountsToAdd.length === 0) { reject('There are no accounts to add') }
        db.read().then(() => {
          db.data ||= { accounts: [] }
          const { accounts } = db.data;
          if (accounts.length > 0) {
            accountsToAdd = accountsToAdd.filter((accountToAdd => {
              let isValid = true;
              for (var i = 0 ; i < accounts.length ; i++) {
                if (accounts[i].au_External_Id__c === accountToAdd.au_External_Id__c) {
                  isValid = false;
                  break;
                }
                return isValid;
              }
            }));
          }
          if (accountsToAdd && accountsToAdd.length > 0) {
            accounts.push(...accountsToAdd);
          } else {
            reject('There are no accounts to add');
          }
          try {
            db.write()
            resolve(accounts);
          } catch (error) {
            reject(error);
          }
        });
  });
}
const addContacts = (contactsToAdd) => {
  return new Promise((resolve, reject) => {
    if (!contactsToAdd || contactsToAdd.length === 0) { reject('There are no accounts to add') }
      db.read().then(() => {
        db.data ||= { contacts: [] }
        const { contacts } = db.data;
        if (contacts.length > 0) {
          contactsToAdd = contactsToAdd.filter((contactToAdd => {
            let isValid = true;
            for (var i = 0 ; i < contacts.length ; i++) {
              if (contacts[i].au_External_Id__c === contactToAdd.au_External_Id__c) {
                isValid = false;
                break;
              }
              return isValid;
            }
          }));
        }
        if (contactsToAdd && contactsToAdd.length > 0) {
          console.log(contactsToAdd);
          contacts.push(...contactsToAdd);
        } else {
          reject('There are no accounts to add');
        }
        try {
          db.write()
          resolve(contacts);
        } catch (error) {
          reject(error);
        }
      });
});
}
const addCases = (casesToAdd) => {
  return new Promise((resolve, reject) => {
    if (!casesToAdd || casesToAdd.length === 0) { reject('There are no cases to add') }
    db.read().then(() => {
      db.data ||= { cases: [] }
      const { cases } = db.data;
      if (cases.length > 0) {
        casesToAdd = casesToAdd.filter((caseToAdd => {
          let isValid = true;
          for (var i = 0 ; i < cases.length ; i++) {
            if (cases[i].Case_ExternalId__c === caseToAdd.Case_ExternalId__c) {
              isValid = false;
              break;
            }
            return isValid;
          }
        }));
      }
      if (casesToAdd && casesToAdd.length > 0) {
        cases.push(...casesToAdd);
      } else {
        reject('There are no cases to add');
      }
      try {
        db.write()
        resolve(cases);
      } catch (error) {
        reject(error);
      }
    });
  });
}
const addOpportunities = (opportunitiesToAdd) => {
  return new Promise((resolve, reject) => {
    if (!opportunitiesToAdd || opportunitiesToAdd.length === 0) { reject('There are no opportunities to add') }
    db.read().then(() => {
    db.data ||= { opportunities: [] }
    const { opportunities } = db.data;
    if (opportunities.length > 0) {
      opportunitiesToAdd = opportunitiesToAdd.filter((opportunityToAdd => {
      let isValid = true;
      for (var i = 0 ; i < opportunities.length ; i++) {
        if (opportunities[i].TrackingNumber__c === opportunityToAdd.TrackingNumber__c) {
        isValid = false;
        break;
        }
        return isValid;
      }
      }));
    }
    if (opportunitiesToAdd && opportunitiesToAdd.length > 0) {
      opportunities.push(...opportunitiesToAdd);
    } else {
      reject('There are no opportunities to add');
    }
    try {
      db.write()
      resolve(opportunities);
    } catch (error) {
      reject(error);
    }
    });
  });
  }
const getAccounts = () => {
  return new Promise((resolve, reject) => {
    db.read().then(() => {
      const { accounts } = db.data;
      if (accounts && accounts.length > 0) {
          resolve(accounts);
      } else {
          resolve([]);
      }
    }).catch(error => {console.log(error); reject(error)})
  });
}
const getContacts = () => {
  return new Promise((resolve, reject) => {
    db.read().then(() => {
      const { contacts } = db.data;
      if (contacts && contacts.length > 0) {
          resolve(contacts);
      } else {
          resolve([]);
      }
    }).catch(error => {console.log(error); reject(error)})
  });
}
const getCases = () => {
  return new Promise((resolve, reject) => {
    db.read().then(() => {
      const { cases } = db.data;
      if (cases && cases.length > 0) {
          resolve(cases);
      } else {
          resolve([]);
      }
    }).catch(error => {console.log(error); reject(error)})
  });
}
const getOpportunities = () => {
  return new Promise((resolve, reject) => {
    db.read().then(() => {
    const { opportunities } = db.data;
    if (opportunities && opportunities.length > 0) {
      resolve(opportunities);
    } else {
      resolve([]);
    }
    }).catch(error => {console.log(error); reject(error)})
  });
}
const updateAccountsCreatedLocally = (accountsToUpdate) => {
  db.read().then(() => {
    const { accounts } = db.data;
    accounts.forEach(account => {
      accountsToUpdate.forEach(accountToUpdate => {
        if (account.au_External_Id__c == accountToUpdate.au_External_Id__c && !account.Id) {
          account.Id = accountToUpdate.Id;
        }
      });
    });
  let updatedAccounts = accounts.filter(account => account.Id);
  db.data.accounts = updatedAccounts;
  db.write();
  }).catch(error => {console.log(error)});
}
const updateContactsCreatedLocally = (contactsToUpdate) => {
  db.read().then(() => {
    const { contacts } = db.data;
    contacts.forEach(contact => {
      contactsToUpdate.forEach(contactToUpdate => {
        if (contact.au_External_Id__c == contactToUpdate.au_External_Id__c && !contact.Id) {
          contact.Id = contactToUpdate.Id;
        }
      });
    });
  let updateContact = contacts.filter(contact => contact.Id);
  db.data.contacts = updateContact;
  db.write();
  }).catch(error => {console.log(error)});
}
const updateCasesCreatedLocally = (casesToUpdate) => {
  console.log(casesToUpdate);
  db.read().then(() => {
    const { cases } = db.data;
    cases.forEach(localCase => {
      casesToUpdate.forEach(caseToUpdate => {
        if (localCase.Case_ExternalId__c == caseToUpdate.Case_ExternalId__c && !localCase.Id) {
          localCase.Id = caseToUpdate.Id;
        }
      });
    });
  let updatedCases = cases.filter(localCase => localCase.Id);
  db.data.cases = updatedCases;
  db.write();
  }).catch(error => {console.log(error)});
}
const updateOpportunitiesCreatedLocally = (opportunitiesToUpdate) => {
  db.read().then(() => {
    const { opportunities } = db.data;
    opportunities.forEach(localOpportunity => {
      opportunitiesToUpdate.forEach(opportunityToUpdate => {
        if (localOpportunity.TrackingNumber__c == opportunityToUpdate.TrackingNumber__c &&!localOpportunity.Id) {
          localOpportunity.Id = opportunityToUpdate.Id;
        }
      });
    });
  let updatedOpportunities = opportunities.filter(localOpportunity => localOpportunity.Id);
  db.data.opportunities = updatedOpportunities;
  db.write();
  }).catch(error => {console.log(error)});
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
export {
  addAccounts,
  addContacts,
  addCases,
  addOpportunities,
  getAccounts,
  getContacts,
  getCases,
  getOpportunities,
  updateAccountsCreatedLocally,
  updateContactsCreatedLocally,
  updateCasesCreatedLocally,
  updateOpportunitiesCreatedLocally,
  getCounts
}