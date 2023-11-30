import { Database } from "./database.js"
import { OAuht2 } from "./oauth.js"
import { JSForce } from "./jsforce.js"
import * as DevNames from "./devNames.js"

const oauth2 = new OAuht2()
const jsForce = new JSForce(oauth2.bciUatMinorCO)
const database = new Database()

const getBranchesFromSalesforce = () => {
  let queryfielsdList = {
    Name: 'PBP Más Cerro Aconcagua'
  };
  let fields = {
    Id: 1
  };
  jsForce.getRecordsFilteredByFieldsList(DevNames.branchDevName, queryfielsdList, fields).then((records) => {
    database.upsertData('bciMinor', 'Branch__c', records)
  }).catch((error) => {
    console.log(error);
  })
}

export {
    getBranchesFromSalesforce
}