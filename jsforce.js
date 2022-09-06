import jsforce from 'jsforce';
import { UnicomerDev1, UnicomerHVSDEV, UnicomerHVSTST } from './oauth.js';

const currentSfEnv = UnicomerDev1;

const insertAccounts = (accountsToinsert) => {
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
      let ids = [];
      conn.bulk.pollTimeout = 250000; // Bulk timeout can be specified globally on the connection object
      conn.bulk.load("Account", "insert", accountsToinsert, function(err, rets) {
        if (err) { reject(console.error(err)); }
        for (var i=0; i < rets.length; i++) {
          let queryObj = {};
          if (rets[i].success) {
            console.log("#" + (i+1) + " loaded successfully, id = " + rets[i].id);
            ids.push(queryObj['Id'] = rets[i].id);
          } else {
            console.log("#" + (i+1) + " error occurred, message = " + rets[i].errors.join(', '));
          }
        }
        getAccountsFromSF(conn, ids).then(result => {resolve(result);}).catch(error => {reject(error)});
      });
    });
  });
}

const getAccountsFromSF = (conn, ids) => {
  return new Promise((resolve, reject) => {
    conn.sobject('Account').find(
      {$or: ids},
      { Id: 1, External_ID__c: 1 }).execute((err, accounts) => {
        if (err) { reject(console.error(err)); }
        resolve(accounts);
      });
  })
}

export { insertAccounts }