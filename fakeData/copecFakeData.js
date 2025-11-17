import { FakeData } from './fakeData.js';

class CopecFakeData extends FakeData {
  constructor() {
    super();
  }
  createFakeFrequentQuestions = (numberOfRecords) => {
    if (!numberOfRecords) numberOfRecords = 10;
    let records = [];
    for (let i = 0; i < numberOfRecords; i++) {
      let record = {
          Order__c: i + 1,
          Question__c: 'Is this the question number ' + i + '?',
          Answer__c: 'Yes, this is the answer to the question number ' + i + '.',
          Category__c: 'Producto',
          Active__c: true
      }
      records.push(record);
    }
    return records;
  }
}
export {CopecFakeData}