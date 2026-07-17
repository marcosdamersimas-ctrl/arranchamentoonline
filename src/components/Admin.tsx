import React, { useState } from 'react';
import { FirebaseUser, UserNivel } from '../types';
import { Users, UserPlus, Trash2, Award, Lock, Shield, User, Building, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cleanTextId } from '../utils/storage';

interface AdminProps {
  user: FirebaseUser;
  users: FirebaseUser[];
  onUpdateUser: (userId: string, updatedFields: Partial<FirebaseUser>) => void;
  onDeleteUser: (userId: string) => void;
  onAddUserByAdmin: (newUser: FirebaseUser) => void;
}

const REPARTICOES = [
  'Oficiais',
  'St/Sgt',
  '1º Esqd',
  '2º Esqd',
  '3º Esqd',
  'Esqd Cap',
  'Fanfarra'
];

const GRADUACOES = [
  'Cel',
  'Ten Cel',
  'Maj',
  'Cap',
  '1º Ten',
  '2º Ten',
  'Asp',
  'Subten',
  '1º Sgt',
  '2º Sgt',
  '3º Sgt',
  'Cb',
  'Sd'
];

const NIVEIS: UserNivel[] = ['Militar', 'Furriel', 'Administrador'];

export default function Admin({ user, users, onUpdateUser, onDeleteUser, onAddUserByAdmin }: AdminProps) {
  
  // Create user manual dialog state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUsuario, setNewUsuario] = useState('');
  const [newReparticao, setNewReparticao] = useState(REPARTICOES[0]);
  const [newSenha, setNewSenha] = useState('123');
  const [newNivel, setNewNivel] = useState<UserNivel>('Militar');
  const [newGraduacao, setNewGraduacao] = useState('Sd');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEsquadraoFilter, setSelectedEsquadraoFilter] = useState('Todos');
  const [selectedGraduacaoFilter, setSelectedGraduacaoFilter] = useState('Todas');

  // Selected user state for single-row management
  const [selectedUserId, setSelectedUserId] = useState<string>(user.id);

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!newUsuario.trim() || !newSenha.trim()) {
      setFormError('Por favor, preencha todos os campos.');
      return;
    }

    const normalizedId = cleanTextId(newUsuario);
    if (users.some(u => cleanTextId(u.usuario) === normalizedId)) {
      setFormError('Já existe um militar cadastrado com este nome de guerra.');
      return;
    }

    if (newNivel === 'Furriel' && (newReparticao === 'Oficiais' || newReparticao === 'St/Sgt')) {
      setFormError('Os furriéis devem ser cadastrados por esquadrão. Oficiais e sargentos não precisam de furriel.');
      return;
    }

    const newUser: FirebaseUser = {
      id: normalizedId,
      usuario: newUsuario.trim(),
      reparticao: newReparticao,
      senha: newSenha,
      nivel: newNivel,
      graduacao: newGraduacao
    };

    onAddUserByAdmin(newUser);
    setFormSuccess('Militar inserido e ativado com sucesso no sistema!');
    
    // Clear
    setNewUsuario('');
    setNewSenha('123');
    setNewGraduacao('Sd');
    setTimeout(() => {
      setShowAddForm(false);
      setFormSuccess('');
    }, 1500);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
  };

  const handleEsquadraoFilterChange = (val: string) => {
    setSelectedEsquadraoFilter(val);
  };

  const handleGraduacaoFilterChange = (val: string) => {
    setSelectedGraduacaoFilter(val);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.usuario.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEsquadrao = selectedEsquadraoFilter === 'Todos' || u.reparticao === selectedEsquadraoFilter;
    const matchesGraduacao = selectedGraduacaoFilter === 'Todas' || u.graduacao === selectedGraduacaoFilter;
    return matchesSearch && matchesEsquadrao && matchesGraduacao;
  });

  const totalItems = filteredUsers.length;

  const currentSelectedUser = filteredUsers.find(u => u.id === selectedUserId) 
    || filteredUsers[0] 
    || users.find(u => u.id === selectedUserId) 
    || users.find(u => u.id === user.id) 
    || users[0];

  return (
    <div className="space-y-6 font-sans text-grafite" id="admin-panel">
      
      {/* Header Panel */}
      <div className="bg-white p-6 border border-gray-200/60 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-display font-black text-vinho uppercase tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-vinho animate-pulse shrink-0" />
            Central de Administração
          </h3>
          <p className="text-xs text-gray-500 font-semibold mt-1">
            Controle total de permissões, inserção física de novos usuários e auditoria de credenciais.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError('');
            setFormSuccess('');
            setShowAddForm(!showAddForm);
          }}
          className="w-full sm:w-auto bg-vinho hover:bg-vinho-escuro text-white font-display font-bold py-3 px-5 rounded-2xl text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-transparent hover:border-ouro shadow-md shadow-vinho/10 transition-all"
          id="btn-manual-add"
        >
          <UserPlus className="w-4 h-4 text-ouro" />
          <span>Cadastrar Militar Manual</span>
        </button>
      </div>

      {/* Manual Creation Form Dropdown */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm overflow-hidden"
          >
            <h4 className="text-xs font-display font-black text-vinho uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-ouro" />
              Inserir Militar Manualmente no Banco de Dados
            </h4>
            
            {formError && (
              <p className="text-xs text-red-800 bg-red-50 border border-red-200 rounded-xl p-3 mb-4 font-semibold">{formError}</p>
            )}

            {formSuccess && (
              <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 font-semibold">{formSuccess}</p>
            )}

            <form onSubmit={handleManualAdd} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1"><Award className="w-3 h-3 text-vinho" />Graduação</label>
                <select
                  value={newGraduacao}
                  onChange={e => setNewGraduacao(e.target.value)}
                  className="w-full bg-[#F9F9F9] border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-grafite focus:outline-none focus:border-vinho cursor-pointer font-semibold"
                >
                  {GRADUACOES.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1"><User className="w-3 h-3 text-vinho" />Nome de Guerra</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ten Simas"
                  value={newUsuario}
                  onChange={e => setNewUsuario(e.target.value)}
                  className="w-full bg-[#F9F9F9] border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-grafite placeholder-gray-400 focus:outline-none focus:border-vinho font-semibold"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1"><Building className="w-3 h-3 text-vinho" />Subdivisão / Seção</label>
                <select
                  value={newReparticao}
                  onChange={e => setNewReparticao(e.target.value)}
                  className="w-full bg-[#F9F9F9] border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-grafite focus:outline-none focus:border-vinho cursor-pointer font-semibold"
                >
                  {REPARTICOES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1"><Lock className="w-3 h-3 text-vinho" />Senha Inicial</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 123"
                  value={newSenha}
                  onChange={e => setNewSenha(e.target.value)}
                  className="w-full bg-[#F9F9F9] border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-grafite focus:outline-none focus:border-vinho font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1"><Shield className="w-3 h-3 text-vinho" />Nível Acesso</label>
                <select
                  value={newNivel}
                  onChange={e => setNewNivel(e.target.value as UserNivel)}
                  className="w-full bg-[#F9F9F9] border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-grafite focus:outline-none focus:border-vinho cursor-pointer font-semibold"
                >
                  {NIVEIS.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-12 flex justify-end mt-2">
                <button
                  type="submit"
                  className="bg-vinho hover:bg-vinho-escuro text-white text-xs font-display font-bold py-2.5 px-6 rounded-xl cursor-pointer shadow-sm transition-all text-center"
                >
                  Gravar Registro
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Directory of registered personnel */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4" id="directory-panel">
        
        {/* Filter controls panel */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-gray-50/50 p-4 border border-gray-150 rounded-2xl">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-vinho" />
            <h4 className="text-xs font-display font-black text-vinho uppercase tracking-wider">
              Filtros de Gerenciamento ({totalItems} militares)
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 grow max-w-4xl">
            {/* Esquadrão filter */}
            <div className="relative">
              <select
                value={selectedEsquadraoFilter}
                onChange={e => handleEsquadraoFilterChange(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-grafite focus:outline-none focus:border-vinho cursor-pointer font-semibold"
              >
                <option value="Todos">Todos os Esquadrões</option>
                {REPARTICOES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Graduação filter */}
            <div className="relative">
              <select
                value={selectedGraduacaoFilter}
                onChange={e => handleGraduacaoFilterChange(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-grafite focus:outline-none focus:border-vinho cursor-pointer font-semibold"
              >
                <option value="Todas">Todas as Graduações</option>
                {GRADUACOES.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Search box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-grafite placeholder-gray-400 focus:outline-none focus:border-vinho font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Directory Table exactly matching user layout specifications */}
        <div className="overflow-x-auto border border-gray-200 rounded-2xl bg-white shadow-inner" id="accounts-table-container">
          <table className="w-full border-collapse text-left text-xs text-grafite">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-display font-black uppercase tracking-wider text-[10px]">
                <th className="px-5 py-4 w-[25%]">Seleção do Esqd</th>
                <th className="px-5 py-4 w-[20%]">Graduação</th>
                <th className="px-5 py-4 w-[25%]">Nome de Guerra</th>
                <th className="px-5 py-4 w-[20%]">Nível de Acesso</th>
                <th className="px-5 py-4 text-right w-[10%]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
              {!currentSelectedUser ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-400 font-bold">
                    Nenhum militar localizado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                (() => {
                  const u = currentSelectedUser;
                  const isOwnAccount = u.id === cleanTextId(user.usuario);
                  return (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-all">
                      
                      {/* Column 1: Seleção do Esqd */}
                      <td className="px-5 py-3">
                        <select
                          value={u.reparticao}
                          onChange={e => onUpdateUser(u.id, { reparticao: e.target.value })}
                          className="bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-grafite font-semibold focus:outline-none focus:border-vinho cursor-pointer w-full max-w-[180px] shadow-sm hover:border-gray-300 transition-all"
                        >
                          {REPARTICOES.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </td>

                      {/* Column 2: Graduação do Militar */}
                      <td className="px-5 py-3">
                        <select
                          value={u.graduacao || 'Sd'}
                          onChange={e => onUpdateUser(u.id, { graduacao: e.target.value })}
                          className="bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-grafite font-semibold focus:outline-none focus:border-vinho cursor-pointer w-full max-w-[120px] shadow-sm hover:border-gray-300 transition-all"
                        >
                          {GRADUACOES.map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </td>

                      {/* Column 3: Nome do Militar (Seletor com todos os militares cadastrados) */}
                      <td className="px-5 py-3">
                        <div className="flex flex-col max-w-[200px]">
                          <select
                            value={u.id}
                            onChange={e => {
                              setSelectedUserId(e.target.value);
                            }}
                            className="bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-vinho font-bold focus:outline-none focus:border-vinho cursor-pointer w-full max-w-[200px] shadow-sm hover:border-gray-300 transition-all"
                          >
                            {users.map(usr => (
                              <option key={usr.id} value={usr.id}>
                                {usr.usuario}
                              </option>
                            ))}
                          </select>
                          <span className="text-[9px] text-gray-400 font-mono px-2 mt-1">Senha Física: {u.senha}</span>
                        </div>
                      </td>

                      {/* Column 4: Nível de Acesso */}
                      <td className="px-5 py-3">
                        <select
                          value={u.nivel}
                          onChange={e => onUpdateUser(u.id, { nivel: e.target.value as UserNivel })}
                          className={`text-[10px] font-extrabold uppercase border border-gray-250 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer shadow-sm transition-all ${
                            u.nivel === 'Administrador' 
                              ? 'text-vinho bg-red-50 border-red-200/60' 
                              : u.nivel === 'Furriel'
                              ? 'text-amber-700 bg-amber-50 border-amber-200/60'
                              : 'text-gray-600 bg-gray-50 border-gray-200/60'
                          }`}
                        >
                          {NIVEIS.map(lvl => (
                            <option key={lvl} value={lvl}>{lvl}</option>
                          ))}
                        </select>
                      </td>

                      {/* Column 5: Ações */}
                      <td className="px-5 py-3 text-right">
                        {isOwnAccount ? (
                          <span className="text-[9px] font-bold text-gray-400 italic">Minha Conta</span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                const newPass = prompt(`Defina a nova senha para ${u.usuario}:`, u.senha);
                                if (newPass !== null && newPass.trim() !== '') {
                                  onUpdateUser(u.id, { senha: newPass.trim() });
                                }
                              }}
                              className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl border border-gray-200 hover:border-gray-300 transition-all cursor-pointer"
                              title="Redefinir Senha do Militar"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Tem certeza que deseja apagar permanentemente o registro de ${u.usuario} do sistema?`)) {
                                  onDeleteUser(u.id);
                                }
                              }}
                              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all inline-flex items-center justify-center cursor-pointer border border-transparent hover:border-red-200"
                              title="Excluir Conta Permanentemente"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>

                    </tr>
                  );
                })()
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold pt-1">
          <span>Você pode alterar os campos de qualquer militar alterando a caixa seletora correspondente ou selecionando seu nome de guerra.</span>
          <span>Aprovação automática ao criar ou editar.</span>
        </div>
      </div>

    </div>
  );
}
