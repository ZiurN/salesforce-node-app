import { OAuth2 } from "./../oauth.js";
import { Metadata } from "../metadata/metadata.js";
import fs from 'fs';

const oauth2 = new OAuth2()
const metadata = new Metadata(oauth2.ziurfreelance)
metadata.retrieveBusinessSObjects()
  .then((sObjectsMetadata) => {
    let childRelationshipsMap = new Map()
    sObjectsMetadata.forEach(sObject => {
      sObject.fields.forEach(field => {
        if (field.relationshipName) {
          let referencedSObjects = field.referenceTo
          referencedSObjects.forEach(referencedSObject => {
            if (!metadata.SObjectsToExclude.includes(referencedSObject)) {
              if (childRelationshipsMap.has(referencedSObject)) {
                let relationshipName = sObject.name + referencedSObject + field.relationshipName
                childRelationshipsMap.get(referencedSObject).push({
                  relationshipName: relationshipName,
                  type: sObject.name + '[]',
                  relation: relationshipName
                })
              } else {
                childRelationshipsMap.set(referencedSObject, [])
              }
            }
          })
        }
      })
    })
    let modelSt = ''
    sObjectsMetadata.forEach(sObject => {
      modelSt += `model ${sObject.name} {\n`
      let referencedFieldsMap = new Map()
      sObject.fields.forEach(field => {
        let fieldType = checkFieldType(field)
        let modelField = ''
        if (fieldType === 'id') {
          modelField = 'id String @id'
        } else if (fieldType === 'reference') {
          if (field.referenceTo.length == 1 && !metadata.SObjectsToExclude.includes(field.referenceTo[0])) {
            let referencedSObject = field.referenceTo[0]
            modelField = `${field.name} ${referencedSObject} `
            let fieldReferenceName ='id_' + sObject.name + referencedSObject + 'Id'
            referencedFieldsMap.set(fieldReferenceName, referencedFieldsMap.get(fieldReferenceName) ? referencedFieldsMap.get(fieldReferenceName) + 1: 1)
            fieldReferenceName = fieldReferenceName + referencedFieldsMap.get(fieldReferenceName)
            let relationshipName = sObject.name + referencedSObject + field.relationshipName
            modelField += `@relation("${relationshipName}", fields: [${fieldReferenceName}], references: [id])\n`
            modelField += `${fieldReferenceName} String`
          }
        } else {
          modelField = `${field.name} ${fieldType}`
        }
        modelField += '\n'
        modelSt += modelField
      })
      if (childRelationshipsMap.has(sObject.name)) {
        childRelationshipsMap.get(sObject.name).forEach(childRelationship => {
          modelSt += `${childRelationship.relationshipName} ${childRelationship.type} @relation("${childRelationship.relation}")\n`
        })
      }
      modelSt += `}\n`
    })
    fs.writeFileSync('models.txt', modelSt)
  })

function checkFieldType(field) {
  let fieldType = field.type.toLowerCase()
  switch (fieldType) {
    case 'id':
      return 'id'
    case 'int':
      return 'Int'
    case 'boolean':
      return 'Boolean'
    case 'date':
    case 'datetime':
        return 'DateTime'
    case 'double':
    case 'currency':
      return 'Decimal'
    case 'string':
    case 'picklist':
    case 'textarea':
    case 'address':
    case 'phone':
    case 'url':
    case 'multipicklist':
      return 'String'
    case 'reference':
      return 'reference'
    default:
      return 'String'
  }
}