import { Database } from "./database.js"
import { OAuht2 } from "./oauth.js"
import { JSForce } from "./jsforce.js"
import * as DevNames from "./devNames.js"
import { FakeData } from './fakeData/fakeData.js'
import { bciFakeData } from './fakeData/bci.js'

const oauth2 = new OAuht2()
const jsForce = new JSForce(oauth2.bci1001)
const database = new Database('bci1001')
const faker = new FakeData()
const fakeData = new bciFakeData()

const getBranchByBranchCode = (branchCode) => {
  let fields = {
    Id: 1,
    Name: 1,
    bci_id_sucursal__c: 1,
    bci_cod_suc__c: 1
  }
  let filters = {
    bci_cod_suc__c: branchCode
  }
  jsForce.getRecordsByFieldsList(DevNames.branchDevName, filters, fields)
    .then((records) => {
      database.upsertData('bci_Sucursal', records)
    })
    .catch((err) => {
      console.log(err)
    })
}

const getUsersByRoleInheritance = (roleName) => {
  let userFields = {
    Id: 1,
    LastName: 1,
    FirstName: 1,
    LastName: 1,
    FirstName: 1,
    Name: 1,
    'Profile.Name': 1,
    bci_Codigo_Sucursal__c: 1,
    Alias: 1,
    Title: 1
    Alias: 1,
    Title: 1
  }
  let filters = {
    $and : [
      {$or : [
        {'UserRole.Name': roleName},
        {'Manager.UserRole.Name': roleName }
      ]},
      {IsActive: true}
    ]
  }
  jsForce.getRecordsByFieldsList(DevNames.userDevName, filters, userFields)
    .then((users) => {
      database.upsertData('bci_User', users)
    })
    .catch((err) => {
      console.log(err)
    })
}
const updateAccountsToBeUsed = (branchCode, firstNameForFiltering) => {
  database.findData('bci_Sucursal', {bci_cod_suc__c: branchCode}).then((branches) => {
    console.log(branches)
    let filters = {
      FirstName : firstNameForFiltering,
      isPersonAccount: true
    }
    let accountFields = {
      Id: 1,
      FirstName: 1,
      LastName: 1,
      bci_id_sf_sucursal__c: 1
    }
    jsForce.getRecordsByFieldsList(DevNames.accountDevName, filters, accountFields)
      .then((accounts) => {
        if (accounts.length > 0) {
          let accountsToBeUsed = []
          accounts.forEach(account => {
            let accountName = faker.returnFakeName()
            let accountToBeUsed = {
              Id: account.Id,
              FirstName: accountName.firstName,
              LastName: accountName.lastName,
              bci_id_sf_sucursal__c: branches.length == 1 ? branches[0].Id : undefined
            }
            console.log(accountToBeUsed)
            accountsToBeUsed.push(accountToBeUsed)
          });
          jsForce.CRUDRecords(DevNames.accountDevName, 'Update', accountsToBeUsed)
            .then(result => {
              console.log(result)
            })
            .catch((err) => {
              console.log(err)
            })
        } else {
          console.log('No se encontrador cuentas')
        }
      })
      .catch((err) => {
        console.log(err)
      })
  })
}

const assingAccountsToUsers = (previewOwnerAlias) => {
  let userFilters = {
    $and : [
      { 'Profile.Name': 'Ejecutivo Comercial' },
      { Name: { $not: /Ejecutivo Descarterizado/} },
      { Name: { $not: /EJECUTIVO INTEGRAL/} }
    ]
  }
  let userFields = {
    Id: 1,
  }
  database.findData('bci_User', userFilters, userFields)
    .then((users) => {
      console.log(users)
      let accountFilters = {
        'bci_id_sf_sucursal__r.bci_cod_suc__c': '334',
        isPersonAccount: true,
        'Owner.Alias': previewOwnerAlias
      }
      let accountFields = {
        Id: 1,
      }
      jsForce.getRecordsByFieldsList (DevNames.accountDevName, accountFilters, accountFields)
        .then(accounts => {
          let numberOfUsers = users.length;
          let numberOfAccount = accounts.length;
          if (numberOfUsers == 0 || numberOfAccount == 0) return;
          let numberOfAccountsPerUser = Math.floor(numberOfAccount / numberOfUsers);
          let accountsToUpdate = []
          if (numberOfAccountsPerUser == 0 && numberOfAccount > 0) {
            accounts.forEach((account, idx) => {
              let userId = users[idx].Id
              account.OwnerId = userId
              accountsToUpdate.push(account)
            })
          } else {
            users.forEach((user, idx) => {
              let userId = user.Id
              let groupOfAccounts = accounts.slice(idx * numberOfAccountsPerUser, (idx + 1) * numberOfAccountsPerUser)
              groupOfAccounts.forEach(account => {
                account.OwnerId = userId
              })
              accountsToUpdate.push(...groupOfAccounts)
            })
          }
          jsForce.CRUDRecords(DevNames.accountDevName, 'Update', accountsToUpdate)
        })
        .catch((err) => {
          console.log(err)
        })
    })
    .catch((err) => {
      console.log(err)
    })
}

