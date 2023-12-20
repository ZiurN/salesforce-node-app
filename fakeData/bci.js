import { Faker, faker } from '@faker-js/faker'
import random from 'random'
import { FakeData } from './fakeData.js'

const fakeData = new FakeData()
const motivos = ['FALTA FIRMA', 'FIRMA DISCONFORME']

class bciFakeData {
  createBasicCheque = (accountNumber, officeNumber, lastSerialNumber, protestadoPorFondo) => {
    let monto = Math.round(random.int(1000, 1000000)*100)
    let percentageMonto = Math.round((monto/100)*random.float(0.1, 0.9))*100
    let saldoDisponible = protestadoPorFondo ? monto - percentageMonto : monto + percentageMonto
    let saldoDisponibleTotal = saldoDisponible + Math.round((saldoDisponible/100)*random.float(0.1, 0.9))*100
    return {
      oficina: officeNumber,
      cheque: {
        serial: fakeData.padToNDigits(lastSerialNumber + 1, 8) ,
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
  createFakeChequesProtestadosForma = (accountNumbers, existingChequesGroupedByAccountNumber, quantity, userInfo) => {
    let cheques = []
    let officeNumber = userInfo.bci_Codigo_Sucursal__c
    let userAlias = userInfo.Alias
    accountNumbers.forEach(accountNumber => {
      let existingCheques = existingChequesGroupedByAccountNumber[accountNumber] ?? []
      let lastSerialNumber = 0
      if (existingCheques.length > 0) {
        lastSerialNumber = existingCheques.reduce((max, serial) => {
          return serial > max ? serial : max
        })
      }
      for (let i = 0; i < quantity; i++) {
        let chequeToBeCreated = this.createBasicCheque(accountNumber, officeNumber, lastSerialNumber, false)
        chequeToBeCreated = {
          ...chequeToBeCreated,
          cic: '123',
          origen: 'origen',
          estado: 'PR',
          motivo: motivos[fakeData.returnRandomIndex(motivos)],
          aclaracion: 'aclaracion',
          codigoOficina: officeNumber,
          _userAlias: userAlias
        }
        cheques.push(chequeToBeCreated)
      }
    })
    return cheques
  }
}

export { bciFakeData }