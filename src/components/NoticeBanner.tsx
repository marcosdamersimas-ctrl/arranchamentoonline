import React, { useState } from 'react';
import { Clock, X, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function NoticeBanner() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gradient-to-r from-vinho to-vinho-escuro text-white rounded-2xl p-3.5 sm:p-4 shadow-lg border-2 border-ouro/40 relative overflow-hidden font-sans mb-4 sm:mb-6"
      >
        {/* Background emblem accent */}
        <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
          <ShieldAlert className="w-28 sm:w-32 h-28 sm:h-32 text-ouro" />
        </div>

        <div className="flex items-start justify-between gap-2.5 sm:gap-3 relative z-10">
          <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-ouro/20 border border-ouro/40 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-ouro animate-pulse" />
            </div>

            <div className="space-y-1 sm:space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[9px] sm:text-[10px] font-display font-black uppercase text-ouro tracking-wider bg-black/40 px-2 py-0.5 rounded border border-ouro/30">
                  Aviso
                </span>
                <h4 className="text-xs sm:text-sm font-display font-bold uppercase tracking-tight text-white leading-snug">
                  Prazos Limite para Arranchamento
                </h4>
              </div>

              <div className="text-[11px] sm:text-xs text-gray-200 font-medium leading-relaxed space-y-1">
                <p>
                  • <strong className="text-ouro font-bold">Terça a Sexta-feira:</strong> Até às <strong className="text-white font-bold bg-white/10 px-1.5 py-0.5 rounded">15:30h do dia anterior</strong>.
                </p>
                <p>
                  • <strong className="text-ouro font-bold">Sáb, Dom e Segunda:</strong> Até <strong className="text-white font-bold bg-white/10 px-1.5 py-0.5 rounded">Sexta-feira às 10:30h</strong>.
                </p>
                <p className="text-[10px] sm:text-[11px] text-gray-300 italic pt-0.5">
                  * Horário oficial de Brasília.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-gray-300 hover:text-white transition-colors cursor-pointer shrink-0 border border-white/10 focus:outline-none"
            title="Fechar aviso"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-ouro" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