const createChequesProtestosPorFormaForUser = (userAlias, quantity) => {
  let financialAccountFilters = {
    $and: [
      {'FinServ__PrimaryOwner__r.Owner.Alias': userAlias},
      {FinServ__FinancialAccountNumber__c : { $not: '' }},
      {'RecordType.Name': 'BCI Cuenta'}
    ]
  }
  let financialAccountFields = {
    FinServ__FinancialAccountNumber__c: 1,
    FinServ__PrimaryOwner__c: 1,
  }
  jsForce.getRecordsByFieldsList(DevNames.finalcialAccountDevName, financialAccountFilters, financialAccountFields)
    .then(financialAccounts => {
      console.log('Cuentas Corrientes Encontradas: ' + financialAccounts.length)
      if(financialAccounts.length == 0) {
        console.log('No se encontraron cuentas')
        return
      }
      let financialAccountNumbersList = financialAccounts.map(financialAccount => financialAccount.FinServ__FinancialAccountNumber__c)
      let financialAccountsGroupedByAccount = Object.groupBy(financialAccounts, financialAccount => {
        return financialAccount.FinServ__PrimaryOwner__c
      })
      let userFields = {
        Id: 1,
        bci_Codigo_Sucursal__c: 1,
        Alias: 1
      }
      database.findData('bci_User', {Alias: userAlias}, userFields).then((users) => {
        console.log('USUARIOS ENCONTRADOS: ' + users.length)
        database.findData('bci_ChequeProtestadoForma', {'cuenta.numero': {$in: financialAccountNumbersList}}, {'cuenta.numero': 1, 'cheque.serial': 1})
          .then((chequesProtestados) => {
            let chequesProtestadosGroupedByAccountNumber = {}
            if(chequesProtestados.length > 0) {
              chequesProtestadosGroupedByAccountNumber = Object.groupBy(chequesProtestados, cheque => {
                return cheque.cuenta.numero
              })
            }
            let chequesProtestosPorFormaToInsert = []
            Object.keys(financialAccountsGroupedByAccount).forEach((key) => {
              let financialAccounts = financialAccountsGroupedByAccount[key]
              let financialAccountNumbers = financialAccounts.map(financialAccount => financialAccount.FinServ__FinancialAccountNumber__c)
              let chequesProtestosPorForma = fakeData.createFakeChequesProtestadosForma(financialAccountNumbers, chequesProtestadosGroupedByAccountNumber, quantity, users[0])
              chequesProtestosPorFormaToInsert.push(...chequesProtestosPorForma)
            });
            console.log('N° DE CHEQUES A INSERTAR: ' + chequesProtestosPorFormaToInsert.length)
            database.insertData('bci_ChequeProtestadoForma', chequesProtestosPorFormaToInsert)
            .then(
              console.log('CHEQUES INSERTADOS CORRECTAMENTE')
            ).catch((err) => {
              console.log(err)
            })
          }).catch((err) => {
            console.log(err)
          })
      }).catch((err) => {
        console.log(err)
      })
    })
    .catch((err) => {
      console.log(err)
    })

}

export {
  getBranchByBranchCode,
  getUsersByRoleInheritance,
  updateAccountsToBeUsed,
  assingAccountsToUsers,
  createChequesProtestosPorFormaForUser,
  assingAccountsToUsers,
  createChequesProtestosPorFormaForUser,
}