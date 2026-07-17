export type UserNivel = 'Militar' | 'Furriel' | 'Administrador';

export interface FirebaseUser {
  id: string; // padronizarTexto(usuario)
  usuario: string; // Nome de Guerra
  reparticao: string; // Esquadrão / Subdivisão
  senha: string;
  nivel: UserNivel;
  graduacao?: string; // Graduação / Posto do militar
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
