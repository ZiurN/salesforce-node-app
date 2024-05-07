import * as DevNames from '../devNames.js'
import { CRM } from './crm.js'

class bciSalesforce extends CRM {
  constructor(oauth2) {
    super(oauth2)
  }
  branchFields = {
    Id: 1,
    Name: 1,
    bci_id_sucursal__c: 1,
    bci_cod_suc__c: 1
  }
  retrieveBranches = (branchFilters) => {
    branchFilters = branchFilters ? branchFilters : {}
    return this.retrieveSObjectRecords(DevNames.branchDevName, branchFilters, this.branchFields)
  }
  accountFields = {
    Id: 1,
    Name: 1,
    LastName: 1,
    FirstName: 1,
    RecordTypeId: 1,
    OwnerId: 1,
    'Owner.bci_usr_rut__c': 1,
    IsPersonAccount: 1,
    PersonContactId: 1,
    bci_cli_cic__c: 1,
    bci_cli_dv__c: 1,
    bci_cli_mora__c: 1,
    bci_cli_rut__c: 1,
    bci_estado_mora__c: 1,
    bci_id_sf_sucursal__c: 1,
    'bci_id_sf_sucursal__r.bci_id_sucursal__c': 1,
    bci_ind_acciones__c: 1,
    bci_ind_cre_consumo__c: 1,
    bci_ind_cre_hipotecario__c: 1,
    bci_ind_cuenta__c: 1,
    bci_ind_dep_plazo__c: 1,
    bci_ind_fon_mutuos__c: 1,
    bci_ind_garantia__c: 1,
    bci_ind_lin_emergencia__c: 1,
    bci_ind_lin_sobregiro__c: 1,
    bci_ind_margen__c: 1,
    bci_ind_pag_aut_cuenta__c: 1,
    bci_ind_seguros__c: 1,
    bci_ind_tar_credito__c: 1,
    bci_mon_mora__c: 1,
    bci_rut_com__c: 1
  }
  retrieveAccounts = (filters) => {
    filters = filters ? filters : {}
    return this.retrieveSObjectRecords(DevNames.accountDevName, filters, this.accountFields)
  }
  finalcialAccountFields = {
    Id: 1,
    OwnerId: 1,
    Name: 1,
    RecordTypeId: 1,
    'RecordType.Name': 1,
    'RecordType.DeveloperName': 1,
    FinServ__FinancialAccountNumber__c: 1,
    FinServ__FinancialAccountSource__c: 1,
    FinServ__FinancialAccountType__c: 1,
    FinServ__OwnerType__c: 1,
    FinServ__PrimaryOwner__c: 1,
    FinServ__Balance__c: 1,
    'FinServ__PrimaryOwner__r.bci_cli_rut__c': 1,
    'FinServ__PrimaryOwner__r.Name': 1,
    FinServ__RecordTypeName__c: 1,
    FinServ__Status__c: 1,
    bci_BiPersonal__c: 1,
    bci_ind_tipo_mov__c: 1,
    bci_ind_var_precio__c: 1,
    bci_mon_act__c: 1,
    bci_mon_cuota__c: 1,
    bci_mon_inv_ini__c: 1,
    bci_mon_tot_tasa_spread__c: 1,
    bci_moneda__c: 1,
    bci_tasa__c: 1,
    bci_ult_chq_cobrados__c: 1,
    bci_id_financialaccount__c: 1,
    bci_aux_detalle_mora__c: 1,
    bci_cnt_dias_mora__c: 1,
    bci_flg_pago_transito__c: 1,
    bci_prod_code__c: 1,
    bci_fec_primer_venc__c: 1,
    bci_nom_ejecutivo_comex__c: 1,
    bci_nom_ejecutivo_leasing__c: 1,
    bci_num_rentas_act_vs_total__c: 1,
    bci_cod_cartera_inv__c: 1,
    bci_cod_cuenta_inv__c: 1,
    bci_cod_prod_inv__c: 1,
    bci_cod_regimen_tributario__c: 1,
    bci_cod_tipo_cartera__c: 1,
    bci_fec_ven__c: 1,
    bci_num_cuenta_tdc__c: 1
  }
  retrieveFinancialAccounts = (financialAccountsFilters) => {
    financialAccountsFilters = financialAccountsFilters ? financialAccountsFilters : {}
    return this.retrieveSObjectRecords(DevNames.finalcialAccountDevName, financialAccountsFilters, this.finalcialAccountFields)
  }
  financialCardFields = {
    Id: 1,
    Name: 1,
    RecordTypeId: 1,
    'RecordType.Name': 1,
    'RecordType.DeveloperName': 1,
    FinServ__FinancialAccount__c: 1,
    FinServ__Active__c: 1,
    FinServ__OwnershipType__c: 1,
    FinServ__ValidUntil__c: 1,
    bci_est_tarjeta__c: 1,
    bci_id_tarjeta__c: 1,
    bci_mon_int_aut__c: 1,
    bci_mon_nac_aut__c: 1,
    bci_num_tarjeta__c: 1,
    bci_tip_producto__c: 1
  }
  retrieveFinancialCards = (cardsFilters) => {
    cardsFilters = cardsFilters ? cardsFilters : {}
    return this.retrieveSObjectRecords(DevNames.cardDevName, filters, this.financialCardFields)
  }
  userFields = {
    IsActive: 1,
    Id: 1,
    LastName: 1,
    FirstName: 1,
    Name: 1,
    ProfileId: 1,
    'Profile.Name': 1,
    UserRoleId: 1,
    'UserRole.Name': 1,
    'UserRole.DeveloperName': 1,
    'UserRole.ParentRoleId': 1,
    bci_Codigo_Sucursal__c: 1,
    Alias: 1,
    Title: 1,
    bci_usr_rut__c: 1,
  }
  retrieveUsers = (usersFilters) => {
    usersFilters = usersFilters ? usersFilters : {}
    return this.retrieveSObjectRecords(DevNames.userDevName, usersFilters, this.userFields)
  }
}

export { bciSalesforce }