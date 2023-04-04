import { Faker, faker } from '@faker-js/faker';
import { CASE, OPPORTUNITY } from "../metadata/aureumTest.js";
import random from 'random';
import { FakeData } from './fakeData.js';

const fakeData = new FakeData();

class AureumFakeData {
  type = [
    "Prospect",
    "Customer - Direct",
    "Customer - Channel",
    "Channel Partner / Reseller",
    "Installation Partner",
    "Technology Partner",
    "Other"
  ];
  accountSources = [
    "Web",
    "Phone Inquiry",
    "Partner Referral",
    "Purchased List",
    "Other"
  ];
  industries = [
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
  caseReasons = [
    "Installation",
    "Equipment Complexity",
    "Performance",
    "Breakdown",
    "Equipment Design",
    "Feedback",
    "Other"
  ];
  caseOrigins = [
    "Phone",
    "Email",
    "Web"
  ];
  productFamilies = [
    "Digital Media",
    "Accessories",
    "Laptops",
    "Tablets",
    "Phones"
  ];
  opportunityStage = [
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
  opportunityTypes = [
    "Existing Customer - Upgrade",
    "Existing Customer - Replacement",
    "Existing Customer - Downgrade",
    "New Customer",
  ];
  opportunityLeadSources = [
    "Web",
    "Phone Inquiry",
    "Partner Referral",
    "Purchased List",
    "Other"
  ];
  opportunityForeCastCategories = [
    "Omitted",
    "Pipeline",
    "BestCase",
    "Forecast",
    "Closed"
  ];
  opportunityForeCastCategoryNames = {
    Omitted: "Omitted",
    Pipeline: "Pipeline",
    BestCase: "Best Case",
    Forecast: "Commit",
    Closed: "Closed"
  }
  opportunitySources = [
    "Marketing",
    "BDR",
    "Alliances",
    "AE"
  ]
  owneIds = [
    "005Dm000001m0DmIAI",
    "005Dm000001m0DqIAI",
    "005Dm000001m0DaIAI",
    "005Dm000001m0DbIAI",
    "005Dm000001m0DcIAI",
    "005Dm000001m0DdIAI",
    "005Dm000001m0DeIAI",
    "005Dm000001m0DfIAI",
    "005Dm000001m0DgIAI",
    "005Dm000001m0DhIAI",
    "005Dm000001m0DiIAI",
    "005Dm000001m0DjIAI",
    "005Dm000001m0DkIAI",
    "005Dm000001m0DlIAI",
    "005Dm000001m0DnIAI",
    "005Dm000001m0DoIAI",
    "005Dm000001m0DpIAI",
    "005Dm000001m0DrIAI",
    "005Dm000001m0DtIAI",
    "005Dm000001ZcCxIAK",
    "005Dm000001m0DZIAY"
  ];
  createFakeBusinessAccount = (numberOfAccounts) => {
    let accountsToCreate = [];
    for (let i = 0; i < numberOfAccounts; i++) {
      //Create random Account
      let externalId = faker.random.alphaNumeric(64);
      let country = faker.address.country();
      let account = {
        au_External_Id__c: externalId,
        Name: faker.company.name() + ' ' + faker.company.companySuffix(),
        Type: type[fakeData.returnRandomIndex(type)],
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
        Industry: industries[fakeData.returnRandomIndex(industries)],
        AnnualRevenue: 1000000.0,
        NumberOfEmployees: 5000,
        Ownership: null,
        TickerSymbol: null,
        Description: null,
        Rating: null,
        Site: null,
        Jigsaw: null,
        AccountSource: accountSources[fakeData.returnRandomIndex(accountSources)],
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
  createFakeContacts = (relatedAccountsInfo) =>{
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
          Email: fakeData.createFakeEmail(firstName, lastName),
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
  createFakeCases = (relatedAccountInfo) => {
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
            Reason: caseReasons[fakeData.returnRandomIndex(caseReasons)],
            Origin: caseOrigins[fakeData.returnRandomIndex(caseOrigins)],
            Subject: "Case about " + faker.commerce.productAdjective() + " " + faker.commerce.product(),
            Priority: "Low",
            Description: null,
            IsEscalated: true,
            EngineeringReqNumber__c: null,
            PotentialLiability__c: null,
            CSAT__c: 105.0,
            Case_ExternalId__c: externalId,
            FCR__c: false,
            Product_Family_KB__c: productFamilies[fakeData.returnRandomIndex(productFamilies)],
            SLAViolation__c: "Compliant",
            SLA_Type__c: "Basic"
          }
          casesToCreate.push(caseToCreate);
        }
      });
    });
    return casesToCreate;
  }
  createFakeOpportunities = (relatedAccountsAndContactsInfo) => {
    let opportunitiesToCreate = [];
    relatedAccountsAndContactsInfo.forEach(info => {
      for (let i = 0; i < info.numberOfOpportunities; i++) {
      let probability = Math.random();
      let amount = faker.finance.amount(250, 950000, 0);
      let totalOpportunityQuantity = faker.finance.amount(0, 5000, 0);
      let forecastCategory = opportunityForeCastCategories[fakeData.returnRandomIndex(opportunityForeCastCategories)];
      let forecastCateroryName = opportunityForeCastCategoryNames[forecastCategory];
      let opportunity = {
        AccountId: info.account.Id,
        TrackingNumber__c: faker.random.alphaNumeric(7),
        IsPrivate: false,
        Name: "The " + info.contact.LastName + " Opportunity ",
        Description: "Opportunity created by Aureum",
        StageName: opportunityStage[fakeData.returnRandomIndex(opportunityStage)],
        Amount: Number(amount),
        Probability: Math.floor(probability*100),
        TotalOpportunityQuantity: totalOpportunityQuantity > 150 ? totalOpportunityQuantity: null,
        CloseDate: null,
        Type: opportunityTypes[fakeData.returnRandomIndex(opportunityTypes)],
        LeadSource: opportunityLeadSources[fakeData.returnRandomIndex(opportunityLeadSources)],
        ForecastCategoryName: forecastCateroryName,
        CloseDate: fakeData.setFutureDate(Math.floor(Math.random()*60))
      }
      opportunitiesToCreate.push(opportunity);
      }
    });
    return opportunitiesToCreate;
  }
  fakeUpdateCases = (casesToUpdate) => {
    let fields = CASE.fields;
    let updatedCases = [];
    let fieldsToChoose = CASE.tracked_fields;
    let statusOptions = {
      New: "Working",
      Working: "Escalated",
      Escalated: "Working",
      Closed: "Closed"
    }
    casesToUpdate.forEach(caseToUpdate => {
      let noPickListOptions = {
        OwnerId: owneIds[fakeData.returnRandomIndex(owneIds)],
        Description: 'The ' + new Date() + ' get invoice details'
      }
      let fieldToUpdate = fieldsToChoose[fakeData.returnRandomIndex(fieldsToChoose)];
      let currentValue = caseToUpdate[fieldToUpdate];
      let updatedCase = {};
      updatedCase.Id = caseToUpdate.Id,
      updatedCase[fieldToUpdate] = function () {
        if (typeof currentValue === 'boolean') {
          return !currentValue
        } else {
          let field = fields.find(field => field.name === fieldToUpdate);
          let isPickListField = field && field.picklistValues.length > 0;
          let isNotPickListField = field && field.picklistValues.length === 0;
          if (isPickListField && fieldToUpdate !== 'Status') {
            let otherValues = field.picklistValues.filter(pickListValue => pickListValue.value !== currentValue);
            return otherValues[fakeData.returnRandomIndex(otherValues)].value;
          } else if (isPickListField && fieldToUpdate === 'Status') {
            return statusOptions[currentValue];
          } else if (isNotPickListField) {
            return noPickListOptions[fieldToUpdate];
          }
        }
      }();
      updatedCases.push(updatedCase);
    });
    return updatedCases
  }
  fakeUpdateOpportunities = (opportunitiesToUpdate) => {
    let updatedOpportunities = [];
    let fields = OPPORTUNITY.fields;
    let fieldsToChoose = OPPORTUNITY.tracked_fields;
    let stageList = [
      "Qualification",
      "Needs Analysis",
      "Value Proposition",
      "Id. Decision Makers",
      "Perception Analysis",
      "Proposal/Price Quote"
    ];
    let stageOptions = {
      "Prospecting": "Qualification",
      "Qualification": "Needs Analysis",
      "Needs Analysis": "Value Proposition",
      "Value Proposition": "Id. Decision Makers",
      "Id. Decision Makers": "Perception Analysis",
      "Perception Analysis": "Proposal/Price Quote",
      "Proposal/Price Quote": "Negotiation/Review",
      "Negotiation/Review": stageList[fakeData.returnRandomIndex(stageList)],
      "Closed Won": "Closed Won",
      "Closed Lost": "Closed Lost"
    }
    opportunitiesToUpdate.forEach(opportunityToUpdate => {
      let fieldToUpdate = fieldsToChoose[fakeData.returnRandomIndex(fieldsToChoose)];
      let currentValue = opportunityToUpdate[fieldToUpdate];
      let updatedOpportunity = {};
      let newProbability = function (lastValue) {
        if (typeof lastValue === 'number') {
          let newValue = Math.floor(lastValue*random.float(0.8, 1.3));
          return newValue > 100? 100 : newValue;
        } else return lastValue;
      };
      let noPickListOptions = {
        OwnerId: owneIds[fakeData.returnRandomIndex(owneIds)],
        Description: 'The ' + new Date() + ' get invoice details',
        Amount: typeof currentValue === 'number' ? Math.floor(currentValue*random.float(0.9, 1.2)) : currentValue,
        NextStep: 'The next step will be discussed at ' + new Date(),
        Opportunity_Source__c: opportunitySources[fakeData.returnRandomIndex(opportunitySources)],
        Probability: newProbability(currentValue),
        TotalOpportunityQuantity: typeof currentValue === 'number' ? Math.floor(currentValue*random.float(0.9, 1.2)) : currentValue
      }
      updatedOpportunity.Id = opportunityToUpdate.Id,
      updatedOpportunity[fieldToUpdate] = function () {
        if (typeof currentValue === 'boolean') {
          return !currentValue
        } else {
          let field = fields.find(field => field.name === fieldToUpdate);
          let isPickListField = field && field.picklistValues.length > 0;
          let isNotPickListField = field && field.picklistValues.length === 0;
          if (isPickListField && fieldToUpdate !== 'StageName') {
            let otherValues = field.picklistValues.filter(pickListValue => pickListValue.value !== currentValue);
            return otherValues[fakeData.returnRandomIndex(otherValues)].value;
          } else if (isPickListField && fieldToUpdate === 'StageName') {
            return stageOptions[currentValue];
          } else if (isNotPickListField) {
            return noPickListOptions[fieldToUpdate];
          }
        }
      }();
      updatedOpportunities.push(updatedOpportunity);
    });
    return updatedOpportunities;
  }
}
export { AureumFakeData }