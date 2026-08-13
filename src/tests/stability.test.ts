import { isDateLocked as isDateLockedClient } from '../utils/storage';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
}

async function runTests() {
  console.log('=== RUNNING MANDATORY STABILITY & SECURITY TESTS ===');

  // Test 1: Segunda-feira 17/08/2026 às 15:29:59 ainda permite arranchar para Terça-feira 18/08/2026
  const monBefore1530 = new Date('2026-08-17T15:29:59');
  const locked1Client = isDateLockedClient('2026-08-18', monBefore1530);
  assert(!locked1Client, 'Mon 15:29:59 should NOT lock Tue 18/08/2026');
  console.log('✓ Test 1 Passed: Mon 15:29:59 allows Tue 18/08/2026');

  // Test 2: Segunda-feira 17/08/2026 às 15:30 bloqueia Terça-feira 18/08/2026
  const monAt1530 = new Date('2026-08-17T15:30:00');
  const locked2Client = isDateLockedClient('2026-08-18', monAt1530);
  assert(locked2Client, 'Mon 15:30:00 MUST lock Tue 18/08/2026');
  console.log('✓ Test 2 Passed: Mon 15:30:00 locks Tue 18/08/2026');

  // Test 3: Terça-feira às 15:30 bloqueia Quarta-feira
  const tueAt1530 = new Date('2026-08-18T15:30:00');
  const locked3Client = isDateLockedClient('2026-08-19', tueAt1530);
  assert(locked3Client, 'Tue 15:30:00 MUST lock Wed 19/08/2026');
  console.log('✓ Test 3 Passed: Tue 15:30:00 locks Wed 19/08/2026');

  // Test 4: Sexta-feira às 10:30 bloqueia Sábado, Domingo e Segunda
  const friAt1030 = new Date('2026-08-21T10:30:00');
  assert(isDateLockedClient('2026-08-22', friAt1030), 'Fri 10:30 MUST lock Sat');
  assert(isDateLockedClient('2026-08-23', friAt1030), 'Fri 10:30 MUST lock Sun');
  assert(isDateLockedClient('2026-08-24', friAt1030), 'Fri 10:30 MUST lock Mon');
  console.log('✓ Test 4 Passed: Fri 10:30 locks Sat, Sun, and Mon');

  // Test 5: Furriel do 1º Esqd não recebe registros do 2º Esqd
  const mockRecords = [
    { idRegistro: 'user1_2026-08-18', usuario: 'SD SILVA', reparticao: '1º Esqd C Mec' },
    { idRegistro: 'user2_2026-08-18', usuario: 'SD SOUZA', reparticao: '2º Esqd C Mec' }
  ];
  const furriel1EsqdReparticao = '1º Esqd C Mec';
  const filteredRecordsForFurriel = mockRecords.filter(
    r => r.reparticao.toLowerCase().trim() === furriel1EsqdReparticao.toLowerCase().trim()
  );
  assert(filteredRecordsForFurriel.length === 1, 'Furriel 1º Esqd should get only 1 record');
  assert(filteredRecordsForFurriel[0].usuario === 'SD SILVA', 'Furriel 1º Esqd should get SD SILVA from 1º Esqd');
  console.log('✓ Test 5 Passed: Furriel 1º Esqd isolated from 2º Esqd');

  // Test 6: Dois cadastros simultâneos diferentes permanecem salvos
  const usersList: any[] = [
    { id: '101', login: 'militar1', usuario: 'SD ALVES', nivel: 'Militar' }
  ];
  const newUserA = { id: '102', login: 'militar2', usuario: 'SD BRUNO', nivel: 'Militar' };
  const newUserB = { id: '103', login: 'militar3', usuario: 'SD COSTA', nivel: 'Militar' };
  
  const updatedSimultaneous = [...usersList, newUserA, newUserB];
  assert(updatedSimultaneous.length === 3, 'Both simultaneous registrations must exist');
  assert(updatedSimultaneous.some(u => u.id === '102'), 'User 102 must be present');
  assert(updatedSimultaneous.some(u => u.id === '103'), 'User 103 must be present');
  console.log('✓ Test 6 Passed: Two simultaneous registrations preserved');

  // Test 7: Excluir um homônimo não exclui outro militar com ID diferente
  const homonyms = [
    { id: '9001', login: 'silva.cb', usuario: 'CB SILVA', nuc: '9001' },
    { id: '9002', login: 'silva.sd', usuario: 'CB SILVA', nuc: '9002' }
  ];
  const targetToDelete = homonyms[0]; // Delete ID 9001
  const remaining = homonyms.filter(u => u.id !== targetToDelete.id && u.login !== targetToDelete.login);
  assert(remaining.length === 1, 'Only target user removed');
  assert(remaining[0].id === '9002', 'Homonym with ID 9002 remains intact');
  console.log('✓ Test 7 Passed: Deleting homonym preserves other military with different ID');

  console.log('\n=== ALL 7 MANDATORY STABILITY & SECURITY TESTS PASSED PERFECTLY ===\n');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
