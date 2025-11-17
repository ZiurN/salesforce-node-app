import { DataMigration } from "./dataMigration.js";

class BciDataMigration extends DataMigration {
  constructor(database, crm1, crm2) {
    super(database, crm1, crm2)
  }
  syncAccountsToBeMigrated = (filters) => {
    let crmTo = this.crm1
    let crmFrom = this.crm2
    if (!crmFrom || !crmTo) {
        console.log('No se han definido los objetos de CRM')
        return
    }
    delete crmFrom.accountFields.Name
    crmFrom.retrieveAccounts(filters)
      .then(accounts => {
        if (typeof accounts === 'object' && accounts.length > 0) {
          console.log('Registros a sincronizar: ', accounts.length)
          let userExternalIds = []
          let branchExternalIds = []
          accounts.forEach(account => {
            if (account.Owner.bci_usr_rut__c) {
              userExternalIds.push(account.Owner.bci_usr_rut__c)
            }
            if (account['bci_id_sf_sucursal__c']) {
              branchExternalIds.push(account.bci_id_sf_sucursal__r.bci_id_sucursal__c)
            }
          })
          let userFilters = { 'bci_usr_rut__c': { $in: userExternalIds } }
          let branchFilters = { 'bci_id_sucursal__c': { $in: branchExternalIds } }
          crmTo.retrieveBranches(branchFilters)
            .then(branches => {
              crmTo.retrieveUsers(userFilters)
                .then(users => {
                  let branchMap = new Map()
                  branches.forEach(branch => {
                    branchMap.set(branch.bci_id_sucursal__c, branch.Id)
                  })
                  let userMap = new Map()
                  users.forEach(user => {
                    userMap.set(user.bci_usr_rut__c, user.Id)
                  })
                  accounts.forEach(account => {
                    if (account.Owner.bci_usr_rut__c) {
                      account.OwnerId = userMap.get(account.Owner.bci_usr_rut__c)
                    }
                    if (account.bci_id_sf_sucursal__c) {
                      account.bci_id_sf_sucursal__c = branchMap.get(account.bci_id_sf_sucursal__r.bci_id_sucursal__c)
                    }
                  })
                  accounts.forEach(account => {
                    delete account.Id
                    delete account.IsPersonAccount
                    delete account.PersonContactId
                    delete account.bci_estado_mora__c
                    for (let key in account) {
                      if (typeof account[key] === 'object') {
                        delete account[key]
                      }
                    }
                  })
                  console.log(accounts[1])
                  crmTo.jsforce.CRUDRecords('Account', 'upsert', accounts, 'bci_cli_rut__c')
                    .then(result => {
                      if (typeof result === 'object' && (result.ids || result.errors)) {
                        if (result.errors.length > 0) {
                          result.errors.forEach(error => {
                            console.log(error)
                          })
                        }
                        if (result.ids.length > 0) {
                          result.ids.forEach(id => {
                            console.log('Registro sincronizado: ', id)
                          })
                        }
                      } else {
                        console.log('Algo salió mal al intentar sincronizar los registros con la base de datos')
                      }
                    })
                    .catch(err => console.log(err))
                })
                .catch(err => console.log(err))
            })
            .catch(err => console.log(err))
        } else {
          console.log('No hay registros para sincronizar')
        }
      })
      .catch(err => console.log(err))
  }
}

export { BciDataMigration }