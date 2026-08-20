import React, { useState } from 'react';
import { FirebaseUser, ArranchamentoRecord } from '../types';
import { getNextSevenDays, isDateLocked, isMealForUser } from '../utils/storage';
import { Calendar, AlertCircle, Coffee, Utensils, Moon, CheckCircle2, XCircle, Lock, ChevronLeft, ChevronRight, CopyCheck, Clock } from 'lucide-react';
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
      return `Hoje (${formattedDate}) • ${weekdayFull}`;
    } else if (dayObj.label === 'Amanhã') {
      return `Amanhã (${formattedDate}) • ${weekdayFull}`;
    } else {
      return `${weekdayFull}, ${formattedDate}`;
    }
  };

  const activeDayObj = daysOfWeek.find(d => d.dateStr === selectedDate) || daysOfWeek[0];

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

  // Trava do arranchamento
  const locked = isDateLocked(selectedDate);

  const handleMealToggle = (mealKey: 'cafe' | 'almoco' | 'jantar', currentValue: boolean) => {
    if (locked) return;
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
    <div className="space-y-4 md:space-y-6 font-sans text-grafite pb-6 md:pb-10 w-full max-w-full">
      
      {/* =========================================================================
         DESKTOP HEADER & WEEK SELECTOR (Preserved for desktop md+)
         ========================================================================= */}
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
        
        {/* Dynamic 7-Day Week Selector */}
        <div className="grid grid-cols-4 sm:grid-cols-7 bg-gray-100 p-1 rounded-2xl w-full xl:w-auto gap-1">
          {daysOfWeek.map((day) => {
            const isSelected = selectedDate === day.dateStr;
            const isDayLocked = isDateLocked(day.dateStr);
            return (
              <button
                key={day.dateStr}
                type="button"
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

      {/* =========================================================================
         MOBILE REFACTORED DAY SELECTOR & CAROUSEL (Mobile-first responsive solution)
         ========================================================================= */}
      <div className="block md:hidden bg-white p-3.5 sm:p-4 border border-ouro/30 rounded-3xl shadow-sm space-y-3">
        
        {/* 7-Days Horizontal Ribbon with Smooth Touch Scroll */}
        <div>
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[10px] font-display font-black text-vinho uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-ouro" />
              Selecione o Dia
            </span>
            <span className="text-[9px] font-bold text-gray-400">
              Próximos 7 dias
            </span>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 pt-0.5 overflow-touch scrollbar-none snap-x">
            {daysOfWeek.map((day) => {
              const isSelected = selectedDate === day.dateStr;
              const isDayLocked = isDateLocked(day.dateStr);
              return (
                <button
                  key={day.dateStr}
                  type="button"
                  onClick={() => setSelectedDate(day.dateStr)}
                  className={`flex flex-col items-center justify-center py-2 px-2.5 rounded-2xl text-xs transition-all relative shrink-0 min-w-[54px] snap-start cursor-pointer border ${
                    isSelected
                      ? 'bg-vinho text-white border-ouro shadow-md font-bold'
                      : isDayLocked
                      ? 'bg-gray-100 text-gray-500 border-gray-200 hover:border-gray-300'
                      : 'bg-white text-grafite border-gray-200/80 hover:border-ouro/50'
                  }`}
                >
                  <span className={`text-[9px] uppercase leading-tight ${isSelected ? 'text-ouro font-black' : 'text-gray-500'}`}>
                    {day.label === 'Hoje' ? 'Hoje' : day.label === 'Amanhã' ? 'Amanhã' : day.weekday}
                  </span>
                  <span className="font-mono font-black text-xs mt-0.5">
                    {formatDateLabel(day.dateStr)}
                  </span>
                  {isDayLocked && (
                    <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center border text-[7px] ${
                      isSelected ? 'bg-ouro text-vinho border-white' : 'bg-red-500 text-white border-white'
                    }`} title="Bloqueado">
                      <Lock className="w-2 h-2" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day Stepper & Active Label Banner */}
        <div className="flex items-center justify-between gap-2 bg-marfim-escuro/60 p-1.5 rounded-2xl border border-ouro/20">
          <button
            type="button"
            disabled={!hasPrev}
            onClick={handlePrevDay}
            className={`w-11 h-11 rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer ${
              hasPrev ? 'bg-white text-vinho shadow-xs active:scale-95 border border-gray-200' : 'text-gray-300 cursor-not-allowed opacity-40'
            }`}
            title="Dia anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex-1 min-w-0 text-center px-1">
            <p className="text-xs font-display font-black text-vinho uppercase tracking-tight truncate">
              {getFullMobileDateLabel(activeDayObj)}
            </p>
            <p className="text-[9px] font-semibold text-grafite-suave truncate mt-0.5">
              {locked ? '🔒 Arranchamento Encerrado' : '✅ Período Aberto para Alterações'}
            </p>
          </div>

          <button
            type="button"
            disabled={!hasNext}
            onClick={handleNextDay}
            className={`w-11 h-11 rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer ${
              hasNext ? 'bg-white text-vinho shadow-xs active:scale-95 border border-gray-200' : 'text-gray-300 cursor-not-allowed opacity-40'
            }`}
            title="Próximo dia"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-3.5 sm:p-4 bg-vinho/[0.04] border-l-4 border-ouro rounded-r-2xl flex items-start gap-2.5 sm:gap-3">
        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-vinho shrink-0 mt-0.5" />
        <div className="text-xs text-gray-700 space-y-0.5">
          <p className="font-bold text-vinho uppercase tracking-wider text-[10px] sm:text-[11px]">Aviso!</p>
          <p className="font-semibold text-grafite text-[11px] sm:text-xs leading-relaxed">
            O arranchamento garante a etapa do militar. Em caso de falta após arranchar-se, o militar deverá justificar junto ao setor de aprovisionamento.
          </p>
        </div>
      </div>

      {/* Lock Warning Banner */}
      {locked && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start sm:items-center gap-2.5 text-xs text-red-800 font-bold uppercase">
          <Lock className="w-4 h-4 text-red-600 shrink-0 mt-0.5 sm:mt-0" />
          <span className="text-[11px] leading-snug">
            Arranchamento encerrado para {formatDateLabel(selectedDate)}. Sáb/Dom/Seg: sexta às 10:30. Ter a Sex: dia anterior às 15:30.
          </span>
        </div>
      )}

      {/* Quick bulk action button */}
      {!locked && onBulkUpdateMeals && (
        <button
          type="button"
          onClick={handleRepeatForOpenDays}
          className="w-full bg-white border border-vinho/20 hover:border-vinho text-vinho rounded-2xl px-4 py-3.5 text-xs font-display font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all min-h-[48px] cursor-pointer"
        >
          <CopyCheck className="w-4 h-4 text-ouro" />
          <span>Repetir refeições nos dias abertos</span>
        </button>
      )}

      {/* =========================================================================
         MEALS CARDS: Fully Responsive Grid (1 col on mobile, 3 cols on desktop)
         Clean, large touch targets, color-coded, 100% hand-friendly!
         ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        
        {/* 1. CAFÉ DA MANHÃ */}
        <motion.div 
          whileHover={locked ? {} : { y: -2 }}
          className={`bg-white border rounded-3xl p-4 sm:p-6 flex flex-col justify-between transition-all duration-200 shadow-sm ${
            currentRecord.cafe 
              ? 'border-ouro/60 bg-gradient-to-b from-amber-50/40 to-white ring-1 ring-ouro/20' 
              : 'border-gray-200/80 bg-white'
          } ${locked ? 'opacity-90' : ''}`}
        >
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 shadow-xs flex items-center justify-center shrink-0">
                  <Coffee className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-display font-black text-vinho uppercase tracking-wider leading-tight">
                    Café da Manhã
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-gray-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-ouro" />
                    {getMealTimeRange('cafe')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-gray-400">Situação:</span>
              {currentRecord.cafe ? (
                <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Arranchado
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                  <XCircle className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  Sem Rancho
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={locked}
              onClick={() => handleMealToggle('cafe', currentRecord.cafe)}
              className={`w-full py-3.5 px-4 rounded-2xl text-xs font-display font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 min-h-[48px] active:scale-98 cursor-pointer ${
                locked
                  ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                  : currentRecord.cafe
                  ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 shadow-xs'
                  : 'bg-vinho hover:bg-vinho-escuro text-white border border-ouro/40 shadow-md'
              }`}
            >
              {locked ? (
                <>
                  <Lock className="w-4 h-4 text-gray-400" />
                  <span>Rancho Bloqueado</span>
                </>
              ) : currentRecord.cafe ? (
                <>
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>Desarranchar Café</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-ouro" />
                  <span>Arranchar Café</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* 2. ALMOÇO */}
        <motion.div 
          whileHover={locked ? {} : { y: -2 }}
          className={`bg-white border rounded-3xl p-4 sm:p-6 flex flex-col justify-between transition-all duration-200 shadow-sm ${
            currentRecord.almoco 
              ? 'border-emerald-500/50 bg-gradient-to-b from-emerald-50/40 to-white ring-1 ring-emerald-500/20' 
              : 'border-gray-200/80 bg-white'
          } ${locked ? 'opacity-90' : ''}`}
        >
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-xs flex items-center justify-center shrink-0">
                  <Utensils className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-display font-black text-vinho uppercase tracking-wider leading-tight">
                    Almoço
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-gray-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    {getMealTimeRange('almoco')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-gray-400">Situação:</span>
              {currentRecord.almoco ? (
                <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Arranchado
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                  <XCircle className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  Sem Rancho
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={locked}
              onClick={() => handleMealToggle('almoco', currentRecord.almoco)}
              className={`w-full py-3.5 px-4 rounded-2xl text-xs font-display font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 min-h-[48px] active:scale-98 cursor-pointer ${
                locked
                  ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                  : currentRecord.almoco
                  ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 shadow-xs'
                  : 'bg-vinho hover:bg-vinho-escuro text-white border border-ouro/40 shadow-md'
              }`}
            >
              {locked ? (
                <>
                  <Lock className="w-4 h-4 text-gray-400" />
                  <span>Rancho Bloqueado</span>
                </>
              ) : currentRecord.almoco ? (
                <>
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>Desarranchar Almoço</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-ouro" />
                  <span>Arranchar Almoço</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* 3. JANTAR */}
        <motion.div 
          whileHover={locked ? {} : { y: -2 }}
          className={`bg-white border rounded-3xl p-4 sm:p-6 flex flex-col justify-between transition-all duration-200 shadow-sm ${
            currentRecord.jantar 
              ? 'border-vinho/50 bg-gradient-to-b from-vinho/5 to-white ring-1 ring-vinho/20' 
              : 'border-gray-200/80 bg-white'
          } ${locked ? 'opacity-90' : ''}`}
        >
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-vinho/10 border border-vinho/20 text-vinho shadow-xs flex items-center justify-center shrink-0">
                  <Moon className="w-6 h-6 text-ouro" />
                </div>
                <div>
                  <h4 className="text-base font-display font-black text-vinho uppercase tracking-wider leading-tight">
                    Jantar
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-gray-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-vinho" />
                    {getMealTimeRange('jantar')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-gray-400">Situação:</span>
              {currentRecord.jantar ? (
                <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Arranchado
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                  <XCircle className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  Sem Rancho
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={locked}
              onClick={() => handleMealToggle('jantar', currentRecord.jantar)}
              className={`w-full py-3.5 px-4 rounded-2xl text-xs font-display font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 min-h-[48px] active:scale-98 cursor-pointer ${
                locked
                  ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                  : currentRecord.jantar
                  ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 shadow-xs'
                  : 'bg-vinho hover:bg-vinho-escuro text-white border border-ouro/40 shadow-md'
              }`}
            >
              {locked ? (
                <>
                  <Lock className="w-4 h-4 text-gray-400" />
                  <span>Rancho Bloqueado</span>
                </>
              ) : currentRecord.jantar ? (
                <>
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>Desarranchar Jantar</span>
                </>
              ) : (
                <>
                  <Utensils className="w-4 h-4 text-ouro" />
                  <span>Arranchar Jantar</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

      </div>

    </div>
  );
}
