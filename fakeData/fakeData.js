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
}
export { FakeData }