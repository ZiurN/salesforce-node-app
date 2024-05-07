import { Database } from './database.js'
import { OAuht2 } from './oauth.js'
import { JSForce } from './jsforce.js'
import * as DevNames from './devNames.js'
import { FakeData } from './fakeData/fakeData.js'
import { bciFakeData } from './fakeData/bci.js'
import { bciSalesforce} from './CRM/bciSalesforce.js'
import { DataMigration } from './dataMigration/dataMigration.js'
import { BciDataMigration } from './dataMigration/bciDataMigration.js'

const oauth2 = new OAuht2()
const jsForce = new JSForce(oauth2.bci1001)
const database = new Database('bci1001')
const faker = new FakeData()
const fakeData = new bciFakeData()
const crmBci1001 = new bciSalesforce(oauth2.bci1001)
const crmBciUATMinorCO = new bciSalesforce(oauth2.bciUatMinorCO)
const dataMigration = new DataMigration(database, crmBci1001, crmBciUATMinorCO)
const bciDataMigration = new BciDataMigration(database, crmBci1001, crmBciUATMinorCO)

const syncBranchesFromSalesforce = (branchCodes) => {
  let filters = branchCodes ? { bci_cod_suc__c: { $in : branchCodes } } : {}
  dataMigration.syncSOBjectsFromSalesforce(crmBci1001.retrieveBranches(filters), 'bci_Sucursal')
}
const syncBranchesFromDatabase = (insert, branchCodes) => {
  let filters = branchCodes ? { bci_cod_suc__c: { $in : branchCodes } } : {}
  let fields = crmBci1001.branchFields
  let colletion = 'bci_Sucursal'
  let SObjectDevName = DevNames.branchDevName
  let upsertField = 'bci_id_sucursal__c'
  dataMigration.syncSOBjectsFromDatabase(fields, colletion, SObjectDevName, upsertField, insert, filters)
}
const syncCommercialUsersByRoleInheritanceFromSalesforce = async (roleName, getLevelUsers) => {
  let andQueryFilters = [
    ...DevNames.commercialUsersStandardFilters,
    { 'UserRole.Name': { $nlike: '%PLATAFORMA%' } },
    { Title: { $nlike: '%EJECUTIVO INTEGRAL%' } },
    { Title: { $nlike: '%ASISTENTE%' } },
    { IsActive: true }
  ]
  let filters = {
    $and : andQueryFilters
  }
  if (getLevelUsers) {
    let parentRoleFilters = {
      $or : [
        { Name: roleName },
        { DeveloperName: roleName }
      ]
    }
    let parentRoles = await database.findData('bci_UserRole', parentRoleFilters, {Id: 1, ParentRoleId: 1})
    if (parentRoles.length == 0) return []
    let roles = await getChildrenRolesFromParentRoleName(parentRoles)
    let rolesIds = roles.map(role => role.Id)
    filters.$and.push({'UserRole.Id': {$in: rolesIds}})
  } else {
    filters.$and.push({$or: [
      {'UserRole.Name': roleName},
      {'UserRole.DeveloperName': roleName}
    ]})
  }
  dataMigration.syncSOBjectsFromSalesforce(crmBci1001.retrieveUsers(filters), 'bci_User')
}
const getChildrenRolesFromParentRoleName = (parentRoles) => {
  return new Promise((resolve, reject) => {
    let idList = parentRoles.map(parentRole => parentRole.Id)
    database.findData('bci_UserRole', { ParentRoleId: { $in: idList}}, {Id: 1})
      .then(childrenRoles => {
        if (childrenRoles.length == 0) resolve(parentRoles)
        else {
          getChildrenRolesFromParentRoleName(childrenRoles)
            .then((returnedChildrenRoles) => {
              resolve([...parentRoles, ...returnedChildrenRoles])
            })
        }
      })
      .catch(err => {reject(err)})
  })
}
const syncUsersFromDatabase = (insert, filters) => {
  let fields = crmBci1001.userFields
  delete fields.Name
  filters = filters ? filters : {}
  let collection = 'bci_User'
  let SObjectDevName = DevNames.userDevName
  let upsertField = 'bci_usr_rut__c'
  dataMigration.syncSOBjectsFromDatabase(fields, collection, SObjectDevName, upsertField, insert, filters)
}
const syncAccountsBetweenOrgs = () => {
  let filters = [
    { isPersonAccount: true },
    { bci_cli_rut__c : { $ne: null } },
  ]
  bciDataMigration.syncAccountsToBeMigrated({ $and: filters })
}
const syncAccountsFromSalesforce = (filters) => {
  filters = filters ? filters : {}
  dataMigration.syncSOBjectsFromSalesforce(crmBci1001.retrieveAccounts(filters), 'bci_Account')
}
const syncAccountsFromDatabase = (insert, filters) => {
  filters = filters ? filters : {}
  let fields = crmBci1001.accountFields
  delete fields.Name
  delete fields.IsPersonAccount
  delete fields.PersonContactId
  delete fields.bci_estado_mora__c
  let collection = 'bci_Account'
  let SObjectDevName = DevNames.accountDevName
  let upsertField = 'bci_cli_rut__c'
  dataMigration.syncSOBjectsFromDatabase(fields, collection, SObjectDevName, upsertField, insert, filters)
}

