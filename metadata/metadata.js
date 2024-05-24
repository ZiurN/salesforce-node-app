import { JSForce } from '../jsforce.js'

class Metadata {
  constructor(oauth2_1, oauth2_2) {
    this.jsforce1 = new JSForce(oauth2_1)
    if (oauth2_2) this.jsforce2 = new JSForce(oauth2_2)
  }
  compareSObject(sObjectDevName) {
    return new Promise((resolve, reject) => {
      if (!this.jsforce2 || !this.jsforce2 || !sObjectDevName) reject('No se ha configurado un segundo CRM para comparar');
      let metadataCRM1 = {}
      let metadataCRM2 = {}
      this.jsforce1.getSObjectsMetadata(sObjectDevName)
        .then(responseBody => JSON.parse(responseBody))
        .then(mtdCRM1 => {
          metadataCRM1 = mtdCRM1
          return this.jsforce2.getSObjectsMetadata(sObjectDevName)
        })
        .then(responseBody2 => JSON.parse(responseBody2))
        .then(mtdCRM2 => {
          metadataCRM2 = mtdCRM2
          let metadataCRM1Fields = metadataCRM1.fields.filter(field => field.custom === true)
          let metadataCRM2Fields = metadataCRM2.fields.filter(field => field.custom === true)
          let response = {
            commonFields: [],
            fieldsOnlyInCRM1: [],
            fieldsOnlyInCRM2: []
          }
          metadataCRM1Fields.forEach(field => {
            let commonField = metadataCRM2Fields.find(f => f.name === field.name)
            if (commonField) response.commonFields.push({
              name: field.name,
              type: field.type,
              label: field.label,
              referenceTo: field.referenceTo
            })
            else response.fieldsOnlyInCRM1.push({
              name: field.name,
              type: field.type,
              label: field.label,
              referenceTo: field.referenceTo
            })
          })
          metadataCRM2Fields.forEach(field => {
            let commonField = metadataCRM1Fields.find(f => f.name === field.name)
            if (!commonField) response.fieldsOnlyInCRM2.push({
              name: field.name,
              type: field.type,
              label: field.label,
              referenceTo: field.referenceTo
            })
          })
          resolve(response)
        })
        .catch(err => reject(err))
    })
  }
  retrieveFields(sObjectDevName) {
    return new Promise((resolve, reject) => {
      if (!this.jsforce1 || !sObjectDevName) reject('No se ha configurado un CRM para obtener los campos');
      this.jsforce1.getSObjectsMetadata(sObjectDevName)
        .then(responseBody => JSON.parse(responseBody))
        .then(metadata => {resolve(metadata.fields)})
        .catch(err => reject(err))
    })
  }
}

export { Metadata }