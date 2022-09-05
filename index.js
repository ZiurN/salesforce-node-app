import { addAccounts } from "./database.js";
import { createFakeAccouts } from "./fakeData.js";
import { insertAccounts } from "./jsforce.js";

addAccounts(createFakeAccouts(2))
  .then((result) => {
    console.log(result.length);
    insertAccounts(result);
  })
  .catch((error) => console.log(error));