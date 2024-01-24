import { faker } from '@faker-js/faker';

class FakeData {
  constructor () {
    this.date = new Date();
    this.faker = faker;
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
  returnRandomDateBetweenGivenDates = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }
  createFakeEmail = (firstName, lastName) => {
    let emailAdress =
      firstName + lastName + Math.round(Math.random() * 1000) + '@test.com';
    return emailAdress.toLowerCase();
  }
  padToNDigits = (num, N) => {
	  return num.toString().padStart(N, '0');
  }
  returnDataTimeFormatted = (date) => {
    return (
      [
        date.getFullYear(),
        this.padToNDigits(date.getMonth() + 1, 2),
        this.padToNDigits(date.getDate(), 2),
      ].join('-') +
      ' ' +
      [
        this.padToNDigits(date.getHours(), 2),
        this.padToNDigits(date.getMinutes(), 2),
        this.padToNDigits(date.getSeconds(), 2),
      ].join(':')
    );
  }
  returnDataFormatted = (date) => {
    return [
      date.getFullYear(),
      this.padToNDigits(date.getMonth() + 1, 2),
      this.padToNDigits(date.getDate(), 2),
    ].join('-')
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