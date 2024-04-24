import { JSForce } from './../jsforce.js'
import * as DevNames from './../devNames.js'

class bciSalesforce {
  constructor(oauth2) {
    this.jsForce = new JSForce(oauth2)
  }
  branchFields = {
    Id: 1,
    Name: 1,
    bci_id_sucursal__c: 1,
    bci_cod_suc__c: 1
  }
  retrieveBranches = (branchCodes) => {
    return new Promise((resolve, reject) => {
      let filters = branchCodes ? { bci_cod_suc__c: { $in : branchCodes } } : {}
      this.jsForce.getRecordsByFieldsList(DevNames.branchDevName, filters, this.branchFields)
        .then((records) => {
          resolve(records)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }
}

export { bciSalesforce }