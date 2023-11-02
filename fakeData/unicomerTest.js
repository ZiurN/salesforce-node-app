import { faker } from '@faker-js/faker';
import { FakeData } from './fakeData.js';

const fakeData = new FakeData();
var branches;

class HVSFakeData {
  constructor (database) {
    this.database = database;
  }
  createFakePersonAccouts = (numberOfAccounts, isCustomerRetentionCreditRenewal, flagForPreApproved, monthsInactive) => {
    return new Promise ((resolve, reject) => {
      this.database.findData('unicomer', 'Branch__c', {'Branch_Group_Members__r': {$ne: null}}).then(result => {
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
            Flag_for_pre_approved__c: flagForPreApproved = (flagForPreApproved === 'true'),
            Existing_Customer__c: false,
          };
          let customerRetentionCreditRenewalRefData = this.customerRetentionCreditRenewalInformation(isCustomerRetentionCreditRenewal);
          let DisappearingCustomerInformation = this.disappearingCustomerInformation(monthsInactive);
          let account = {
            ...personalInfo,
            ...accountIds,
            ...existingCustomerRefData,
            ...customerRetentionCreditRenewalRefData,
            ...DisappearingCustomerInformation,
            'RecordType.Name': 'Person Account Jamaica',
            'Branch__r.Branch_Code__c' : '875',
            PersonLeadSource: 'Integration',
            AccountSource: 'Integration',
            Approve_spending_limit__c: 258000.0,
            ISO__c: 'JM',
            Last_salary_info_updated__c: 70000.0,
            Net_disposable_income_Ndi__c: 70000.0,
			      MostRecentAccount__c: '2022-06-24'
          };
          accountsToCreate.push(account);
        }
        console.log(accountsToCreate)
        resolve(accountsToCreate);
      }).catch(error => {console.log(error); reject(error);});
    });
  }
  assignBranch = () => {
    if (branches.length > 0) {
      return branches[fakeData.returnRandomIndex(branches)].Branch_Code__c;
    } else return null;
  }
  customerRetentionCreditRenewalInformation = (isCustomerRetentionCreditRenewal) => {
    isCustomerRetentionCreditRenewal = (isCustomerRetentionCreditRenewal === 'true');
    // (SF) Flag_Contract_Expiration_Date__c = if(ADDMONTHS(Contract_Expiration_Date__c,3) <= Today() ,true,false)
    let contractExpirationDate = isCustomerRetentionCreditRenewal ? fakeData.returnDataFormatted(fakeData.setPastDate(3)) : fakeData.returnDataFormatted(new Date());
    // (SF) Flag_RfavailablePercent__c = IF(RfavailablePercent__c >= RfavailablePercent_Fixed_Value__c,True,False)
    let RfAvailablePercent = isCustomerRetentionCreditRenewal ? 10.00 : 0.00;
    let RfAvailablePercentFixedValue = isCustomerRetentionCreditRenewal ? 5.00 : 0.00;
    // (SF) Flag_Credit_Limit__c = IF(Credit_Spending_limit__c > Outstanding_balance__c, True,False)
    let creditSpendingLimit = isCustomerRetentionCreditRenewal ? 25000 : 0;
    let outstandingBalance = isCustomerRetentionCreditRenewal ? 15000 : 0;
    return {
      Contract_Expiration_Date__c: contractExpirationDate,
      RfavailablePercent__c : RfAvailablePercent,
      RfavailablePercent_Fixed_Value__c: RfAvailablePercentFixedValue,
      Credit_Spending_limit__c: creditSpendingLimit,
      Outstanding_balance__c: outstandingBalance,
      Customer_Retention_Credit_Renewal__c: false,
    };
  }
  disappearingCustomerInformation = (monthsInactive) => {
    let isInactive = (monthsInactive && Number(monthsInactive) > 6);
      // (SF) Flag_inactive_date_greater_than_18_month__c = Today() > Inactive_date_greater_than_18_months__c
      // (SF) Inactive_date_greater_than_18_months__c = addmonths(Date_that_becomes_inactive__c, 18)
      // (SF) Flag_inactive_date_between_6_18_months__c = And(Today() >= Inactive_date_greater_than_6_months__c, Today() < Inactive_date_greater_than_18_months__c)
      // (SF) Inactive_date_greater_than_6_months__c = addmonths(Date_that_becomes_inactive__c, 6)
    return {
      Flag_for_inactive__c: isInactive,
      Date_that_becomes_inactive__c: isInactive ? fakeData.returnDataFormatted(fakeData.setPastDate(monthsInactive)): '',
      Disappearing_Customers_18__c: false,
      Disappearing_Customers_6_18_months__c: false
    }
  }
}

