import React, { useEffect } from 'react';
import { FirebaseUser } from '../types';
import { formatMilitaryName } from '../utils/storage';
import arranchaLogo from '../assets/logo-brand-v7.png';
import {
  Home,
  Coffee,
  History,
  QrCode,
  BookOpen,
  Users,
  KeyRound,
  LogOut,
  X,
  Award,
  Shield,
  Building,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type ActiveTabType = 'inicio' | 'arranchamento' | 'historico' | 'qrcode' | 'usuarios' | 'furriel' | 'senha';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser;
  activeTab: ActiveTabType;
  onSelectTab: (tab: ActiveTabType) => void;
  onLogout: () => void;
}

export default function MobileDrawer({
  isOpen,
  onClose,
  currentUser,
  activeTab,
  onSelectTab,
  onLogout
}: MobileDrawerProps) {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const isMilitar = currentUser.nivel === 'Militar';
  const isFurriel = currentUser.nivel === 'Furriel';
  const isAdmin = currentUser.nivel === 'Administrador';

  const isTabAllowed = (tab: ActiveTabType) => {
    if (isMilitar) {
      return ['inicio', 'arranchamento', 'historico', 'qrcode', 'senha'].includes(tab);
    }
    if (isFurriel) {
      return ['inicio', 'arranchamento', 'historico', 'qrcode', 'furriel', 'senha'].includes(tab);
    }
    return ['inicio', 'arranchamento', 'historico', 'qrcode', 'furriel', 'usuarios', 'senha'].includes(tab);
  };

  const handleItemClick = (tab: ActiveTabType) => {
    onSelectTab(tab);
    onClose();
  };

  const handleLogoutClick = () => {
    onClose();
    onLogout();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop overlay with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Drawer sheet sliding from left */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-[85%] max-w-[320px] h-[100dvh] bg-vinho-escuro text-white flex flex-col justify-between shadow-2xl border-r border-ouro/25 z-10 select-none overflow-hidden"
          >
            {/* Top Brand Header & Close Button */}
            <div className="pt-safe px-5 py-4 bg-vinho border-b border-ouro/20 flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border-2 border-ouro flex items-center justify-center p-0.5 shrink-0 overflow-hidden shadow-sm">
                  <img src={arranchaLogo} alt="ARRANCHA+" className="w-full h-full object-cover rounded-lg" />
                </div>
                <div>
                  <span className="text-base font-display font-black tracking-tight block text-white">
                    ARRANCHA<span className="text-ouro">+</span>
                  </span>
                  <span className="text-[9px] text-ouro font-display font-bold tracking-wider block leading-none uppercase mt-0.5">
                    7º RC Mec
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white/90 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Fechar Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Card */}
            <div className="p-4 bg-black/20 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-ouro/30 to-ouro/10 border border-ouro/40 flex items-center justify-center text-ouro font-display font-black text-sm shadow-inner shrink-0">
                  {currentUser.graduacao.substring(0, 3).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-display font-black text-white truncate">
                    {formatMilitaryName(currentUser.usuario, currentUser.graduacao)}
                  </p>
                  <p className="text-[10px] text-white/70 font-semibold truncate flex items-center gap-1 mt-0.5">
                    <Building className="w-3 h-3 text-ouro shrink-0" />
                    <span>{currentUser.reparticao}</span>
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-white/10">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-lg text-[9px] font-bold text-ouro uppercase tracking-wider">
                  <Award className="w-3 h-3 text-ouro shrink-0" />
                  <span>{currentUser.nivel}</span>
                </div>
                {currentUser.nuc && (
                  <span className="text-[9px] font-mono text-white/60 font-medium">
                    NUC: {currentUser.nuc}
                  </span>
                )}
              </div>
            </div>

            {/* Navigation Menu List */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 overflow-touch">
              <span className="px-3 text-[9px] font-black uppercase text-ouro/80 tracking-widest block mb-2">
                Navegação Principal
              </span>

              {/* Início */}
              {isTabAllowed('inicio') && (
                <button
                  type="button"
                  onClick={() => handleItemClick('inicio')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer min-h-[46px] ${
                    activeTab === 'inicio'
                      ? 'bg-vinho text-ouro shadow-md border-l-4 border-ouro font-black'
                      : 'text-white/85 hover:bg-white/10 active:bg-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Home className={`w-4.5 h-4.5 ${activeTab === 'inicio' ? 'text-ouro' : 'text-white/70'}`} />
                    <span>Início</span>
                  </div>
                  {activeTab === 'inicio' && <ChevronRight className="w-4 h-4 text-ouro" />}
                </button>
              )}

              {/* Arranchamento */}
              {isTabAllowed('arranchamento') && (
                <button
                  type="button"
                  onClick={() => handleItemClick('arranchamento')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer min-h-[46px] ${
                    activeTab === 'arranchamento'
                      ? 'bg-vinho text-ouro shadow-md border-l-4 border-ouro font-black'
                      : 'text-white/85 hover:bg-white/10 active:bg-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Coffee className={`w-4.5 h-4.5 ${activeTab === 'arranchamento' ? 'text-ouro' : 'text-white/70'}`} />
                    <span>Arranchamento</span>
                  </div>
                  {activeTab === 'arranchamento' && <ChevronRight className="w-4 h-4 text-ouro" />}
                </button>
              )}

              {/* Histórico */}
              {isTabAllowed('historico') && (
                <button
                  type="button"
                  onClick={() => handleItemClick('historico')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer min-h-[46px] ${
                    activeTab === 'historico'
                      ? 'bg-vinho text-ouro shadow-md border-l-4 border-ouro font-black'
                      : 'text-white/85 hover:bg-white/10 active:bg-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <History className={`w-4.5 h-4.5 ${activeTab === 'historico' ? 'text-ouro' : 'text-white/70'}`} />
                    <span>Histórico</span>
                  </div>
                  {activeTab === 'historico' && <ChevronRight className="w-4 h-4 text-ouro" />}
                </button>
              )}

              {/* QR Code */}
              {isTabAllowed('qrcode') && (
                <button
                  type="button"
                  onClick={() => handleItemClick('qrcode')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer min-h-[46px] ${
                    activeTab === 'qrcode'
                      ? 'bg-vinho text-ouro shadow-md border-l-4 border-ouro font-black'
                      : 'text-white/85 hover:bg-white/10 active:bg-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <QrCode className={`w-4.5 h-4.5 ${activeTab === 'qrcode' ? 'text-ouro' : 'text-white/70'}`} />
                    <span>QR Code</span>
                  </div>
                  {activeTab === 'qrcode' && <ChevronRight className="w-4 h-4 text-ouro" />}
                </button>
              )}

              {/* Seção de Gestão (Furriel / Admin) */}
              {(isFurriel || isAdmin) && (
                <div className="pt-3 pb-1">
                  <span className="px-3 text-[9px] font-black uppercase text-ouro/80 tracking-widest block mb-2">
                    Controle & Gestão
                  </span>
                </div>
              )}

              {/* Furriel */}
              {isTabAllowed('furriel') && (
                <button
                  type="button"
                  onClick={() => handleItemClick('furriel')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer min-h-[46px] ${
                    activeTab === 'furriel'
                      ? 'bg-vinho text-ouro shadow-md border-l-4 border-ouro font-black'
                      : 'text-white/85 hover:bg-white/10 active:bg-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className={`w-4.5 h-4.5 ${activeTab === 'furriel' ? 'text-ouro' : 'text-white/70'}`} />
                    <span>Painel Furriel</span>
                  </div>
                  {activeTab === 'furriel' && <ChevronRight className="w-4 h-4 text-ouro" />}
                </button>
              )}

              {/* Usuários / Admin */}
              {isTabAllowed('usuarios') && (
                <button
                  type="button"
                  onClick={() => handleItemClick('usuarios')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer min-h-[46px] ${
                    activeTab === 'usuarios'
                      ? 'bg-vinho text-ouro shadow-md border-l-4 border-ouro font-black'
                      : 'text-white/85 hover:bg-white/10 active:bg-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Shield className={`w-4.5 h-4.5 ${activeTab === 'usuarios' ? 'text-ouro' : 'text-white/70'}`} />
                    <span>Administração</span>
                  </div>
                  {activeTab === 'usuarios' && <ChevronRight className="w-4 h-4 text-ouro" />}
                </button>
              )}

              {/* Configurações de Conta */}
              <div className="pt-3 pb-1">
                <span className="px-3 text-[9px] font-black uppercase text-ouro/80 tracking-widest block mb-2">
                  Segurança & Conta
                </span>
              </div>

              {/* Alterar Senha */}
              {isTabAllowed('senha') && (
                <button
                  type="button"
                  onClick={() => handleItemClick('senha')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer min-h-[46px] ${
                    activeTab === 'senha'
                      ? 'bg-vinho text-ouro shadow-md border-l-4 border-ouro font-black'
                      : 'text-white/85 hover:bg-white/10 active:bg-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <KeyRound className={`w-4.5 h-4.5 ${activeTab === 'senha' ? 'text-ouro' : 'text-white/70'}`} />
                    <span>Alterar Senha</span>
                  </div>
                  {activeTab === 'senha' && <ChevronRight className="w-4 h-4 text-ouro" />}
                </button>
              )}
            </div>

            {/* Bottom Footer & Logout Action */}
            <div className="pb-safe p-4 border-t border-white/10 bg-black/25 shrink-0 space-y-2">
              <button
                type="button"
                onClick={handleLogoutClick}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-red-900/40 hover:bg-red-800/60 active:bg-red-900 border border-red-500/30 rounded-2xl text-xs font-display font-black uppercase tracking-wider text-red-200 hover:text-white transition-all cursor-pointer min-h-[46px]"
              >
                <LogOut className="w-4 h-4 text-red-300" />
                <span>Sair do Sistema</span>
              </button>

              <div className="text-center pt-1">
                <p className="text-[9px] text-white/40 font-mono">
                  ARRANCHA+ 2.0 • 7º RC Mec
                </p>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
