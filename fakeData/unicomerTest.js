import { faker } from '@faker-js/faker';
import { FakeData } from './fakeData.js';

const fakeData = new FakeData();
var branches;

class unicomerFakeData {
  constructor (database) {
    this.database = database;
  }
  createFakePersonAccouts = (numberOfAccounts, isCustomerRetentionCreditRenewal, monthsInactive) => {
    return new Promise ((resolve, reject) => {
      this.database.getAllRecords('Branch__c').then(result => {
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
            PersonEmail: fakeData.createFakeEmail(firstName, lastName),
            Country__c: 'Jamaica',
            Street__c: faker.address.streetAddress(true),
          };
          let externalId = faker.random.alphaNumeric(64);
          let accountIds = {
            CustomerID__c: externalId,
            External_ID__c: externalId,
          };
          let existingCustomerRefData = {
            Flag_for_pre_approved__c: true,
            Existing_Customer__c: false,
          };
          let customerRetentionCreditRenewalRefData = customerRetentionCreditRenewalInformation(isCustomerRetentionCreditRenewal);
          let DisappearingCustomerInformation = disappearingCustomerInformation(monthsInactive);
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
  }
}
const assignBranch = () => {
  if (branches.length > 0) {
    return branches[fakeData.returnRandomIndex(branches)].Branch_Code__c;
  } else return null;
}
const customerRetentionCreditRenewalInformation = (isCustomerRetentionCreditRenewal) => {
  return {
    // (SF) Flag_Contract_Expiration_Date__c = if(ADDMONTHS(Contract_Expiration_Date__c,3) <= Today() ,true,false)
    Contract_Expiration_Date__c: isCustomerRetentionCreditRenewal ? returnDataFormatted(fakeData.setPastDate(3)) : returnDataFormatted(new Date()),
    // (SF) Flag_RfavailablePercent__c = IF(RfavailablePercent__c >= RfavailablePercent_Fixed_Value__c,True,False)
    RfavailablePercent__c : isCustomerRetentionCreditRenewal ? 10.00 : 0.00,
    RfavailablePercent_Fixed_Value__c: isCustomerRetentionCreditRenewal ? 5.00 : 0.00,
    // (SF) Flag_Credit_Limit__c = IF(Credit_Spending_limit__c > Outstanding_balance__c, True,False)
    Credit_Spending_limit__c: isCustomerRetentionCreditRenewal ? 25000 : 0,
    Outstanding_balance__c: isCustomerRetentionCreditRenewal ? 15000 : 0,
    Customer_Retention_Credit_Renewal__c: false,
  };
}
const disappearingCustomerInformation = (monthsInactive) => {
  let isInactive = (monthsInactive && monthsInactive.length > 6);
    // (SF) Flag_inactive_date_greater_than_18_month__c = Today() > Inactive_date_greater_than_18_months__c
    // (SF) Inactive_date_greater_than_18_months__c = addmonths(Date_that_becomes_inactive__c, 18)
    // (SF) Flag_inactive_date_between_6_18_months__c = And(Today() >= Inactive_date_greater_than_6_months__c, Today() < Inactive_date_greater_than_18_months__c)
    // (SF) Inactive_date_greater_than_6_months__c = addmonths(Date_that_becomes_inactive__c, 6)
  return {
    Flag_for_inactive__c: isInactive,
    Date_that_becomes_inactive__c: isInactive ? fakeData.setPastDate(monthsInactive): '',
    Disappearing_Customers_18__c: false,
    Disappearing_Customers_6_18_months__c: false
  }
}
const padTo2Digits = (num) => {
	return num.toString().padStart(2, '0');
}
const returnDataFormatted = (date) => {
	return (
		[
			date.getFullYear(),
			padTo2Digits(date.getMonth() + 1),
			padTo2Digits(date.getDate()),
		].join('-') +
		' ' +
		[
			padTo2Digits(date.getHours()),
			padTo2Digits(date.getMinutes()),
			padTo2Digits(date.getSeconds()),
		].join(':')
	);
}
export { unicomerFakeData }