import { Faker, faker } from "@faker-js/faker";

const createFakeEmail = (firstName, lastName) => {
  let emailAdress =
    firstName + lastName + Math.round(Math.random() * 1000) + "@test.com";
  return emailAdress.toLowerCase();
};

const createFakeAccouts = (numberOfAccounts) => {
  let accountsToCreate = [];
  for (let i = 0; i < numberOfAccounts; i++) {
    //Create random Account.
    let sex = faker.name.sex();
    let lastName = faker.name.lastName();
    let firstName = faker.name.firstName(sex);
    let personalInfo = {
      Sex__c: sex == "male" ? "M" : "F",
      LastName: lastName,
      FirstName: firstName,
      PersonMobilePhone: faker.phone.number("+876 ########"),
      PersonEmail: createFakeEmail(firstName, lastName),
      Country__c: "Jamaica",
      Street__c: faker.address.streetAddress(true),
    };
    let externalId = faker.random.alphaNumeric(64);
    let accountIds = {
      CustomerID__c: externalId,
      External_ID__c: externalId,
    };
    let recordType = {
      attributes: {
        type: "RecordType",
      },
      Name: "Person Account Jamaica",
    };
    let existingCustomerRefData = {
      Flag_for_pre_approved__c: true,
      Existing_Customer__c: false,
    };
    let customerRetentionCreditRenewalRefData = {
      Flag_Contract_Expiration_Date__c: false,
      Flag_RfavailablePercent__c: false,
      Flag_Credit_Limit__c: false,
      Customer_Retention_Credit_Renewal__c: false,
    };
    let DisappearingCustomer_6_18_monthsRefData = {
      Flag_for_inactive__c: false,
      Flag_inactive_date_between_6_18_months__c: false,
      Disappearing_Customers_6_18_months__c: false,
    };
    let DisappearingCustomer_moreThan_18_monthsRefData = {
      Disappearing_Customers_18__c: false,
      Flag_inactive_date_greater_than_18_month__c: false,
    };

    let account = {
      ...personalInfo,
      ...accountIds,
      ...existingCustomerRefData,
      ...customerRetentionCreditRenewalRefData,
      ...DisappearingCustomer_6_18_monthsRefData,
      ...DisappearingCustomer_moreThan_18_monthsRefData,
      'RecordType.Name': "Person Account Jamaica",
      PersonLeadSource: "Integration",
      AccountSource: "Integration",
      Tiene_Capital_Adelantado__c: true,
      Approve_spending_limit__c: 258000.0,
      ISO__c: "JM",
      Last_salary_info_updated__c: 70000.0,
      Net_disposable_income_Ndi__c: 70000.0,
      RfavailablePercent_Fixed_Value__c: 40.0,
    };
    accountsToCreate.push(account);
  }
  return accountsToCreate;
};

export {createFakeAccouts}
