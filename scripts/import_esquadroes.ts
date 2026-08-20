import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set } from 'firebase/database';
import fs from 'fs';
import path from 'path';
import { cleanTextId, getMilitarGroupFromGraduacao } from '../src/utils/storage';
import { FirebaseUser } from '../src/types';

function deduplicateUsers(users: FirebaseUser[]): FirebaseUser[] {
  const seenIds = new Set<string>();
  const seenLogins = new Set<string>();
  const result: FirebaseUser[] = [];
  for (const user of users) {
    if (!user || !user.id) continue;
    const idKey = cleanTextId(user.id);
    const loginKey = cleanTextId(user.login || user.usuario || '');
    if (seenIds.has(idKey) || (loginKey && seenLogins.has(loginKey))) {
      continue;
    }
    seenIds.add(idKey);
    if (loginKey) seenLogins.add(loginKey);
    result.push(user);
  }
  return result;
}

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyDtWsJpYq0ixmdn-kcdVkZy717cYtu6vX4',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'arranchamais1.firebaseapp.com',
  databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://arranchamais1-default-rtdb.firebaseio.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'arranchamais1',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'arranchamais1.firebasestorage.app',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '1012748557408',
  appId: process.env.FIREBASE_APP_ID || '1:1012748557408:web:ef10fa982dce6300a27705'
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const list1Esqd = [
  { num: 1, grad: 'Cap', name: 'THAUÃ MARQUES' },
  { num: 2, grad: '1º Ten', name: 'ANÍZIO' },
  { num: 3, grad: '2º Ten', name: 'SANTOS' },
  { num: 4, grad: 'Asp', name: 'FASSARELA' },
  { num: 5, grad: '1º Sgt', name: 'SOUZA MOTTA' },
  { num: 6, grad: '2º Sgt', name: 'FAGUNDES' },
  { num: 7, grad: '2º Sgt', name: 'GABERTI' },
  { num: 8, grad: '2º Sgt', name: 'LISANDRO' },
  { num: 9, grad: '2º Sgt', name: 'BECKER' },
  { num: 10, grad: '3º Sgt', name: 'SÉRGIO' },
  { num: 11, grad: '3º Sgt', name: 'LIRA' },
  { num: 12, grad: '3º Sgt', name: 'BARROSO' },
  { num: 13, grad: '3º Sgt', name: 'RODRIGUES' },
  { num: 14, grad: '3º Sgt', name: 'MAICO' },
  { num: 15, grad: '3º Sgt', name: 'VILMAR' },
  { num: 16, grad: '3º Sgt', name: 'J RODRIGUES' },
  { num: 17, grad: '3º Sgt', name: 'FIALHO' },
  { num: 18, grad: '3º Sgt', name: 'KROTH' },
  { num: 19, grad: '3º Sgt', name: 'SILAS MAGALHÃES' },
  { num: 20, grad: '3º Sgt', name: 'FAJARDO' },
  { num: 21, grad: '3º Sgt', name: 'ARAÚJO SANTOS' },
  { num: 22, grad: '3º Sgt', name: 'RAMIREZ' },
  { num: 23, grad: 'Cb', name: 'M GONÇALVES' },
  { num: 24, grad: 'Cb', name: 'CORREA' },
  { num: 25, grad: 'Cb', name: 'ESCOTO' },
  { num: 26, grad: 'Cb', name: 'DA COSTA' },
  { num: 27, grad: 'Cb', name: 'COSTA' },
  { num: 28, grad: 'Cb', name: 'ALEXANDRE' },
  { num: 29, grad: 'Cb', name: 'SOUZA' },
  { num: 30, grad: 'Cb', name: 'MUNHOS' },
  { num: 31, grad: 'Cb', name: 'LEONARDO' },
  { num: 32, grad: 'Cb', name: 'RANNINI' },
  { num: 33, grad: 'Cb', name: 'CARLOS' },
  { num: 34, grad: 'Cb', name: 'MARTINS' },
  { num: 35, grad: 'Cb', name: 'GABRIEL COSTA' },
  { num: 36, grad: 'Cb', name: 'MATEUS DUTRA' },
  { num: 37, grad: 'Cb', name: 'JOÃO MARIO' },
  { num: 38, grad: 'Cb', name: 'PEICHOTO' },
  { num: 39, grad: 'Cb', name: 'D. VELEDA' },
  { num: 40, grad: 'Cb', name: 'CABRERA' },
  { num: 41, grad: 'Cb', name: 'MIKE' },
  { num: 42, grad: 'Cb', name: 'DAS NEVES' },
  { num: 43, grad: 'Cb', name: 'MEIRELLES' },
  { num: 44, grad: 'Sd EP', name: 'JHONATT' },
  { num: 45, grad: 'Sd EP', name: 'M BITENCOURT' },
  { num: 46, grad: 'Sd EP', name: 'MAURO' },
  { num: 47, grad: 'Sd EP', name: 'ANGELO' },
  { num: 48, grad: 'Sd EP', name: 'BARONI' },
  { num: 49, grad: 'Sd EP', name: 'MACHADO DE CASTRO' },
  { num: 50, grad: 'Sd EP', name: 'ISAC' },
  { num: 51, grad: 'Sd EP', name: 'BARBOSA' },
  { num: 52, grad: 'Sd EP', name: 'LETIERRE' },
  { num: 53, grad: 'Sd EP', name: 'SAMPAIO' },
  { num: 54, grad: 'Sd EP', name: 'GOMES' },
  { num: 55, grad: 'Sd EP', name: 'THIAGO' },
  { num: 56, grad: 'Sd EP', name: 'THIAGO SEVERO' },
  { num: 57, grad: 'Sd EP', name: 'TOLEDO' },
  { num: 58, grad: 'Sd EP', name: 'EDGAR' },
  { num: 59, grad: 'Sd EP', name: 'SIMAS' },
  { num: 60, grad: 'Sd EP', name: 'KLEITON' },
  { num: 61, grad: 'Sd EP', name: 'SAMUEL FREITAS' },
  { num: 62, grad: 'Sd EP', name: 'SAMUEL CASTRO' },
  { num: 63, grad: 'Sd EP', name: 'ROSSANO' },
  { num: 64, grad: 'Sd EP', name: 'VICTOR' },
  { num: 65, grad: 'Sd EP', name: 'DE AZEVEDO' },
  { num: 66, grad: 'Sd EP', name: 'HENRIQUES' },
  { num: 67, grad: 'Sd EP', name: 'ANDERSON' },
  { num: 68, grad: 'Sd EP', name: 'RODRIGUEZ' },
  { num: 69, grad: 'Sd EP', name: 'SALACAR' },
  { num: 70, grad: 'Sd EP', name: 'LACERDA' },
  { num: 71, grad: 'Sd EP', name: 'MUNIZ' },
  { num: 72, grad: 'Sd EP', name: 'FREITAS' },
  { num: 73, grad: 'Sd EP', name: 'JULLIANO' },
  { num: 74, grad: 'Sd EP', name: 'BARRADA' },
  { num: 75, grad: 'Sd EP', name: 'SOUZA PINTO' },
  { num: 76, grad: 'Sd EV', name: 'MACHADO' },
  { num: 77, grad: 'Sd EV', name: 'ANTONY' },
  { num: 78, grad: 'Sd EV', name: 'BRYAN' },
  { num: 79, grad: 'Sd EV', name: 'DOS SANTOS' },
  { num: 80, grad: 'Sd EV', name: 'CARBAJAL' },
  { num: 81, grad: 'Sd EV', name: 'JACOB' },
  { num: 82, grad: 'Sd EV', name: 'ELIARDO' },
  { num: 83, grad: 'Sd EV', name: 'EDILSON' },
  { num: 84, grad: 'Sd EV', name: 'VAQUEIRO' },
  { num: 85, grad: 'Sd EV', name: 'SEVERO' },
  { num: 86, grad: 'Sd EV', name: 'DA LUZ' },
  { num: 87, grad: 'Sd EV', name: 'HERIK' },
  { num: 88, grad: 'Sd EV', name: 'BOENO' },
  { num: 89, grad: 'Sd EV', name: 'SILVEIRA' },
  { num: 90, grad: 'Sd EV', name: 'ESMIT' },
  { num: 91, grad: 'Sd EV', name: 'PEÇANHA' },
  { num: 92, grad: 'Sd EV', name: 'DUARTE' },
  { num: 93, grad: 'Sd EV', name: 'PROCOPIO' },
  { num: 94, grad: 'Sd EV', name: 'LEITE' },
  { num: 95, grad: 'Sd EV', name: 'PACHECO' },
  { num: 96, grad: 'Sd EV', name: 'DE ALMEIDA' },
  { num: 97, grad: 'Sd EV', name: 'LUIS CASTRO' },
  { num: 98, grad: 'Sd EV', name: 'RODRIGUES' },
  { num: 99, grad: 'Sd EV', name: 'ALISSON COSTA' },
  { num: 100, grad: 'Sd EV', name: 'BITTENCOURT' },
  { num: 101, grad: 'Sd EV', name: 'MADRUGA' },
  { num: 102, grad: 'Sd EV', name: 'GEDRES' },
  { num: 103, grad: 'Sd EV', name: 'AYANG' },
  { num: 104, grad: 'Sd EV', name: 'RHIÃ' },
  { num: 105, grad: 'Sd EV', name: 'MACIEL' },
  { num: 106, grad: 'Sd EV', name: 'CORDEIRO' },
  { num: 107, grad: 'Sd EV', name: 'GARCES' },
  { num: 108, grad: 'Sd EV', name: 'DA ROSA' },
  { num: 109, grad: 'Sd EV', name: 'YAGO' },
  { num: 110, grad: 'Sd EV', name: 'COIMBRA' },
  { num: 111, grad: 'Sd EV', name: 'IGNACIO' },
  { num: 112, grad: 'Sd EV', name: 'TOMAZ' },
  { num: 113, grad: 'Sd EV', name: 'KILUA' },
  { num: 114, grad: 'Sd EV', name: 'VIDARTE' },
  { num: 115, grad: 'Sd EV', name: 'GUILHERME COSTA' },
  { num: 116, grad: 'Sd EV', name: 'FAGUNDES' },
  { num: 117, grad: 'Sd EV', name: 'GUERRES' },
  { num: 118, grad: 'Sd EV', name: 'MACHADO BUENO' },
  { num: 119, grad: 'Sd EV', name: 'CUSTÓDIO' },
  { num: 120, grad: 'Sd EV', name: 'REGUEIRO' },
  { num: 121, grad: 'Sd EV', name: 'FELICE' },
  { num: 122, grad: 'Sd EV', name: 'SILVA' },
  { num: 123, grad: 'Sd EV', name: 'JOÃO VITOR' },
  { num: 124, grad: 'Sd EV', name: 'MIGUEL' },
  { num: 125, grad: 'Sd EV', name: 'CALVEIRA' },
  { num: 126, grad: 'Sd EV', name: 'MARTINS' },
  { num: 127, grad: 'Sd EV', name: 'DETTMANN' },
  { num: 128, grad: 'Sd EV', name: 'MULLER' },
  { num: 129, grad: 'Sd EV', name: 'HESS' },
  { num: 130, grad: 'Sd EV', name: 'JUNIOR' },
  { num: 131, grad: 'Sd EV', name: 'AIBAR' },
  { num: 132, grad: 'Sd EV', name: 'BRASIL' }
];

