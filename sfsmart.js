

import { OAuth2 } from './oauth.js'
import { Metadata } from './metadata/metadata.js'
import { deletedFields } from './devNames.js'
import fs from 'fs'

const oauth2_1 = new OAuth2().ABATesting;
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
  'Contact',
  ]
  let justCustomFields = true
  metadata.createERFromSObjectListToDBDiagramFormat(sObjects, justCustomFields)
  .then(tables => {
    let content = ''
    let references = []
    tables.forEach(table => {
      content += `Table ${table.name} {\n`
      table.fields.forEach(field => {
        content += '  ' + field.name
        content += '  ' + field.type
        if (field.isPrmaryKey) content += '  [primary key]'
        content += '\n'
        if (field.referenceTo) {
          field.referenceTo.forEach(ref => {
            if (sObjects.includes(ref)) references.push(`Ref: ${table.name}.${field.name} > ${ref}.id\n`)
          })
        }
      })
      content += '}\n'
    })
    content += references.join('\n')
    fs.writeFileSync('dbDiagram.txt', content)
  })
  .catch(err => console.error(err))
}

export const createERContactTransformation = () => {
  let deletedFields = [
    "Role__c",
    "Scope_of_Request__c",
    "mkto71_Acquisition_Date__c",
    "mkto71_Acquisition_Program__c",
    "Accident_Date__c",
    "Additional_Current_Symptoms__c",
    "Antibiotic_Drug_Used__c",
    "Any_muscle_soft_tissue_damage__c",
    "Any_other_orthopedic_doctors__c",
    "Autopsy_Performed__c",
    "Bankruptcy2__c",
    "Born_With_Following_Defects__c",
    "Breast_Development__c",
    "Cancer_Cell_Type__c",
    "Complications_Notes__c",
    "Currently_represented_by_attorney__c",
    "Date_Hospitalized__c",
    "Date_Physical_HIPPA_Sent__c",
    "Date_of_Deceased__c",
    "Date_of_Injury_Accident__c",
    "Date_of_Revision_Surgery__c",
    "Date_of_Scheduled_Revision__c",
    "Descendents_Name_DOB__c",
    "Describe_if_Yes__c",
    "Diagnosing_Treating_Doctor__c",
    "Did_Airbag_Deploy__c",
    "Did_you_Have_Hip_Replacement_Surgery__c",
    "Did_you_suffer_from_Metal_Toxicity__c",
    "Did_you_suffer_from_other_injuries__c",
    "Doctor_that_put_in_the_IVC_Filter__c",
    "Doctor_who_DXed_with_Metallosis__c",
    "Doctor_who_implanted_initial_hip__c",
    "Drug_Stop_Date__c",
    "Family_History_of_Birth_Defects__c",
    "Father_SSN__c",
    "Have_Accident_Report__c",
    "Hip_Replacement_Surgery_AFTER_2006__c",
    "IVC_Filter_Implanted__c",
    "IVC_Make_Model__c",
    "If_Yes_Describe__c",
    "Implanted_from_2002_Present__c",
    "Injured_Party_1_First_Last_Name__c",
    "Injured_Party_2_First_Last_Name__c",
    "Injured_Party_3_Deceased__c",
    "Injured_Party_3_First_Last_Name__c",
    "Injured_Party_4_Deceased__c",
    "Injured_Party_4_First_Last_Name__c",
    "Injured_Party_took_blood_thinner__c",
    "Intake_2_Notes__c",
    "Local_Time_Difference__c",
    "Local_Hour__c",
    "Location_of_Surgery__c",
    "Location_of_Vehicle__c",
    "Mesh_Insertion_After_1996__c",
    "Mesh_Insertion_Date__c",
    "Method_of_Insertion__c",
    "Mother_SSN__c",
    "Mother_Took_One_of_These_Drugs__c",
    "Mother_s_Alt_Phone_Number__c",
    "Mother_s_Email_Address__c",
    "Mother_s_Phone_Number__c",
    "Name_Location_of_Facility_for_Procedures__c",
    "Name_and_Address__c",
    "Nights_Hospitalized__c",
    "OBGYN_During_Pregnancy_with_Injured_Chil__c",
    "Other_Atypical__c",
    "Pediatrician_s__c",
    "Primary_Surgery_Hospital_Info__c",
    "Reason_Prescribed_IMPORT__c",
    "Reason_for__c",
    "Removal_Details__c",
    "Revision_Surgery__c",
    "Risperdal_Condition_Treated__c",
    "Risperdal_In_2007_or_Earlier__c",
    "Risperdal_Qualifying__c",
    "Smoked__c",
    "Smoker__c",
    "Spouse_Email__c",
    "State_Risperdal_was_ingested__c",
    "Subsequent_Surgery_Date__c",
    "Subsequent_Surgery_Details__c",
    "Subsequent_Surgery_Locations__c",
    "Surgeons__c",
    "Surgery_Date__c",
    "Surgery_Hospitals_and_Dates_of_Surgery__c",
    "Surgery_Type_2__c",
    "Surgery_w_Dates_related_to_defects__c",
    "Symptom_Notes__c",
    "Symptoms_After_Implant__c",
    "Took_Generic_during_pregnancy_with_injur__c",
    "Took_Wafarin_Coumadin_Prior_To_RX__c",
    "Took_Xarelto__c",
    "Treatment_Hospital_Facility__c",
    "Type_of_Risperidone_Taken__c",
    "Which_Drug__c",
    "Worked_for_a_company_more_than__c",
    "Worked_in_oil_and_gas_industry__c",
    "X1st_Date_of_Surgery__c",
    "X2nd_Date_of_Surgery__c",
    "X2nd_Mesh_Insertion_Date__c",
    "X3rd_Surgery_Date__c",
    "Mesh_inserted_between_2005_and_2017__c",
    "Days_Hospitalized__c",
    "Date_of_DX__c",
    "Injured_Party_Middle_Name__c",
    "Experienced_Symptoms__c",
    "Date_tolled__c",
    "How_long_married__c",
    "Job__c",
    "Kids__c",
    "Married__c",
    "Prior_disability__c",
    "Years_on_job__c",
    "Amount_Of_money_lost__c",
    "Opt_In_Packet__c",
    "EI_Claims__c",
    "Type_of_Knee_Implant__c",
    "X1st_Surgery_Left_Knee__c",
    "X2nd_Surgery_Left_Knee__c",
    "X1st_Surgery_Right_Knee__c",
    "X2nd_Surgery_Right_Knee__c",
    "X1st_Surgery_Hospital_Surgeon_Left_Knee__c",
    "X2nd_Surgery_Hospital_Surgeon_Left_Knee__c",
    "X2nd_Surgery_Hospital_Surgeon_Right_Kne__c",
    "X1st_Surgery_Hospital_Surgeon_Right_Kne__c",
    "Injuries_after_impant__c",
    "Implant_date__c",
    "Work_Disability_After_Accident__c",
    "Serve_in_military_between_2003_2015__c",
    "Branch_of_military__c",
    "Confirmed_use_of_3M_earplugs__c",
    "Date_PDTF__c",
    "Intake_1_Notes__c",
    "Intake_Created_Date__c",
    "Notes_for_Executor__c",
    "Notes_for_Guardian__c",
    "Notes_For_Injured_Party__c",
    "Extended_Family_Notes__c",
    "Notes__c",
    "Injury_Descriptions__c",
    "Injury_Severe__c",
    "Injury__c",
    "Type_of_Injury__c",
    "Condition_Treated__c",
    "Injured_Boy_s_Other_Medical_Conditions__c",
    "Contact_Information__c",
    "Adult_Client__c",
    "Injured__c",
    "Property_owner__c",
    "Approximate_Day_and_Time_Property_Floode__c",
    "House_Flooded_Prior_to_Reservoir_Release__c",
    "Hospitalized__c",
    "Hip_Replacement_Surgery_Date__c",
    "Procedure_Year__c",
    "X4th_Surgery_Date__c",
    "State_of_death__c",
    "Year_use_began__c",
    "Emergency_Alternate_Contact_Information__c",
    "Doctor_who_repaired_replaced_initial_hip__c",
    "Injured_Party_1_Deceased__c",
    "Injured_Party_2_Deceased__c",
    "Injured_Party_Deceased__c",
    "Descendants__c",
    "Kids_Ages__c",
    "When_did_your_loved_one_pass_away__c",
    "Family_History_Notes__c",
    "Maiden_Alias_Name__c",
    "Relation_to_victem__c",
    "Prescribing_Doctor_Information__c",
    "Prescriber_of_Drug__c",
    "Additional_Medical_Providers__c",
    "Delivery_Hospital__c",
    "Hospital_Facility_IVC_Implanted__c",
    "Pharmacy_Info__c",
    "Primary_Care_Provider__c",
    "X1st_Facility_Hosp_and_surgeons_info__c",
    "X2nd_Facility_Hosp_and_surgeons_info__c",
    "X3rd_Facility_Hosp_and_surgeons_info__c",
    "Where_did_you_buy_your_hair_relaxer_kits__c",
    "Injured_Boy_s_Other_Medical_Conditions__c"
  ]
  let toMedicalHistory = {
    Cause_of_Death__c : 'TextArea_CauseOfDeath__c',
    Neuromuscular_Problems_DX__c : 'PickList_NeuromuscularProblemsDX__c',
    Postoperative_Pathology_Report__c : 'Bool_PostoperativePathologyReport__c',
    Risperdal_while_Underage__c : 'PickList_RisperdalWhileUnderage__c',
    Took_Drug_before_5_1_2015__c : 'Bool_TookDrugBefore512015__c',
    Did_you_have_an_accident__c : 'Bool_DidYouHaveAnAccident__c',
    Took_Valsartan_between_Jan_12_July_18__c : 'Bool_TookValsartanBetweenJan12July18__c',
    Cancer_Dx_with__c : 'PickList_CancerDxWith__c',
    Dx_with_NHL__c : 'PickList_DxWithNHL__c',
    No_Cancer_DX__c : 'Bool_NoCancerDx__c',
    Diabetes__c : 'Bool_HasDiabetes__c',
    Is_there_a_family_history_of_cancer__c : 'PickList_IsThereAFamilyHistoryOfCancer__c',
    Did_your_cancer_dx_impact_your_fertility__c : 'Bool_CancerDxImpactFertility__c',
    Why_did_you_stop_using_relaxers__c : 'TextArea_WhyDidYouStopUsingRelaxers__c',
    Has_extended_family_dx_w_same_cancer__c : 'PickList_HasExtendedFamilyDxSameCancer__c',
    Date_of_Death__c : 'Date_ofDeath__c'
  }
  let toMedicalHistoryKeys = Object.keys(toMedicalHistory)
  let toHealthEvent = {
    Date_dx_with_injury__c : 'Date__c',
    Description_of_Accident__c : 'TextArea_Description__c',
    Injury_result_in_Hospital_Stay__c : 'Bool_EventResultsInHospitalStay__c',
    Has_POU__c : 'Bool_HasPOU__c',
    Has_POI__c : 'Bool_HasPOI__c',
    Product_used__c : 'MPickList_ProductUsed__c',
    Amputation__c : 'PickList_Amputation__c',
    Accident_State__c : 'Addr_Location__Street__s',
    Accident_Address__c : 'Addr_Location__c',
    Dates_of_Hospitalization__c : 'Date_HospitalizationStarts__c',
    Death_Related_to_Accident__c : 'PickList_WereThereDeaths__c',
    State_of_Residence_at_Death__c : 'Addr_ResidentAddressATDeath__c',
  }
  let toHealthEventKeys = Object.keys(toHealthEvent)
  let toMedicalCondition = {
    Current_Symptoms__c : "MPickList_CurrentSymptoms__c",
    Description_of_Injuries_Suffered__c : "TextArea_Description__c",
    Injury_Descriptions__c : "TextArea_Description__c",
    Injury_Severe__c : "Name",
    Injury__c : "Name",
    Type_of_Injury__c : "Name",
    Injury_While_on_Drug__c : "Bool_InjuryWhileOnDrug__c" ,
    Date_of_Gynecomastia_Diagnosis__c : "Date_OfDiagnosis__c",
  }
  let toMedicalConditionKeys = Object.keys(toMedicalCondition)
  metadata.createERFromSObjectListToDBDiagramFormat(['Contact'], true)
  .then(tables => {
    let contactTable = tables[0]
    let contentContactTable = `Table ${contactTable.name} {\n`
    let contentMedicalHistoryTable = `Table Medical_History__c {\n`
    contentMedicalHistoryTable += '  id string  [primary key]\n'
    let contentHealthEventTable = `Table Health_Event__c {\n`
    contentHealthEventTable += '  id string  [primary key]\n'
    let contentMedicalConditionTable = `Table Medical_Condition__c {\n`
    contentMedicalConditionTable += '  id string  [primary key]\n'
    let references = []
    let transformedFields = {}
    let contactDeletedFields = []
    contactTable.fields.forEach(field => {
      if (toMedicalHistoryKeys.includes(field.name)) {
        transformedFields.toMedicalHistory ||= []
        transformedFields.toMedicalHistory.push(field)
        contentMedicalHistoryTable += '  ' + toMedicalHistory[field.name]
        contentMedicalHistoryTable += '  ' + field.type
        contentMedicalHistoryTable += '\n'
        references.push(`Ref: Medical_History__c.${toMedicalHistory[field.name]} > ${contactTable.name}.${field.name}\n`)
      } else if (toHealthEventKeys.includes(field.name)) {
        transformedFields.toHealthEvent ||= []
        transformedFields.toHealthEvent.push(field)
        contentHealthEventTable += '  ' + toHealthEvent[field.name]
        contentHealthEventTable += '  ' + field.type
        contentHealthEventTable += '\n'
        references.push(`Ref: Health_Event__c.${toHealthEvent[field.name]} > ${contactTable.name}.${field.name}\n`)
      } else if (toMedicalConditionKeys.includes(field.name)) {
        transformedFields.toMedicalCondition ||= []
        transformedFields.toMedicalCondition.push(field)
        contentMedicalConditionTable += '  ' + toMedicalCondition[field.name]
        contentMedicalConditionTable += '  ' + field.type
        contentMedicalConditionTable += '\n'
        references.push(`Ref: Medical_Condition__c.${toMedicalCondition[field.name]} > ${contactTable.name}.${field.name}\n`)
      } else if(deletedFields.includes(field.name)) {
        contactDeletedFields.push(field)
      } else {
        contentContactTable += '  ' + field.name
        contentContactTable += '  ' + field.type
        if (field.isPrmaryKey) contentContactTable += '  [primary key]'
        contentContactTable += '\n'
      }
    })
    Object.keys(transformedFields).forEach(key => {
      transformedFields[key].forEach(field => {
        contentContactTable += '  ' + field.name
        contentContactTable += '  ' + field.type
        if (field.isPrmaryKey) contentContactTable += '  [primary key]'
        contentContactTable += '\n'
      })
    })
    contactDeletedFields.forEach(field => {
      contentContactTable += '  ' + field.name
      contentContactTable += '  ' + field.type
      contentContactTable += "  [note: 'DELETED']"
      contentContactTable += '\n'
    })
    contentContactTable += '}\n'
    contentMedicalHistoryTable += '}\n'
    contentHealthEventTable += '}\n'
    contentMedicalConditionTable += '}\n'
    let finalContentList = [
      contentContactTable,
      contentMedicalHistoryTable,
      contentHealthEventTable,
      contentMedicalConditionTable
    ]
    let finalContent = finalContentList.join('\n')
    finalContent += references.join('\n')
    fs.writeFileSync('dbMigrationDiagram.txt', finalContent)
  })
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