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
		if (!accountsToAdd || accountsToAdd.length === 0) { resolve('There are no accounts to add') }
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
					resolve('There are no accounts to add')
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

export {addAccounts}