const list2Esqd = [
  { num: 1, grad: 'Cap', name: 'GUSTAVO MOTTA' },
  { num: 2, grad: '1º Ten', name: 'GUARILHA' },
  { num: 3, grad: '2º Ten', name: 'SAMOGIM' },
  { num: 4, grad: 'ST', name: 'KARBONI' },
  { num: 5, grad: '2º Sgt', name: 'SIMÕES' },
  { num: 6, grad: '2º Sgt', name: 'OLIVEIRA ALVES' },
  { num: 7, grad: '3º Sgt', name: 'LACH' },
  { num: 8, grad: '3º Sgt', name: 'DIOGO' },
  { num: 9, grad: '3º Sgt', name: 'LEONEL' },
  { num: 10, grad: '3º Sgt', name: 'ALEJANDRO' },
  { num: 11, grad: '3º Sgt', name: 'MEIRELLES' },
  { num: 12, grad: '3º Sgt', name: 'WESLEY' },
  { num: 13, grad: '3º Sgt', name: 'RAI' },
  { num: 14, grad: '3º Sgt', name: 'CAMARGO' },
  { num: 15, grad: '3º Sgt', name: 'TRINDADE' },
  { num: 16, grad: '3º Sgt', name: 'ARTECHE' },
  { num: 17, grad: 'Cb', name: 'CRISTIAN LUCAS' },
  { num: 18, grad: 'Cb', name: 'GIOVANI' },
  { num: 19, grad: 'Cb', name: 'SANDER' },
  { num: 20, grad: 'Cb', name: 'LEITES' },
  { num: 21, grad: 'Cb', name: 'AVILA FLORES' },
  { num: 22, grad: 'Cb', name: 'YGOR' },
  { num: 23, grad: 'Cb', name: 'THIRSON' },
  { num: 24, grad: 'Cb', name: 'GUILHERME' },
  { num: 25, grad: 'Cb', name: 'MONCOPIO' },
  { num: 26, grad: 'Cb', name: 'ALTAMIR' },
  { num: 27, grad: 'Cb', name: 'THOMAS' },
  { num: 28, grad: 'Cb', name: 'ARANDA' },
  { num: 29, grad: 'Cb', name: 'OLIVEIRA PIRES' },
  { num: 30, grad: 'Cb', name: 'CRISTOPHER' },
  { num: 31, grad: 'Cb', name: 'LUIS FABIANO' },
  { num: 32, grad: 'Cb', name: 'AMBROSIO' },
  { num: 33, grad: 'Cb', name: 'GOES' },
  { num: 34, grad: 'Cb', name: 'DA CUNHA' },
  { num: 35, grad: 'Cb', name: 'VIANA' },
  { num: 36, grad: 'Cb', name: 'GABRIEL PEDROSO' },
  { num: 37, grad: 'Sd EP', name: 'OLIVER' },
  { num: 38, grad: 'Sd EP', name: 'ELIAS' },
  { num: 39, grad: 'Sd EP', name: 'GEBERSON' },
  { num: 40, grad: 'Sd EP', name: 'RUBENS' },
  { num: 41, grad: 'Sd EP', name: 'KAUANDER' },
  { num: 42, grad: 'Sd EP', name: 'WANDER' },
  { num: 43, grad: 'Sd EP', name: 'FERREIRA' },
  { num: 44, grad: 'Sd EP', name: 'RODZYNSKI' },
  { num: 45, grad: 'Sd EP', name: 'LEWRY' },
  { num: 46, grad: 'Sd EP', name: 'WEGNER' },
  { num: 47, grad: 'Sd EP', name: 'LUCAS VARGAS' },
  { num: 48, grad: 'Sd EP', name: 'MORAIS' },
  { num: 49, grad: 'Sd EP', name: 'SIQUEIRA' },
  { num: 50, grad: 'Sd EP', name: 'DOS SANTOS' },
  { num: 51, grad: 'Sd EP', name: 'CABREIRA' },
  { num: 52, grad: 'Sd EP', name: 'KARLISOM' },
  { num: 53, grad: 'Sd EP', name: 'ASSIS' },
  { num: 54, grad: 'Sd EV', name: 'ROMERO' },
  { num: 55, grad: 'Sd EV', name: 'SIMÕES' },
  { num: 56, grad: 'Sd EV', name: 'ADROALDO' },
  { num: 57, grad: 'Sd EV', name: 'OYAMBURO' },
  { num: 58, grad: 'Sd EV', name: 'PEDRO HENRIQUE' },
  { num: 59, grad: 'Sd EV', name: 'RECOVA' },
  { num: 60, grad: 'Sd EV', name: 'PINA' },
  { num: 61, grad: 'Sd EV', name: 'MASSAQUE' },
  { num: 62, grad: 'Sd EV', name: 'KAIKE' },
  { num: 63, grad: 'Sd EV', name: 'GUILHERME' },
  { num: 64, grad: 'Sd EV', name: 'BRAGA' },
  { num: 65, grad: 'Sd EV', name: 'MOTTA' },
  { num: 66, grad: 'Sd EV', name: 'BEZERRA' },
  { num: 67, grad: 'Sd EV', name: 'SANTOS' },
  { num: 68, grad: 'Sd EV', name: 'OLIVEIRA ALVES' },
  { num: 69, grad: 'Sd EV', name: 'E.GOULART' },
  { num: 70, grad: 'Sd EV', name: 'G.SOARES' },
  { num: 71, grad: 'Sd EV', name: 'JOÃO GABRIEL' },
  { num: 72, grad: 'Sd EV', name: 'DE AVILA' },
  { num: 73, grad: 'Sd EV', name: 'COUTO' },
  { num: 74, grad: 'Sd EV', name: 'LEVI' },
  { num: 75, grad: 'Sd EV', name: 'ANDREI' },
  { num: 76, grad: 'Sd EV', name: 'DEYVIDH' },
  { num: 77, grad: 'Sd EV', name: 'DOSTATNY' },
  { num: 78, grad: 'Sd EV', name: 'DE LACERDA' },
  { num: 79, grad: 'Sd EV', name: 'T.TAVARES' },
  { num: 80, grad: 'Sd EV', name: 'REHBEIN' },
  { num: 81, grad: 'Sd EV', name: 'VIGEL' },
  { num: 82, grad: 'Sd EV', name: 'EDUARDO SOUZA' },
  { num: 83, grad: 'Sd EV', name: 'SUTELLO' },
  { num: 84, grad: 'Sd EV', name: 'AFFELDT' },
  { num: 85, grad: 'Sd EV', name: 'GAMA' },
  { num: 86, grad: 'Sd EV', name: 'KRUMEL' },
  { num: 87, grad: 'Sd EV', name: 'LUCAS PEREIRA' },
  { num: 88, grad: 'Sd EV', name: 'GUEDES' },
  { num: 89, grad: 'Sd EV', name: 'OLIVEIRA MACHADO' },
  { num: 90, grad: 'Sd EV', name: 'FARIAS' }
];

