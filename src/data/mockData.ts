import { FirebaseUser, ArranchamentoRecord } from '../types';

export const INITIAL_USERS: FirebaseUser[] = [
  {
    id: 'marcos_simas',
    usuario: 'Marcos Simas',
    reparticao: 'Oficiais',
    senha: '123',
    nivel: 'Administrador'
  },
  {
    id: 'carlos_silva',
    usuario: 'Carlos Silva',
    reparticao: 'St/Sgt',
    senha: '123',
    nivel: 'Furriel'
  },
  {
    id: 'joao_souza',
    usuario: 'Joao Souza',
    reparticao: 'Esqd Cap',
    senha: '123',
    nivel: 'Militar'
  },
  {
    id: 'felipe_neves',
    usuario: 'Felipe Neves',
    reparticao: '1º Esqd',
    senha: '123',
    nivel: 'Militar'
  }
];

export const MILITARY_GRADS = [
  'Sd EV',
  'Sd EP',
  'Cb',
  '3º Sgt',
  '2º Sgt',
  '1º Sgt',
  'Subten',
  '2º Ten',
  '1º Ten',
  'Cap',
  'Maj',
  'Ten Cel',
  'Cel'
];

export const SECTIONS = [
  'Oficiais',
  'St/Sgt',
  '1º Esqd',
  '2º Esqd',
  '3º Esqd',
  'Esqd Cap',
  'Fanfarra'
];
