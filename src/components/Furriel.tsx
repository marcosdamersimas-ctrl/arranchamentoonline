import React, { useState } from 'react';
import { FirebaseUser, ArranchamentoRecord } from '../types';
import { getTodayDateStr, getTomorrowDateStr, isMealForUser, getMilitarGroupFromGraduacao } from '../utils/storage';
import { generateMapaDaForcaPDF, generateRelatorioMilitaresEsqdPDF, generateArranchamentoPDF, generateLoginsPDF, normalizeReparticao } from '../utils/pdfGenerator';
import { FileText, Coffee, Utensils, Moon, Users, Printer, Calendar, Key, RefreshCw, LockKeyhole } from 'lucide-react';

interface FurrielProps {
  user: FirebaseUser;
  users: FirebaseUser[];
  meals: ArranchamentoRecord[];
  onRefresh: () => Promise<{ users: FirebaseUser[]; meals: ArranchamentoRecord[] }>;
  onCloseDaily: (date: string) => Promise<unknown>;
}

export default function Furriel({ user, users, meals, onRefresh, onCloseDaily }: FurrielProps) {
  const isFurrielUser = user.nivel === 'Furriel';
  const esquadrao = user.reparticao;

  const today = getTodayDateStr();
  const tomorrow = getTomorrowDateStr();

  // Primary filtering states
  const [dateFilter, setDateFilter] = useState<string>(today);
  const [selectedEsq, setSelectedEsq] = useState<string>(
    user.nivel === 'Administrador' ? 'Todos' : esquadrao
  );
  const [selectedGrp, setSelectedGrp] = useState<string>('Todos');
  const [refreshing, setRefreshing] = useState(false);
  const [closing, setClosing] = useState(false);

  // Helper function to resolve the military group by rank or subdivision
  const getMilitarGroup = (u: FirebaseUser): 'Oficiais' | 'St/Sgt' | 'Cb/Sd' => {
    return getMilitarGroupFromGraduacao(u.graduacao, u.reparticao, u.grupo);
  };

  const allSubdivisions = [
    'Todos',
    '1º Esqd C Mec',
    '2º Esqd C Mec',
    '3º Esqd C Mec',
    'Esqd Cap',
    'Fanfarra',
    'Visitantes'
  ];
  const allowedSubdivisions = isFurrielUser ? [esquadrao] : allSubdivisions;

  // Filter users based on selected Subdivision and Group
  const displayedUsers = users.filter(u => {
    const userGroup = getMilitarGroup(u);

    if (selectedEsq !== 'Todos') {
      if (normalizeReparticao(u.reparticao) !== normalizeReparticao(selectedEsq)) {
        return false;
      }
    }
    
    if (selectedGrp !== 'Todos') {
      if (userGroup !== selectedGrp) {
        return false;
      }
    }
    
    return true;
  });

  // Filter meals based on the selected Date Filter
  const filteredMeals = meals.filter(m => m.dataRegistro === dateFilter);

  // Sync meals count with selected squadron & group filters
  const displayedMeals = filteredMeals.filter(m => {
    return displayedUsers.some(u => isMealForUser(m, u, dateFilter));
  });

  // Meal totals
  const totalCafe = displayedMeals.filter(m => m.cafe).length;
  const totalAlmoco = displayedMeals.filter(m => m.almoco).length;
  const totalJantar = displayedMeals.filter(m => m.jantar).length;

  const refreshBefore = async () => {
    setRefreshing(true);
    try {
      return await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const handleExportPDF = async () => {
    const fresh = await refreshBefore();
    generateMapaDaForcaPDF(fresh.users, fresh.meals, dateFilter, selectedEsq, selectedGrp);
  };

  const handlePrintArranchamento = async () => {
    const fresh = await refreshBefore();
    const repForPDF = selectedEsq === 'Todos' ? 'Todas' : selectedEsq;
    generateArranchamentoPDF(fresh.users, fresh.meals, dateFilter, repForPDF);
  };

  const handlePrintEfetivo = async () => {
    const fresh = await refreshBefore();
    const targetRep = selectedEsq === 'Todos' ? 'Todas' : selectedEsq;
    generateRelatorioMilitaresEsqdPDF(fresh.users, targetRep);
  };

  const handlePrintLogins = async () => {
    const fresh = await refreshBefore();
    generateLoginsPDF(fresh.users, selectedEsq === 'Todos' ? 'Esqd Cap' : selectedEsq);
  };

  const handleCloseVale = async () => {
    if (!window.confirm(`Fechar e congelar o vale de ${dateFilter.split('-').reverse().join('/')}? Depois disso, nenhum arranchamento dessa data poderá ser alterado.`)) return;
    setClosing(true);
    try {
      await onCloseDaily(dateFilter);
      alert('Vale diário fechado e congelado com sucesso.');
      await onRefresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Não foi possível fechar o vale.');
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-sans text-grafite pb-12">
      
      {/* Unified Control & Statistics Panel */}
      <div className="bg-white p-4 sm:p-6 border border-gray-200/80 rounded-3xl shadow-sm space-y-4 sm:space-y-6">
        
        {/* Panel Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg sm:text-xl font-display font-black text-vinho uppercase tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-ouro animate-pulse" />
              {isFurrielUser ? `Painel do Furriel • ${esquadrao}` : 'Painel de Controle e Estatísticas'}
            </h3>
            <p className="text-xs text-gray-500 font-semibold mt-1">
              Controle simplificado de arranchamento para Café, Almoço e Jantar com emissão de relatórios.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full md:w-auto">
            {user.nivel === 'Administrador' && (
              <button
                onClick={handlePrintLogins}
                disabled={refreshing}
                className="col-span-1 px-3 sm:px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white rounded-2xl text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-sm cursor-pointer min-h-[44px]"
              >
                <Key className="w-4 h-4 text-emerald-200 shrink-0" />
                <span>Logins PDF</span>
              </button>
            )}

            <button
              onClick={refreshBefore}
              disabled={refreshing}
              className={`col-span-1 px-3 sm:px-4 py-2.5 bg-white hover:bg-gray-50 disabled:opacity-60 text-vinho border border-vinho/15 rounded-2xl text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-sm cursor-pointer min-h-[44px] ${user.nivel !== 'Administrador' ? 'col-span-1' : ''}`}
            >
              <RefreshCw className={`w-4 h-4 shrink-0 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Atualizando...' : 'Atualizar'}</span>
            </button>

            <button
              onClick={handleExportPDF}
              disabled={refreshing}
              className="col-span-2 sm:col-span-1 px-3 sm:px-4 py-2.5 bg-vinho hover:bg-vinho-escuro text-white rounded-2xl text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-sm cursor-pointer border border-ouro/30 min-h-[44px]"
            >
              <FileText className="w-4 h-4 text-ouro shrink-0" />
              <span>Mapa da Força (PDF)</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 bg-gray-50 p-3.5 sm:p-4 rounded-2xl border border-gray-150">
          
          {/* Date Selector */}
          <div className="space-y-1 text-left">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-vinho" />
              Data de Consulta
            </label>
            <div className="flex gap-1.5">
              <select
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="flex-1 bg-white border border-gray-200 focus:border-vinho rounded-xl px-3 py-2.5 text-xs text-grafite font-bold cursor-pointer shadow-sm transition-all focus:outline-none min-h-[44px]"
              >
                <option value={today}>Hoje ({today.split('-').reverse().slice(0, 2).join('/')})</option>
                <option value={tomorrow}>Amanhã ({tomorrow.split('-').reverse().slice(0, 2).join('/')})</option>
                {! [today, tomorrow].includes(dateFilter) && (
                  <option value={dateFilter}>{dateFilter.split('-').reverse().join('/')}</option>
                )}
              </select>
              <input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-2 py-2 text-xs text-grafite font-bold focus:outline-none focus:border-vinho w-12 min-h-[44px] flex items-center justify-center cursor-pointer"
              />
            </div>
          </div>

          {/* Esquadrão Selector */}
          <div className="space-y-1 text-left">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Esquadrão / Subunidade
            </label>
            <select
              value={selectedEsq}
              onChange={e => setSelectedEsq(e.target.value)}
              className="w-full bg-white border border-gray-200 focus:border-vinho rounded-xl px-3.5 py-2.5 text-xs text-grafite font-bold cursor-pointer shadow-sm transition-all focus:outline-none min-h-[44px]"
            >
              {allowedSubdivisions.map(sub => (
                <option key={sub} value={sub}>
                  {sub === 'Todos' ? 'Todos os Esquadrões (Geral)' : sub}
                </option>
              ))}
            </select>
          </div>

          {/* Grupo Selector */}
          <div className="space-y-1 text-left">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Grupo (Nível)
            </label>
            <select
              value={selectedGrp}
              onChange={e => setSelectedGrp(e.target.value)}
              className="w-full bg-white border border-gray-200 focus:border-vinho rounded-xl px-3.5 py-2.5 text-xs text-grafite font-bold cursor-pointer shadow-sm transition-all focus:outline-none min-h-[44px]"
            >
              <option value="Todos">Todos os Grupos (Oficiais, ST/Sgt, Cb/Sd)</option>
              <option value="Oficiais">Oficiais</option>
              <option value="St/Sgt">ST/Sgt</option>
              <option value="Cb/Sd">CB/Sd</option>
            </select>
          </div>

        </div>

        {/* Militares Arranchados Stats Cards (Café, Almoço, Jantar ONLY) */}
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2.5">
            Militares Arranchados para {dateFilter === today ? 'Hoje' : dateFilter === tomorrow ? 'Amanhã' : dateFilter.split('-').reverse().join('/')} ({selectedEsq})
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            
            {/* Café Total */}
            <div className="bg-marfim-escuro border-2 border-ouro/40 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-0.5 sm:space-y-1">
                <span className="text-[11px] sm:text-xs font-black text-vinho uppercase tracking-wider block">CAFÉ DA MANHÃ</span>
                <span className="text-2xl sm:text-3xl font-display font-black text-vinho font-mono leading-none">{totalCafe}</span>
                <span className="text-[10px] text-grafite-suave font-bold block">militares arranchados</span>
              </div>
              <div className="p-3 sm:p-3.5 bg-ouro text-vinho rounded-2xl shadow-md border border-ouro/60 shrink-0">
                <Coffee className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
            </div>

            {/* Almoço Total */}
            <div className="bg-oliva/10 border-2 border-oliva/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-0.5 sm:space-y-1">
                <span className="text-[11px] sm:text-xs font-black text-oliva-escuro uppercase tracking-wider block">ALMOÇO</span>
                <span className="text-2xl sm:text-3xl font-display font-black text-vinho font-mono leading-none">{totalAlmoco}</span>
                <span className="text-[10px] text-oliva-escuro font-bold block">militares arranchados</span>
              </div>
              <div className="p-3 sm:p-3.5 bg-oliva text-white rounded-2xl shadow-md border border-oliva-escuro shrink-0">
                <Utensils className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
            </div>

            {/* Jantar Total */}
            <div className="bg-vinho/10 border-2 border-vinho/25 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-0.5 sm:space-y-1">
                <span className="text-[11px] sm:text-xs font-black text-vinho uppercase tracking-wider block">JANTAR</span>
                <span className="text-2xl sm:text-3xl font-display font-black text-vinho font-mono leading-none">{totalJantar}</span>
                <span className="text-[10px] text-vinho-escuro font-bold block">militares arranchados</span>
              </div>
              <div className="p-3 sm:p-3.5 bg-vinho text-white rounded-2xl shadow-md border border-vinho-escuro shrink-0">
                <Moon className="w-6 h-6 sm:w-7 sm:h-7 text-ouro" />
              </div>
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 sm:pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-2.5 sm:gap-3">
          <button
            onClick={handlePrintEfetivo}
            disabled={refreshing}
            className="w-full sm:w-auto px-4 sm:px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border border-gray-300 min-h-[44px]"
          >
            <Users className="w-4 h-4 text-gray-600 shrink-0" />
            <span className="text-center">Relação de Militares ({selectedEsq === 'Todos' ? 'Geral' : selectedEsq})</span>
          </button>

          <button
            onClick={handlePrintArranchamento}
            disabled={refreshing}
            className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 bg-vinho hover:bg-vinho-escuro text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer border border-ouro/30 active:scale-95 min-h-[44px]"
          >
            <Printer className="w-4 h-4 text-ouro shrink-0" />
            <span className="text-center">Imprimir Arranchamento e Vale Diário ({selectedEsq === 'Todos' ? 'Geral' : selectedEsq})</span>
          </button>

          {user.nivel === 'Administrador' && (
            <button
              onClick={handleCloseVale}
              disabled={closing}
              className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 bg-[#301014] hover:bg-black disabled:opacity-60 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer border border-ouro/30 active:scale-95 min-h-[44px]"
            >
              <LockKeyhole className="w-4 h-4 text-ouro shrink-0" />
              <span>{closing ? 'Fechando...' : 'Fechar vale diário'}</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