class B2BFakeData {
  createFakeB2BAccounts = (numberOfAccounts) => {
    let accountTypeList = [
      "Analyst",
      "Competitor",
      "Customer",
      "Integrator",
      "Investor",
      "Partner",
      "Press",
      "Prospect",
      "Reseller",
      "Other"
    ]
    let industries = [
      "Agriculture",
      "Apparel",
      "Banking",
      "Biotechnology",
      "Chemicals",
      "Communications",
      "Construction",
      "Consulting",
      "Education",
      "Electronics",
      "Energy",
      "Engineering",
      "Entertainment",
      "Environmental",
      "Finance",
      "Food & Beverage",
      "Government",
      "Healthcare",
      "Hospitality",
      "Insurance",
      "Machinery",
      "Manufacturing",
      "Media",
      "Not For Profit",
      "Other",
      "Recreation",
      "Retail",
      "Shipping",
      "Technology",
      "Telecommunications",
      "Transportation",
      "Utilities"
    ]
    let leadSources = [
      "Advertisement",
      "Employee Referral",
      "External Referral",
      "Partner",
      "Public Relations",
      "Seminar - Internal",
      "Seminar - Partner",
      "Trade Show",
      "Web",
      "Word of mouth",
      "Other",
      "In-Store",
      "On Site",
      "Social",
      "Integration"
    ]
    let fakeAccountsList = []
    for (let i = 0; i < numberOfAccounts; i++) {
      let externalId = faker.random.alphaNumeric(64)
      let leadSource = leadSources[fakeData.returnRandomIndex(leadSources)]
      let fakeAccount = {
        "Account Name": faker.company.name(),
        "Account Number": faker.finance.account(),
        "Account Description": faker.lorem.words(20),
        "Comments": faker.lorem.words(20),
        "Account Phone": faker.phone.number('##########'),
        "Employees": faker.datatype.number(10000),
        "Account Site2": faker.internet.url(),
        "Email address": faker.internet.email(),
        "ID Cosacs": externalId,
        "ID Number": externalId,
        "ID Type": externalId,
        "UnicomerId": externalId,
        "TAX Identification Number": externalId,
        "TaxIdentification": externalId,
        "Original Customer Number": externalId,
        "Billing Country": faker.address.country(),
        "Billing State/Province": faker.address.state(),
        "Billing City": faker.address.city(),
        "Billing Street": faker.address.street(),
        "Billing Zip/Postal Code": faker.address.zipCode('######'),
        "Shipping Country": faker.address.country(),
        "Shipping State/Province": faker.address.state(),
        "Shipping City": faker.address.city(),
        "Shipping Street": faker.address.street(),
        "Shipping Zip/Postal Code": faker.address.zipCode('######'),
        "Pinterest": "https://www.pinterest.com/" + "fakeaccount",
        "Youtube": "https://www.youtube.com/" + "fakeaccount",
        "Twitter": "https://www.twitter.com/" + "fakeaccount",
        "Facebook": "https://www.facebook.com/" + "fakeaccount",
        "Account Type": accountTypeList[fakeData.returnRandomIndex(accountTypeList)],
        "Billing Geocode Accuracy": "Street",
        "Shipping Geocode Accuracy": "Street",
        "Industry": industries[fakeData.returnRandomIndex(industries)],
        "Ownership": "Private",
        "Account Rating": "Cold",
        "Account Currency": "USD",
        "Account Source": leadSource,
        "Country": "Trinidad & Tobago",
        "ISO": "TT",
        "Email Opt Out": false,
        "Fax Opt Out": false,
        "Do Not Call": false,
        "Dummy": false,
        "Disappearing Customers >=18": false,
        "Disappearing Customers 6- 18 months.": false,
        "Existing Customer": false,
        "Flag for inactive": false,
        "Flag for pre-approved": false,
        "Flag for inactive2": false,
        "Flag for pre-approved3": false,
        "Credit Offer": "",
        "Credit Score": "",
        "Campaign": "",
        "Last Campaign": "",
        "Payment Method": "",
        "Gross Expenses": faker.datatype.number({ min: 1000, max: 100000, precision: 0.01 }),
        "Number": faker.datatype.number({ min: 1000, max: 100000, precision: 0.01 }),
        "Total CXD": faker.datatype.number({ min: 1000, max: 100000, precision: 0.01 }),
        "Score Risk Class": 5,
        "Total Credits": faker.datatype.number({ min: 0, max: 10, precision: 1 }),
        "Total CXR": faker.datatype.number({ min: 1000, max: 100000, precision: 0.01 }),
        "Maximum combine instalment": faker.datatype.number({ min: 1000, max: 100000, precision: 0.01 }),
        "CampaignAmount": faker.datatype.number({ min: 1000, max: 100000, precision: 0.01 }),
        "Income Source Name": faker.datatype.number({ min: 1000, max: 100000, precision: 0.01 }),
        "Maximum combine instalment3": faker.datatype.number({ min: 1000, max: 100000, precision: 0.01 }),
        "Gross Income": faker.datatype.number({ min: 1000, max: 100000, precision: 0.01 }),
        "Total Active Credits": faker.datatype.number({ min: 0, max: 10, precision: 1 }),
        "Current combine instalment": faker.datatype.number({ min: 1000, max: 100000, precision: 0.01 }),
        "RfavailablePercent": faker.datatype.number({ min: 0, max: 1, precision: 0.01 }),
        "RfavailablePercent Fixed Value": faker.datatype.number({ min: 0, max: 1, precision: 0.01 }),
        "Date First Credit": fakeData.returnDataFormatted(faker.date.past()),
        "Date that becomes inactive": fakeData.returnDataFormatted(faker.date.past()),
        "Date Last Purchase": fakeData.returnDataFormatted(faker.date.past()),
        "Date Last Credit Canceled": fakeData.returnDataFormatted(faker.date.past()),
        "Loading Date": fakeData.returnDataFormatted(faker.date.past()),
        "StartdateCampaign": fakeData.returnDataFormatted(faker.date.past()),
        "Contract Expiration Date": fakeData.returnDataFormatted(faker.date.past()),
        "Date Last Judgment": fakeData.returnDataFormatted(faker.date.past()),
        "Contract Expiration Date2": fakeData.returnDataFormatted(faker.date.past()),
        "Last Score Date": fakeData.returnDataFormatted(faker.date.past()),
        "Last Campaign Code": fakeData.returnDataFormatted(faker.date.past()),
        "Date that becomes inactive3": fakeData.returnDataFormatted(faker.date.past()),
        "EnddateCampaign": fakeData.returnDataFormatted(faker.date.past()),
        "Last Credit Payment Date": fakeData.returnDataFormatted(faker.date.past()),
        "Last Credit Payment Date2": fakeData.returnDataFormatted(faker.date.past()),
        "DC6-18 D/T": fakeData.returnDataFormatted(faker.date.past()),
        "CRCR D/T": fakeData.returnDataFormatted(faker.date.past()),
        "DC>=18 D/T": fakeData.returnDataFormatted(faker.date.past()),
        "Record Type": "Bussines Account"
      }
      fakeAccountsList.push(fakeAccount)
    }
    return fakeAccountsList
  }
}

export { HVSFakeData, B2BFakeData }