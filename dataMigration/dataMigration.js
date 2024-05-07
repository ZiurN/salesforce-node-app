class DataMigration {
  constructor(database, crm1, crm2) {
    this.database = database;
    this.crm1 = crm1;
    this.crm2 = crm2;
  }
  syncSOBjectsFromSalesforce = (promise, collection) => {
    promise
      .then(SObjectRecords => {
        if (typeof SObjectRecords === 'object' && SObjectRecords.length > 0) {
          console.log('Registros a sincronizar: ', SObjectRecords.length)
          this.database.upsertData(collection, SObjectRecords)
        } else {
          console.log('No hay registros para sincronizar')
        }
      })
      .catch(err => {console.log(err)})
  }
  syncSOBjectsFromDatabase = (fields, collection, SObjectDevName, upsertField, insert, filters) => {
    insert = insert === 'true'
    if (insert) { delete fields.Id }
    fields._id = 0
    this.database.findData(collection, filters, fields)
      .then(records => {
        if (typeof records === 'object' && records.length > 0) {
          records.forEach(record => {
            for (let key in record) {
              if (typeof record[key] === 'object') {
                delete record[key]
              }
            }
          })
          this.crm1.jsforce.CRUDRecords(SObjectDevName, insert ? 'insert' : 'upsert', records)
            .then(result => {
              if (typeof result === 'object' && (result.ids || result.errors)) {
                if (result.errors.length > 0) {
                  result.errors.forEach(error => {
                    console.log(error)
                  })
                }
                if (result.ids.length > 0) {
                  let sfIds = result.ids;
                  records.forEach((record, idx) => {record.Id = sfIds[idx]})
                  this.database.upsertData(collection, records, upsertField)
                    .then(result => {
                      console.log(result)
                    })
                    .catch(err => console.log(err))
                }
              } else {
                console.log('Algo salió mal al intentar sincronizar los registros con la base de datos')
              }
            })
            .catch(err => console.log(err))
        }
      })
      .catch(err => console.log(err))
  }
}

export { DataMigration }