import { JSForce } from './../jsforce.js'

class Metadata {
  constructor(oauth2) {
    this.jsforce = new JSForce(oauth2);
    this.setupSObjectsNames = [
      'User',
      'ContentVersion',
      'ContentDocument',
      'RecordType',
      'BusinessProcess'
    ]
    this.SObjectsToExclude = [
      'MessagingChannel',
      'DuplicateRule',
      'EmailTemplate',
      'ContentAsset',
      'PaymentMethod',
      'PaymentGatewayProvider',
      'NamedCredential',
      'PrivacyPolicyDefinition',
      'ExternalDataSource',
      'Report',
      'Knowledge__kav',
      'UserRole',
      'Profile',
      'CallCenter',
      'ConnectedApplication',
      'UserProvisioningConfig',
      'UserProvAccount'
    ]
  }
  retrieveBusinessSObjects() {
    return new Promise((resolve, reject) => {
      this.jsforce.getSObjectsMetadata()
      .then((sObjectsMetadataStr) => {
        let sObjectsMetadata = JSON.parse(sObjectsMetadataStr).sobjects
        let businessSObjects = sObjectsMetadata.filter(sObject => {
          return (sObject.createable && sObject.undeletable && sObject.updateable && sObject.deletable && sObject.layoutable)
          || (this.setupSObjectsNames.includes(sObject.name))
        })
        console.log('Número de objetos de negocio: ' + businessSObjects.length)
        let promises = []
        businessSObjects.forEach(sObject => {
          promises.push(this.jsforce.getSObjectsMetadata(sObject.name))
        })
        Promise.all(promises)
          .then((metadataReturned) => {
            businessSObjects = metadataReturned.map(sObjectStr => {
              return JSON.parse(sObjectStr)
            })
            businessSObjects.forEach(sObject => {
              console.log('Objeto de negocio: ' + sObject.name)
              console.log('Número de campos: ' + sObject.fields.length)
              let businessFields = sObject.fields.filter(field => {
                return (field.createable && field.updateable) || field.name == 'Id'
              })
              console.log('Número de campos de negocio: ' + businessFields.length)
              sObject.fields = businessFields
            })
            resolve(businessSObjects)
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
}

export { Metadata }