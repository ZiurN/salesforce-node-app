import { faker } from '@faker-js/faker';
import { FakeData } from './fakeData.js';
import * as fs from 'node:fs/promises';

const fakeData = new FakeData();

const createCustomerData = (numberOfCustomers, numberOfInvoices, sufix) => {
  let customerList = [];
	for (let i = 0; i < numberOfCustomers; i++) {
    let gender = faker.name.sex() == 'male' ? 'M' : 'F';
    let lastName = faker.name.lastName();
    let firstName = faker.name.firstName(gender);
    let personMobilePhone = faker.phone.number('###########');
    let personEmail = fakeData.createFakeEmail(firstName, lastName);
    let state = faker.address.state();
    let salary = faker.datatype.number({ min: 1200, max: 85000 });
    let customerId = faker.random.alphaNumeric(18);
    let customer = {
      customerId,
      firstName,
      lastName,
      gender,
      personMobilePhone,
      personEmail,
      state,
      salary
    }
    customerList.push(customer);
  }
  ConvertToCSV(customerList, 'customers_' + sufix);
  let invoiceList = [];
  for (let i = 0; i < numberOfInvoices; i++) {
    let customerIdx = fakeData.returnRandomIndex(customerList);
    let customer = customerList[customerIdx];
    let invoiceNumber = faker.datatype.number({ min: 10000, max: 99999 });
    let branch = customer.state;
    let customerId = customer.customerId;
    let amount = faker.datatype.number({ min: 50, max: 10000 });
    let cashierGender = faker.name.sex() == 'male' ? 'M' : 'F';
    let cashierLastName = faker.name.lastName();
    let cashierFirstName = faker.name.firstName(cashierGender);
    let invoice = {
      branch,
      cashier: cashierFirstName + ' ' + cashierLastName,
      invoiceNumber,
      date: fakeData.returnDataFormatted(faker.date.between({ from: '2020-01-01T00:00:00.000Z', to: '2023-06-31T00:00:00.000Z' })),
      customerId,
      amount
    }
    invoiceList.push(invoice);
  }
  ConvertToCSV(invoiceList, 'invoices_' + sufix);
}
const ConvertToCSV = (objArray, fileName) => {
  var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
  var str = '';
  if (objArray.length > 0) {
    let properties = Object.getOwnPropertyNames(objArray[0]);
    let headLine = '';
    properties.forEach(propertyName => {
      if (headLine != '') headLine += ','
      headLine += propertyName;
    });
    str += headLine + '\r\n';
    array.forEach((element, idx) => {
      let line = '';
      for (var index in element) {
        if (line != '') line += ','
        line += element[index];
      }
      if (idx < array.length-1) {
        str += line + '\r\n';
      } else {
        str += line;
      }
    });
  }
  fs.writeFile(fileName + '.csv', str, function (err) {
    if (err) throw err;
    console.log('File created successfully.');
  });
}
export { createCustomerData }
