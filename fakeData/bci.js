import { Faker, faker } from '@faker-js/faker';
import random from 'random';
import { FakeData } from './fakeData.js';

const fakeData = new FakeData();

class bciFakeData {
  createFakeCheques = (quantity) => {
    let cheques = []
    for (let i = 0; i < quantity; i++) {
      let cheque = {
        cic: '123',
        origen: 'origen',
        estado: 'PR',
        motivo: 'motivo',
        aclaracion: 'aclaracion',
        codigoOficina: '104',
        oficina: 'oficina',
        cheque: {
          serial: 1410282,
          monto: 5000,
          fecha: '2020-12-11'
        },
        cuenta: {
          numero: '58315110'
        },
        saldoContable: 76000,
        saldoDisponible: 25000000,
        saldoDisponibleTotal: 235000000,
        retenciones: 1500
      }
      cheques.push(cheque)
    }
    return cheques
  }
}

export { bciFakeData }