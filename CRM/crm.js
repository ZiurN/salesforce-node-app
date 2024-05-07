import { JSForce } from './../jsforce.js'
import * as DevNames from './../devNames.js';

class CRM {
  constructor(oauth2) {
    this.jsforce = new JSForce(oauth2);
  }
  retrieveSObjectRecords = (SObjectDevName, filters, fields) => {
    return new Promise((resolve, reject) => {
      this.jsforce.getRecordsByFieldsList(SObjectDevName, filters, fields)
        .then((records) => {
          resolve(records)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }
  recordTypeFields = {
    Id: 1,
    Name: 1,
    DeveloperName: 1,
    SobjectType: 1
  }
  retrieveRecordTypes = (recordTypes) => {
    let filters = recordTypes
     ? { $or: [ { DeveloperName: { $in : recordTypes } },  { Name: { $in : recordTypes } }] }
     : {}
    return this.retrieveSObjectRecords(DevNames.recordTypeDevName, filters, this.recordTypeFields)
  }
  userRoleFields = {
    Id: 1,
    Name: 1,
    DeveloperName: 1,
    ParentRoleId: 1,
    RollupDescription: 1
  }
  retrieveUserRoles = (userRolesList) => {
    let filters = userRolesList
      ? { $or: [ { DeveloperName: { $in : userRolesList } },  { Name: { $in : userRolesList } }] }
      : {}
    return this.retrieveSObjectRecords(DevNames.userRoleDevName, filters, this.userRoleFields)
  }
  BusinessHoursFields = {
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
  retrieveBusinessHours = () => {
    return this.retrieveSObjectRecords(DevNames.businessHoursDevName, {}, this.BusinessHoursFields)
  }
}

export { CRM }