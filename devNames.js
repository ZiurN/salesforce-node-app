let branchDevName = 'bci_sucursal__c'
let accountDevName = 'Account'
let chequeDevName = 'cheque__c'
let userDevName = 'User'
let finalcialAccountDevName = 'FinServ__FinancialAccount__c'
let caseDevName = 'Case'
let userRoleDevName = 'UserRole'
let recordTypeDevName = 'RecordType'
let BusinessHoursDevName = 'BusinessHours'
let taskDevName = 'Task'
let cardDevName = 'FinServ__Card__c'
/** LISTAS */
let commercialProfiles = [
  'Asistente Comercial',
  'Ejecutivo Comercial',
  'Ejecutivo Comercial Banca Privada',
  'Gerente Comercial',
  'Gerente Regional',
  'Jefe Comercial'
]
let tipoGestion = {
  TELEFONICO : [
    'TEL_SOLICITUD_PRORROGA_MYPE',
    'TEL_SOLICITUD_PRORROGA_NOVA',
    'PAGADO_N',
    'PROCESO_RENEG',
    'FALLECIDO_N',
    'FONO_NO_CONTESTA_N',
    'FONO_NO_CORRESPONDE_N',
    'CESANTE_N',
    'COMPROMISO_PAGO_N',
    'COMPROMISO_RENE_N',
    'CLIENTE_CORTA_LLAMADA_N',
    'CLIENTE_NO_PAGARA_N',
    'CONSULTA_BOTON_PAGO',
    'INTERESADO_RENEG_N',
    'RENEGOCIACION_PENDIENTE_N',
    'SUC_RECHAZADA',
    'OTROS',
    'NUEVO_COPA_N'
  ]
}
/** FILTROS */
let commercialUsersStandardFilters = [
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
    taskDevName,
    cardDevName,
    commercialProfiles,
    tipoGestion,
    commercialUsersStandardFilters
}