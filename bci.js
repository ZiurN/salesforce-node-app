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

const retrieveBranches = (branchCodes) => {
  let fields = {
    Id: 1,
    Name: 1,
    bci_id_sucursal__c: 1,
    bci_cod_suc__c: 1
  }
  let filters = branchCodes ? { bci_cod_suc__c: { $in : branchCodes } } : {}
  jsForce.getRecordsByFieldsList(DevNames.branchDevName, filters, fields)
    .then((records) => {
      database.upsertData('bci_Sucursal', records)
    })
    .catch((err) => {
      console.log(err)
    })
}
const retrieveRecordTypes = (recordTypes) => {
  let fields = {
    Id: 1,
    Name: 1,
    DeveloperName: 1,
    SobjectType: 1
  }
  let filters = recordTypes ? { $or: [ { DeveloperName: { $in : recordTypes } },  { Name: { $in : recordTypes } }] } : {}
  jsForce.getRecordsByFieldsList(DevNames.recordTypeDevName, filters, fields)
    .then((records) => {
      database.upsertData('bci_RecordType', records)
    })
    .catch((err) => {
      console.log(err)
    })
}
const retrieveUserRoles = (userRolesList) => {
  let userRoleFields = {
    Id: 1,
    Name: 1,
    DeveloperName: 1,
    ParentRoleId: 1,
    RollupDescription: 1
  }
  let filters = userRolesList ? { $or: [ { DeveloperName: { $in : userRolesList } },  { Name: { $in : userRolesList } }] } : {}
  jsForce.getRecordsByFieldsList(DevNames.userRoleDevName, filters, userRoleFields)
    .then((userRoles) => {
      database.upsertData('bci_UserRole', userRoles).then((result) => {
        database.findData('bci_UserRole', {}, {Id: 1, ParentRoleId: 1}).then((userRoles) => {
          let userRolesToUpdate = []
          userRoles.forEach(userRole => {
            if (userRole.ParentRoleId == null) return
            let parentRole = userRoles.find(role => role.Id == userRole.ParentRoleId)
            if (parentRole) {
              userRole._parentRoleId = parentRole._id
              userRolesToUpdate.push(userRole)
            }
          })
          if (userRolesToUpdate.length == 0) return
          database.upsertData('bci_UserRole', userRolesToUpdate)
        })
        .catch((err) => {
          console.log(err)
        })
      })
    })
    .catch((err) => {
      console.log(err)
    })
}
let accountFilters = {
  isPersonAccount: true
}
const retrieveAccounts = (filters = accountFilters) => {
  let fields = {
    Id: 1,
    Name: 1,
    LastName: 1,
    FirstName: 1,
    RecordTypeId: 1,
    OwnerId: 1,
    IsPersonAccount: 1,
    PersonContactId: 1,
    bci_cli_cic__c: 1,
    bci_cli_dv__c: 1,
    bci_cli_mora__c: 1,
    bci_cli_rut__c: 1,
    bci_estado_mora__c: 1,
    bci_id_sf_sucursal__c: 1,
    bci_ind_acciones__c: 1,
    bci_ind_cre_consumo__c: 1,
    bci_ind_cre_hipotecario__c: 1,
    bci_ind_cuenta__c: 1,
    bci_ind_dep_plazo__c: 1,
    bci_ind_fon_mutuos__c: 1,
    bci_ind_garantia__c: 1,
    bci_ind_lin_emergencia__c: 1,
    bci_ind_lin_sobregiro__c: 1,
    bci_ind_margen__c: 1,
    bci_ind_pag_aut_cuenta__c: 1,
    bci_ind_seguros__c: 1,
    bci_ind_tar_credito__c: 1,
    bci_mon_mora__c: 1,
    bci_rut_com__c: 1
  }
  jsForce.getRecordsByFieldsList(DevNames.accountDevName, filters, fields)
  .then((records) => {
    database.upsertData('bci_Account', records)
  })
  .catch((err) => {
    console.log(err)
  })
}
let registerFieldByFinacialAccountType = {
  bci_acciones: 'bci_ind_acciones__c',
  bci_credito_consumo: 'bci_ind_cre_consumo__c',
  bci_credito_hipotecario: 'bci_ind_cre_hipotecario__c',
  bci_cuenta: 'bci_ind_cuenta__c',
  bci_deposito_plazo: 'bci_ind_dep_plazo__c',
  bci_fondos_mutuos: 'bci_ind_fon_mutuos__c',
  bci_garantia: 'bci_ind_garantia__c',
  bci_linea_emergencia: 'bci_ind_lin_emergencia__c',
  bci_linea_sobregiro: 'bci_ind_lin_sobregiro__c',
  bci_margen: 'bci_ind_margen__c',
  bci_pago_automatico_cuenta: 'bci_ind_pag_aut_cuenta__c',
  bci_seguros: 'bci_ind_seguros__c',
  bci_tarjeta_de_credito: 'bci_ind_tar_credito__c',
  bci_credito_comex: 'bci_ind_cre_comex__c',
  bci_factoring: 'bci_ind_factoring__c',
  BCI_SegurosRelacionados: 'bci_ind_seguros__c',
  bci_cartera_dinamica: 'bci_ind_cartera_dinamica__c'
}
const retrieveFinancialAccounts = () => {
  return new Promise((resolve, reject) => {
    database.findData('bci_Account', { isPersonAccount: true }, {Id: 1})
      .then((accounts) => {
        let accountIds = accounts.map(account => account.Id)
        let financialAccountFilters = {
          FinServ__PrimaryOwner__c: {$in: accountIds},
        }
        let finalcialAccountfields = {
          Id: 1,
          OwnerId: 1,
          Name: 1,
          RecordTypeId: 1,
          'RecordType.Name': 1,
          'RecordType.DeveloperName': 1,
          FinServ__FinancialAccountNumber__c: 1,
          FinServ__FinancialAccountSource__c: 1,
          FinServ__FinancialAccountType__c: 1,
          FinServ__OwnerType__c: 1,
          FinServ__PrimaryOwner__c: 1,
          'FinServ__PrimaryOwner__r.bci_cli_rut__c': 1,
          'FinServ__PrimaryOwner__r.Name': 1,
          FinServ__RecordTypeName__c: 1,
          FinServ__Status__c: 1,
          bci_BiPersonal__c: 1,
          bci_ind_tipo_mov__c: 1,
          bci_ind_var_precio__c: 1,
          bci_mon_act__c: 1,
          bci_mon_cuota__c: 1,
          bci_mon_inv_ini__c: 1,
          bci_mon_tot_tasa_spread__c: 1,
          bci_moneda__c: 1,
          bci_tasa__c: 1,
          bci_ult_chq_cobrados__c: 1,
          bci_id_financialaccount__c: 1,
          bci_aux_detalle_mora__c: 1,
          bci_cnt_dias_mora__c: 1,
          bci_flg_pago_transito__c: 1,
          bci_prod_code__c: 1,
          bci_fec_primer_venc__c: 1,
          bci_nom_ejecutivo_comex__c: 1,
          bci_nom_ejecutivo_leasing__c: 1,
          bci_num_rentas_act_vs_total__c: 1,
          bci_cod_cartera_inv__c: 1,
          bci_cod_cuenta_inv__c: 1,
          bci_cod_prod_inv__c: 1,
          bci_cod_regimen_tributario__c: 1,
          bci_cod_tipo_cartera__c: 1,
          bci_fec_ven__c: 1,
          bci_num_cuenta_tdc__c: 1
        }
        jsForce.getRecordsByFieldsList(DevNames.finalcialAccountDevName, financialAccountFilters, finalcialAccountfields)
          .then((financialAccounts) => {
            database.upsertData('bci_FinancialAccount', financialAccounts)
              .then((results) => {
                let financialAccountsGroupedByAccount = Object.groupBy(financialAccounts, financialAccount => {
                  return financialAccount.FinServ__PrimaryOwner__c
                })
                let accountsToUpdate = []
                for (const accountId in financialAccountsGroupedByAccount) {
                  let financialAccounts = financialAccountsGroupedByAccount[accountId]
                  let accountToUpdate = {
                    Id: accountId,
                  }
                  financialAccounts.forEach(financialAccount => {
                    let field = registerFieldByFinacialAccountType[financialAccount.RecordType.DeveloperName]
                    if (field && !accountToUpdate[field]) {
                      accountToUpdate[field] = true
                    }
                  })
                  accountsToUpdate.push(accountToUpdate)
                }
                if (accountsToUpdate.length == 0) resolve('No hay cuentas cliente para actualizar')
                jsForce.CRUDRecords(DevNames.accountDevName, 'Update', accountsToUpdate)
                  .then(result => {
                    resolve(result)
                  })
                  .catch((err) => {
                    reject(err)
                  })
              }
              ).catch((err) => {
                reject(err)
              })
          })
          .catch((err) => {
            reject(err)
          })
      })
      .catch((err) => {
        reject(err)
      })
  })
}
const retrieveFinancialCards = () => {
  database.findData('bci_Account', { isPersonAccount: true }, {Id: 1})
    .then((accounts) => {
      let accountIds = accounts.map(account => account.Id)
      let cardsFilters = {
        FinServ__AccountHolder__c: {$in: accountIds},
      }
      let cardsFields = {
        Id: 1,
        Name: 1,
        RecordTypeId: 1,
        'RecordType.Name': 1,
        'RecordType.DeveloperName': 1,
        FinServ__FinancialAccount__c: 1,
        FinServ__Active__c: 1,
        FinServ__OwnershipType__c: 1,
        FinServ__ValidUntil__c: 1,
        bci_est_tarjeta__c: 1,
        bci_id_tarjeta__c: 1,
        bci_mon_int_aut__c: 1,
        bci_mon_nac_aut__c: 1,
        bci_num_tarjeta__c: 1,
        bci_tip_producto__c: 1
      }
      jsForce.getRecordsByFieldsList(DevNames.cardDevName, cardsFilters, cardsFields)
        .then((cards) => {
          database.upsertData('bci_Card', cards)
            .then(results => {
              let financialAccountFields = {
                Id: 1,
                FinServ__PrimaryOwner__c: 1,
                bci_num_cuenta_tdc__c: 1
              }
              database.findData('bci_FinancialAccount', { 'RecordType.DeveloperName': 'bci_tarjeta_de_credito' }, financialAccountFields)
                .then((financialAccounts) => {
                  if (financialAccounts.length == 0) {
                    console.log('No se encontraron cuentas de tarjetas de crédito')
                    return
                  }
                  let financialTCsWithoutCards = financialAccounts.filter(financialAccount => {
                    return !cards.find(card => card.FinServ__FinancialAccount__c == financialAccount.Id)
                  })
                  if (financialTCsWithoutCards.length == 0) {
                    console.log('No se encontraron tarjetas sin plástico registrado')
                    return
                  }
                  let cardsToBeCreated = []
                  financialTCsWithoutCards.forEach(financialTC => {
                    let card = {
                      FinServ__AccountHolder__c: financialTC.FinServ__PrimaryOwner__c,
                      FinServ__FinancialAccount__c: financialTC.Id,
                      FinServ__Active__c: true,
                      FinServ__OwnershipType__c: 'Primary',
                      bci_num_tarjeta__c: financialTC.bci_num_cuenta_tdc__c,
                      bci_mon_int_aut__c: 5000,
                      bci_mon_nac_aut__c: 5900000,
                      bci_est_tarjeta__c: 'Activa ',
                      bci_glosa_est__c: 'ACTIVADA'
                    }
                    cardsToBeCreated.push(card)
                  })
                  jsForce.CRUDRecords(DevNames.cardDevName, 'Insert', cardsToBeCreated)
                    .then(result => {
                      console.log(result)
                    })
                    .catch((err) => {
                      console.log(err)
                    })
                }).catch((err) => {
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
    }).catch((err) => {
      console.log(err)
    })
}
const retrieveBusinessHours = () => {
  let fields = {
    Id: 1,
    Name: 1,
    IsActive: 1,
    IsDefault: 1,
    SundayStartTime: 1,
    SundayEndTime: 1,
    MondayStartTime: 1,
    MondayEndTime: 1,
    TuesdayStartTime: 1,
    TuesdayEndTime: 1,
    WednesdayStartTime: 1,
    WednesdayEndTime: 1,
    ThursdayStartTime: 1,
    ThursdayEndTime: 1,
    FridayStartTime: 1,
    FridayEndTime: 1,
    SaturdayStartTime: 1,
    SaturdayEndTime: 1
  }
  jsForce.getRecordsByFieldsList('BusinessHours', {}, fields)
    .then((records) => {
      database.upsertData('bci_BusinessHours', records)
    })
    .catch((err) => {
      console.log(err)
    })
}
const activeCommercialUsers = (roleName, getLevelUsers) => {
  let initialUsers = getCommercialUsersByRoleInheritance(roleName, getLevelUsers)
  if (initialUsers.length == 0) return
  let usersToBeChecked = [...initialUsers]
  initialUsers.forEach(user => {
    if (user.UserRole.Name !== null && user.UserRole.Name !== undefined  && user.UserRole.Name !== '') {
      usersToBeChecked = [...usersToBeChecked, getCommercialUsersByRoleInheritance(user.UserRole.Name, getLevelUsers)]
    }
  })
  if (usersToUpdate.length == 0) return
  jsForce.CRUDRecords(DevNames.userDevName, 'Update', usersToUpdate)
    .then(result => {
      console.log(result)
    })
    .catch((err) => {
      console.log(err)
    })
}
const getCommercialUsersByRoleInheritance = async (roleName, getLevelUsers) => {
  let userFields = {
    IsActive: 1,
    Id: 1,
    LastName: 1,
    FirstName: 1,
    Name: 1,
    'Profile.Name': 1,
    'ProfileId': 1,
    'UserRole.Name': 1,
    'UserRole.DeveloperName': 1,
    'UserRole.Id': 1,
    'UserRole.ParentRoleId': 1,
    bci_Codigo_Sucursal__c: 1,
    Alias: 1,
    Title: 1
  }
  let andQueryFilters = [
    ...DevNames.commercialUsersStandardFilters,
    { 'UserRole.Name': { $nlike: '%PLATAFORMA%' } },
    { Title: { $nlike: '%EJECUTIVO INTEGRAL%' } },
    { Title: { $nlike: '%ASISTENTE%' } }
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
    if (roles.length == 0) return []
    let rolesIds = roles.map(role => role.Id)
    filters.$and.push({'UserRole.Id': {$in: rolesIds}})
  } else {
    filters.$and.push({$or: [
      {'UserRole.Name': roleName},
      {'UserRole.DeveloperName': roleName}
    ]})
  }
  jsForce.getRecordsByFieldsList(DevNames.userDevName, filters, userFields)
    .then((users) => {
      if (users.length === 0) console.log('No se encontraron usuarios')
      else {
        console.log('Usuarios encontrados: ' + users.length)
        database.upsertData('bci_User', users)
        return users
      }
    })
    .catch((err) => {
      console.log(err)
    })
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
    intefaceName: null
  }
  createChequesForUser(arg)
}
const createChequesProtestadosPorFondoForUser = (userAlias, quantity, intefaceName) => {
  let arg = {
    userAlias: userAlias,
    quantity: quantity,
    builder: fakeData.createFakeChequesProtestadosFondo,
    databaseName: 'bci_ChequeProtestadoFondo',
    intefaceName: intefaceName
  }
  createChequesForUser(arg)
}
const createChequesForUser = ({userAlias, quantity, builder, databaseName, intefaceName}) => {
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
              if (intefaceName) {
                chequesProtestados.push(...builder(financialAccountNumbers, chequesProtestadosGroupedByAccountNumber, users[0], intefaceName))
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
      let casesToCreate = []
      accounts.forEach(account => {
        let caseToCreate = {
          Subject: 'Caso de Prueba',
          Status: 'Nuevo',
          Origin: 'Web',
          RecordTypeId: recordType.Id,
          AccountId: account.Id
        }
        casesToCreate.push(caseToCreate)
      })
      jsForce.CRUDRecords(DevNames.caseDevName, 'Create', casesToCreate).then((result) => {
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
              let TasksToCreate = []
              for (let i = 0; i < quantity; i++) {
                let tipoGestion = DevNames.tipoGestion['TELEFONICO'][faker.returnRandomIndex(DevNames.tipoGestion['TELEFONICO'])]
                let subject = 'Ingreso de gestión: ' + tipoGestion
                let taskToCreate = {
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
                  CreatedDate: '2024-01-12T19:30:47.000+0000',
                  ActivityDate: '2024-01-12T19:30:47.000+0000',
                  OwnerId: accountCase.OwnerId
                }
                console.log(taskToCreate)
                TasksToCreate.push(taskToCreate)
              }
              jsForce.CRUDRecords(DevNames.taskDevName, 'insert', TasksToCreate)
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
const getChildrenRolesFromParentRoleName = (parentRoles) => {
  return new Promise((resolve, reject) => {
    let idList = []
    parentRoles.forEach(parentRole => {
      idList.push(parentRole.Id)
    })
    database.findData('bci_UserRole', { ParentRoleId: { $in: idList}}, {Id: 1})
      .then(childrenRoles => {
        if (childrenRoles.length == 0) resolve(parentRoles)
        else {
          getChildrenRolesFromParentRoleName(childrenRoles)
            .then((grandChildrenRoles) => {
              resolve([...parentRoles, ...grandChildrenRoles])
            })
        }
      })
      .catch(err => {reject(err)})
  })
}
const createFinancialAccountForAccount = (accountRut, recordTypeName, quantity, createLEM, createLSG) => {
  database.findData('bci_Account', {bci_cli_rut__c: Number(accountRut)}, {Id: 1})
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
          let finalcialAccountsToCreate = []
          for (let i = 0; i < quantity; i++) {
            let financialAccountToCreate = {
              FinServ__PrimaryOwner__c: account.Id,
              RecordTypeId: recordType.Id,
            }
            if (recordTypeName == 'BCI Tarjeta de Credito' || recordTypeName == 'bci_tarjeta_de_credito') {
              let lastDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
              let cardNumber = faker.faker.finance.creditCardNumber().replace(/-/g, '').substring(0, 16)
              financialAccountToCreate.FinServ__FinancialAccountNumber__c = cardNumber
              financialAccountToCreate.bci_fec_ven__c = returnRandomDateBetweenGivenDates(new Date(), lastDayOfMonth)
              financialAccountToCreate.bci_mto_total_pagar__c = faker.faker.finance.amount(10000, 1000000, 0)
            }
            if (recordTypeName == 'BCI Cuenta' || recordTypeName == 'bci_cuenta') {
              let amount =  faker.faker.finance.amount(10000, 1000000, 0)
              financialAccountToCreate.FinServ__FinancialAccountNumber__c = faker.faker.finance.account(12)
              financialAccountToCreate.FinServ__FinancialAccountType__c = 'CUENTA CORRIENTE'
              financialAccountToCreate.bci_sdo_cont_ayer__c = amount
              financialAccountToCreate.FinServ__Balance__c = amount
              financialAccountToCreate.FinServ__OpenDate__c = faker.returnDataTimeFormatted(faker.setPastDate(Math.floor(Math.random()*48)))
            }
            finalcialAccountsToCreate.push(financialAccountToCreate)
          }
          jsForce.CRUDRecords(DevNames.finalcialAccountDevName, 'Insert', finalcialAccountsToCreate)
            .then(result => {
              console.log(result)
              retrieveFinancialAccounts()
                .then(retrieveResult => {
                  if ((recordTypeName == 'BCI Cuenta' || recordTypeName == 'bci_cuenta') && (createLEM || createLSG)) {
                    if (result.ids.length == 0) {
                      console.log('No hay Ids de cuentas')
                      return
                    }
                    let financialAccountIds = result.ids.map(result => result.Id)
                    let financialAccountFilters = {
                      Id: {$in: financialAccountIds}
                    }
                    database.findData('bci_FinancialAccount', financialAccountFilters, {Id: 1})
                      .then(cuentasCorrientes => {
                        if (cuentasCorrientes && cuentasCorrientes.length == 0) {
                          console.log('No se encontraron cuentas')
                          return
                        }
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
                            if (lineasRecordTypes.length == 0) {
                              console.log('No se encontraron record types para los productos LSG y LEM')
                              return
                            }
                            let sobreGiroRT = lineasRecordTypes.find(lineaRecordType => lineaRecordType.DeveloperName == 'bci_linea_sobregiro')
                            let emergenciaRT = lineasRecordTypes.find(lineaRecordType => lineaRecordType.DeveloperName == 'bci_linea_emergencia')
                            let lineasToCreate = []
                            cuentasCorrientes.forEach(cuentaCorriente => {
                              let lineaToCreate = {
                                bci_cuenta_rel__c: cuentaCorriente.Id,
                                FinServ__PrimaryOwner__c: account.Id,
                              }
                              if (createLEM) {
                                let amount = faker.faker.finance.amount(10000, 1000000, 0)
                                let LEMToCreate = {
                                  ...lineaToCreate,
                                  RecordTypeId: emergenciaRT.Id,
                                  FinServ__FinancialAccountNumber__c: 'LEM' + faker.faker.finance.account(12),
                                  FinServ__Balance__c: amount,
                                  FinServ__TotalCreditLimit__c: amount
                                }
                                lineasToCreate.push(LEMToCreate)
                              }
                              if (createLSG) {
                                let amount = faker.faker.finance.amount(10000, 1000000, 0)
                                let LSGToCreate = {
                                  ...lineaToCreate,
                                  RecordTypeId: sobreGiroRT.Id,
                                  FinServ__FinancialAccountNumber__c: 'LSG' + faker.faker.finance.account(12),
                                  FinServ__Balance__c: amount,
                                  FinServ__TotalCreditLimit__c: amount
                                }
                                lineasToCreate.push(LSGToCreate)
                              }
                            })
                            console.log(lineasToCreate)
                            jsForce.CRUDRecords(DevNames.finalcialAccountDevName, 'Insert', lineasToCreate)
                              .then(result => {
                                console.log(result)
                                retrieveFinancialAccounts()
                                  .then(retrieveResult => {
                                    console.log(retrieveResult)
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
                      })
                      .catch((err) => {
                        console.log(err)
                      })
                  }
                })
                .catch(err => {
                  console.log(err)
                })
            })
            .catch((err) => {
              console.log(err)
            })
        })
    })
}
export {
  retrieveBranches,
  retrieveRecordTypes,
  retrieveUserRoles,
  retrieveAccounts,
  retrieveFinancialAccounts,
  retrieveFinancialCards,
  retrieveBusinessHours,
  activeCommercialUsers,
  getCommercialUsersByRoleInheritance,
  updateAccountsToBeUsed,
  reAssignAccountsToUsers,
  assignAccountsWithoutBranch,
  createChequesProtestadosPorFormaForUser,
  createChequesProtestadosPorFondoForUser,
  createCasesForUser,
  createContactabilidadTasksForAccount,
  setProximosVencimientosForAccount,
  createFinancialAccountForAccount
}