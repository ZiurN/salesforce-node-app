import { Faker, faker } from '@faker-js/faker';

var branches;
const type = [
  "Prospect",
  "Customer - Direct",
  "Customer - Channel",
  "Channel Partner / Reseller",
  "Installation Partner",
  "Technology Partner",
  "Other"
];
const accountSources = [
  "Web",
  "Phone Inquiry",
  "Partner Referral",
  "Purchased List",
  "Other"
];
const industries = [
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
  "Recreation",
  "Retail",
  "Shipping",
  "Technology",
  "Telecommunications",
  "Transportation",
  "Utilities",
  "Other"
];
const caseReasons = [
  "Installation",
  "Equipment Complexity",
  "Performance",
  "Breakdown",
  "Equipment Design",
  "Feedback",
  "Other"
];
const caseOrigins = [
  "Phone",
  "Email",
  "Web"
];
const productFamilies = [
  "Digital Media",
  "Accessories",
  "Laptops",
  "Tablets",
  "Phones"
];
const opportunityStage = [
  "Prospecting",
  "Qualification",
  "Needs Analysis",
  "Value Proposition",
  "Id. Decision Makers",
  "Perception Analysis",
  "Proposal/Price Quote",
  "Negotiation/Review",
  "Closed Won",
  "Closed Lost",
];
const opportunityTypes = [
  "Existing Customer - Upgrade",
  "Existing Customer - Replacement",
  "Existing Customer - Downgrade",
  "New Customer",
];
const opportunityLeadSources = [
  "Web",
  "Phone Inquiry",
  "Partner Referral",
  "Purchased List",
  "Other"
];
const opportunityForeCastCategories = [
  "Omitted",
  "Pipeline",
  "BestCase",
  "Forecast",
  "Closed"
];
const opportunityForeCastCategoryNames = {
  Omitted: "Omitted",
  Pipeline: "Pipeline",
  BestCase: "Best Case",
  Forecast: "Commit",
  Closed: "Closed"
}
const date = new Date();
const setPastDate = (monthsAgo) => {
  let yearsAgo = Math.floor(monthsAgo/12);
  monthsAgo = yearsAgo == 0 ? monthsAgo : monthsAgo % 12;
  let pastDate = new Date();
  pastDate.setFullYear(date.getFullYear() - yearsAgo);
  pastDate.setMonth(date.getMonth() - monthsAgo);
  return pastDate;
}
const setFutureDate = (monthsAhead) => {
  let yearsAhead = Math.floor(monthsAhead/12);
  monthsAhead = yearsAhead == 0 ? monthsAhead : monthsAhead % 12;
  let futureDate = new Date();
  futureDate.setFullYear(date.getFullYear() + yearsAhead);
  futureDate.setMonth(date.getMonth() + monthsAhead);
  return futureDate;
}
const createFakeEmail = (firstName, lastName) => {
  let emailAdress =
    firstName + lastName + Math.round(Math.random() * 1000) + '@test.com';
  return emailAdress.toLowerCase();
}
const assignBranch = () => {
  if (branches.length > 0) {
    return branches[Math.floor(Math.random() * (branches.length - 1))].Branch_Code__c;
  } else return null;
}
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
}
const createFakeBusinessAccount = (numberOfAccounts) => {
  let accountsToCreate = [];
  for (let i = 0; i < numberOfAccounts; i++) {
    //Create random Account
    let externalId = faker.random.alphaNumeric(64);
    let country = faker.address.country();
    let account = {
      au_External_Id__c: externalId,
      Name: faker.company.name() + ' ' + faker.company.companySuffix(),
      Type: type[Math.floor(Math.random()*type.length)],
      ParentId: null,
      BillingStreet: null,
      BillingCity: null,
      BillingState: null,
      BillingPostalCode: null,
      BillingCountry: country,
      BillingLatitude: null,
      BillingLongitude: null,
      BillingGeocodeAccuracy: null,
      ShippingStreet: null,
      ShippingCity: null,
      ShippingState: null,
      ShippingPostalCode: null,
      ShippingCountry: null,
      ShippingLatitude: null,
      ShippingLongitude: null,
      ShippingGeocodeAccuracy: null,
      Phone: faker.phone.number('+1 ##########'),
      Fax: faker.phone.number('+1 ##########'),
      AccountNumber: null,
      Website: null,
      Sic: 1610,
      Industry: industries[Math.floor(Math.random()*industries.length)],
      AnnualRevenue: 1000000.0,
      NumberOfEmployees: 5000,
      Ownership: null,
      TickerSymbol: null,
      Description: null,
      Rating: null,
      Site: null,
      Jigsaw: null,
      AccountSource: accountSources[Math.floor(Math.random()*accountSources.length)],
      DunsNumber: null,
      Tradestyle: null,
      NaicsCode: null,
      NaicsDesc: null,
      YearStarted: null,
      SicDesc: null,
      DandbCompanyId: null,
      CustomerPriority__c: null,
      SLA__c: null,
      Active__c: 'Yes',
      NumberofLocations__c: null,
      UpsellOpportunity__c: null,
      SLASerialNumber__c: null,
      SLAExpirationDate__c: null,
      Segment__c: null
    }
    accountsToCreate.push(account);
  }
  return accountsToCreate;
}
const createFakeContacts = (relatedAccountsInfo) =>{
  let contactsToCreate = [];
  relatedAccountsInfo.forEach((value, key) => {
    console.log('Account Id: ' + key);
    console.log('Contacts to be created: ' + value);
    for (let i = 0; i < value; i++) {
      let sex = faker.name.sex();
      let lastName = faker.name.lastName();
      let firstName = faker.name.firstName(sex);
      let externalId = faker.random.alphaNumeric(64);
      let contact = {
        au_External_Id__c: externalId,
        AccountId: key,
        LastName: lastName,
        FirstName: firstName,
        Salutation: sex == 'male' ? 'Mr.' : 'Ms.',
        OtherStreet: null,
        OtherCity: null,
        OtherState: null,
        OtherPostalCode: null,
        OtherCountry: null,
        OtherLatitude: null,
        OtherLongitude: null,
        OtherGeocodeAccuracy: null,
        MailingStreet: null,
        MailingCity: null,
        MailingState: null,
        MailingPostalCode: null,
        MailingCountry: null,
        MailingLatitude: null,
        MailingLongitude: null,
        MailingGeocodeAccuracy: null,
        Phone: faker.phone.number('+1 ##########'),
        Fax: null,
        MobilePhone: null,
        HomePhone: null,
        OtherPhone: null,
        AssistantPhone: null,
        ReportsToId: null,
        Email: createFakeEmail(firstName, lastName),
        Title: null,
        Department: null,
        AssistantName: null,
        LeadSource: null,
        Birthdate: null,
        Description: null,
        Jigsaw: null,
        CleanStatus: null,
        IndividualId: null,
        Level__c: null,
        Languages__c: null,
      }
      contactsToCreate.push(contact);
    }
  });
  return contactsToCreate;
}
const createFakeCases = (relatedAccountInfo) => {
  let casesToCreate = [];
  relatedAccountInfo.forEach(relatedAccountInfo => {
    let relatedContactsInfo = relatedAccountInfo.relatedContactsInfo;
    relatedContactsInfo.forEach((value, key) => {
      for (let i = 0; i < value; i++) {
        let externalId = faker.random.alphaNumeric(9);
        let caseToCreate = {
          ContactId: key,
          AccountId: relatedAccountInfo.accountId,
          AssetId: null,
          ParentId: null,
          SuppliedName: null,
          SuppliedEmail: null,
          SuppliedPhone: null,
          SuppliedCompany: null,
          Type: null,
          Status: "New",
          Reason: caseReasons[Math.floor(Math.random()*caseReasons.length)],
          Origin: caseOrigins[Math.floor(Math.random()*caseOrigins.length)],
          Subject: "Case about " + faker.commerce.productAdjective() + " " + faker.commerce.product(),
          Priority: "Low",
          Description: null,
          IsEscalated: true,
          EngineeringReqNumber__c: null,
          Product__c: null,
          PotentialLiability__c: null,
          CSAT__c: 105.0,
          Case_ExternalId__c: externalId,
          FCR__c: false,
          Product_Family_KB__c: productFamilies[Math.floor(Math.random()*productFamilies.length)],
          SLAViolation__c: "Compliant",
          SLA_Type__c: "Basic"
        }
        casesToCreate.push(caseToCreate);
      }
    });
  });
  return casesToCreate;
}
const createFakeOpportunities = (relatedAccountsAndContactsInfo) => {
  let opportunitiesToCreate = [];
  relatedAccountsAndContactsInfo.forEach(info => {
    for (let i = 0; i < info.numberOfOpportunities; i++) {
    let probability = Math.random();
    let amount = faker.finance.amount(250, 950000, 0);
    let totalOpportunityQuantity = faker.finance.amount(0, 5000, 0);
    let forecastCategory = opportunityForeCastCategories[Math.floor(Math.random()*opportunityForeCastCategories.length)];
    let forecastCateroryName = opportunityForeCastCategoryNames[forecastCategory];
    let opportunity = {
      AccountId: info.account.Id,
      TrackingNumber__c: faker.random.alphaNumeric(7),
      IsPrivate: false,
      Name: "The " + info.contact.LastName + " Opportunity ",
      Description: "Opportunity created by Aureum",
      StageName: opportunityStage[Math.floor(Math.random()*opportunityStage.length)],
      Amount: Number(amount),
      Probability: Math.floor(probability*100),
      TotalOpportunityQuantity: totalOpportunityQuantity > 150 ? totalOpportunityQuantity: null,
      CloseDate: null,
      Type: opportunityTypes[Math.floor(Math.random()*opportunityTypes.length)],
      LeadSource: opportunityLeadSources[Math.floor(Math.random()*opportunityLeadSources.length)],
      ForecastCategoryName: forecastCateroryName,
      CloseDate: setFutureDate(Math.floor(Math.random()*60))
    }
    opportunitiesToCreate.push(opportunity);
    }
  });
  return opportunitiesToCreate;
}
export {
  createFakeAccouts,
  createFakeBusinessAccount,
  createFakeContacts,
  createFakeCases,
  createFakeOpportunities
}