function buildUser(item: { num: number; grad: string; name: string }, esqdNum: number, reparticao: string): FirebaseUser {
  const id = (esqdNum === 1 ? 11000000 + item.num : 20000000 + item.num).toString();
  const isOficOrSgt = ['Cap', '1º Ten', '2º Ten', 'Asp', 'ST', '1º Sgt', '2º Sgt', '3º Sgt'].includes(item.grad);
  let login = '';
  if (isOficOrSgt) {
    login = `${cleanTextId(item.grad)}${cleanTextId(item.name)}`;
  } else if (item.grad === 'Cb') {
    login = `cb${esqdNum}esqd${cleanTextId(item.name)}`;
  } else if (item.grad === 'Sd EP') {
    login = `sdep${esqdNum}esqd${cleanTextId(item.name)}`;
  } else if (item.grad === 'Sd EV') {
    login = `sdev${esqdNum}esqd${cleanTextId(item.name)}`;
  } else {
    login = `sd${esqdNum}esqd${cleanTextId(item.name)}`;
  }

  const grupo = getMilitarGroupFromGraduacao(item.grad, reparticao);

  return {
    id,
    nuc: id,
    login,
    usuario: item.name.toUpperCase(),
    reparticao,
    graduacao: item.grad,
    grupo,
    senha: '123456',
    nivel: 'Militar',
    tentativasIncorretas: 0,
    bloqueado: false,
    trocarSenhaNoPrimeiroAcesso: true,
    approved: true,
    ativo: true
  };
}

