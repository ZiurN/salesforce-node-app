import inquirer from 'inquirer';
import { addAccounts, getAccounts, updateAccountsLocally } from "./database.js";
import { createFakeAccouts } from "./fakeData.js";
import { insertAccounts } from "./jsforce.js";

inquirer
  .prompt([
    {
      type: 'number',
      message: 'Number of Account To create',
      name: 'accountsNumber',
      default: 1
    }
  ])
  .then((answers) => {
    if (answers.accountsNumber > 0) {
      createFakeAccouts(answers.accountsNumber).then((result) => {
        addAccounts(result)
          .then(() => {
            insertAccountsInSfQuestion();
          }).catch(error => console.log(error));
      }).catch(error => console.log(error));
    }
  })
  .catch((error) => {
    if (error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
    } else {
      // Something else went wrong
    }
  });

const insertAccountsInSfQuestion = () => {
  inquirer
    .prompt([
      {
        type: 'confirm',
        message: 'Do you want to Insert these account in Salesforce',
        name: 'insertAccountsInSF'
      }
    ])
    .then((answers) => {
      if (answers.insertAccountsInSF) {
        getAccounts().then(result => {
          result = result.filter(account => !account.Id);
            if (result.length > 0) {
              console.log('Accounts To Create in SF: ' + result.length);
              console.log(result);
              insertAccounts(result).then(accounts => {
                updateAccountsLocally(accounts);
              }).catch(error => console.log(error));
            } else {
              console.log('There is not Account to insert');
            }
          }).catch(error => {console.log(error)})
      }
    })
    .catch((error) => {
      if (error.isTtyError) {
        // Prompt couldn't be rendered in the current environment
      } else {
        // Something else went wrong
      }
    });
}