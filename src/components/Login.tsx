import React, { useState, useEffect } from 'react';
import { FirebaseUser } from '../types';
import arranchaLogo from '../assets/arrancha-plus-logo.png';
import { motion, AnimatePresence } from 'motion/react';
import {
  CalendarCheck, Check, ChevronRight, ClipboardCheck, Copy,
  ExternalLink, Eye, EyeOff, Lock, QrCode, Shield, User,
  Utensils, X
} from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: FirebaseUser) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [splashActive, setSplashActive] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const siteUrl = window.location.origin;

  useEffect(() => {
    if (!splashActive) return;

    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = isReducedMotion ? 400 : 2200;

    const timer = setTimeout(() => {
      setSplashActive(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [splashActive]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(siteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (_err) {
      // fallback if clipboard fails
    }
  };

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!usuario.trim() || !senha) {
      setError('Informe o login de acesso e a senha.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: usuario.trim(), senha })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(result.error || 'Não foi possível entrar. Confira os dados.');
        return;
      }
      onLoginSuccess(result as FirebaseUser);
    } catch (_error) {
      setError('Sem conexão com o servidor. Confira a internet e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-marfim font-sans relative overflow-x-hidden selection:bg-vinho/10 flex flex-col justify-between">
      {/* Dynamic Fullscreen Splash Overlay */}
      <AnimatePresence>
        {splashActive && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-vinho-escuro via-vinho to-vinho-escuro text-white select-none overflow-hidden"
          >
            {/* Background ambient gold aura */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(201,162,39,0.18),transparent_65%)] pointer-events-none" />
            
            <div className="relative flex flex-col items-center z-10 px-6 text-center">
              {/* Logo with fade, gentle scale, and gold outline reveal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative mb-6"
              >
                <div className="absolute inset-0 rounded-[30%] bg-ouro/25 blur-2xl scale-105" />
                <img
                  src="/arrancha-plus-logo.png?v=20260813-fix2"
                  alt="7º RC Mec - ARRANCHA+"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = '/arrancha-icon-512.png?v=20260813-fix2';
                  }}
                  className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-[28%] object-cover shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-white"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1.05 }}
                  transition={{ delay: 0.35, duration: 0.75, ease: 'easeOut' }}
                  className="absolute -inset-3.5 rounded-[32%] border-2 border-ouro shadow-[0_0_20px_rgba(201,162,39,0.45)]"
                />
              </motion.div>

              {/* Text reveal below logo */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.7, ease: 'easeOut' }}
                className="space-y-2"
              >
                <h1 className="text-4xl sm:text-5xl font-display font-black tracking-[-0.04em] text-white">
                  ARRANCHA<span className="text-ouro">+</span>
                </h1>
                
                <div className="flex items-center justify-center gap-2 pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-ouro" />
                  <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.16em] text-marfim-escuro/90">
                    7º Regimento de Cavalaria Mecanizado
                  </p>
                  <span className="w-1.5 h-1.5 rounded-full bg-ouro" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Fullscreen / Responsive Container */}
      <div className="relative z-10 w-full min-h-[100dvh] flex flex-col justify-between pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] px-3 sm:px-6 lg:px-10">
        
        {/* Subtle background ambient decorations */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(122,12,12,0.05),transparent_35%),radial-gradient(circle_at_90%_85%,rgba(201,162,39,0.08),transparent_35%)] pointer-events-none" />

        {/* Top Institutional Header */}
        <header className="relative z-10 w-full max-w-7xl mx-auto py-3 px-2 flex items-center justify-between border-b border-vinho/10 mb-4 sm:mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={arranchaLogo}
              alt="ARRANCHA+"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover border-2 border-ouro/40 shadow-xs"
            />
            <div>
              <span className="font-display font-black text-sm uppercase tracking-wider text-vinho block leading-none">
                ARRANCHA<span className="text-ouro">+</span>
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-oliva-escuro uppercase tracking-widest block mt-0.5">
                7º Regimento de Cavalaria Mecanizado
              </span>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-oliva/10 border border-oliva/20 text-oliva-escuro text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-xs">
            <Shield className="w-3.5 h-3.5 text-oliva" /> Exército Brasileiro
          </span>
        </header>

        {/* Central Content Area (Desktop 2 cols / Mobile 1 col) */}
        <main className="relative z-10 max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center my-auto py-2 sm:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-stretch my-auto">
            
            {/* Left Institutional Identity Panel (DESKTOP ONLY: hidden on mobile) */}
            <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-vinho-escuro via-vinho to-vinho-escuro text-white p-8 lg:p-10 rounded-[2.2rem] border-2 border-ouro/40 shadow-2xl relative overflow-hidden flex-col justify-between">
              <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full border-[30px] border-ouro/10 pointer-events-none" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-ouro/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <img
                    src={arranchaLogo}
                    alt="ARRANCHA+"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-ouro shadow-md"
                  />
                  <div>
                    <span className="px-3 py-1 rounded-full bg-ouro/20 border border-ouro/40 text-ouro text-[10px] font-black uppercase tracking-widest inline-block">
                      7º RC Mec
                    </span>
                    <h2 className="text-2xl font-display font-black tracking-tight text-white mt-1">
                      ARRANCHA+
                    </h2>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <p className="text-xs font-bold text-ouro uppercase tracking-widest flex items-center gap-2">
                    <Shield className="w-4 h-4 text-ouro" />
                    Planejamento simples. Efetivo conferido.
                  </p>
                  <h3 className="text-2xl lg:text-3xl font-display font-black text-white leading-tight">
                    Sistema de Arranchamento do Rancho
                  </h3>
                  <p className="text-xs lg:text-sm text-marfim-escuro/85 font-medium leading-relaxed pt-1">
                    Plataforma oficial para controle de presença, reservas de refeições e conferência de efetivo do Regimento.
                  </p>
                </div>

                <div className="pt-4 space-y-3.5 border-t border-white/15">
                  {[
                    { icon: CalendarCheck, title: 'Arranchamento Antecipado', desc: 'Previsibilidade para o rancho e redução do desperdício.' },
                    { icon: Utensils, title: 'Refeições Diárias', desc: 'Controle de café, almoço e jantar por escadronamento.' },
                    { icon: ClipboardCheck, title: 'Comprovação & Vale', desc: 'Emissão de comprovante e conferência por Furriel.' }
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-3 bg-white/10 p-3.5 rounded-2xl border border-white/10 backdrop-blur-xs">
                      <Icon className="w-5 h-5 text-ouro shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">{title}</h4>
                        <p className="text-[11px] text-marfim-escuro/80 leading-snug mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 pt-6 mt-6 border-t border-white/15 flex items-center justify-between text-[11px] text-marfim-escuro/70 font-semibold">
                <span>Exército Brasileiro</span>
                <span className="text-ouro font-mono font-bold">7º RC Mec</span>
              </div>
            </div>

            {/* Right Login Form Panel (Desktop 7 cols / Mobile 12 cols, 100% width) */}
            <div className="lg:col-span-7 bg-white border-2 border-ouro/30 rounded-[2rem] sm:rounded-[2.2rem] shadow-xl p-5 sm:p-8 lg:p-12 flex flex-col justify-center relative w-full">
              
              {/* Form Top Logo & Title */}
              <div className="mb-6">
                <div className="flex items-center gap-3.5 mb-4">
                  <img
                    src={arranchaLogo}
                    alt="ARRANCHA+"
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-ouro/40 shadow-xs shrink-0"
                  />
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-grafite leading-none">
                      ARRANCHA<span className="text-vinho">+</span>
                    </h1>
                    <p className="text-[11px] sm:text-xs font-bold text-oliva-escuro uppercase tracking-widest mt-1">
                      7º Regimento de Cavalaria Mecanizado
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-vinho/10">
                  <h2 className="text-xl sm:text-2xl font-display font-black text-vinho uppercase tracking-tight">
                    Acesso ao sistema
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-grafite-suave font-medium">
                    Entre com seu login único ou NUC para acessar o painel.
                  </p>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 p-3.5 sm:p-4 bg-red-50 border-2 border-red-200 border-l-4 border-l-vinho text-red-950 text-xs sm:text-sm rounded-2xl font-bold flex items-start gap-3 shadow-xs"
                >
                  <X className="w-4 h-4 text-vinho shrink-0 mt-0.5" />
                  <div>{error}</div>
                </motion.div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-5 sm:space-y-6">
                <div>
                  <label htmlFor="input-usuario" className="block text-xs font-black text-vinho uppercase tracking-widest mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-vinho" /> Login de acesso
                  </label>
                  <input
                    id="input-usuario"
                    type="text"
                    autoComplete="username"
                    required
                    value={usuario}
                    onChange={event => setUsuario(event.target.value)}
                    placeholder="Login único ou NUC"
                    className="w-full min-h-[52px] bg-marfim-claro border-2 border-vinho/20 focus:border-vinho rounded-2xl px-4 py-3.5 text-base text-grafite placeholder-grafite/40 focus:outline-none focus:ring-4 focus:ring-vinho/10 transition-all font-semibold shadow-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="input-senha" className="text-xs font-black text-vinho uppercase tracking-widest flex items-center gap-2">
                      <Lock className="w-4 h-4 text-vinho" /> Senha
                    </label>
                    <button
                      type="button"
                      onClick={() => alert('Contate o Administrador para redefinir sua senha.')}
                      className="text-xs font-bold text-vinho hover:text-vinho-escuro hover:underline cursor-pointer py-1"
                    >
                      Esqueceu?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="input-senha"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={senha}
                      onChange={event => setSenha(event.target.value)}
                      placeholder="Digite sua senha"
                      className="w-full min-h-[52px] bg-marfim-claro border-2 border-vinho/20 focus:border-vinho rounded-2xl pl-4 pr-12 py-3.5 text-base text-grafite placeholder-grafite/40 focus:outline-none focus:ring-4 focus:ring-vinho/10 transition-all font-mono shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(value => !value)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-vinho/70 hover:text-vinho p-2 cursor-pointer rounded-xl hover:bg-vinho/5"
                      aria-label="Alternar visibilidade da senha"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  id="btn-entrar"
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[52px] bg-vinho hover:bg-vinho-escuro disabled:opacity-60 text-white font-black py-3.5 px-6 rounded-2xl text-base tracking-wider transition-all shadow-lg flex items-center justify-center gap-2.5 uppercase cursor-pointer border border-ouro/30 active:scale-[0.98]"
                >
                  {loading ? 'Conectando...' : 'ENTRAR NO SISTEMA'}
                  {!loading && <ChevronRight className="w-5 h-5 text-ouro" />}
                </button>
              </form>

              {/* Admin Note */}
              <div className="mt-5 bg-oliva/10 border border-oliva/20 rounded-2xl p-3.5 sm:p-4">
                <p className="text-xs text-oliva-escuro font-bold flex items-center justify-center gap-2 text-center">
                  <Shield className="w-4 h-4 text-oliva shrink-0" />
                  Novos acessos são cadastrados exclusivamente pelo Administrador.
                </p>
              </div>

              {/* QR Code Trigger Button */}
              <button
                type="button"
                onClick={() => setShowQRModal(true)}
                className="mt-3.5 w-full min-h-[48px] text-xs sm:text-sm bg-white border-2 border-oliva/30 text-oliva hover:bg-oliva/5 font-black py-3 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 uppercase shadow-xs cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-oliva" /> QR Code do site
              </button>

            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 w-full max-w-7xl mx-auto py-3 text-center text-[11px] text-grafite-suave/80 font-medium border-t border-vinho/10 mt-4 shrink-0">
          7º RC Mec — Sistema de Arranchamento Inteligente &amp; Controle de Efetivo
        </footer>
      </div>

      {/* QR Code Modal Popup */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-grafite/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.94, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 16 }}
              className="w-full max-w-[calc(100vw-2rem)] sm:max-w-sm bg-marfim-claro border-2 border-ouro/30 rounded-[2rem] p-5 sm:p-6 text-center shadow-2xl relative my-auto"
            >
              <button
                type="button"
                onClick={() => setShowQRModal(false)}
                className="absolute right-4 top-4 w-9 h-9 rounded-full bg-vinho/5 text-vinho flex items-center justify-center cursor-pointer hover:bg-vinho/10"
              >
                <X className="w-4 h-4" />
              </button>
              
              <h3 className="text-lg sm:text-xl font-display font-black text-grafite">Acesso pelo celular</h3>
              <p className="text-xs text-grafite-suave mt-1 font-medium">Aponte a câmera para o código abaixo.</p>
              
              <div className="mt-4 sm:mt-5 mx-auto bg-white p-3.5 rounded-2xl border border-ouro/30 shadow-xs w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&color=7a0c0c&data=${encodeURIComponent(siteUrl)}`}
                  alt="QR Code ARRANCHA+"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="mt-4 sm:mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="flex-1 bg-marfim-escuro border border-vinho/20 text-vinho rounded-xl py-3 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-marfim-escuro/80 transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-oliva" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiado' : 'Copiar link'}
                </button>
                <a
                  href={siteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-vinho text-white rounded-xl py-3 text-xs font-bold flex items-center justify-center gap-1.5 border border-ouro/30 hover:bg-vinho-escuro transition-all"
                >
                  <ExternalLink className="w-4 h-4 text-ouro" />
                  Abrir site
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
