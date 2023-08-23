import { Database } from "./database.js";
import { OAuht2 } from "./oauth.js";
import { JSForce } from "./jsforce.js";
import { unicomerFakeData } from "./fakeData/unicomerTest.js";
import { createCustomerData } from "./fakeData/marketingCloud.js";

const oauth2 = new OAuht2();
const jsForce = new JSForce(oauth2.unicomerDev1);
const database = new Database('unicomerDev1');
const fakeData = new unicomerFakeData(database);

const getBranchesFromSalesforce = () => {
  let queryfielsdList = {
    Country__c: 'Jamaica'
  };
  let fields = {
    Id: 1,
    Name: 1,
    Branch_Code__c: 1,
    Country__c: 1
  };
  jsForce.getRecordsByFieldsList('Branch__c', queryfielsdList, fields).then((records) => {
    database.createRecords(records, 'Branch__c', 'Id').then((localRecords) => {
      console.log(localRecords);
    }).catch((err) => {
      console.log(err);
    });
  }).catch((error) => {
    console.log(error);
  })
}
const createFakeAccountsInSalesforce = (numberOfAccounts, isCustomerRetentionCreditRenewal, flagForPreApproved, monthsInactive) => {
  fakeData.createFakePersonAccouts(numberOfAccounts, isCustomerRetentionCreditRenewal, flagForPreApproved, monthsInactive).then((fakeAccounts) => {
    database.createRecords(fakeAccounts, 'Account', 'CustomerID__c').then((localRecords) => {
      jsForce.CRUDRecords('Account', 'insert', localRecords).then((results) => {
        if (results.ids.length > 0) {
          let fields = {
            "Sex__c": 1,
            "LastName": 1,
            "FirstName": 1,
            "PersonMobilePhone": 1,
            "PersonEmail": 1,
            "Country__c": 1,
            "Street__c": 1,
            "CustomerID__c": 1,
            "External_ID__c": 1,
            "Flag_for_pre_approved__c": 1,
            "Existing_Customer__c": 1,
            "RfavailablePercent__c": 1,
            "RfavailablePercent_Fixed_Value__c": 1,
            "Contract_Expiration_Date__c": 1,
            "Credit_Spending_limit__c": 1,
            "Outstanding_balance__c": 1,
            "Customer_Retention_Credit_Renewal__c": 1,
            "Flag_for_inactive__c": 1,
            "Date_that_becomes_inactive__c": 1,
            "Disappearing_Customers_6_18_months__c": 1,
            "Disappearing_Customers_18__c": 1,
            "RecordType.Name": 1,
            "Branch__r.Branch_Code__c": 1,
            "PersonLeadSource": 1,
            "AccountSource": 1,
            "Approve_spending_limit__c": 1,
            "ISO__c": 1,
            "Last_salary_info_updated__c": 1,
            "Net_disposable_income_Ndi__c": 1,
            "Id": 1
          };
          let ids = results.ids.filter(id => id.Id);
          if (ids.length > 0) {
            jsForce.getRecordsByIds('Account', ids, fields).then((records) => {
              if (records.length > 0) {
                console.log(records);
                database.updateRecordsWithoutId(records, 'Account', 'CustomerID__c');
                console.log(records.length + ' accounts created');
              }
            }).catch((err) => {
              console.log(err);
            });
          } else {
            console.log('There are not accounts to look for');
          }
        } else if (results.ids.length == 0 && results.errors.length > 0) {
          console.log(results.errors);
        }
      }).catch((err) => {
        console.log(err);
      });
      console.log(localRecords);
    }).catch((err) => {
      console.log(err);
    });
  }).catch((error) => {
    console.log(error);
  });
}

export {
  getBranchesFromSalesforce,
  createFakeAccountsInSalesforce,
  createCustomerData
}