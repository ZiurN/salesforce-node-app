import { Faker, faker } from '@faker-js/faker'
import random from 'random'
import { FakeData } from './fakeData.js'

const fakeData = new FakeData()
const motivosForma = [
  {motivo: 'FALTA FIRMA', codMotivo: '01'},
  {motivo: 'FIRMA DISCONFORME', codMotivo: '02'},
  {motivo: 'MAL EXTENDIDO', codMotivo: '04'},
  {motivo: 'FALTA DE FONDOS', codMotivo: '03'}
]
const motivosFondo = [
  {motivo: 'Lista Blanca', codMotivo: '01'},
  {motivo: 'Lista Negra', codMotivo: '02'},
  {motivo: 'Prot s/Aclarar', codMotivo: '03'},
  {motivo: 'Días Sobreg. NP', codMotivo: '04'},
  {motivo: 'Protestos Acum', codMotivo: '05'},
  {motivo: 'Deuda Morosa', codMotivo: '06'},
  {motivo: 'Sobreg NP Auto', codMotivo: '07'},
  {motivo: 'Ret. Mas 3 días', codMotivo: '08'},
  {motivo: 'Mnto Buen Comp', codMotivo: '09'},
  {motivo: 'Error', codMotivo: '11'},
  {motivo: 'Pago SG M$100', codMotivo: 'A'},
  {motivo: 'Mala Calificac', codMotivo: 'C'},
  {motivo: 'Monto del SNP', codMotivo: 'D'},
  {motivo: 'Sdo. Disponible', codMotivo: 'S'}
]
const interfaces = {
  'Protesto por Fondo': {
    estado: ['X', 'A'][fakeData.returnRandomIndex(['X', 'A'])],
    accion: ['', 'PA', 'PR'][fakeData.returnRandomIndex(['', 'PA', 'PR'])],
    origenAccion: 'E'
  },
  'Pagados Automaticamente': {
    estado: 'A',
    accion: 'PA',
    origenAccion: 'A'
  },
  'Protestados Automaticamente': {
    estado: 'A',
    accion: 'PR',
    origenAccion: 'A'
  },
  'Protestos por Contingencia': {
    estado: 'X',
    accion: 'OP',
    origenAccion: ''
  },
}

class bciFakeData {
  createBasicCheque = (accountNumber, officeNumber, serialNumber, protestadoPorFondo) => {
    let monto = Math.round(random.int(1000, 1000000)*100)
    let percentageMonto = Math.round((monto/100)*random.float(0.1, 0.9))*100
    let saldoDisponible = protestadoPorFondo ? monto - percentageMonto : monto + percentageMonto
    let saldoDisponibleTotal = saldoDisponible + Math.round((saldoDisponible/100)*random.float(0.1, 0.9))*100
    return {
      oficina: officeNumber,
      cheque: {
        serial: protestadoPorFondo ? '1' + fakeData.padToNDigits(serialNumber + 1, 8) : '2' + fakeData.padToNDigits(serialNumber, 7),
        monto: monto,
        fecha: fakeData.returnDataFormatted(fakeData.setPastDate(1))
      },
      cuenta: {
        numero: accountNumber
      },
      saldoContable: saldoDisponibleTotal,
      saldoDisponible: saldoDisponible,
      saldoDisponibleTotal: saldoDisponibleTotal,
      retenciones: monto*0.1
    }
  }
  createFakeChequesProtestadosForma = (accountNumbers, existingChequesGroupedByAccountNumber, userInfo) => {
    let cheques = []
    let officeNumber = userInfo.bci_Codigo_Sucursal__c
    let userAlias = userInfo.Alias
    accountNumbers.forEach((accountNumber, idx) => {
      let existingCheques = existingChequesGroupedByAccountNumber
      let lastSerialNumber = 0
      if (existingCheques.length > 0) {
        lastSerialNumber = existingCheques.reduce((max, serial) => {
          return serial > max ? serial : max
        })
      }[accountNumber] ?? []
      let chequeToBeCreated = this.createBasicCheque(accountNumber, officeNumber, Number(lastSerialNumber) + Number(idx), false)
      let motivo = motivosForma[fakeData.returnRandomIndex(motivosForma)]
      chequeToBeCreated = {
        ...chequeToBeCreated,
        cic: '123',
        origen: 'origen',
        estado: 'PR',
        motivo: motivo.motivo,
        codMotivo: motivo.codMotivo,
        aclaracion: 'aclaracion',
        codigoOficina: officeNumber,
        _userAlias: userAlias
      }
      cheques.push(chequeToBeCreated)
    })
    return cheques
  }
  createFakeChequesProtestadosFondo = (accountNumbers, existingChequesGroupedByAccountNumber, userInfo, interfaceName) => {
    let interfaceObject = interfaces[interfaceName]
    let cheques = []
    let officeNumber = userInfo.bci_Codigo_Sucursal__c
    let userAlias = userInfo.Alias
    accountNumbers.forEach((accountNumber, idx) => {
      let motivo = motivosFondo[fakeData.returnRandomIndex(motivosFondo)]
      let existingCheques = existingChequesGroupedByAccountNumber
      let lastSerialNumber = 0
      if (existingCheques.length > 0) {
        lastSerialNumber = existingCheques.reduce((max, serial) => {
          return serial > max ? serial : max
        })
      }[accountNumber] ?? []
      let chequeToBeCreated = this.createBasicCheque(accountNumber, officeNumber, Number(lastSerialNumber) + Number(idx), true)
      chequeToBeCreated = {
        ...chequeToBeCreated,
        estado: interfaceObject.estado,
        descripcionEstado: 'Descripción',
        accion: interfaceObject.accion,
        criterioAutomatico: 'D',
        motivo: motivo.motivo,
        cheque: {
          ...chequeToBeCreated.cheque,
          origenAccion: interfaceObject.origenAccion
        },
        tipoMovimiento: 'Canje',
        saldoDisponibleCalculado: chequeToBeCreated.saldoDisponibleTotal,
        _userAlias: userAlias
      }
      cheques.push(chequeToBeCreated)
    })
    return cheques

  }
}

export { bciFakeData }