import jsforce from 'jsforce';
import request from 'request';

class JSForce {
  constructor(oauth2) {
    this.oauth2 = oauth2;
  }
  /*
  * General Salesforce API methods
  */
  login = () => {
    return new Promise((resolve, reject) => {
      const conn = new jsforce.Connection(this.oauth2);
      conn.login(this.oauth2.username, this.oauth2.password, function (err, userInfo) {
        if (err) { return reject(err); }
        console.log(conn.accessToken);
        console.log(conn.instanceUrl);
        console.log("User ID: " + userInfo.id);
        console.log("Org ID: " + userInfo.organizationId);
        resolve(conn);
      });
    });
  }
  CRUDRecords = (sObjectName, CRUDOperation, records, upsertField) => {
    return new Promise((resolve, reject) => {
      this.login().then((conn) => {
        let results = {};
        let ids = [];
        let errors = [];
        let options = upsertField ? { extIdField: upsertField } : { extIdField: 'Id' }
        options = CRUDOperation.toLowerCase() === 'upsert' ? options : {};
        conn.bulk.pollTimeout = 250000; // Bulk timeout can be specified globally on the connection object
        conn.bulk.load(sObjectName, CRUDOperation, options, records, function (err, rets) {
          if (err) { reject(console.error(err)); }
          for (var i = 0; i < rets.length; i++) {
            let queryObj = {};
            if (rets[i].success) {
              queryObj.Id = rets[i].id;
              ids.push(queryObj.Id);
            } else {
              queryObj.error = "#" + (i + 1) + " error occurred, message = " + rets[i].errors.join(', ');
              errors.push(queryObj);
            }
          }
          results = { ids, errors };
          resolve(results);
        });
      }).catch((err) => {
        reject(err);
      });
    });
  }
  getRecordsByIds = (sObjectName, ids, fields) => {
    return new Promise((resolve, reject) => {
      this.login().then((conn) => {
        conn.sobject(sObjectName).find({ $or: ids }, fields).execute((err, records) => {
          if (err) { reject(console.error(err)); }
          resolve(records);
        });
      }).catch((err) => {
        reject(err);
      });
    });
  }
  getRecordsByIdList = (sObjectName, idList, fields) => {
    return new Promise((resolve, reject) => {
      this.login().then((conn) => {
        conn.sobject(sObjectName).find({ Id: { $in: idList } }, fields).execute((err, records) => {
          if (err) { reject(console.error(err)); }
          resolve(records);
        });
      }).catch((err) => {
        reject(err);
      });
    });
  }
  getRecordsByFieldsList = (sObjectName, queryfielsdList, fields, limit) => {
    return new Promise((resolve, reject) => {
      this.login().then((conn) => {
        let finder = conn.sobject(sObjectName).find(queryfielsdList, fields);
        if (limit && limit > 0) {
          finder.limit(limit);
        }
        finder.execute((err, records) => {
          if (err) { reject(console.error(err)); }
          resolve(records);
        });
      }).catch((err) => {
        reject(err);
      });
    });
  }
  getRecordsByQuery = (query) => {
    return new Promise((resolve, reject) => {
      this.login().then((conn) => {
        conn.query(query, function (err, result) {
          if (err) { return console.error(err) }
          console.log("total : " + result.totalSize)
          console.log("fetched : " + result.records.length)
          resolve(result.records)
        });
      }).catch((err) => {
        reject(err)
      });
    });
  }
  getSObjectsMetadata = (SObjectName) => {
    return new Promise((resolve, reject) => {
      this.login().then((conn) => {
        let url = conn.instanceUrl + '/services/data/v59.0/sobjects/';
        let options = {
          'method': 'GET',
          'url': !SObjectName ? url : url + SObjectName + '/describe/',
          'headers': {
            'Authorization': 'Bearer ' + conn.accessToken
          }
        };
        request(options, function (error, response) {
          if (error) reject(error)
          resolve(response.body)
        })
      }).catch((err) => {
        reject(err)
      })
    })
  }
}

export { JSForce }