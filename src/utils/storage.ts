import { FirebaseUser, ArranchamentoRecord, UserNivel } from '../types';

const USERS_KEY = 'arrancha_users_v2';
const RECORDS_KEY = 'arrancha_records_v2';

const INITIAL_USERS: FirebaseUser[] = [
  {
    id: 'marcos_simas',
    usuario: 'Marcos Simas',
    reparticao: 'Esqd Cmdo Apoio',
    senha: '123',
    nivel: 'Administrador',
    graduacao: '1º Ten'
  },
  {
    id: 'carlos_silva',
    usuario: 'Carlos Silva',
    reparticao: '1º Esqd',
    senha: '123',
    nivel: 'Furriel',
    graduacao: 'Cb'
  },
  {
    id: 'sd_gomes',
    usuario: 'Sd Gomes',
    reparticao: '2º Esqd',
    senha: '123',
    nivel: 'Militar',
    graduacao: 'Sd'
  },
  {
    id: 'sd_santos',
    usuario: 'Sd Santos',
    reparticao: 'Fanfarra',
    senha: '123',
    nivel: 'Militar',
    graduacao: 'Sd'
  }
];

// Helper to get dates
export const getTodayDateStr = (): string => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

export const getTomorrowDateStr = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

export const getDayAfterTomorrowDateStr = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split('T')[0];
};

export const getNextSevenDays = (): { label: string; dateStr: string; weekday: string }[] => {
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const result = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    
    let label = '';
    if (i === 0) label = 'Hoje';
    else if (i === 1) label = 'Amanhã';
    else {
      label = d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'numeric' });
    }
    
    result.push({
      label,
      dateStr,
      weekday: weekdays[d.getDay()]
    });
  }
  return result;
};

export const isDateLocked = (targetDateStr: string, currentTime: Date = new Date()): boolean => {
  const [year, month, day] = targetDateStr.split('-').map(Number);
  
  // O prazo limite para se arranchar para o dia D é até às 15:30 do dia anterior (D-1)
  const deadline = new Date(year, month - 1, day);
  deadline.setDate(deadline.getDate() - 1); // Dia anterior
  deadline.setHours(15, 30, 0, 0); // 15:30:00.000
  
  return currentTime.getTime() > deadline.getTime();
};

// Generate initial mock arranchamentos for today and tomorrow to populate statistics beautifully
const getInitialRecords = (): ArranchamentoRecord[] => {
  const today = getTodayDateStr();
  const tomorrow = getTomorrowDateStr();
  const dayAfter = getDayAfterTomorrowDateStr();
  
  return [
    {
      idRegistro: 'marcos_simas_' + today,
      usuario: 'Marcos Simas',
      reparticao: 'Oficiais',
      dataRegistro: today,
      cafe: true,
      almoco: true,
      jantar: true
    },
    {
      idRegistro: 'carlos_silva_' + today,
      usuario: 'Carlos Silva',
      reparticao: 'St/Sgt',
      dataRegistro: today,
      cafe: true,
      almoco: true,
      jantar: false
    },
    {
      idRegistro: 'sd_gomes_' + today,
      usuario: 'Sd Gomes',
      reparticao: '2º Esqd',
      dataRegistro: today,
      cafe: false,
      almoco: true,
      jantar: true
    },
    {
      idRegistro: 'marcos_simas_' + tomorrow,
      usuario: 'Marcos Simas',
      reparticao: 'Oficiais',
      dataRegistro: tomorrow,
      cafe: true,
      almoco: true,
      jantar: false
    },
    {
      idRegistro: 'sd_santos_' + tomorrow,
      usuario: 'Sd Santos',
      reparticao: 'Fanfarra',
      dataRegistro: tomorrow,
      cafe: true,
      almoco: true,
      jantar: true
    }
  ];
};

export const loadUsers = (): FirebaseUser[] => {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) {
    localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  const loaded: FirebaseUser[] = JSON.parse(raw);
  let changed = false;
  const verified = loaded.map(u => {
    if (!u.graduacao) {
      changed = true;
      let inferred = 'Sd';
      const nameLower = u.usuario.toLowerCase();
      if (nameLower.startsWith('sd ')) inferred = 'Sd';
      else if (nameLower.startsWith('cb ')) inferred = 'Cb';
      else if (nameLower.startsWith('sgt ') || nameLower.startsWith('3º sgt') || nameLower.startsWith('2º sgt') || nameLower.startsWith('1º sgt')) inferred = '3º Sgt';
      else if (nameLower.startsWith('ten ') || nameLower.startsWith('1º ten') || nameLower.startsWith('2º ten')) inferred = '1º Ten';
      else if (u.nivel === 'Administrador') inferred = '1º Ten';
      else if (u.nivel === 'Furriel') inferred = 'Cb';
      return { ...u, graduacao: inferred };
    }
    return u;
  });
  if (changed) {
    localStorage.setItem(USERS_KEY, JSON.stringify(verified));
  }
  return verified;
};

export const saveUsersList = (users: FirebaseUser[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const loadRecords = (): ArranchamentoRecord[] => {
  const raw = localStorage.getItem(RECORDS_KEY);
  if (!raw) {
    const initial = getInitialRecords();
    localStorage.setItem(RECORDS_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(raw);
};

export const saveRecordsList = (records: ArranchamentoRecord[]): void => {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
};

export const cleanTextId = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .trim();
};
