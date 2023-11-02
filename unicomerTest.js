import { Database } from "./database.js"
import { OAuht2 } from "./oauth.js"
import { JSForce } from "./jsforce.js"
import { HVSFakeData, B2BFakeData } from "./fakeData/unicomerTest.js"
import { createCustomerData } from "./fakeData/marketingCloud.js"
import { accountFieldsSelected } from "./extras.js"
import fs from 'fs'

const oauth2 = new OAuht2();
const jsForce = new JSForce(oauth2.unicomerHotFix);
const database = new Database();
const fakeData = new HVSFakeData(database);
const B2BfakeData =  new B2BFakeData()


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
    database.upsertData('unicomer', 'Branch__c', records)
  }).catch((error) => {
    console.log(error);
  })
}
const getBranchesFromSalesforceByQuery = () => {
  jsForce.getRecordsByQuery('SELECT Id, Name, Country__c, Branch_Code__c, (SELECT Id, User__r.Name FROM Branch_Group_Members__r) FROM Branch__c WHERE Country__c= \'Jamaica\'').then((records) => {
    database.upsertData('unicomer', 'Branch__c', records)
  }).catch((error) => {
    console.log(error);
  })
}
const createFakeAccountsInSalesforce = (numberOfAccounts, isCustomerRetentionCreditRenewal, flagForPreApproved, monthsInactive) => {
  fakeData.createFakePersonAccouts(numberOfAccounts, isCustomerRetentionCreditRenewal, flagForPreApproved, monthsInactive).then((fakeAccounts) => {
    console.log(fakeAccounts)
    jsForce.CRUDRecords('Account', 'insert', fakeAccounts).then((results) => {
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
              database.upsertData('unicomer', 'Account', records)
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
  }).catch((error) => {
    console.log(error);
  });
}
const test = () => {
  console.log(fakeData.assignBranch())
}
const getFieldsMedatadaFromSF = (SObjectName) => {
  jsForce.getFieldsMedatada(SObjectName).then(result => {
    //console.log(result.fields)
    database.insertData('SFMetadata', SObjectName + 'Fields', result.fields);
  }).catch(err => console.log(err))
}
const getFieldsMedatadaFromAtlas = () => {
  let filter = {label: {$in: accountFieldsSelected}}
  let project = { picklistValues: 1, name: 1, type: 1, label: 1, nillable: 1, calculated: 1 }
  database.findData('SFMetadata', 'AccountFields', filter, project).then(results => {
    const groupByCategory = results.reduce((group, field) => {
      let type = field.type;
      group[type] = group[type] ?? [];
      group[type].push(field);
      return group;
    }, {});
    let categoryList = {}
    Object.keys(groupByCategory).forEach(type => {
      categoryList[type] = categoryList[type] ?? []
      groupByCategory[type].forEach(field => {
        categoryList[type].push(field.label)
      })
    })
    fs.promises.writeFile('listas.json', JSON.stringify(categoryList));
    let pickListValues = {}
    let booleanFieldsList = []
    // results.forEach(field => {
    //   if (field.picklistValues && field.picklistValues.length > 0) {
    //     let pickListValuesValues = []
    //     field.picklistValues.forEach(pickListValue => {
    //       pickListValuesValues.push(pickListValue.value)
    //     })
    //     pickListValues[field.label] = [...pickListValuesValues]
    //   }
    //   if (field.type == "boolean" && field.calculated == false) {
    //     booleanFieldsList.push(field.label)
    //   }
    //   if (field.type == "double" && field.calculated == false) {

    //   }
    // })
    // pickListValues['List'] = Object.keys(pickListValues)
    // fs.promises.writeFile('picklistValues.json', JSON.stringify(pickListValues))
    // fs.promises.writeFile('fields.json', JSON.stringify(results));
    // fs.promises.writeFile('booleans.json', JSON.stringify(booleanFieldsList));
  })
}
const createFakeB2BAccounts = (numberOfAccounts) => {
  let accounts = B2BfakeData.createFakeB2BAccounts(numberOfAccounts)
  console.log(accounts)
  fs.promises.writeFile('fakeB2BAccounts.json', JSON.stringify(accounts));
}

export {
  getBranchesFromSalesforce,
  getBranchesFromSalesforceByQuery,
  createFakeAccountsInSalesforce,
  createCustomerData,
  test,
  getFieldsMedatadaFromSF,
  getFieldsMedatadaFromAtlas,
  createFakeB2BAccounts
}