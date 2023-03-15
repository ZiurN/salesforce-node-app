import jsforce from 'jsforce';
import { aureumTest } from './oauth.js';
import { updateAccountsCreatedLocally, updateContactsCreatedLocally, updateCasesCreatedLocally,	updateOpportunitiesCreatedLocally, } from './database.js';

const currentSfEnv = aureumTest;

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
const insertContacts = (contactsToInsert) => {
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
      conn.bulk.load("Contact", "insert", contactsToInsert, function(err, rets) {
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
        getContactsFromSF(conn, ids).then(result => {resolve(result);}).catch(error => {reject(error)});
      });
    });
  });
}
const insertCases = (casesToInsert) => {
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
      conn.bulk.load("Case", "insert", casesToInsert, function(err, rets) {
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
        getCasesFromSF(conn, ids).then(result => {resolve(result);}).catch(error => {reject(error)});
      });
    });
  });
}
const insertOpportunities = (opportunitiesToInsert) => {
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
    conn.bulk.load("Opportunity", "insert", opportunitiesToInsert, function(err, rets) {
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
      getOpportunitiesFromSF(conn, ids).then(result => {resolve(result);}).catch(error => {reject(error)});
    });
    });
  });
  }
const getAccountsFromSF = (conn, ids) => {
  console.log(ids);
  return new Promise((resolve, reject) => {
    conn.sobject('Account').find(
      {$or: ids},
      { Id: 1, au_External_ID__c: 1 }).execute((err, accounts) => {
        if (err) { reject(console.error(err)); }
        updateAccountsCreatedLocally(accounts).them((result) => {
          console.log('result');
          console.log(result);
        }).catch((error) => {
          console.log('error');
          console.log(error);
        });
      });
  })
}
const getContactsFromSF = (conn, ids) => {
  console.log(ids);
  return new Promise((resolve, reject) => {
    conn.sobject('Contact').find(
      {$or: ids},
      { Id: 1, au_External_ID__c: 1 }).execute((err, contacts) => {
        if (err) { reject(console.error(err)); }
        updateContactsCreatedLocally(contacts).them((result) => {
          console.log('result');
          console.log(result);
        }).catch((error) => {
          console.log('error');
          console.log(error);
        });
      });
  })
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