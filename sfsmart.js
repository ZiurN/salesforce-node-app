

import { OAuth2 } from './oauth.js'
import { Metadata } from './metadata/metadata.js'
import { deletedFields } from './devNames.js'
import fs from 'fs'

const oauth2_1 = new OAuth2().ABAProd;
const oauth2_2 = new OAuth2().injuryAlliance;

const metadata = new Metadata(oauth2_1, oauth2_2);

export const compareSObject = (sObjectDevName) => {
  metadata.compareSObject(sObjectDevName)
    .then(response => {
      fs.writeFileSync('metadataComparison.json', JSON.stringify(response, null, 2))
    })
    .catch(err => console.error(err));
}

export const retrieveFields = (sObjectDevName) => {
  metadata.retrieveFields(sObjectDevName)
    .then(response => {
      fs.writeFileSync('fields.json', JSON.stringify(response, null, 2))
      let types = []
      response.forEach(field => {
        if (!types.includes(field.type)) types.push(field.type)
      })
      fs.writeFileSync('fieldTypes.json', JSON.stringify(types, null, 2))
    })
    .catch(err => console.error(err));
}

const sqlFieldType = (field) => {
  let staticValues = {
    id: 'VARCHAR(18) NOT NULL PRIMARY KEY',
    boolean: 'BOOLEAN',
    string: 'VARCHAR(255)',
    picklist: 'VARCHAR(255)',
    textarea: 'LONGTEXT',
    double: 'DOUBLE(16,2)',
    phone: 'VARCHAR(40)',
    email: 'VARCHAR(80)',
    date: 'DATE',
    datetime: 'DATETIME',
    url: 'VARCHAR(1000)',
    multipicklist: 'VARCHAR(1000)',
    percent: 'DOUBLE(16,2)'
  }
  if (field.type === 'reference') {
    return `VARCHAR(18) FOREIGN KEY REFERENCES ${field.referenceTo}(${field.name})`
  } else if (field.type === 'address') {
    console.log('Address field')
  } else return staticValues[field.type] || 'VARCHAR(255)'
}

export const createSQLTableCreationCommand = (sObjectDevName) => {
  metadata.retrieveFields(sObjectDevName)
    .then(fields => {
      let sql = 'CREATE TABLE ' + sObjectDevName + ' (\n'
      fields.forEach(field => {
        if (deletedFields.includes(field.name)) return
        sql += field.name + ' ' + sqlFieldType(field) + ',\n'
        field.name == 'Id'
      })
      sql = sql.slice(0, -2) + '\n);'
      fs.writeFileSync('createTable.sql', sql)
    })
    .catch(err => console.error(err));
}