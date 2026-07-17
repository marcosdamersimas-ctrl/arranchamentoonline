import React, { useState } from 'react';
import { FirebaseUser, ArranchamentoRecord } from '../types';
import { getTodayDateStr, getTomorrowDateStr } from '../utils/storage';
import { generateMapaDaForcaPDF, generateRelatorioMilitaresEsqdPDF, generateArranchamentoPDF } from '../utils/pdfGenerator';
import { FileText, Download, Coffee, Utensils, Moon, ShieldAlert, Check, X, FileSpreadsheet, Users, Printer, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface FurrielProps {
  user: FirebaseUser;
  users: FirebaseUser[];
  meals: ArranchamentoRecord[];
}

export default function Furriel({ user, users, meals }: FurrielProps) {
  const isFurrielUser = user.nivel === 'Furriel';
  const esquadrao = user.reparticao;

  const today = getTodayDateStr();
  const tomorrow = getTomorrowDateStr();

  const [dateFilter, setDateFilter] = useState<string>(today);
  
  // Date selector for printing Arranchamento in Furriel View
  const [printDate, setPrintDate] = useState<string>(today);
  const [adminPrintReparticao, setAdminPrintReparticao] = useState<string>('Todas');

  // If the user has Furriel level, render the restricted, printing-only view
  if (isFurrielUser) {
    const esquadraoUsers = users.filter(u => u.reparticao.toLowerCase().trim() === esquadrao.toLowerCase().trim());
    
    const handlePrintEfetivo = () => {
      generateRelatorioMilitaresEsqdPDF(users, esquadrao);
    };

    const handlePrintArranchamento = () => {
      generateArranchamentoPDF(users, meals, printDate, esquadrao);
    };

    return (
      <div className="space-y-6 font-sans text-grafite max-w-2xl mx-auto pb-12">
        
        {/* Painel Geral do Furriel Header Card */}
        <div className="bg-white p-6 sm:p-8 border border-gray-200/60 rounded-3xl shadow-sm text-center space-y-5">
          <div className="flex justify-center">
            <div className="p-4 bg-vinho/5 border border-vinho/10 text-vinho rounded-2xl">
              <Users className="w-8 h-8 text-vinho" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-display font-black text-vinho uppercase tracking-tight flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-ouro animate-pulse shrink-0" />
              Painel Geral do Furriel
            </h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">
              {esquadrao} • Regimento da Fronteira
            </p>
            <p className="text-xs text-gray-500 font-medium mt-3 max-w-md mx-auto leading-relaxed">
              Como Furriel do <strong>{esquadrao}</strong>, você possui controle de impressão do efetivo cadastrado e emissão do arranchamento específico da sua subunidade.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handlePrintEfetivo}
              className="w-full bg-vinho hover:bg-vinho-escuro text-white font-display font-black py-4 px-6 rounded-2xl text-xs shadow-md shadow-vinho/10 flex items-center justify-center gap-2 cursor-pointer transition-all border border-transparent hover:border-ouro uppercase tracking-wider"
              id="btn-print-efetivo"
            >
              <Printer className="w-4 h-4 text-ouro" />
              <span>Imprimir Relatório de Militares Cadastrados ({esquadraoUsers.length})</span>
            </button>
          </div>
        </div>

        {/* Opção Imprimir Arranchamento Immediately Below */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-3 text-center">
            <h4 className="text-sm font-display font-black text-vinho uppercase tracking-wider flex items-center justify-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-ouro" />
              Imprimir Arranchamento
            </h4>
            <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
              Selecione o dia para gerar e imprimir o Arranchamento Diário e o Vale Diário do seu esquadrão.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2.5 flex items-center gap-1 justify-center">
                <Calendar className="w-3.5 h-3.5 text-vinho" />
                Data do Arranchamento
              </label>
              
              {/* Day Shortcuts */}
              <div className="flex gap-2 justify-center mb-4">
                <button
                  type="button"
                  onClick={() => setPrintDate(today)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    printDate === today ? 'bg-vinho text-white' : 'bg-gray-100 text-gray-500 hover:text-vinho'
                  }`}
                >
                  Hoje ({today.split('-').reverse().slice(0, 2).join('/')})
                </button>
                <button
                  type="button"
                  onClick={() => setPrintDate(tomorrow)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    printDate === tomorrow ? 'bg-vinho text-white' : 'bg-gray-100 text-gray-500 hover:text-vinho'
                  }`}
                >
                  Amanhã ({tomorrow.split('-').reverse().slice(0, 2).join('/')})
                </button>
              </div>

              {/* Native date input */}
              <input
                type="date"
                value={printDate}
                onChange={e => setPrintDate(e.target.value)}
                className="w-full max-w-xs mx-auto block bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-grafite font-semibold text-center focus:outline-none focus:border-vinho"
              />
            </div>

            <button
              onClick={handlePrintArranchamento}
              className="w-full bg-gradient-to-r from-vinho to-vinho-escuro hover:from-vinho-escuro hover:to-black text-white font-display font-black py-4.5 px-6 rounded-2xl text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all border border-ouro/30 uppercase tracking-widest"
              id="btn-print-arranchamento"
            >
              <Printer className="w-4 h-4 text-ouro" />
              <span>Gerar e Imprimir Documentos</span>
            </button>
          </div>
        </div>

      </div>
    );
  }

  // Calculate statistics for the selected date filter
  const filteredMeals = meals.filter(m => m.dataRegistro === dateFilter);
  const totalCafe = filteredMeals.filter(m => m.cafe).length;
  const totalAlmoco = filteredMeals.filter(m => m.almoco).length;
  const totalJantar = filteredMeals.filter(m => m.jantar).length;
  const totalMeals = totalCafe + totalAlmoco + totalJantar;

  const handleExportPDF = () => {
    generateMapaDaForcaPDF(users, meals, dateFilter);
  };

  return (
    <div className="space-y-6 font-sans text-grafite">
      
      {/* Upper Title and PDF Exporter */}
      <div className="bg-white p-6 border border-gray-200/60 rounded-3xl shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h3 className="text-xl font-display font-black text-vinho uppercase tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-ouro animate-pulse" />
            Painel Geral do Furriel
          </h3>
          <p className="text-xs text-gray-500 font-semibold mt-1">
            Controle de rancho integrado, listagem quantitativa de esquadrões e Mapa da Força em PDF.
          </p>
        </div>

        {/* Export Button - PDF */}
        <button
          onClick={handleExportPDF}
          className="w-full xl:w-auto bg-vinho hover:bg-vinho-escuro text-white font-display font-bold py-3.5 px-6 rounded-2xl text-xs shadow-md shadow-vinho/10 flex items-center justify-center gap-2 cursor-pointer transition-all border border-transparent hover:border-ouro"
          id="btn-gerar-mapa-pdf"
        >
          <FileText className="w-4 h-4 text-ouro" />
          <span>Exportar Mapa da Força (PDF)</span>
          <Download className="w-3.5 h-3.5 text-ouro" />
        </button>
      </div>

      {/* Interactive Tabs for Date */}
      <div className="bg-white p-5 border border-gray-200 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h4 className="text-sm font-display font-black text-vinho uppercase tracking-wider flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4 text-ouro" />
            Mapa da Força & quantitativo de arranchamento
          </h4>
          
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setDateFilter(today)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                dateFilter === today ? 'bg-vinho text-white shadow-sm' : 'text-gray-500 hover:text-vinho'
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setDateFilter(tomorrow)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                dateFilter === tomorrow ? 'bg-vinho text-white shadow-sm' : 'text-gray-500 hover:text-vinho'
              }`}
            >
              Amanhã
            </button>
          </div>
        </div>

        {/* Quantitativos Bento Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Efetivo Cadastrado */}
          <div className="bg-[#F9F9F9] border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Cadastrados</span>
              <span className="text-2xl font-display font-black text-vinho font-mono">{users.length}</span>
              <span className="text-[9px] text-gray-500 font-semibold block">Efetivo no site</span>
            </div>
            <div className="p-3 bg-vinho/5 border border-vinho/10 text-vinho rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Café quant */}
          <div className="bg-[#F9F9F9] border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">Previsão Café</span>
              <span className="text-2xl font-display font-black text-vinho font-mono">{totalCafe}</span>
              <span className="text-[9px] text-gray-500 font-semibold block">Soluções ativas</span>
            </div>
            <div className="p-3 bg-amber-500/5 border border-amber-500/10 text-amber-500 rounded-xl">
              <Coffee className="w-5 h-5" />
            </div>
          </div>

          {/* Almoço quant */}
          <div className="bg-[#F9F9F9] border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">Previsão Almoço</span>
              <span className="text-2xl font-display font-black text-vinho font-mono">{totalAlmoco}</span>
              <span className="text-[9px] text-gray-500 font-semibold block">Soluções ativas</span>
            </div>
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 rounded-xl">
              <Utensils className="w-5 h-5" />
            </div>
          </div>

          {/* Jantar quant */}
          <div className="bg-[#F9F9F9] border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">Previsão Jantar</span>
              <span className="text-2xl font-display font-black text-vinho font-mono">{totalJantar}</span>
              <span className="text-[9px] text-gray-500 font-semibold block">Soluções ativas</span>
            </div>
            <div className="p-3 bg-indigo-50/5 border border-indigo-100 text-indigo-600 rounded-xl">
              <Moon className="w-5 h-5" />
            </div>
          </div>

        </div>
      </div>

      {/* Opção Imprimir Arranchamento for Admins */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="border-b border-gray-100 pb-3 text-center">
          <h4 className="text-sm font-display font-black text-vinho uppercase tracking-wider flex items-center justify-center gap-1.5">
            <Printer className="w-4 h-4 text-ouro" />
            Imprimir Arranchamento do Dia
          </h4>
          <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
            Gere e imprima os mesmos documentos oficiais (Arranchamento Diário e Vale Diário) conforme a data e subdivisão selecionadas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          {/* Subdivision selector */}
          <div className="space-y-1.5 text-left">
            <label className="block text-[10px] font-bold text-gray-500 uppercase">
              Selecione a Subdivisão (Esquadrão)
            </label>
            <select
              value={adminPrintReparticao}
              onChange={e => setAdminPrintReparticao(e.target.value)}
              className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 focus:border-vinho rounded-xl px-3.5 py-2.5 text-xs text-grafite font-bold cursor-pointer shadow-sm transition-all focus:outline-none"
            >
              <option value="Todas">Todos os Esquadrões (Relatório Geral)</option>
              <option value="Oficiais">Oficiais</option>
              <option value="St/Sgt">St/Sgt</option>
              <option value="1º Esqd">1º Esqd</option>
              <option value="2º Esqd">2º Esqd</option>
              <option value="3º Esqd">3º Esqd</option>
              <option value="Esqd Cap">Esqd Cap</option>
              <option value="Fanfarra">Fanfarra</option>
            </select>
          </div>

          {/* Date Selector */}
          <div className="space-y-1.5 text-left">
            <label className="block text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-vinho" />
              Data do Arranchamento
            </label>
            
            <div className="flex gap-2">
              <input
                type="date"
                value={printDate}
                onChange={e => setPrintDate(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-grafite font-bold focus:outline-none focus:border-vinho"
              />
              <button
                type="button"
                onClick={() => setPrintDate(today)}
                className={`px-3 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  printDate === today ? 'bg-vinho text-white' : 'bg-gray-100 text-gray-500 hover:text-vinho'
                }`}
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={() => setPrintDate(tomorrow)}
                className={`px-3 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  printDate === tomorrow ? 'bg-vinho text-white' : 'bg-gray-100 text-gray-500 hover:text-vinho'
                }`}
              >
                Amanhã
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => generateArranchamentoPDF(users, meals, printDate, adminPrintReparticao)}
            className="w-full bg-gradient-to-r from-vinho to-vinho-escuro hover:from-vinho-escuro hover:to-black text-white font-display font-black py-4 px-6 rounded-2xl text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all border border-ouro/30 uppercase tracking-widest"
          >
            <Printer className="w-4 h-4 text-ouro" />
            <span>Imprimir Documentos ({adminPrintReparticao === 'Todas' ? 'Tudo' : adminPrintReparticao})</span>
          </button>
        </div>
      </div>

    </div>
  );
}
