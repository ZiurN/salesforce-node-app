import { faker } from '@faker-js/faker';

class FakeData {
  constructor () {
    this.date = new Date();
  }
  returnRandomIndex = (array) => {
    return Math.floor(Math.random()*array.length);
  }
  setPastDate = (monthsAgo) => {
    let yearsAgo = Math.floor(monthsAgo/12);
    monthsAgo = yearsAgo == 0 ? monthsAgo : monthsAgo % 12;
    let pastDate = new Date();
    pastDate.setFullYear(this.date.getFullYear() - yearsAgo);
    pastDate.setMonth(this.date.getMonth() - monthsAgo);
    return pastDate;
  }
  setFutureDate = (monthsAhead) => {
    let yearsAhead = Math.floor(monthsAhead/12);
    monthsAhead = yearsAhead == 0 ? monthsAhead : monthsAhead % 12;
    let futureDate = new Date();
    futureDate.setFullYear(this.date.getFullYear() + yearsAhead);
    futureDate.setMonth(this.date.getMonth() + monthsAhead);
    return futureDate;
  }
  createFakeEmail = (firstName, lastName) => {
    let emailAdress =
      firstName + lastName + Math.round(Math.random() * 1000) + '@test.com';
    return emailAdress.toLowerCase();
  }
  padTo2Digits = (num) => {
	return num.toString().padStart(2, '0');
  }
  returnDataFormatted = (date) => {
    return (
      [
      date.getFullYear(),
      this.padTo2Digits(date.getMonth() + 1),
      this.padTo2Digits(date.getDate()),
      ].join('-') +
      ' ' +
      [
      this.padTo2Digits(date.getHours()),
      this.padTo2Digits(date.getMinutes()),
      this.padTo2Digits(date.getSeconds()),
      ].join(':')
    );
  }
  createBasicFakeAccount = (isPersonAccount) => { 
    if (isPersonAccount) {
      let sex = faker.name.sex()
      let lastName = faker.name.lastName()
      let firstName = faker.name.firstName(sex)
      let personalInfo = {
        LastName: lastName,
        FirstName: firstName,
        PersonMobilePhone: faker.phone.number('9########'),
        PersonEmail: this.createFakeEmail(firstName, lastName),
        Salutation: sex == 'male' ? 'Mr.' : 'Mrs.',
        PersonBirthdate: faker.date.between('1940-01-01T00:00:00.000Z', '2005-01-01T00:00:00.000Z')
      }
      let account = {
        ...personalInfo
      }
      return account;
    }
  }
  returnFakeName = () => {
    let sex = faker.name.sex()
    let lastName = faker.name.lastName()
    let firstName = faker.name.firstName(sex)
    return {sex, lastName, firstName}
  }
}
export { FakeData }