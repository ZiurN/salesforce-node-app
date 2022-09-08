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
                          if (accounts[i].CustomerID__c === accountToAdd.CustomerID__c) {
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

const updateAccountsLocally = (accountsToUpdate) => {
    db.read().then(() => {
      const { accounts } = db.data;
      accounts.forEach(account => {
        accountsToUpdate.forEach(accountToUpdate => {
          if (account.External_ID__c == accountToUpdate.External_ID__c && !account.Id) {
            account.Id = accountToUpdate.Id;
          }
        });
      });
	  let updatedAccounts = accounts.filter(account => account.Id);
	  db.data.accounts = updatedAccounts;
	  db.write();
    }).catch(error => {console.log(error)});
}

const getBranches = () => {
  return new Promise((resolve, reject) => {
    db.read().then(() => {
      const { branches } = db.data;
      if (branches && branches.length > 0) {
          resolve(branches);
      } else {
          resolve([]);
      }
    }).catch(error => {console.log(error); reject(error);});
  });
}

export {addAccounts, getAccounts, updateAccountsLocally, getBranches}