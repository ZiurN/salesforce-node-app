import { Faker, faker } from '@faker-js/faker';
import { getBranches } from './database.js';

var branches;
const date = new Date();
const setPastDate = (monthsAgo) => {
  let yearsAgo = Math.floor(monthsAgo/12);
  monthsAgo = yearsAgo == 0 ? monthsAgo : monthsAgo % 12;
  let pastDate = new Date();
  pastDate.setFullYear(date.getFullYear() - yearsAgo);
  pastDate.setMonth(date.getMonth() - monthsAgo);
  return pastDate;
}

const createFakeEmail = (firstName, lastName) => {
  let emailAdress =
    firstName + lastName + Math.round(Math.random() * 1000) + '@test.com';
  return emailAdress.toLowerCase();
};

const assignBranch = () => {
  if (branches.length > 0) {
    return branches[Math.floor(Math.random() * (branches.length - 1))].Branch_Code__c;
  } else return null;
};

const isCustomerRetentionCreditRenewal = (isCustomerRetentionCreditRenewal) => {
  if (isCustomerRetentionCreditRenewal) {
    return {
      // (SF) Flag_Contract_Expiration_Date__c = if(ADDMONTHS(Contract_Expiration_Date__c,3) <= Today() ,true,false)
      Contract_Expiration_Date__c: setPastDate(3),
      // (SF) Flag_RfavailablePercent__c = IF(RfavailablePercent__c >= RfavailablePercent_Fixed_Value__c,True,False)
      RfavailablePercent__c : 10.00,
      RfavailablePercent_Fixed_Value__c: 5.00,
      // (SF) Flag_Credit_Limit__c = IF(Credit_Spending_limit__c > Outstanding_balance__c, True,False)
      Credit_Spending_limit__c: 25000,
      Outstanding_balance__c: 15000,
      Customer_Retention_Credit_Renewal__c: false,
    };
  } else {
    return {
      // (SF) Flag_Contract_Expiration_Date__c = if(ADDMONTHS(Contract_Expiration_Date__c,3) <= Today() ,true,false)
      Contract_Expiration_Date__c: new Date(),
      // (SF) Flag_RfavailablePercent__c = IF(RfavailablePercent__c >= RfavailablePercent_Fixed_Value__c,True,False)
      RfavailablePercent__c : 0.00,
      RfavailablePercent_Fixed_Value__c: 0.00,
      // (SF) Flag_Credit_Limit__c = IF(Credit_Spending_limit__c > Outstanding_balance__c, True,False)
      Credit_Spending_limit__c: 0,
      Outstanding_balance__c: 0,
      Customer_Retention_Credit_Renewal__c: false,
    };
  }
}

const disappearingCustomerInformation = (isInactive, months) => {
  let Flag_for_inactive__c = isInactive;
  months = isInactive ? months : 0;
  // (SF) Flag_inactive_date_greater_than_18_month__c = Today() > Inactive_date_greater_than_18_months__c
  // (SF) Inactive_date_greater_than_18_months__c = addmonths(Date_that_becomes_inactive__c,18)
  // (SF) Flag_inactive_date_between_6_18_months__c = And(Today() >= Inactive_date_greater_than_6_months__c, Today() < Inactive_date_greater_than_18_months__c)
  // (SF) Inactive_date_greater_than_6_months__c = addmonths(Date_that_becomes_inactive__c, 6)
  let Date_that_becomes_inactive__c = setPastDate(months);
  console.log(Date_that_becomes_inactive__c);
  let Disappearing_Customers_18__c = false
  let Disappearing_Customers_6_18_months__c = false
  return {
    Flag_for_inactive__c,
    Date_that_becomes_inactive__c,
    Disappearing_Customers_18__c,
    Disappearing_Customers_6_18_months__c
  }
}

const createFakeAccouts = (numberOfAccounts) => {
  return new Promise ((resolve, reject) => {
    getBranches().then(result => {
      branches = result;
      let accountsToCreate = [];
      for (let i = 0; i < numberOfAccounts; i++) {
        //Create random Account.
        let sex = faker.name.sex();
        let lastName = faker.name.lastName();
        let firstName = faker.name.firstName(sex);
        let personalInfo = {
          Sex__c: sex == 'male' ? 'M' : 'F',
          LastName: lastName,
          FirstName: firstName,
          PersonMobilePhone: faker.phone.number('+876 ########'),
          PersonEmail: createFakeEmail(firstName, lastName),
          Country__c: 'Jamaica',
          Street__c: faker.address.streetAddress(true),
        };
        let externalId = faker.random.alphaNumeric(64);
        let accountIds = {
          CustomerID__c: externalId,
          External_ID__c: externalId,
        };
        let recordType = {
          attributes: {
            type: 'RecordType',
          },
          Name: 'Person Account Jamaica',
        };
        let existingCustomerRefData = {
          Flag_for_pre_approved__c: true,
          Existing_Customer__c: false,
        };
        let customerRetentionCreditRenewalRefData = isCustomerRetentionCreditRenewal(false);
        let DisappearingCustomerInformation = disappearingCustomerInformation(true, 24);
        let account = {
          ...personalInfo,
          ...accountIds,
          ...existingCustomerRefData,
          ...customerRetentionCreditRenewalRefData,
          ...DisappearingCustomerInformation,
          'RecordType.Name': 'Person Account Jamaica',
          'Branch__r.Branch_Code__c' : assignBranch(),
          PersonLeadSource: 'Integration',
          AccountSource: 'Integration',
          Approve_spending_limit__c: 258000.0,
          ISO__c: 'JM',
          Last_salary_info_updated__c: 70000.0,
          Net_disposable_income_Ndi__c: 70000.0
        };
        accountsToCreate.push(account);
      }
      resolve(accountsToCreate);
    }).catch(error => {console.log(error); reject(error);});
  });
};

export {createFakeAccouts}