import { FirebaseUser, ArranchamentoRecord, UserNivel } from '../types';

import { INITIAL_USERS } from '../data/mockData';
export { INITIAL_USERS };

const USERS_KEY = 'arrancha_users_v6';
const RECORDS_KEY = 'arrancha_records_v3';

export const generateUniqueUserId = (users: FirebaseUser[] = []): string => {
  let id = '';
  const existingIds = new Set((users || []).map(u => u?.id));
  do {
    id = Math.floor(10000000 + Math.random() * 90000000).toString();
  } while (existingIds.has(id));
  return id;
};

// Helper to format local Date as YYYY-MM-DD (avoiding UTC timezone shift)
export const formatDateToYYYYMMDD = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayDateStr = (): string => {
  return formatDateToYYYYMMDD(getAuthoritativeNow());
};

export const getTomorrowDateStr = (): string => {
  const d = getAuthoritativeNow();
  d.setDate(d.getDate() + 1);
  return formatDateToYYYYMMDD(d);
};

export const getDayAfterTomorrowDateStr = (): string => {
  const d = getAuthoritativeNow();
  d.setDate(d.getDate() + 2);
  return formatDateToYYYYMMDD(d);
};

export const getNextSevenDays = (offsetWeeks: number = 0): { label: string; dateStr: string; weekday: string }[] => {
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const result = [];
  const baseDate = getAuthoritativeNow();
  baseDate.setDate(baseDate.getDate() + (offsetWeeks * 7));

  for (let i = 1; i <= 7; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    const dateStr = formatDateToYYYYMMDD(d);
    
    let label = '';
    const now = getAuthoritativeNow();
    const todayStr = formatDateToYYYYMMDD(now);
    const tomorrowDate = new Date(now);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStr = formatDateToYYYYMMDD(tomorrowDate);

    if (dateStr === todayStr) label = 'Hoje';
    else if (dateStr === tomorrowStr) label = 'Amanhã';
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

export const isDateLocked = (targetDateStr: string, suppliedTime?: Date): boolean => {
  const currentTime = suppliedTime || getAuthoritativeNow();
  const [year, month, day] = targetDateStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  targetDate.setHours(0, 0, 0, 0);

  const today = new Date(currentTime);
  today.setHours(0, 0, 0, 0);

  // 1. Data passada ou o próprio dia atual é travado para alteração de arranchamento
  if (targetDate.getTime() <= today.getTime()) {
    return true;
  }

  const targetDayOfWeek = targetDate.getDay(); // 0 = Dom, 1 = Seg, 2 = Ter, 3 = Qua, 4 = Qui, 5 = Sex, 6 = Sáb

  // 2. Se a data alvo for Sábado (6), Domingo (0) ou Segunda-feira (1):
  // O prazo estrito é Sexta-feira às 10:30h!
  if (targetDayOfWeek === 6 || targetDayOfWeek === 0 || targetDayOfWeek === 1) {
    const deadlineFriday = new Date(targetDate);
    if (targetDayOfWeek === 6) deadlineFriday.setDate(deadlineFriday.getDate() - 1);
    else if (targetDayOfWeek === 0) deadlineFriday.setDate(deadlineFriday.getDate() - 2);
    else if (targetDayOfWeek === 1) deadlineFriday.setDate(deadlineFriday.getDate() - 3);
    deadlineFriday.setHours(10, 30, 0, 0);

    if (currentTime.getTime() >= deadlineFriday.getTime()) {
      return true;
    }
  }

  // 3. Para terça, quarta, quinta e sexta, o prazo é o dia anterior às 15:30h.
  // O prazo estrito é o dia anterior às 15:30h!
  if (targetDayOfWeek >= 3 && targetDayOfWeek <= 5) {
    const deadline = new Date(targetDate);
    deadline.setDate(deadline.getDate() - 1);
    deadline.setHours(15, 30, 0, 0);

    if (currentTime.getTime() >= deadline.getTime()) {
      return true;
    }
  }

  return false;
};

function getAuthoritativeNow(): Date {
  const offset = typeof window !== 'undefined'
    ? Number((window as any).__ARRANCHA_SERVER_OFFSET_MS__ || 0)
    : 0;
  return new Date(Date.now() + offset);
}

// Generate initial mock arranchamentos for today and tomorrow to populate statistics beautifully
const getInitialRecords = (): ArranchamentoRecord[] => {
  return [];
};

export const getMilitarGroupFromGraduacao = (
  graduacao?: string,
  reparticao?: string,
  grupoFallback?: string
): 'Oficiais' | 'St/Sgt' | 'Cb/Sd' => {
  const normGrad = (graduacao || '').toLowerCase().trim();

  // 1. Check graduacao string explicitly
  if (
    normGrad.includes('cel') ||
    normGrad.includes('maj') ||
    normGrad.includes('cap') ||
    normGrad.includes('ten') ||
    normGrad.includes('asp') ||
    normGrad.includes('ofic')
  ) {
    if (
      !normGrad.includes('1º sgt') &&
      !normGrad.includes('2º sgt') &&
      !normGrad.includes('3º sgt') &&
      !normGrad.includes('sgt') &&
      !normGrad.includes('subten')
    ) {
      return 'Oficiais';
    }
  }

  if (
    normGrad.includes('subten') ||
    normGrad.includes('st') ||
    normGrad.includes('sgt') ||
    normGrad.includes('sargento')
  ) {
    return 'St/Sgt';
  }

  if (
    normGrad.includes('cb') ||
    normGrad.includes('cabo') ||
    normGrad.includes('sd') ||
    normGrad.includes('soldado') ||
    normGrad.includes('taifeiro') ||
    normGrad.includes('s1') ||
    normGrad.includes('s2')
  ) {
    return 'Cb/Sd';
  }

  const oficiaisRanks = ['Cel', 'Ten Cel', 'Maj', 'Cap', '1º Ten', '2º Ten', 'Asp', 'Tenente', 'Capitão', 'Major', 'Coronel'];
  const stsgtRanks = ['Subten', '1º Sgt', '2º Sgt', '3º Sgt', 'Sgt', 'St', 'Subtenente', 'Sargento'];
  const cbsdRanks = ['Cb', 'Sd', 'Cabo', 'Soldado'];

  const cleanGrad = (graduacao || '').trim();
  if (oficiaisRanks.includes(cleanGrad)) return 'Oficiais';
  if (stsgtRanks.includes(cleanGrad)) return 'St/Sgt';
  if (cbsdRanks.includes(cleanGrad)) return 'Cb/Sd';

  const normRep = (reparticao || '').trim();
  if (normRep === 'Oficiais') return 'Oficiais';
  if (normRep === 'St/Sgt') return 'St/Sgt';

  if (grupoFallback === 'Oficiais' || grupoFallback === 'St/Sgt' || grupoFallback === 'Cb/Sd') {
    return grupoFallback;
  }

  return 'Cb/Sd';
};

export const isSameUser = (u1: FirebaseUser, u2: FirebaseUser): boolean => {
  if (!u1 || !u2) return false;
  
  // Primary comparison: exact ID match
  if (u1.id && u2.id && u1.id === u2.id) return true;

  // Cleaned ID match
  const id1 = cleanTextId(u1.id || '');
  const id2 = cleanTextId(u2.id || '');
  if (id1 && id2 && id1 === id2) return true;

  // Cleaned Login match
  const login1 = u1.login ? cleanTextId(u1.login) : '';
  const login2 = u2.login ? cleanTextId(u2.login) : '';
  if (login1 && login2 && login1 === login2) return true;

  // If both have distinct IDs/logins, they are DIFFERENT military members even if they share war names
  return false;
};

export const deduplicateUsersList = (users: FirebaseUser[]): FirebaseUser[] => {
  const result: FirebaseUser[] = [];
  (users || []).forEach(u => {
    if (!u) return;
    const existingIdx = result.findIndex(existing => isSameUser(existing, u));
    if (existingIdx >= 0) {
      const existing = result[existingIdx];
      // Preserve elevated role ('Furriel' or 'Administrador') if incoming object is default 'Militar' or un-updated
      let finalNivel = u.nivel;
      if ((!finalNivel || finalNivel === 'Militar') && (existing.nivel === 'Furriel' || existing.nivel === 'Administrador')) {
        finalNivel = existing.nivel;
      }
      result[existingIdx] = { ...existing, ...u, nivel: finalNivel || 'Militar' };
    } else {
      result.push(u);
    }
  });
  return result;
};

export const loadUsers = (): FirebaseUser[] => {
  try {
    ['arrancha_users', 'arrancha_users_v1', 'arrancha_users_v2', 'arrancha_users_v3', 'arrancha_users_v4', 'arrancha_users_v5'].forEach(k => {
      localStorage.removeItem(k);
    });
    localStorage.removeItem('arrancha_deleted_users_v3');
  } catch (e) {
    // Ignore storage errors in non-browser env
  }

  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) {
    localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  const loaded: FirebaseUser[] = JSON.parse(raw);
  let changed = false;
  const verified = loaded.map(u => {
    let updated = { ...u };
    
    // Ensure NUC exists (Número Único de Cadastro)
    if (!updated.nuc) {
      changed = true;
      updated.nuc = updated.id || Math.floor(10000000 + Math.random() * 90000000).toString();
    }
    
    // Inferred rank if missing
    if (!updated.graduacao) {
      changed = true;
      let inferred = 'Sd';
      const nameLower = updated.usuario.toLowerCase();
      if (nameLower.startsWith('sd ')) inferred = 'Sd';
      else if (nameLower.startsWith('cb ')) inferred = 'Cb';
      else if (nameLower.startsWith('sgt ') || nameLower.startsWith('3º sgt') || nameLower.startsWith('2º sgt') || nameLower.startsWith('1º sgt')) inferred = '3º Sgt';
      else if (nameLower.startsWith('ten ') || nameLower.startsWith('1º ten') || nameLower.startsWith('2º ten')) inferred = '1º Ten';
      else if (updated.nivel === 'Administrador') inferred = '1º Ten';
      else if (updated.nivel === 'Furriel') inferred = 'Cb';
      updated.graduacao = inferred;
    }

    // Ensure grupo is strictly calculated by rank (graduação)
    const correctGrupo = getMilitarGroupFromGraduacao(updated.graduacao, updated.reparticao, updated.grupo);
    if (updated.grupo !== correctGrupo) {
      changed = true;
      updated.grupo = correctGrupo;
    }

    // Normalize reparticao (represent esquadrao now)
    const currentRep = (updated.reparticao || '').trim();
    const norm = normalizeReparticao(currentRep);
    if (norm === '1º esqd c mec') updated.reparticao = '1º Esqd C Mec';
    else if (norm === '2º esqd c mec') updated.reparticao = '2º Esqd C Mec';
    else if (norm === '3º esqd c mec') updated.reparticao = '3º Esqd C Mec';
    else if (norm === 'esqd cap') updated.reparticao = 'Esqd Cap';
    else if (norm === 'fanfarra') updated.reparticao = 'Fanfarra';
    else if (norm === 'visitantes') updated.reparticao = 'Visitantes';
    else if (currentRep === 'Oficiais' || currentRep === 'St/Sgt') updated.reparticao = 'Esqd Cap';
    else updated.reparticao = currentRep || 'Esqd Cap';

    return updated;
  });

  const cleanUsers = deduplicateUsersList(verified);
  if (changed || cleanUsers.length !== loaded.length) {
    localStorage.setItem(USERS_KEY, JSON.stringify(cleanUsers));
  }
  return cleanUsers;
};

export const saveUsersList = (users: FirebaseUser[]): void => {
  const cleanUsers = deduplicateUsersList(users);
  localStorage.setItem(USERS_KEY, JSON.stringify(cleanUsers));
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

export const extractUserPrefixFromIdRegistro = (idRegistro?: string): string => {
  if (!idRegistro) return '';
  const match = idRegistro.match(/^(.*)_\d{4}-\d{2}-\d{2}$/);
  if (match) return match[1];
  return idRegistro.split('_')[0];
};

export const cleanTextId = (text: string): string => {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[º°]/g, '')
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .trim();
};

export const normalizeReparticao = (rep?: string): string => {
  const norm = (rep || '').toLowerCase().replace(/°/g, 'º').trim();
  if (norm.includes('1º esqd') || norm.includes('1 esqd') || norm.includes('1ºesqd')) return '1º esqd c mec';
  if (norm.includes('2º esqd') || norm.includes('2 esqd') || norm.includes('2ºesqd')) return '2º esqd c mec';
  if (norm.includes('3º esqd') || norm.includes('3 esqd') || norm.includes('3ºesqd')) return '3º esqd c mec';
  if (norm.includes('cap')) return 'esqd cap';
  if (norm.includes('fanf')) return 'fanfarra';
  if (norm.includes('visit')) return 'visitantes';
  return norm;
};

export const formatMilitaryName = (usuario: string, graduacao?: string): string => {
  if (!usuario) return '';
  if (!graduacao || graduacao === 'Todas' || graduacao === 'Todos') return usuario;
  const normalizedUser = usuario.toLowerCase().trim();
  const normalizedGrad = graduacao.toLowerCase().trim();
  if (normalizedUser.startsWith(normalizedGrad)) {
    return usuario;
  }
  return `${graduacao} ${usuario}`;
};

export const isMealForUser = (m: ArranchamentoRecord, u: FirebaseUser, date?: string): boolean => {
  if (!m || !u) return false;
  if (date && m.dataRegistro !== date) return false;

  const cleanUId = cleanTextId(u.id || '');
  const cleanULogin = u.login ? cleanTextId(u.login) : '';
  const cleanUName = cleanTextId(u.usuario || '');

  // 1. Direct idRegistro check using robust prefix extraction
  if (m.idRegistro) {
    const recPrefix = extractUserPrefixFromIdRegistro(m.idRegistro);
    if (cleanUId && (recPrefix === cleanUId || recPrefix.replace(/_/g, '') === cleanUId.replace(/_/g, ''))) return true;
    if (cleanULogin && (recPrefix === cleanULogin || recPrefix.replace(/_/g, '') === cleanULogin.replace(/_/g, ''))) return true;

    // Disambiguate if recPrefix points to a specific distinct user ID/login
    if (recPrefix &&
        recPrefix !== cleanUName && recPrefix !== cleanUId && recPrefix !== cleanULogin &&
        recPrefix.replace(/_/g, '') !== cleanUName.replace(/_/g, '') &&
        recPrefix.replace(/_/g, '') !== cleanUId.replace(/_/g, '') &&
        recPrefix.replace(/_/g, '') !== cleanULogin.replace(/_/g, '')) {
      return false;
    }
  }

  // 2. Check usuario name
  const cleanMName = cleanTextId(m.usuario || '');
  if (cleanMName === cleanUName || (cleanMName && cleanUName && (cleanMName.includes(cleanUName) || cleanUName.includes(cleanMName)))) {
    // If record specifies reparticao, check if it matches
    if (m.reparticao && u.reparticao && normalizeReparticao(m.reparticao) !== normalizeReparticao(u.reparticao)) {
      return false;
    }

    // Disambiguation for duplicate Guerra names (e.g. 3º Sgt Farias vs Cb Farias)
    const recPrefix = extractUserPrefixFromIdRegistro(m.idRegistro);
    if (cleanUId === 'lfarias' && recPrefix === 'farias') return false;
    if (cleanUId === 'farias' && recPrefix === 'lfarias') return false;

    return true;
  }

  return false;
};
