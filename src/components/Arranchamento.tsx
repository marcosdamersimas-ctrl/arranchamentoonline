import React, { useState } from 'react';
import { FirebaseUser, ArranchamentoRecord } from '../types';
import { getNextSevenDays, isDateLocked, isMealForUser } from '../utils/storage';
import { Calendar, AlertCircle, Coffee, Utensils, Moon, CheckCircle2, XCircle, Lock, ChevronLeft, ChevronRight, CopyCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ArranchamentoProps {
  user: FirebaseUser;
  meals: ArranchamentoRecord[];
  onUpdateMeal: (date: string, mealKey: 'cafe' | 'almoco' | 'jantar', value: boolean) => void;
  onBulkUpdateMeals?: (updates: { date: string; cafe: boolean; almoco: boolean; jantar: boolean }[]) => void;
}

export default function Arranchamento({ user, meals, onUpdateMeal, onBulkUpdateMeals }: ArranchamentoProps) {
  const daysOfWeek = getNextSevenDays();
  const [selectedDate, setSelectedDate] = useState<string>(daysOfWeek[0].dateStr);
  const [activeMobileMeal, setActiveMobileMeal] = useState<'cafe' | 'almoco' | 'jantar'>('almoco');

  const currentIndex = daysOfWeek.findIndex(d => d.dateStr === selectedDate);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < daysOfWeek.length - 1;

  const handlePrevDay = () => {
    if (hasPrev) {
      setSelectedDate(daysOfWeek[currentIndex - 1].dateStr);
    }
  };

  const handleNextDay = () => {
    if (hasNext) {
      setSelectedDate(daysOfWeek[currentIndex + 1].dateStr);
    }
  };

  const getFullMobileDateLabel = (dayObj: { label: string; dateStr: string; weekday: string }) => {
    const weekdaysFull = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const [year, month, day] = dayObj.dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const formattedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`;
    const weekdayFull = weekdaysFull[date.getDay()];
    
    if (dayObj.label === 'Hoje') {
      return `Hoje (${formattedDate}) - ${weekdayFull}`;
    } else if (dayObj.label === 'Amanhã') {
      return `Amanhã (${formattedDate}) - ${weekdayFull}`;
    } else {
      return `${weekdayFull}, ${formattedDate}`;
    }
  };

  const activeDayObj = daysOfWeek.find(d => d.dateStr === selectedDate);
  const selectedDateLabel = activeDayObj ? activeDayObj.label : 'Selecionado';

  // Find record for user/date
  const currentRecord = meals.find(m => isMealForUser(m, user, selectedDate)) || {
    idRegistro: 'temp',
    usuario: user.usuario,
    reparticao: user.reparticao,
    dataRegistro: selectedDate,
    cafe: false,
    almoco: false,
    jantar: false
  };

  // A trava do arranchamento aplica-se a todos os usuários (inclusive Administradores e Furriéis)
  const locked = isDateLocked(selectedDate);

  const handleMealToggle = (mealKey: 'cafe' | 'almoco' | 'jantar', currentValue: boolean) => {
    if (locked) return; // Trava real e funcional
    onUpdateMeal(selectedDate, mealKey, !currentValue);
  };

  const handleRepeatForOpenDays = () => {
    if (!onBulkUpdateMeals) return;
    const openDays = daysOfWeek.filter(day => !isDateLocked(day.dateStr));
    if (openDays.length === 0) {
      alert('Não há datas abertas neste período.');
      return;
    }
    if (!window.confirm(`Repetir esta combinação de refeições nos ${openDays.length} dias ainda abertos?`)) return;
    onBulkUpdateMeals(openDays.map(day => ({
      date: day.dateStr,
      cafe: currentRecord.cafe,
      almoco: currentRecord.almoco,
      jantar: currentRecord.jantar
    })));
  };

  const getMealTimeRange = (meal: 'cafe' | 'almoco' | 'jantar') => {
    switch (meal) {
      case 'cafe': return '07:00h às 08:30h';
      case 'almoco': return '11:00h às 13:30h';
      case 'jantar': return '17:00h às 19:30h';
    }
  };

  const formatDateLabel = (dateStr: string) => {
    return dateStr.split('-').reverse().slice(0, 2).join('/');
  };

  return (
    <div className="space-y-6 font-sans text-grafite">
      
      {/* Top Banner & Week Calendar (Desktop Only) */}
      <div className="hidden md:flex flex-col xl:flex-row justify-between items-start xl:items-center gap-5 bg-white p-6 border border-gray-200/60 rounded-3xl shadow-sm">
        <div>
          <h3 className="text-xl font-display font-black text-vinho uppercase tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-ouro animate-ping shrink-0" />
            Arranchamento Individual
          </h3>
          <p className="text-xs text-gray-500 font-semibold mt-1">
            Escolha o dia da semana no calendário para visualizar ou modificar seu arranchamento individual.
          </p>
        </div>
        
        {/* Dynamic 7-Day Week Selector with responsive design */}
        <div className="grid grid-cols-4 sm:grid-cols-7 bg-gray-100 p-1 rounded-2xl w-full xl:w-auto gap-1">
          {daysOfWeek.map((day) => {
            const isSelected = selectedDate === day.dateStr;
            const isDayLocked = isDateLocked(day.dateStr);
            return (
              <button
                key={day.dateStr}
                onClick={() => setSelectedDate(day.dateStr)}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl text-xs transition-all relative cursor-pointer ${
                  isSelected
                    ? 'bg-vinho text-white shadow-md'
                    : 'text-gray-500 hover:text-vinho hover:bg-gray-200/55'
                }`}
              >
                <span className="text-[9px] font-bold uppercase opacity-80">{day.weekday}</span>
                <span className="font-mono font-black text-[13px] mt-0.5">{formatDateLabel(day.dateStr)}</span>
                {isDayLocked && (
                  <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border text-[8px] ${
                    isSelected ? 'bg-white text-vinho border-vinho' : 'bg-red-500 text-white border-white'
                  }`} title="Rancho Bloqueado">
                    <Lock className="w-2 h-2" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile-Only Day Navigation Header (Exactly 1 day of Arranchamento!) */}
      <div className="block md:hidden bg-white p-4 border border-gray-200/60 rounded-3xl shadow-sm text-center">
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Data do Arranchamento</span>
        <div className="flex items-center justify-between gap-1.5 bg-gray-50 p-1 rounded-2xl border border-gray-200/50">
          <button
            type="button"
            disabled={!hasPrev}
            onClick={handlePrevDay}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer ${
              hasPrev ? 'text-vinho hover:bg-gray-200/60 active:scale-95 animate-pulse' : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex-1 min-w-0">
            <p className="text-xs font-display font-black text-vinho uppercase tracking-tight truncate">
              {activeDayObj ? getFullMobileDateLabel(activeDayObj) : ''}
            </p>
          </div>

          <button
            type="button"
            disabled={!hasNext}
            onClick={handleNextDay}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer ${
              hasNext ? 'text-vinho hover:bg-gray-200/60 active:scale-95 animate-pulse' : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Updated Aviso! (Normas de rancho replaced exactly as requested) */}
      <div className="p-4 bg-vinho/[0.03] border-l-4 border-ouro rounded-r-2xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-vinho shrink-0 mt-0.5" />
        <div className="text-xs text-gray-700 space-y-1">
          <p className="font-bold text-vinho uppercase tracking-wider text-[11px]">Aviso!</p>
          <p className="font-semibold text-grafite">O arranchamento garante a etapa do militar. Em caso de falta após arranchar-se, o militar deverá justificar junto ao setor de aprovisionamento.</p>
        </div>
      </div>

      {/* Lock Warning Banner */}
      {locked && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs text-red-800 font-bold uppercase">
          <Lock className="w-4 h-4 text-red-600 shrink-0" />
          <span>Arranchamento encerrado para {formatDateLabel(selectedDate)}. Sáb/Dom/Seg: sexta às 10:30. Ter a Sex: dia anterior às 15:30.</span>
        </div>
      )}

      {!locked && onBulkUpdateMeals && (
        <button
          type="button"
          onClick={handleRepeatForOpenDays}
          className="w-full bg-white border border-vinho/15 hover:border-vinho/35 text-vinho rounded-2xl px-5 py-3.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <CopyCheck className="w-4 h-4 text-ouro" />
          Repetir estas refeições nos dias abertos
        </button>
      )}

      {/* Meal Cards Container - Descriptions (Menus) removed as requested */}
      <div className="hidden md:grid grid-cols-3 gap-5">
        
        {/* CAFÉ DA MANHÃ */}
        <motion.div 
          whileHover={locked ? {} : { y: -3 }}
          className={`bg-white border rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-md ${
            currentRecord.cafe ? 'border-ouro bg-amber-50/10' : 'border-gray-200'
          } ${locked ? 'opacity-85' : ''}`}
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 shadow-sm shrink-0">
                <Coffee className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200/50">
                {getMealTimeRange('cafe')}
              </span>
            </div>
            
            <h4 className="text-base font-display font-black text-vinho uppercase tracking-wider">Café da Manhã</h4>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-gray-400">Status do Rancho:</span>
              {currentRecord.cafe ? (
                <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  Arranchado
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                  Sem Rancho
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                disabled={locked}
                onClick={() => handleMealToggle('cafe', currentRecord.cafe)}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  locked
                    ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                    : currentRecord.cafe
                    ? 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 cursor-pointer'
                    : 'bg-vinho text-white hover:bg-vinho-escuro shadow-sm cursor-pointer'
                }`}
              >
                {locked && <Lock className="w-3.5 h-3.5" />}
                <span>{locked ? 'Rancho Bloqueado' : currentRecord.cafe ? 'Desarranchar' : 'Arranchar'}</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* ALMOÇO */}
        <motion.div 
          whileHover={locked ? {} : { y: -3 }}
          className={`bg-white border rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-md ${
            currentRecord.almoco ? 'border-ouro bg-amber-50/10' : 'border-gray-200'
          } ${locked ? 'opacity-85' : ''}`}
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-sm shrink-0">
                <Utensils className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200/50">
                {getMealTimeRange('almoco')}
              </span>
            </div>
            
            <h4 className="text-base font-display font-black text-vinho uppercase tracking-wider">Almoço</h4>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-gray-400">Status do Rancho:</span>
              {currentRecord.almoco ? (
                <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  Arranchado
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                  Sem Rancho
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                disabled={locked}
                onClick={() => handleMealToggle('almoco', currentRecord.almoco)}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  locked
                    ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                    : currentRecord.almoco
                    ? 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 cursor-pointer'
                    : 'bg-vinho text-white hover:bg-vinho-escuro shadow-sm cursor-pointer'
                }`}
              >
                {locked && <Lock className="w-3.5 h-3.5" />}
                <span>{locked ? 'Rancho Bloqueado' : currentRecord.almoco ? 'Desarranchar' : 'Arranchar'}</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* JANTAR */}
        <motion.div 
          whileHover={locked ? {} : { y: -3 }}
          className={`bg-white border rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-md ${
            currentRecord.jantar ? 'border-ouro bg-amber-50/10' : 'border-gray-200'
          } ${locked ? 'opacity-85' : ''}`}
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3.5 rounded-2xl bg-oliva/10 border border-oliva/30 text-oliva-escuro shadow-sm shrink-0">
                <Moon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200/50">
                {getMealTimeRange('jantar')}
              </span>
            </div>
            
            <h4 className="text-base font-display font-black text-vinho uppercase tracking-wider">Jantar</h4>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-gray-400">Status do Rancho:</span>
              {currentRecord.jantar ? (
                <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  Arranchado
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                  Sem Rancho
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                disabled={locked}
                onClick={() => handleMealToggle('jantar', currentRecord.jantar)}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  locked
                    ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                    : currentRecord.jantar
                    ? 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 cursor-pointer'
                    : 'bg-vinho text-white hover:bg-vinho-escuro shadow-sm cursor-pointer'
                }`}
              >
                {locked && <Lock className="w-3.5 h-3.5" />}
                <span>{locked ? 'Rancho Bloqueado' : currentRecord.jantar ? 'Desarranchar' : 'Arranchar'}</span>
              </button>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Mobile Version: Single card with switcher tabs */}
      <div className="md:hidden space-y-4">
        {/* Switcher segmented control bar */}
        <div className="flex bg-gray-100 p-1 rounded-2xl w-full gap-1 border border-gray-200/50 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveMobileMeal('cafe')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMobileMeal === 'cafe'
                ? 'bg-vinho text-white shadow-md'
                : 'text-gray-500 hover:text-vinho'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>Café</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileMeal('almoco')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMobileMeal === 'almoco'
                ? 'bg-vinho text-white shadow-md'
                : 'text-gray-500 hover:text-vinho'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Almoço</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileMeal('jantar')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMobileMeal === 'jantar'
                ? 'bg-vinho text-white shadow-md'
                : 'text-gray-500 hover:text-vinho'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Jantar</span>
          </button>
        </div>

        {/* Selected Meal Card wrapper with sliding/fade animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMobileMeal}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className={`bg-white border rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 shadow-sm ${
              activeMobileMeal === 'cafe' && currentRecord.cafe ? 'border-ouro bg-marfim-escuro' :
              activeMobileMeal === 'almoco' && currentRecord.almoco ? 'border-ouro bg-oliva/10' :
              activeMobileMeal === 'jantar' && currentRecord.jantar ? 'border-ouro bg-vinho/10' :
              'border-gray-200'
            } ${locked ? 'opacity-85' : ''}`}
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3.5 rounded-2xl shadow-sm shrink-0 ${
                  activeMobileMeal === 'cafe' ? 'bg-marfim-escuro border border-ouro/40 text-vinho' :
                  activeMobileMeal === 'almoco' ? 'bg-oliva/10 border border-oliva/30 text-oliva-escuro' :
                  'bg-vinho/10 border border-vinho/25 text-vinho-escuro'
                }`}>
                  {activeMobileMeal === 'cafe' && <Coffee className="w-6 h-6" />}
                  {activeMobileMeal === 'almoco' && <Utensils className="w-6 h-6" />}
                  {activeMobileMeal === 'jantar' && <Moon className="w-6 h-6" />}
                </div>
                <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200/50">
                  {getMealTimeRange(activeMobileMeal)}
                </span>
              </div>
              
              <h4 className="text-base font-display font-black text-vinho uppercase tracking-wider">
                {activeMobileMeal === 'cafe' ? 'Café da Manhã' : activeMobileMeal === 'almoco' ? 'Almoço' : 'Jantar'}
              </h4>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-gray-400">Status do Rancho:</span>
                {((activeMobileMeal === 'cafe' && currentRecord.cafe) ||
                  (activeMobileMeal === 'almoco' && currentRecord.almoco) ||
                  (activeMobileMeal === 'jantar' && currentRecord.jantar)) ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    Arranchado
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                    Sem Rancho
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  disabled={locked}
                  onClick={() => handleMealToggle(activeMobileMeal, activeMobileMeal === 'cafe' ? currentRecord.cafe : activeMobileMeal === 'almoco' ? currentRecord.almoco : currentRecord.jantar)}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    locked
                      ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                      : ((activeMobileMeal === 'cafe' && currentRecord.cafe) ||
                         (activeMobileMeal === 'almoco' && currentRecord.almoco) ||
                         (activeMobileMeal === 'jantar' && currentRecord.jantar))
                      ? 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 cursor-pointer'
                      : 'bg-vinho text-white hover:bg-vinho-escuro shadow-sm cursor-pointer'
                  }`}
                >
                  {locked && <Lock className="w-3.5 h-3.5" />}
                  <span>{locked ? 'Rancho Bloqueado' : ((activeMobileMeal === 'cafe' && currentRecord.cafe) ||
                         (activeMobileMeal === 'almoco' && currentRecord.almoco) ||
                         (activeMobileMeal === 'jantar' && currentRecord.jantar)) ? 'Desarranchar' : 'Arranchar'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
