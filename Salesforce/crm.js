import { JSForce } from './../jsforce.js'
import * as DevNames from './../devNames.js'

class crm {
  constructor(oauth2) {
    this.jsForce = new JSForce(oauth2)
  }
  recordTypeFields = {
    Id: 1,
    Name: 1,
    DeveloperName: 1,
    SobjectType: 1
  }
  retrieveRecordTypes = (recordTypes) => {
    return new Promise((reject, resolve) => {
      let filters = recordTypes ? { $or: [ { DeveloperName: { $in : recordTypes } },  { Name: { $in : recordTypes } }] } : {}
      this.jsForce.getRecordsByFieldsList(DevNames.recordTypeDevName, filters, this.recordTypeFields)
        .then((records) => {
          resolve(records)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }
}

export { crm }