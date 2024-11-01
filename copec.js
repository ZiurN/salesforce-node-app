import { OAuth2 } from './oauth.js'
import { Metadata } from './metadata/metadata.js'
import fs from 'fs'

const oauth2_1 = new OAuth2().copecDevelSolu1;
const oauth2_2 = new OAuth2().injuryAlliance;

const metadata = new Metadata(oauth2_1, oauth2_2);

export const retrieveFields = (sObjectDevName) => {
  metadata.retrieveFields(sObjectDevName)
    .then(response => {
      console.log(response)
      let fields = response.map(field => {
        return {
          name: field.name,
          type: field.type,
          label: field.label,
          referenceTo: field.referenceTo.lenght === 0 ? '' : field.referenceTo.join(', '),
          summarizedField: field.calculated && field.calculatedFormula === null,
          formula: field.calculatedFormula === null ? '' : field.calculatedFormula
        }
      })
      fs.writeFileSync('fields.json', JSON.stringify(fields, null, 2))
      let types = []
      response.forEach(field => {
        if (!types.includes(field.type)) types.push(field.type)
      })
      fs.writeFileSync('fieldTypes.json', JSON.stringify(types, null, 2))
    })
    .catch(err => console.error(err));
}

export const createERFromSObjectListToDBDiagramFormat = () => {
  let sObjects = [
    'Product2',
    'Product_Integration__c',
    'ProductAttribute',
  ]
  // let sObjects = [
  //   'Order',
  //   'FulfillmentOrder',
  //   'OrderSummary',
  //   'OrderItem',
  //   'OrderItemSummary',
  //   'Product2',
  //   'Account',
  //   'OrderDeliveryMethod',
  //   'FulfillmentOrderLineItem'
  // ]
  // let sObjects = [
  //   'LocationGroup',
  //   'Product2',
  //   'LocationGroupAssignment',
  //   'Location',
  //   'Account',
  //   'Sales_Area_Integration__c',
  //   'Product_Integration__c',
  //   'Product_Org_Channel_Integration__c'
  // ]
  let justCustomFields = false
  let justReferenceFields = true
  let useThoseFields = [
    'Sales_Office__c',
    'Sales_Org__c',
    'Sector__c',
    'Channel__c'
  ]
  metadata.createERFromSObjectListToDBDiagramFormat(sObjects, justCustomFields, justReferenceFields, useThoseFields)
  .then(tables => {
    let content = ''
    let references = []
    //fs.writeFileSync('tmp_tables.txt', JSON.stringify(tables))
    tables.forEach(table => {
      content += `Table ${table.name} {\n`
      table.fields.forEach(field => {
        content += '  ' + field.name
        content += '  ' + field.type
        if (field.isPrmaryKey) content += '  [primary key]'
        content += '\n'
        if (field.referenceTo) {
          field.referenceTo.forEach(ref => {
            console.log(ref, sObjects.includes(ref))
            if (sObjects.includes(ref)) references.push(`Ref: ${table.name}.${field.name} > ${ref}.Id\n`)
          })
        }
      })
      content += '}\n'
    })
    content += references.join('\n')
    fs.writeFileSync('dbDiagrams.txt', content)
  })
  .catch(err => console.error(err))
}