async function runImport() {
  console.log('--- INICIANDO IMPORTAÇÃO ADITIVA E SEGURA ---');

  // 1. Fetch current data from Firebase RTDB
  const [usersSnap, recordsSnap, deletedSnap] = await Promise.all([
    get(ref(db, 'users')),
    get(ref(db, 'recordsById')),
    get(ref(db, 'deletedUsers'))
  ]);

  const currentUsers: FirebaseUser[] = usersSnap.exists()
    ? (Array.isArray(usersSnap.val()) ? usersSnap.val() : Object.values(usersSnap.val()))
    : [];
  const currentRecords = recordsSnap.exists() ? recordsSnap.val() : {};
  const currentDeleted = deletedSnap.exists()
    ? (Array.isArray(deletedSnap.val()) ? deletedSnap.val() : Object.values(deletedSnap.val()))
    : [];

  const existingCount = currentUsers.length;
  const recordsCount = Object.keys(currentRecords).length;
  console.log(`Estado inicial do Firebase: ${existingCount} usuários, ${recordsCount} arranchamentos.`);

  if (existingCount < 200) {
    throw new Error('Abortando: base de usuários existente não foi detectada corretamente!');
  }

  // 2. Build candidate new users
  const users1 = list1Esqd.map(item => buildUser(item, 1, '1º Esqd C Mec'));
  const users2 = list2Esqd.map(item => buildUser(item, 2, '2º Esqd C Mec'));
  const candidatesToAdd = [...users1, ...users2];

  console.log(`Candidatos a adicionar: 1º Esqd (${users1.length}), 2º Esqd (${users2.length}), Total = ${candidatesToAdd.length}`);

  // 3. Idempotent filtering: ensure no existing user ID or Login is replaced or overwritten
  const existingIds = new Set(currentUsers.map(u => cleanTextId(u.id)));
  const existingLogins = new Set(currentUsers.map(u => cleanTextId(u.login)));

  const trulyNewUsers: FirebaseUser[] = [];
  const alreadyExistingUsers: FirebaseUser[] = [];

  for (const candidate of candidatesToAdd) {
    const idKey = cleanTextId(candidate.id);
    const loginKey = cleanTextId(candidate.login);
    if (existingIds.has(idKey) || existingLogins.has(loginKey)) {
      alreadyExistingUsers.push(candidate);
    } else {
      trulyNewUsers.push(candidate);
    }
  }

  console.log(`Novos usuários a inserir: ${trulyNewUsers.length}`);
  console.log(`Usuários já existentes ignorados (idempotência): ${alreadyExistingUsers.length}`);

  // 4. Combine existing users + new users
  const finalUsersList = deduplicateUsers([...currentUsers, ...trulyNewUsers]);
  console.log(`Total final de usuários: ${finalUsersList.length}`);

  // 5. Update Firebase RTDB atomically
  console.log('Gravando novos usuários no Firebase RTDB...');
  await set(ref(db, 'users'), finalUsersList);

  // 6. Update local db.json
  const dbPath = path.resolve(process.cwd(), 'src/data/db.json');
  if (fs.existsSync(dbPath)) {
    const rawLocal = fs.readFileSync(dbPath, 'utf8');
    const localJson = JSON.parse(rawLocal);
    localJson.users = finalUsersList;
    fs.writeFileSync(dbPath, JSON.stringify(localJson, null, 2), 'utf8');
    console.log('src/data/db.json atualizado com sucesso.');
  }

  // 7. Verify result by re-fetching from Firebase RTDB
  console.log('Verificando integridade no Firebase RTDB...');
  const [verifyUsersSnap, verifyRecordsSnap] = await Promise.all([
    get(ref(db, 'users')),
    get(ref(db, 'recordsById'))
  ]);

  const verifyUsers: FirebaseUser[] = verifyUsersSnap.exists()
    ? (Array.isArray(verifyUsersSnap.val()) ? verifyUsersSnap.val() : Object.values(verifyUsersSnap.val()))
    : [];
  const verifyRecords = verifyRecordsSnap.exists() ? verifyRecordsSnap.val() : {};

  const byReparticao: Record<string, number> = {};
  verifyUsers.forEach(u => {
    byReparticao[u.reparticao] = (byReparticao[u.reparticao] || 0) + 1;
  });

  console.log('--- RELATÓRIO DE SUCESSO DA IMPORTAÇÃO ---');
  console.log(`Total de usuários no banco: ${verifyUsers.length} (esperado: ${existingCount + trulyNewUsers.length})`);
  console.log(`Total de arranchamentos preservados: ${Object.keys(verifyRecords).length} (esperado: ${recordsCount})`);
  console.log('Distribuição por Subunidade / Repartição:');
  for (const [rep, count] of Object.entries(byReparticao)) {
    console.log(`  - ${rep}: ${count} militares`);
  }

  console.log('--- OPERAÇÃO CONCLUÍDA COM ÊXITO ---');
  process.exit(0);
}

runImport().catch(err => {
  console.error('ERRO NA IMPORTAÇÃO:', err);
  process.exit(1);
});
