export type UserNivel = 'Militar' | 'Furriel' | 'Administrador';

export interface FirebaseUser {
  id: string; // ID único do sistema
  nuc?: string; // Número Único de Cadastro (NUC) imutável
  usuario: string; // Nome de Guerra
  reparticao: string; // Esquadrão / Subdivisão
  grupo?: string; // Grupo: 'Oficiais' | 'St/Sgt' | 'Cb/Sd'
  senha: string;
  trocarSenhaNoPrimeiroAcesso?: boolean; // Força a alteração de senha no 1º login
  nivel: UserNivel;
  graduacao?: string; // Graduação / Posto do militar
  login?: string; // Nome de usuário / login para acesso
  tentativasIncorretas?: number; // Contador de tentativas de senha erradas
  bloqueado?: boolean; // Trava de conta bloqueada após 3 erros
  dataBloqueio?: string; // Data e hora do bloqueio
  approved?: boolean; // Decisão do administrador de manter o militar
}

export interface ArranchamentoRecord {
  idRegistro: string; // Key: `${userId}_${date}`
  usuario: string;
  reparticao: string;
  dataRegistro: string; // YYYY-MM-DD
  cafe: boolean;
  almoco: boolean;
  jantar: boolean;
}