const updateAccountsToBeUsed = (branchCode, firstNameForFiltering) => {
  database.findData('bci_Sucursal', {bci_cod_suc__c: branchCode}).then((branches) => {
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
const reAssignAccountsToUsers = (previewOwnerAlias, branchCode) => {
  let userFilters = {
    $and : [
      { 'Profile.Name': 'Ejecutivo Comercial' },
      { Name: { $not: /Ejecutivo Descarterizado/} },
      { Name: { $not: /EJECUTIVO INTEGRAL/} },
      { bci_Codigo_Sucursal__c : branchCode }
    ]
  }
  let userFields = {
    Id: 1,
  }
  database.findData('bci_User', userFilters, userFields)
    .then((users) => {
      if (users.length == 0) {
        console.log('No se encontraron usuarios')
        return
      }
      let accountFilters = {
        'bci_id_sf_sucursal__r.bci_cod_suc__c': branchCode,
        isPersonAccount: true
      }
      if (previewOwnerAlias) {
        accountFilters['Owner.Alias'] = previewOwnerAlias
      }
      let accountFields = {
        Id: 1,
      }
      jsForce.getRecordsByFieldsList (DevNames.accountDevName, accountFilters, accountFields)
        .then(accounts => {
          if (accounts.length == 0) {
            console.log('No se encontraron cuentas')
            return
          }
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
const assignAccountsWithoutBranch = (branchCode, numberOfAccountsToReAssign) => {
  database.findData('bci_Sucursal', {bci_cod_suc__c: branchCode})
    .then((branches) => {
      if (branches.length == 0) {
        console.log('No se encontró la sucursal')
        return
      }
      let branch = branches[0]
      let userFilters = {
        $and : [
          { 'Profile.Name': 'Ejecutivo Comercial' },
          { Name: { $not: /Ejecutivo Descarterizado/} },
          { Name: { $not: /EJECUTIVO INTEGRAL/} },
          { bci_Codigo_Sucursal__c : branchCode }
        ]
      }
      let userFields = {
        Id: 1,
      }
      database.findData('bci_User', userFilters, userFields)
        .then((users) => {
          if (users.length == 0) {
            console.log('No se encontraron usuarios')
            return
          }
          let accountFilters = {
            'bci_id_sf_sucursal__r.bci_cod_suc__c': null,
            isPersonAccount: true
          }
          let accountFields = {
            Id: 1,
          }
          jsForce.getRecordsByFieldsList (DevNames.accountDevName, accountFilters, accountFields)
            .then(accounts => {
              if (accounts.length == 0) {
                console.log('No se encontraron cuentas')
                return
              }
              let numberOfUsers = users.length;
              let numberOfAccount = accounts.length;
              if (numberOfUsers == 0 || numberOfAccount == 0) return;
              let numberOfAccountsPerUser = numberOfAccountsToReAssign
              let accountsToUpdate = []
              if (numberOfAccountsPerUser == 0 && numberOfAccount > 0) {
                accounts.forEach((account, idx) => {
                  let userId = users[idx].Id
                  account.OwnerId = userId
                  account.bci_id_sf_sucursal__c = branch.Id
                  accountsToUpdate.push(account)
                })
              } else {
                users.forEach((user, idx) => {
                  let userId = user.Id
                  let groupOfAccounts = accounts.slice(idx * numberOfAccountsPerUser, (idx + 1) * numberOfAccountsPerUser)
                  groupOfAccounts.forEach(account => {
                    account.OwnerId = userId
                    account.bci_id_sf_sucursal__c = branch.Id
                  })
                  accountsToUpdate.push(...groupOfAccounts)
                })
              }
              console.log('Cuentas para actualizar: ' + accountsToUpdate.length)
              jsForce.CRUDRecords(DevNames.accountDevName, 'Update', accountsToUpdate)
            })
            .catch((err) => {
              console.log(err)
            })
        })
        .catch((err) => {
          console.log(err)
        })
    })
    .catch((err) => {
      console.log(err)
    })
}
const createChequesProtestadosPorFormaForUser = (userAlias, quantity) => {
  let arg = {
    userAlias: userAlias,
    quantity: quantity,
    builder: fakeData.createFakeChequesProtestadosForma,
    databaseName: 'bci_ChequeProtestadoForma',
    interfaceName: null
  }
  createChequesForUser(arg)
}
const createChequesProtestadosPorFondoForUser = (userAlias, quantity, interfaceName) => {
  let arg = {
    userAlias: userAlias,
    quantity: quantity,
    builder: fakeData.createFakeChequesProtestadosFondo,
    databaseName: 'bci_ChequeProtestadoFondo',
    interfaceName: interfaceName
  }
  createChequesForUser(arg)
}
const createChequesForUser = ({userAlias, quantity, builder, databaseName, interfaceName}) => {
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
  jsForce.getRecordsByFieldsList(DevNames.finalcialAccountDevName, financialAccountFilters, financialAccountFields, quantity)
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
      database.findData('bci_User', {Alias: userAlias}, userFields)
        .then((users) => {
        console.log('USUARIOS ENCONTRADOS: ' + users.length)
        if(users.length == 0) return;
        database.findData(databaseName, {'cuenta.numero': {$in: financialAccountNumbersList}}, {'cuenta.numero': 1, 'cheque.serial': 1})
          .then((chequesProtestadosInDB) => {
            let chequesProtestadosGroupedByAccountNumber = {}
            if(chequesProtestadosInDB.length > 0) {
              chequesProtestadosGroupedByAccountNumber = Object.groupBy(chequesProtestadosInDB, cheque => {
                return cheque.cuenta.numero
              })
            }
            let chequesProtestados = []
            Object.keys(financialAccountsGroupedByAccount).forEach((key) => {
              let financialAccounts = financialAccountsGroupedByAccount[key]
              let financialAccountNumbers = financialAccounts.map(financialAccount => financialAccount.FinServ__FinancialAccountNumber__c)
              if (interfaceName) {
                chequesProtestados.push(...builder(financialAccountNumbers, chequesProtestadosGroupedByAccountNumber, users[0], interfaceName))
              } else {
                chequesProtestados.push(...builder(financialAccountNumbers, chequesProtestadosGroupedByAccountNumber, users[0]))
              }
            });
            console.log('N° DE CHEQUES A INSERTAR: ' + chequesProtestados.length)
            database.insertData(databaseName, chequesProtestados)
            .then(result => {
              console.log(result)
              console.log('CHEQUES INSERTADOS CORRECTAMENTE')
            }).catch((err) => {
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
const createCasesForUser = (recordType, userAlias) => {
  let accountFields = {
    Id: 1,
  }
  let accountfilters = {
    isPersonAccount: true,
    'Owner.Alias': userAlias
  }
  jsForce.getRecordsByFieldsList(DevNames.accountDevName, accountfilters, accountFields).then((accounts) => {
    let rtFilters = {
      $and : [
        {SobjectType: 'Case'},
        {$or : [
          {DeveloperName: recordType},
          {Name: recordType}
        ]}
      ]
    }
    database.findData('bci_RecordType', rtFilters, {Id: 1}).then((recordTypes) => {
      if (recordTypes.length == 0) {
        console.log('No se encontró el record type')
        return
      }
      if (recordTypes.length > 1) {
        console.log('Se encontraron varios tipos de registros')
        return
      }
      let casesToBeCreated = []
      accounts.forEach(account => {
        let caseToBeCreated = {
          Subject: 'Caso de Prueba',
          Status: 'Nuevo',
          Origin: 'Web',
          RecordTypeId: recordType.Id,
          AccountId: account.Id
        }
        casesToBeCreated.push(caseToBeCreated)
      })
      jsForce.CRUDRecords(DevNames.caseDevName, 'Create', casesToBeCreated).then((result) => {
        console.log(result)
      })
    });
  }).catch((err) => {
    console.log(err)
  })
}
const createContactabilidadTasksForAccount = (accountRut, quantity ) => {
  let accountFilters = {
    $and : [
      {bci_cli_rut__c: Number(accountRut)},
      {bci_cli_mora__c : true}
    ]
  }
  database.findData('bci_Account', accountFilters, {Id: 1, PersonContactId: 1})
    .then((accounts) => {
      if (accounts.length == 0) {
        console.log('No se encontró la cuenta')
        return
      }
      let account = accounts[0]
      database.findData('bci_RecordType', {DeveloperName: 'Ingreso_de_gestion'}, {Id: 1})
        .then((recordTypes) => {
          if (recordTypes.length == 0) {
            console.log('No se encontró el record type')
            return
          }
          let recordType = recordTypes[0]
          jsForce.getRecordsByFieldsList(DevNames.caseDevName, {AccountId: account.Id, Status: 'Asignado'}, {Id: 1, OwnerId: 1})
            .then((cases) => {
              if (cases.length == 0) {
                console.log('No se encontraron casos')
                return
              }
              let accountCase = cases[0]
              let TasksToBeCreated = []
              for (let i = 0; i < quantity; i++) {
                let tipoGestion = DevNames.tipoGestion['TELEFONICO'][faker.returnRandomIndex(DevNames.tipoGestion['TELEFONICO'])]
                let subject = 'Ingreso de gestión: ' + tipoGestion
                let createdDate = faker.returnDataTimeFormatted(faker.returnRandomDateBetweenGivenDates(faker.firstDayOfMonth, new Date()))
                let taskToBeCreated = {
                  /** Estas asignaciones no funcionan */
                  //WhoId: account.Id,
                  //AccountId: account.Id,
                  bci_rut_com__c: accountRut,
                  WhatId: accountCase.Id,
                  Subject: subject,
                  RecordTypeId: recordType.Id,
                  Status: 'Terminada',
                  Priority: 'Normal',
                  Type: 'Cobrar',
                  Description: 'Gestión de Contactabilidad',
                  bci_can_gestion__c: 'TELEFONICO',
                  bci_tipo_gestion__c: tipoGestion,
                  bci_ind_msj_cobranza__c: true,
                  CreatedDate: createdDate.replace(' ', 'T'),
                  ActivityDate: createdDate,
                  OwnerId: accountCase.OwnerId
                }
                console.log(taskToBeCreated)
                TasksToBeCreated.push(taskToBeCreated)
              }
              jsForce.CRUDRecords(DevNames.taskDevName, 'insert', TasksToBeCreated)
                .then(result => {
                  console.log(result)
                })
            })
        })
    })
}
const setProximosVencimientosForAccount = (accountRut) => {
  let financialAccountFilters = {
    $and: [
      {'FinServ__PrimaryOwner__r.bci_cli_rut__c': Number(accountRut)},
      {'RecordType.Name': 'BCI Tarjeta de Credito'}
    ]
  }
  let financialAccountFields = {
    Id: 1,
    bci_fec_ven__c: 1,
    bci_cnt_dias_mora__c: 1,
    bci_mto_total_pagar__c: 1,
    bci_num_cuenta_tdc__c: 1
  }
  database.findData('bci_FinancialAccount', financialAccountFilters, financialAccountFields)
    .then((financialAccounts) => {
      if (financialAccounts.length == 0) {
        console.log('No se encontraron cuentas, se procede a crear una nueva')
        createFinancialAccountForAccount(Number(accountRut), 'BCI Tarjeta de Credito')
      } else {
        let cardsWithoutDefault = financialAccounts.filter(financialAccount => financialAccount.bci_cnt_dias_mora__c)
        if (cardsWithoutDefault.length == 0) {
          //
          return
        } else {
          let cardsToBeUpdated = []
          let lastDayOfMonth = faker.returnDataFormatted(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0))
          cardsWithoutDefault.forEach(card => {
            card.bci_fec_ven__c = returnRandomDateBetweenGivenDates(new Date(), lastDayOfMonth)
            card.bci_mto_total_pagar__c = bci_mto_total_pagar__c > 0 ? bci_mto_total_pagar__c : 1
            cardsToBeUpdated.push(card)
          })
          jsForce.CRUDRecords(DevNames.finalcialAccountDevName, 'Update', cardsToBeUpdated)
        }
      }
    })
    .catch((err) => {
      console.log(err)
    })
}
const createFinancialAccountForAccount = (accountRut, recordTypeName, quantity, inDefault, createLSG, createLEM, installments) => {
  let accountFields = {
    Id: 1,
    bci_cli_rut__c: 1,
    bci_cli_dv__c: 1
  }
  database.findData('bci_Account', {bci_cli_rut__c: Number(accountRut)}, accountFields)
    .then((accounts) => {
      if (accounts.length == 0) {
        console.log('No se encontró la cuenta')
        return
      }
      let account = accounts[0]
      let rtFilters = {
        $and : [
          {SobjectType: 'FinServ__FinancialAccount__c'},
          {$or : [
            {DeveloperName: recordTypeName},
            {Name: recordTypeName}
          ]}
        ]
      }
      database.findData('bci_RecordType', rtFilters, {Id: 1})
        .then((recordTypes) => {
          if (recordTypes.length == 0) {
            console.log('No se encontró el record type')
            return
          }
          let recordType = recordTypes[0]
          let isTC = recordTypeName == 'BCI Tarjeta de Credito' || recordTypeName == 'bci_tarjeta_de_credito'
          let isCuentaCorriente = recordTypeName == 'BCI Cuenta' || recordTypeName == 'bci_cuenta'
          let isCHIP = recordTypeName == 'BCI Credito Hipotecario' || recordTypeName == 'bci_credito_hipotecario'
          let isLeasing = recordTypeName == 'BCI Leasing' || recordTypeName == 'bci_leasing'
          let isCC = recordTypeName == 'BCI Credito Consumo' || recordTypeName == 'bci_credito_consumo'
          let isComex = recordTypeName == 'BCI Credito Comex' || recordTypeName == 'bci_credito_comex'
          let args = {
            account: account,
            recordType: recordType,
            quantity: quantity,
            createLEM: createLEM === 'true',
            createLSG: createLSG === 'true',
            inDefault: inDefault === 'true',
            installments: installments
          }
          if (isTC) {
            createCreditCardsForAccount(args)
          }
          if (isCuentaCorriente) {
            createCuentasCorrientesForAccount(args)
          }
          if (isCHIP) {
            createCHIPsForAccount(args)
          }
          if (isLeasing) {
            createLeasingsForAccount(args)
          }
          if (isCC) {
            createCreditosConsumoForAccount(args)
          }
          if (isComex) {
            createComexForAccount(args)
          }
          retrieveFinancialAccounts([{ Id: account.Id }])
        })
    })
}
const createCreditCardsForAccount = ({account, recordType, quantity, inDefault}) => {
  let creditCardsToBeCreated = []
  let registrosDeudaMora = []
  for (let i = 0; i < quantity; i++) {
    let lastDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    let cardNumber = faker.faker.finance.creditCardNumber().replace(/-/g, '').substring(0, 16)
    let creditCard = {
      FinServ__PrimaryOwner__c: account.Id,
      RecordTypeId: recordType.Id,
      FinServ__FinancialAccountNumber__c: cardNumber,
      bci_num_cuenta_tdc__c: cardNumber,
      bci_fec_ven__c: faker.returnDataTimeFormatted(faker.returnRandomDateBetweenGivenDates(new Date(), lastDayOfMonth))
    }
    let montoInicial = Number(faker.faker.finance.amount(400000, 1000000, 0))
    if (inDefault) {
      let diasEnMora = faker.faker.datatype.number({min: 3, max: 89})
      let mora1A30Dias = montoInicial
      let mora31A60Dias = diasEnMora > 30 ? mora1A30Dias + Number(faker.faker.finance.amount(10000, 1000000, 0)) : 0
      let mora61A90Dias = diasEnMora > 60 ? mora31A60Dias + Number(faker.faker.finance.amount(10000, 1000000, 0)) : 0
      let registroDeudaMora = {
        detalleDeudaMora: {
          mora1A30Dias: mora1A30Dias,
          mora31A60Dias: mora31A60Dias,
          mora61A90Dias: mora61A90Dias
        }
      }
      let montoTotalAPagar = 0
      let detalleDeudaMora = registroDeudaMora.detalleDeudaMora
      Object.keys(detalleDeudaMora).forEach(key => {
        montoTotalAPagar += detalleDeudaMora[key]
      })
      registroDeudaMora.montoTotalAPagar = montoTotalAPagar
      registrosDeudaMora.push(registroDeudaMora)
      creditCard.bci_mto_total_pagar__c = montoTotalAPagar
      creditCard.bci_cnt_dias_mora__c = diasEnMora
    }
    creditCardsToBeCreated.push(creditCard)
  }
  jsForce.CRUDRecords(DevNames.finalcialAccountDevName, 'Insert', creditCardsToBeCreated)
    .then(result => {
      console.log(result)
      if (result.ids.length == 0) {
        console.log('No hay Ids de cuentas')
        return
      }
      let financialAccountIds = result.ids
      let plasticCardsToBeCreated = []
      financialAccountIds.forEach((financialAccountId, idx) => {
        let plasticCard = {
          FinServ__AccountHolder__c: account.Id,
          FinServ__FinancialAccount__c: financialAccountId,
          FinServ__Active__c: true,
          FinServ__OwnershipType__c: 'Primary',
          bci_num_tarjeta__c: creditCardsToBeCreated[idx].FinServ__FinancialAccountNumber__c,
          bci_mon_int_aut__c: Math.floor(creditCardsToBeCreated[idx].bci_mto_total_pagar__c * (1/900)),
          bci_mon_nac_aut__c: creditCardsToBeCreated[idx].bci_mto_total_pagar__c,
          bci_glosa_est__c: 'ACTIVADA'
        }
        plasticCardsToBeCreated.push(plasticCard)
      })
      jsForce.CRUDRecords(DevNames.cardDevName, 'Insert', plasticCardsToBeCreated)
        .then(result => {
          console.log(result)
          if (registrosDeudaMora.length == 0) return
          database.insertData('bci_RegistroDeudaMora', registrosDeudaMora)
        })
        .catch((err) => {
          console.log(err)
        })
    })
    .catch((err) => {
      console.log(err)
    })

}
const createCuentasCorrientesForAccount = ({account, recordType, quantity, createLEM, createLSG, inDefault}) => {
  let cuentasCorrientesToBeCreated = []
  for (let i = 0; i < quantity; i++) {
    let amount =  faker.faker.finance.amount(10000, 1000000, 0)
    let cuentaCorrienteToBeCreated = {
      FinServ__PrimaryOwner__c: account.Id,
      RecordTypeId: recordType.Id,
      FinServ__FinancialAccountNumber__c: faker.faker.finance.account(12),
      FinServ__FinancialAccountType__c: 'CUENTA CORRIENTE',
      bci_sdo_cont_ayer__c: amount,
      FinServ__Balance__c: amount,
      FinServ__OpenDate__c: faker.returnDataTimeFormatted(faker.setPastDate(Math.floor(Math.random()*48)))
    }
    cuentasCorrientesToBeCreated.push(cuentaCorrienteToBeCreated)
  }
  jsForce.CRUDRecords(DevNames.finalcialAccountDevName, 'Insert', cuentasCorrientesToBeCreated)
    .then(result => {
      console.log(result)
      if (result.ids.length == 0) {
        console.log('No hay Ids de cuentas')
        return
      }
      if (createLEM || createLSG) {
        let recordTypesFilters = {
          $and : [
            {SobjectType: 'FinServ__FinancialAccount__c'},
            {$or : [
              {DeveloperName: 'bci_linea_emergencia'},
              {DeveloperName: 'bci_linea_sobregiro'},
            ]}
          ]
        }
        database.findData('bci_RecordType', recordTypesFilters, {Id: 1, DeveloperName: 1})
          .then(lineasRecordTypes => {
            let sobreGiroRT = lineasRecordTypes.find(lineaRecordType => lineaRecordType.DeveloperName == 'bci_linea_sobregiro')
            let emergenciaRT = lineasRecordTypes.find(lineaRecordType => lineaRecordType.DeveloperName == 'bci_linea_emergencia')
            let lineasToBeCreated = []
            let registrosDeudaMora = []
            result.ids.forEach((cuentaCorrienteId, idx) => {
              let cuentaCorriente = cuentasCorrientesToBeCreated[idx]
              let lineaToBeCreated = {
                bci_cuenta_rel__c: cuentaCorrienteId,
                FinServ__PrimaryOwner__c: account.Id,
                FinServ__OpenDate__c: cuentaCorriente.FinServ__OpenDate__c
              }
              if (createLEM) {
                let amount = faker.faker.finance.amount(10000, 1000000, 0)
                let LEMToBeCreated = {
                  ...lineaToBeCreated,
                  RecordTypeId: emergenciaRT.Id,
                  FinServ__FinancialAccountNumber__c: 'LEM' + faker.faker.finance.account(12),
                  FinServ__Balance__c: amount,
                  FinServ__TotalCreditLimit__c: amount
                }
                lineasToBeCreated.push(LEMToBeCreated)
              }
              if (createLSG) {
                let amount = faker.faker.finance.amount(10000, 1000000, 0)
                let LSGToBeCreated = {
                  ...lineaToBeCreated,
                  RecordTypeId: sobreGiroRT.Id,
                  FinServ__FinancialAccountNumber__c: 'LSG' + faker.faker.finance.account(12),
                  FinServ__Balance__c: amount,
                  FinServ__TotalCreditLimit__c: amount
                }
                if (inDefault) {
                  let deudaTotal = Number(amount) - (faker.faker.finance.amount(1000, amount))
                  let diasEnMora = faker.faker.datatype.number(30, 89)
                  let registroDeudaMora = {
                    numeroCuentaCorriente: cuentaCorriente.FinServ__FinancialAccountNumber__c,
                    numeroCuentaSobregiro: LSGToBeCreated.FinServ__FinancialAccountNumber__c,
                    codigoGarantia: "SIN",
                    rut: account.bci_cli_rut__c,
                    dv: account.bci_cli_dv__c,
                    rutAval: 0,
                    dvAval:  '',
                    valorSpread: 1.8,
                    valorAutorizado: null,
                    porcentajePago: 0,
                    fechaVencimiento: faker.returnDataTimeFormatted(faker.setPastDate(diasEnMora/30)),
                    codigoComision: 0,
                    montoUtilizado: 0,
                    interes: deudaTotal*0.01,
                    deudaTotal: deudaTotal,
                    periodoPago: 1,
                    seguroDesgravamen: "S",
                    codigoTipoPlan: "Y",
                    seguroCesantia: "N",
                    porcentaje: 0,
                    estadoCuentaCorriente: "VIG",
                    fechaApertura: cuentaCorriente.FinServ__OpenDate__c,
                    tipo: 0,
                    fechaInicio: faker.returnDataTimeFormatted(faker.setPastDate(diasEnMora/30)),
                    fechaFin: null,
                    tipoBanco: null,
                    indicador: 0,
                    porcentajeDescuento: 0,
                    tasa: 0,
                    cuenta: null
                  }
                  registrosDeudaMora.push(registroDeudaMora)
                  LSGToBeCreated.bci_mto_total_pagar__c = deudaTotal
                  LSGToBeCreated.bci_monto_utilizado__c = amount - deudaTotal
                  LSGToBeCreated.bci_mon_interes__c = deudaTotal*0.01
                  LSGToBeCreated.bci_cnt_dias_mora__c = diasEnMora
                }
                lineasToBeCreated.push(LSGToBeCreated)
              }
            })
            jsForce.CRUDRecords(DevNames.finalcialAccountDevName, 'Insert', lineasToBeCreated)
              .then(result => {
                console.log(result)
                if (registrosDeudaMora.length == 0) return
                database.insertData('bci_RegistroDeudaMora', registrosDeudaMora)
              })
              .catch((err) => {
                console.log(err)
              })
          })
          .catch((err) => {
            console.log(err)
          })
      }
    })
    .catch((err) => {
      console.log(err)
    })
}
const createCHIPsForAccount = ({account, recordType, quantity, inDefault, installments}) => {
  let chipsToBeCreated = []
  let registrosDeudaMora = []
  for (let i = 0; i < quantity; i++) {
    let amount = faker.faker.finance.amount(8000, 600000)*1000
    let openDate = faker.setPastDate(Math.floor(Math.random()*120))
    let numberOfinstallments = 20*12 //REVISAR
    let today = new Date()
    ///Pendiente ver en qué campos se guarda el valor total del crédito y la fecha de finalización
    let chipToBeCreated = {
      FinServ__PrimaryOwner__c: account.Id,
      RecordTypeId: recordType.Id,
      FinServ__FinancialAccountNumber__c: '00' + faker.faker.finance.account(8),
      FinServ__FinancialAccountType__c: 'CHIP',
      FinServ__OpenDate__c: faker.returnDataTimeFormatted(openDate)
    }
    let numberOfMonthsSinceCreation = today.getMonth() - openDate.getMonth() + (12 * (today.getFullYear() - openDate.getFullYear()))
    if (inDefault && numberOfMonthsSinceCreation > 1) {
      let diasEnMora = faker.faker.datatype.number({min: 30 * (installments - 1) , max: 30 * installments})
      let defaultDate = faker.setPastDate(diasEnMora/30)
      let detalleDeudaMora = []
      let nroUltimaCuota = numberOfMonthsSinceCreation - installments
      let loanAmount = Math.floor(amount / numberOfinstallments)
      for (let i = 0; i < installments; i++) {
        let seguroDesgravamen = Math.floor(loanAmount * 0.05)
        let seguroIncendio = Math.floor(loanAmount * 0.05)
        let interes = Math.floor(loanAmount * (installments - i)*0.02)
        let detalle = {
          numeroCuota: nroUltimaCuota + i,
          valorCuota: loanAmount,
          fechaVencimiento: faker.setPastDate(Math.floor(Math.random()*3)),
          interes: interes,
          interesPenal: 0,
          gastoCobranza: 0,
          valorComision: 0,
          seguroAdicionales: 0,
          subTotal: loanAmount,
          seguroDesgravamen: seguroDesgravamen,
          seguroIncendio: seguroIncendio,
          totalSeguros: seguroDesgravamen + seguroIncendio,
          totalDividendo: loanAmount + interes + seguroDesgravamen + seguroIncendio
        }
        detalleDeudaMora.push(detalle)
      }
      let deudaMoraTotal = detalleDeudaMora.reduce((total, detalle) => {
        return total + detalle.totalDividendo
      }, 0)
      console.log(deudaMoraTotal)
      let registroDeudaMora = {
        numeroOperacion: chipToBeCreated.FinServ__FinancialAccountNumber__c,
        defaultDate,
        detalleDeudaMora,
        deudaMoraTotal,
      }
      registrosDeudaMora.push(registroDeudaMora)
      console.log(detalleDeudaMora)
      console.log(deudaMoraTotal)
      chipToBeCreated.bci_mto_total_pagar__c = deudaMoraTotal
      chipToBeCreated.bci_cnt_dias_mora__c = diasEnMora
    }
    chipsToBeCreated.push(chipToBeCreated)
  }
  jsForce.CRUDRecords(DevNames.finalcialAccountDevName, 'Insert', chipsToBeCreated)
    .then(result => {
      console.log(result)
      if (registrosDeudaMora.length > 0) {
        database.insertData('bci_RegistroDeudaMora', registrosDeudaMora)
      }
    })
    .catch((err) => {
      console.log(err)
    })
}
const createCreditosConsumoForAccount = ({account, recordType, quantity, inDefault, installments}) => {
  let CCsToBeCreated = []
  let registrosDeudaMora = []
  for (let i = 0; i < quantity; i++) {
    let amount = faker.faker.finance.amount(8000, 600000)*1000
    let openDate = faker.setPastDate(Math.floor(Math.random()*120))
    let numberOfinstallments = 20*12 //REVISAR
    let today = new Date()
    //Pendiente ver en qué campos se guarda el valor total del crédito y la fecha de finalización
    let CCToBeCreated = {
      FinServ__PrimaryOwner__c: account.Id,
      RecordTypeId: recordType.Id,
      FinServ__FinancialAccountNumber__c: '00' + faker.faker.finance.account(8),
      FinServ__OpenDate__c: faker.returnDataTimeFormatted(openDate)
    }
    let numberOfMonthsSinceCreation = installments + (today.getMonth() - openDate.getMonth() + (12 * (today.getFullYear() - openDate.getFullYear())))
    if (inDefault && numberOfMonthsSinceCreation > 1) {
      let diasEnMora = faker.faker.datatype.number({min: 30 * (installments - 1) , max: 30 * installments})
      let defaultDate = faker.setPastDate(diasEnMora/30)
      let detalleMorosidad = []
      let nroUltimaCuota = numberOfMonthsSinceCreation - installments
      let loanAmount = Math.floor(amount / numberOfinstallments)
      for (let i = 0; i < installments; i++) {
        let interes = Math.floor(loanAmount * (installments - i)*0.02)
        let detalle = {
          numCuota: nroUltimaCuota + i,
          valorCuota: loanAmount,
          fechaVencimiento: faker.setPastDate(Math.floor(Math.random()*3)),
          intereses: interes,
          interesGenerado: 0,
          gastoCobranza: 0,
          valorComision: 0,
          interesesMora: interes * 0.02,
          totalCuota: loanAmount + interes + (interes * 0.02)
        }
        detalleMorosidad.push(detalle)
      }
      let deudaMoraTotal = detalleMorosidad.reduce((total, detalle) => {
        return total + detalle.totalCuota
      }, 0)
      console.log(deudaMoraTotal)
      let registroDeudaMora = {
        numeroOperacion: CCToBeCreated.FinServ__FinancialAccountNumber__c,
        defaultDate,
        detalleMorosidad,
        deudaMoraTotal,
      }
      registrosDeudaMora.push(registroDeudaMora)
      console.log(detalleMorosidad)
      console.log(deudaMoraTotal)
      CCToBeCreated.bci_mto_total_pagar__c = deudaMoraTotal
      CCToBeCreated.bci_cnt_dias_mora__c = diasEnMora
    }
    CCsToBeCreated.push(CCToBeCreated)
  }
  jsForce.CRUDRecords(DevNames.finalcialAccountDevName, 'Insert', CCsToBeCreated)
    .then(result => {
      console.log(result)
      if (registrosDeudaMora.length > 0) {
        database.insertData('bci_RegistroDeudaMora', registrosDeudaMora)
      }
    })
    .catch((err) => {
      console.log(err)
    })
}
const createLeasingsForAccount = ({account, recordType, quantity, inDefault}) => {
  let leasingsToBeCreated = []
  let registrosDeudaMora = []
  for (let i = 0; i < quantity; i++) {
    let amount = faker.faker.finance.amount(8000, 600000)*1000
    let openDate = faker.setPastDate(Math.floor(Math.random()*120))
    let numberOfinstallments = 20*12 //REVISAR
    let today = new Date()
    //Pendiente ver en qué campos se guarda el valor total del crédito y la fecha de finalización
    let leasingToBeCreated = {
      FinServ__PrimaryOwner__c: account.Id,
      RecordTypeId: recordType.Id,
      FinServ__FinancialAccountNumber__c: faker.faker.finance.account(8),
      FinServ__FinancialAccountType__c: 'Leasing',
      FinServ__OpenDate__c: faker.returnDataTimeFormatted(openDate),
      bci_trm_mora__c: 'Mora'
    }
    let numberOfMonthsSinceCreation = today.getMonth() - openDate.getMonth() + (12 * (today.getFullYear() - openDate.getFullYear()))
    if (inDefault && numberOfMonthsSinceCreation > 1) {
      let diasEnMora = numberOfMonthsSinceCreation > 3 ? faker.faker.datatype.number({min: 1, max: 89}) : faker.faker.datatype.number(28*(numberOfMonthsSinceCreation))
      let nroCuotasInDefault = Math.floor(diasEnMora / 30) + 1
      let defaultDate = faker.setPastDate(diasEnMora/30)
      let cuotas = []
      let nroUltimaCuota = numberOfMonthsSinceCreation - nroCuotasInDefault
      let loanAmount = Math.floor(amount / numberOfinstallments)
      for (let i = 0; i < nroCuotasInDefault; i++) {
        let iva = Math.floor(loanAmount * 0.14)
        let cuotaBruta = Math.floor(loanAmount + iva)
        let interes = Math.floor(loanAmount * (nroCuotasInDefault - i)*0.02)
        let detalle = {
          numeroCuota: nroUltimaCuota + i,
          cuota_neta: loanAmount,
          fec_venc: faker.setPastDate(Math.floor(Math.random()*3)),
          moneda: '$',
          pago_parcial: 0,
          iva: iva,
          cuota_bruta: cuotaBruta,
          interes: interes,
          gasto_cobranza: 143650,
          monto_total: cuotaBruta + interes + 143650
        }
        cuotas.push(detalle)
      }
      let deudaMoraTotal = cuotas.reduce((total, detalle) => {
        return total + detalle.monto_total
      }, 0)
      let registroDeudaMora = {
        numOperacion: leasingToBeCreated.FinServ__FinancialAccountNumber__c,
        defaultDate,
        cuotas,
      }
      registrosDeudaMora.push(registroDeudaMora)
      leasingToBeCreated.bci_mto_total_pagar__c = deudaMoraTotal
      leasingToBeCreated.bci_cnt_dias_mora__c = diasEnMora
    }
    leasingsToBeCreated.push(leasingToBeCreated)
  }
  jsForce.CRUDRecords(DevNames.finalcialAccountDevName, 'Insert', leasingsToBeCreated)
    .then(result => {
      console.log(result)
      if (registrosDeudaMora.length > 0) {
        database.insertData('bci_RegistroDeudaMora', registrosDeudaMora)
      }
    })
    .catch((err) => {
      console.log(err)
    })
}
const createComexForAccount = ({account, recordType, quantity, inDefault}) => {
  let comexsToBeCreated = []
  let registrosDeudaMora = []
  for (let i = 0; i < quantity; i++) {
    let amount = faker.faker.finance.amount(8000, 600000)*1000
    let openDate = faker.setPastDate(Math.floor(Math.random()*120))
    let comexToBeCreated = {
      FinServ__PrimaryOwner__c: account.Id,
      RecordTypeId: recordType.Id,
      FinServ__FinancialAccountNumber__c: faker.faker.finance.account(8),
      FinServ__FinancialAccountType__c: 'Comex',
      FinServ__OpenDate__c: faker.returnDataTimeFormatted(openDate)
    }
    comexsToBeCreated.push(comexToBeCreated)
    if (inDefault) {
      registrosDeudaMora.push({
        cuota: {
          montoTotal: amount,
          interes: amount * 0.01,
          fechaVencimiento: faker.setFutureDate(30),
        },
        mensajeSinMora: null
      })
    }
  }
  jsForce.CRUDRecords(DevNames.finalcialAccountDevName, 'Insert', comexsToBeCreated)
    .then(result => {
      console.log(result)
      if (registrosDeudaMora.length > 0) {
        database.insertData('bci_RegistroDeudaMora', registrosDeudaMora)
      }
    })
    .catch((err) => {
      console.log(err)
    })
}
export {
  syncBranchesFromSalesforce,
  syncBranchesFromDatabase,
  syncCommercialUsersByRoleInheritanceFromSalesforce,
  syncUsersFromDatabase,
  syncAccountsBetweenOrgs,
  syncAccountsFromSalesforce,
  syncAccountsFromDatabase
  // retrieveUserRoles,
  // retrieveAccounts,
  // retrieveFinancialAccounts,
  // retrieveFinancialCards,
  // retrieveBusinessHours,
  // activeCommercialUsers,
  // getCommercialUsersByRoleInheritance,
  // updateAccountsToBeUsed,
  // reAssignAccountsToUsers,
  // assignAccountsWithoutBranch,
  // createChequesProtestadosPorFormaForUser,
  // createChequesProtestadosPorFondoForUser,
  // createCasesForUser,
  // createContactabilidadTasksForAccount,
  // setProximosVencimientosForAccount,
  // createFinancialAccountForAccount
}