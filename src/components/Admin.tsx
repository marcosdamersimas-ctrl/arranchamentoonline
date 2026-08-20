import React, { useState } from 'react';
import { FirebaseUser, UserNivel } from '../types';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Award, 
  Shield, 
  QrCode, 
  ArrowLeft, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  Copy, 
  Check, 
  User, 
  Building,
  Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cleanTextId, formatMilitaryName, normalizeReparticao, generateUniqueUserId, getMilitarGroupFromGraduacao } from '../utils/storage';

interface AdminProps {
  user: FirebaseUser;
  users: FirebaseUser[];
  onUpdateUser: (userId: string, updatedFields: Partial<FirebaseUser>) => void;
  onDeleteUser: (userId: string) => void;
  onAddUserByAdmin: (newUser: FirebaseUser) => void;
}

const REPARTICOES = [
  '1º Esqd C Mec',
  '2º Esqd C Mec',
  '3º Esqd C Mec',
  'Esqd Cap',
  'Fanfarra',
  'Visitantes'
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

type AdminModule = 'menu' | 'cadastrar' | 'excluir' | 'classificar' | 'funcao' | 'qrcode';

export default function Admin({ user, users, onUpdateUser, onDeleteUser, onAddUserByAdmin }: AdminProps) {
  const [activeModule, setActiveModule] = useState<AdminModule>('menu');

  // 1. Cadastrar Usuário State
  const [newUsuario, setNewUsuario] = useState('');
  const [newLogin, setNewLogin] = useState('');
  const [newNuc, setNewNuc] = useState('');
  const [newReparticao, setNewReparticao] = useState(REPARTICOES[0]);
  const [newGraduacao, setNewGraduacao] = useState('Sd');
  const [newSenha, setNewSenha] = useState('123456');
  const [newNivel, setNewNivel] = useState<UserNivel>('Militar');
  const [addMsg, setAddMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // 2. Excluir Usuário State
  const [deleteSearch, setDeleteSearch] = useState('');
  const [deleteMsg, setDeleteMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // 3. Classificar State (Trocar Esquadrão e Graduação)
  const [classUserId, setClassUserId] = useState('');
  const [classReparticao, setClassReparticao] = useState(REPARTICOES[0]);
  const [classGraduacao, setClassGraduacao] = useState('Sd');
  const [classMsg, setClassMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // 4. Definir Função State (Usuário, Furriel, Admin)
  const [roleUserId, setRoleUserId] = useState('');
  const [roleNivel, setRoleNivel] = useState<UserNivel>('Militar');
  const [roleMsg, setRoleMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // 5. QR Code State
  const siteUrl = window.location.origin;
  const [copied, setCopied] = useState(false);

  // Handlers
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddMsg(null);

    if (!newUsuario.trim()) {
      setAddMsg({ text: 'Por favor, informe o Nome de Guerra.', type: 'error' });
      return;
    }

    const nucFinal = newNuc.trim() || generateUniqueUserId();
    const loginFinal = newLogin.trim() ? cleanTextId(newLogin) : cleanTextId(newUsuario);
    const idFinal = nucFinal;

    // Check duplicate login or NUC
    const duplicate = users.find(u => u.id === idFinal || (u.login && cleanTextId(u.login) === loginFinal));
    if (duplicate) {
      setAddMsg({ text: `Já existe um militar com este NUC (${nucFinal}) ou login (${loginFinal}).`, type: 'error' });
      return;
    }

    const grupoCalculado = getMilitarGroupFromGraduacao(newGraduacao, newReparticao);

    const newUserObj: FirebaseUser = {
      id: idFinal,
      nuc: nucFinal,
      login: loginFinal,
      usuario: newUsuario.trim().toUpperCase(),
      reparticao: newReparticao,
      graduacao: newGraduacao,
      grupo: grupoCalculado,
      senha: newSenha || '123456',
      nivel: newNivel,
      tentativasIncorretas: 0,
      bloqueado: false,
      trocarSenhaNoPrimeiroAcesso: true,
      approved: true
    };

    onAddUserByAdmin(newUserObj);
    setAddMsg({ text: `Militar ${newUserObj.usuario} cadastrado com sucesso! (NUC: ${nucFinal})`, type: 'success' });
    
    // Reset form
    setNewUsuario('');
    setNewLogin('');
    setNewNuc('');
    setNewSenha('123456');
  };

  const handleDeleteUser = (u: FirebaseUser) => {
    if (u.nivel === 'Administrador' && users.filter(item => item.nivel === 'Administrador').length <= 1) {
      alert('O sistema precisa manter pelo menos um Administrador. Promova outro usuário antes de excluir este acesso.');
      return;
    }

    if (confirm(`Tem certeza que deseja apagar permanentemente o militar ${u.usuario} (${u.reparticao}) da base de dados?`)) {
      onDeleteUser(u.id);
      setDeleteMsg({ text: `Militar ${u.usuario} excluído com sucesso da base de dados!`, type: 'success' });
      setTimeout(() => setDeleteMsg(null), 3000);
    }
  };

  const handleClassifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClassMsg(null);
    if (!classUserId) {
      setClassMsg({ text: 'Selecione um militar para alterar.', type: 'error' });
      return;
    }

    const grupo = getMilitarGroupFromGraduacao(classGraduacao, classReparticao);
    onUpdateUser(classUserId, {
      reparticao: classReparticao,
      graduacao: classGraduacao,
      grupo
    });

    const target = users.find(u => u.id === classUserId);
    setClassMsg({ text: `Esquadrão e Graduação de ${target?.usuario || 'Militar'} atualizados com sucesso!`, type: 'success' });
  };

  const handleRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRoleMsg(null);
    if (!roleUserId) {
      setRoleMsg({ text: 'Selecione um militar para alterar a função.', type: 'error' });
      return;
    }

    const target = users.find(u => u.id === roleUserId);
    if (target?.nivel === 'Administrador' && roleNivel !== 'Administrador' && users.filter(item => item.nivel === 'Administrador').length <= 1) {
      setRoleMsg({ text: 'O sistema precisa manter pelo menos um Administrador.', type: 'error' });
      return;
    }

    onUpdateUser(roleUserId, { nivel: roleNivel });
    setRoleMsg({ text: `Função de ${target?.usuario || 'Militar'} alterada para ${roleNivel.toUpperCase()}!`, type: 'success' });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(siteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintQRCode = () => {
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=7a0c0c&data=${encodeURIComponent(siteUrl)}`;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>QR Code de Acesso - 7º RC Mec</title>
  <style>
    body { font-family: sans-serif; text-align: center; padding: 40px; }
    .card { border: 3px solid #7a0c0c; border-radius: 20px; padding: 30px; display: inline-block; }
    h1 { color: #7a0c0c; margin-bottom: 5px; }
    h2 { color: #555; font-size: 16px; margin-bottom: 25px; }
    img { width: 250px; height: 250px; }
    p { color: #888; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>7º REGIMENTO DE CAVALARIA MECANIZADO</h1>
    <h2>ARRANCHA+ — ACESSO RÁPIDO</h2>
    <img src="${qrImageUrl}" alt="QR Code Acesso" />
    <p>Aponte a câmera do seu celular para acessar o site de Arranchamento.</p>
  </div>
  <script>window.print();</script>
</body>
</html>
    `);
    printWindow.document.close();
  };

  // Filtered users for delete tab
  const filteredUsersForDelete = users.filter(u => {
    if (!deleteSearch.trim()) return true;
    const term = cleanTextId(deleteSearch);
    return cleanTextId(u.usuario).includes(term) || 
           (u.nuc && u.nuc.includes(term)) ||
           (u.login && cleanTextId(u.login).includes(term)) ||
           cleanTextId(u.reparticao).includes(term);
  });

  return (
    <div className="space-y-6 font-sans text-grafite pb-10">
      
      {/* Module Title Header */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200/60 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-black text-vinho tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-ouro" />
            Painel do Administrador
          </h2>
          <p className="text-xs text-gray-500 font-semibold mt-1">
            Gestão completa de militares, funções, esquadrões e acessos ao sistema.
          </p>
        </div>

        {activeModule !== 'menu' && (
          <button
            onClick={() => setActiveModule('menu')}
            className="w-full md:w-auto px-5 py-2.5 bg-vinho text-white rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-vinho-dark transition-all shadow-md active:scale-95 cursor-pointer min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Menu Admin
          </button>
        )}
      </div>

      {/* ------------------- MAIN MENU GRID OF 5 BIG BUTTONS ------------------- */}
      {activeModule === 'menu' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
          
          {/* Button 1: Cadastrar Usuário */}
          <button
            onClick={() => setActiveModule('cadastrar')}
            className="group text-left bg-white p-5 sm:p-7 rounded-3xl border-2 border-gray-200/80 hover:border-vinho/40 hover:shadow-xl transition-all duration-200 flex flex-col justify-between cursor-pointer relative overflow-hidden min-h-[170px] sm:min-h-[190px]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-vinho/5 rounded-bl-full transition-transform group-hover:scale-110" />
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 relative z-10">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-vinho text-ouro flex items-center justify-center shadow-md shrink-0 border border-ouro/30">
                <UserPlus className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-ouro tracking-widest block">Ação do Admin</span>
                <h3 className="text-base sm:text-lg font-display font-black text-vinho leading-tight">Cadastrar Militar</h3>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium relative z-10 leading-relaxed">
              Adicione um novo militar com NUC individual, posto/graduação e esquadrão.
            </p>
          </button>

          {/* Button 2: Excluir Usuário */}
          <button
            onClick={() => setActiveModule('excluir')}
            className="group text-left bg-white p-5 sm:p-7 rounded-3xl border-2 border-gray-200/80 hover:border-red-500/40 hover:shadow-xl transition-all duration-200 flex flex-col justify-between cursor-pointer relative overflow-hidden min-h-[170px] sm:min-h-[190px]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-full transition-transform group-hover:scale-110" />
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 relative z-10">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-red-700 text-white flex items-center justify-center shadow-md shrink-0 border border-red-800">
                <Trash2 className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-red-500 tracking-widest block">Remoção</span>
                <h3 className="text-base sm:text-lg font-display font-black text-red-900 leading-tight">Excluir Militar</h3>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium relative z-10 leading-relaxed">
              Remova militares da base de dados com confirmação e exclusão permanente.
            </p>
          </button>

          {/* Button 3: Trocar Esquadrão e Graduação */}
          <button
            onClick={() => setActiveModule('classificar')}
            className="group text-left bg-white p-5 sm:p-7 rounded-3xl border-2 border-gray-200/80 hover:border-amber-500/40 hover:shadow-xl transition-all duration-200 flex flex-col justify-between cursor-pointer relative overflow-hidden min-h-[170px] sm:min-h-[190px]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full transition-transform group-hover:scale-110" />
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 relative z-10">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md shrink-0 border border-amber-700">
                <Building className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest block">Classificação</span>
                <h3 className="text-base sm:text-lg font-display font-black text-vinho leading-tight">Trocar Esquadrão / Graduação</h3>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium relative z-10 leading-relaxed">
              Altere a subunidade/esquadrão e o posto ou graduação de qualquer militar.
            </p>
          </button>

          {/* Button 4: Definir Função (Usuário / Furriel / Admin) */}
          <button
            onClick={() => setActiveModule('funcao')}
            className="group text-left bg-white p-5 sm:p-7 rounded-3xl border-2 border-gray-200/80 hover:border-blue-500/40 hover:shadow-xl transition-all duration-200 flex flex-col justify-between cursor-pointer relative overflow-hidden min-h-[170px] sm:min-h-[190px]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full transition-transform group-hover:scale-110" />
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 relative z-10">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-700 text-white flex items-center justify-center shadow-md shrink-0 border border-blue-800">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest block">Nível de Acesso</span>
                <h3 className="text-base sm:text-lg font-display font-black text-vinho leading-tight">Definir Função (Nível)</h3>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium relative z-10 leading-relaxed">
              Defina quem é Usuário, Furriel ou Administrador no sistema de forma permanente.
            </p>
          </button>

          {/* Button 5: Gerar QR Code de Acesso */}
          <button
            onClick={() => setActiveModule('qrcode')}
            className="group text-left bg-white p-5 sm:p-7 rounded-3xl border-2 border-gray-200/80 hover:border-emerald-500/40 hover:shadow-xl transition-all duration-200 flex flex-col justify-between cursor-pointer relative overflow-hidden min-h-[170px] sm:min-h-[190px]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full transition-transform group-hover:scale-110" />
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 relative z-10">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md shrink-0 border border-emerald-800">
                <QrCode className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest block">Acesso Rápido</span>
                <h3 className="text-base sm:text-lg font-display font-black text-vinho leading-tight">Gerar QR Code do Site</h3>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium relative z-10 leading-relaxed">
              Gere e imprima o QR Code de acesso ao site para ser afixado nas subunidades.
            </p>
          </button>

        </div>
      )}

      {/* ------------------- MODULE 1: CADASTRAR MILITAR ------------------- */}
      {activeModule === 'cadastrar' && (
        <div className="bg-white p-5 sm:p-8 rounded-3xl border border-gray-200/80 shadow-sm max-w-3xl mx-auto space-y-5 sm:space-y-6">
          <div className="flex items-center gap-3 pb-3 sm:pb-4 border-b border-gray-200">
            <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-vinho" />
            <h3 className="text-lg sm:text-xl font-display font-black text-vinho uppercase tracking-tight">
              Cadastrar Novo Militar
            </h3>
          </div>

          {addMsg && (
            <div className={`p-3.5 sm:p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
              addMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {addMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
              <span>{addMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleAddUserSubmit} className="space-y-4 text-xs font-semibold">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
              
              <div>
                <label className="block text-gray-600 uppercase text-[10px] tracking-wider mb-1 font-bold">Nome de Guerra *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: SILVA"
                  value={newUsuario}
                  onChange={(e) => setNewUsuario(e.target.value.toUpperCase())}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-vinho bg-gray-50 font-bold min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-gray-600 uppercase text-[10px] tracking-wider mb-1 font-bold">Login de Acesso (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: 3sgtsilva (deixe em branco p/ gerar)"
                  value={newLogin}
                  onChange={(e) => setNewLogin(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-vinho bg-gray-50 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-gray-600 uppercase text-[10px] tracking-wider mb-1 font-bold">Número Único (NUC) *</label>
                <input
                  type="text"
                  placeholder="Ex: 10000100 (deixe em branco p/ automático)"
                  value={newNuc}
                  onChange={(e) => setNewNuc(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-vinho bg-gray-50 font-mono min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-gray-600 uppercase text-[10px] tracking-wider mb-1 font-bold">Posto / Graduação</label>
                <select
                  value={newGraduacao}
                  onChange={(e) => setNewGraduacao(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-vinho bg-gray-50 font-bold min-h-[44px]"
                >
                  {GRADUACOES.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-600 uppercase text-[10px] tracking-wider mb-1 font-bold">Esquadrão / Subunidade</label>
                <select
                  value={newReparticao}
                  onChange={(e) => setNewReparticao(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-vinho bg-gray-50 font-bold min-h-[44px]"
                >
                  {REPARTICOES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-600 uppercase text-[10px] tracking-wider mb-1 font-bold">Nível de Acesso</label>
                <select
                  value={newNivel}
                  onChange={(e) => setNewNivel(e.target.value as UserNivel)}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-vinho bg-gray-50 font-bold min-h-[44px]"
                >
                  <option value="Militar">Usuário (Militar)</option>
                  <option value="Furriel">Furriel</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-600 uppercase text-[10px] tracking-wider mb-1 font-bold">Senha Inicial</label>
                <input
                  type="text"
                  value={newSenha}
                  onChange={(e) => setNewSenha(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-vinho bg-gray-50 font-mono min-h-[44px]"
                />
              </div>

            </div>

            <div className="pt-3 sm:pt-4 flex justify-end">
              <button
                type="submit"
                className="w-full md:w-auto px-8 py-3.5 bg-vinho text-white rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-vinho-dark transition-all shadow-md active:scale-95 cursor-pointer min-h-[46px]"
              >
                Cadastrar Militar na Base de Dados
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------- MODULE 2: EXCLUIR MILITAR ------------------- */}
      {activeModule === 'excluir' && (
        <div className="bg-white p-4 sm:p-8 rounded-3xl border border-gray-200/80 shadow-sm space-y-4 sm:space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-red-700" />
              <h3 className="text-lg sm:text-xl font-display font-black text-red-900 uppercase tracking-tight">
                Excluir Militar da Base de Dados
              </h3>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Buscar por nome, NUC, login..."
                value={deleteSearch}
                onChange={(e) => setDeleteSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-gray-300 text-xs focus:outline-none focus:border-red-600 bg-gray-50 min-h-[44px]"
              />
            </div>
          </div>

          {deleteMsg && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{deleteMsg.text}</span>
            </div>
          )}

          {/* Mobile Cards View (Hidden on desktop md+) */}
          <div className="block md:hidden space-y-3">
            {filteredUsersForDelete.map((u) => (
              <div key={u.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-vinho">
                      {formatMilitaryName(u.usuario, u.graduacao)}
                    </h4>
                    <p className="text-[10px] text-gray-500 font-semibold">{u.reparticao}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold shrink-0 ${
                    u.nivel === 'Administrador' ? 'bg-vinho/15 text-vinho border border-vinho/20' :
                    u.nivel === 'Furriel' ? 'bg-ouro/20 text-vinho border border-ouro/40' : 'bg-oliva/10 text-oliva-escuro border border-oliva/20'
                  }`}>
                    {u.nivel}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono border-t border-gray-200/60 pt-2">
                  <span>NUC: {u.nuc || u.id}</span>
                  <span>Login: {u.login || '—'}</span>
                </div>

                <div className="pt-1 flex justify-end">
                  {u.nivel === 'Administrador' && users.filter(item => item.nivel === 'Administrador').length <= 1 ? (
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Único Admin</span>
                  ) : (
                    <button
                      onClick={() => handleDeleteUser(u)}
                      className="w-full py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all shadow-sm active:scale-95 cursor-pointer min-h-[40px]"
                    >
                      Excluir Militar
                    </button>
                  )}
                </div>
              </div>
            ))}

            {filteredUsersForDelete.length === 0 && (
              <div className="p-8 text-center text-gray-400 font-medium bg-gray-50 rounded-2xl">
                Nenhum militar encontrado com o termo pesquisado.
              </div>
            )}
          </div>

          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100 text-gray-700 font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-3.5">NUC</th>
                  <th className="p-3.5">Nome / Graduação</th>
                  <th className="p-3.5">Esquadrão</th>
                  <th className="p-3.5">Login</th>
                  <th className="p-3.5">Nível</th>
                  <th className="p-3.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsersForDelete.map((u) => (
                  <tr key={u.id} className="hover:bg-red-50/40 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-gray-600">{u.nuc || u.id}</td>
                    <td className="p-3.5 font-bold text-vinho">
                      {formatMilitaryName(u.usuario, u.graduacao)}
                    </td>
                    <td className="p-3.5 text-gray-600 font-medium">{u.reparticao}</td>
                    <td className="p-3.5 text-gray-500 font-mono">{u.login || '—'}</td>
                    <td className="p-3.5 font-bold text-xs">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold ${
                        u.nivel === 'Administrador' ? 'bg-vinho/15 text-vinho border border-vinho/20' :
                        u.nivel === 'Furriel' ? 'bg-ouro/20 text-vinho border border-ouro/40' : 'bg-oliva/10 text-oliva-escuro border border-oliva/20'
                      }`}>
                        {u.nivel}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {u.nivel === 'Administrador' && users.filter(item => item.nivel === 'Administrador').length <= 1 ? (
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Único Administrador</span>
                      ) : (
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="px-3.5 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                          Excluir
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredUsersForDelete.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-400 font-medium">
                      Nenhum militar encontrado com o termo pesquisado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------- MODULE 3: TROCAR ESQUADRÃO E GRADUAÇÃO ------------------- */}
      {activeModule === 'classificar' && (
        <div className="bg-white p-4 sm:p-8 rounded-3xl border border-gray-200/80 shadow-sm max-w-3xl mx-auto space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3 pb-3 sm:pb-4 border-b border-gray-200">
            <Building className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
            <h3 className="text-lg sm:text-xl font-display font-black text-vinho uppercase tracking-tight">
              Trocar Esquadrão e Graduação
            </h3>
          </div>

          {classMsg && (
            <div className={`p-3.5 sm:p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
              classMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {classMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
              <span>{classMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleClassifySubmit} className="space-y-4 sm:space-y-5 text-xs font-semibold">
            <div>
              <label className="block text-gray-600 uppercase text-[10px] tracking-wider mb-1 font-bold">Selecione o Militar *</label>
              <select
                value={classUserId}
                onChange={(e) => {
                  setClassUserId(e.target.value);
                  const selected = users.find(u => u.id === e.target.value);
                  if (selected) {
                    setClassReparticao(selected.reparticao || REPARTICOES[0]);
                    setClassGraduacao(selected.graduacao || 'Sd');
                  }
                }}
                className="w-full p-3 sm:p-3.5 rounded-xl border border-gray-300 focus:outline-none focus:border-vinho bg-gray-50 font-bold min-h-[44px]"
              >
                <option value="">-- Selecione o militar --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {formatMilitaryName(u.usuario, u.graduacao)} — {u.reparticao} (NUC: {u.nuc || u.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label className="block text-gray-600 uppercase text-[10px] tracking-wider mb-1 font-bold">Novo Posto / Graduação</label>
                <select
                  value={classGraduacao}
                  onChange={(e) => setClassGraduacao(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-vinho bg-gray-50 font-bold min-h-[44px]"
                >
                  {GRADUACOES.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-600 uppercase text-[10px] tracking-wider mb-1 font-bold">Novo Esquadrão / Subunidade</label>
                <select
                  value={classReparticao}
                  onChange={(e) => setClassReparticao(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-vinho bg-gray-50 font-bold min-h-[44px]"
                >
                  {REPARTICOES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 sm:pt-4 flex justify-end">
              <button
                type="submit"
                className="w-full md:w-auto px-8 py-3.5 bg-amber-600 text-white rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-amber-700 transition-all shadow-md active:scale-95 cursor-pointer min-h-[46px]"
              >
                Salvar Alterações de Classificação
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------- MODULE 4: DEFINIR FUNÇÃO (NÍVEL DE ACESSO) ------------------- */}
      {activeModule === 'funcao' && (
        <div className="bg-white p-4 sm:p-8 rounded-3xl border border-gray-200/80 shadow-sm max-w-3xl mx-auto space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3 pb-3 sm:pb-4 border-b border-gray-200">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700" />
            <h3 className="text-lg sm:text-xl font-display font-black text-vinho uppercase tracking-tight">
              Definir Nível de Acesso (Usuário / Furriel / Admin)
            </h3>
          </div>

          {roleMsg && (
            <div className={`p-3.5 sm:p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
              roleMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {roleMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
              <span>{roleMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleRoleSubmit} className="space-y-4 sm:space-y-5 text-xs font-semibold">
            <div>
              <label className="block text-gray-600 uppercase text-[10px] tracking-wider mb-1 font-bold">Selecione o Militar *</label>
              <select
                value={roleUserId}
                onChange={(e) => {
                  setRoleUserId(e.target.value);
                  const selected = users.find(u => u.id === e.target.value);
                  if (selected) {
                    setRoleNivel(selected.nivel);
                  }
                }}
                className="w-full p-3 sm:p-3.5 rounded-xl border border-gray-300 focus:outline-none focus:border-vinho bg-gray-50 font-bold min-h-[44px]"
              >
                <option value="">-- Selecione o militar --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {formatMilitaryName(u.usuario, u.graduacao)} — {u.reparticao} (Nível Atual: {u.nivel})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-600 uppercase text-[10px] tracking-wider mb-2 font-bold">Novo Nível de Acesso</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                
                <button
                  type="button"
                  onClick={() => setRoleNivel('Militar')}
                  className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all cursor-pointer min-h-[44px] ${
                    roleNivel === 'Militar' ? 'border-vinho bg-vinho/5 shadow-sm' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <User className="w-5 h-5 text-gray-600 mb-1" />
                  <span className="font-bold block text-sm text-vinho">Usuário</span>
                  <span className="text-[10px] text-gray-500 font-normal">Acesso comum para arranchamento e alteração de senha.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRoleNivel('Furriel')}
                  className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all cursor-pointer min-h-[44px] ${
                    roleNivel === 'Furriel' ? 'border-amber-500 bg-amber-500/5 shadow-sm' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <Award className="w-5 h-5 text-amber-600 mb-1" />
                  <span className="font-bold block text-sm text-amber-900">Furriel</span>
                  <span className="text-[10px] text-gray-500 font-normal">Visualiza arranchamento do esquadrão, vale diário e impressão.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRoleNivel('Administrador')}
                  className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all cursor-pointer min-h-[44px] ${
                    roleNivel === 'Administrador' ? 'border-vinho bg-vinho/5 shadow-sm' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <Shield className="w-5 h-5 text-vinho mb-1" />
                  <span className="font-bold block text-sm text-vinho">Administrador</span>
                  <span className="text-[10px] text-gray-500 font-normal">Acesso total ao painel admin e controle de cadastros.</span>
                </button>

              </div>
            </div>

            <div className="pt-3 sm:pt-4 flex justify-end">
              <button
                type="submit"
                className="w-full md:w-auto px-8 py-3.5 bg-vinho hover:bg-vinho-escuro text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer border border-ouro/30 min-h-[46px]"
              >
                Atualizar Função no Banco de Dados
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------- MODULE 5: GERAR QR CODE DO SITE ------------------- */}
      {activeModule === 'qrcode' && (
        <div className="bg-white p-5 sm:p-8 rounded-3xl border border-gray-200/80 shadow-sm max-w-2xl mx-auto text-center space-y-5 sm:space-y-6">
          <div className="flex items-center justify-center gap-3 pb-3 sm:pb-4 border-b border-gray-200">
            <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700" />
            <h3 className="text-lg sm:text-xl font-display font-black text-vinho uppercase tracking-tight">
              QR Code de Acesso ao Site
            </h3>
          </div>

          <p className="text-xs text-gray-500 font-medium max-w-md mx-auto leading-relaxed">
            Este QR Code direciona os militares diretamente para a página de login e arranchamento do 7º RC Mec.
          </p>

          <div className="flex flex-col items-center justify-center p-4 sm:p-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl max-w-xs mx-auto">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=7a0c0c&data=${encodeURIComponent(siteUrl)}`}
              alt="QR Code do Site ARRANCHA+"
              className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-2xl shadow-md border border-gray-200 bg-white p-2"
            />
            <span className="text-[10px] sm:text-[11px] font-mono text-gray-500 font-bold mt-3 break-all px-2">
              {siteUrl}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-2">
            <button
              onClick={handlePrintQRCode}
              className="w-full sm:w-auto px-6 py-3.5 bg-vinho text-white rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-vinho-dark transition-all shadow-md active:scale-95 cursor-pointer min-h-[44px]"
            >
              <Printer className="w-4 h-4 text-ouro" />
              Imprimir Folha de QR Code
            </button>

            <button
              onClick={handleCopyLink}
              className="w-full sm:w-auto px-6 py-3.5 bg-gray-100 text-gray-800 border border-gray-300 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-gray-200 transition-all active:scale-95 cursor-pointer min-h-[44px]"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
              {copied ? 'Link Copiado!' : 'Copiar Link do Site'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
