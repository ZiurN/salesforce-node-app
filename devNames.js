let branchDevName = 'bci_sucursal__c'
let accountDevName = 'Account'
let chequeDevName = 'cheque__c'
let userDevName = 'User'
let finalcialAccountDevName = 'FinServ__FinancialAccount__c'
let caseDevName = 'Case'
let userRoleDevName = 'UserRole'
let recordTypeDevName = 'RecordType'
let BusinessHoursDevName = 'BusinessHours'
/** LISTAS */
let commercialProfiles = [
  'Asistente Comercial',
  'Ejecutivo Comercial',
  'Ejecutivo Comercial Banca Privada',
  'Gerente Comercial',
  'Gerente Regional',
  'Jefe Comercial'
]
/** FILTROS */
let commercialUsersStandardFilters = [
  { Title: { $nlike: '%EJECUTIVO INTEGRAL%' } },
  { 'Profile.Name' : { $in: commercialProfiles } },
]
export {
    branchDevName,
    accountDevName,
    chequeDevName,
    userDevName,
    finalcialAccountDevName,
    caseDevName,
    userRoleDevName,
    recordTypeDevName,
    BusinessHoursDevName,
    commercialProfiles,
    commercialUsersStandardFilters
}