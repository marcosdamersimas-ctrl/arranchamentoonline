import React, { useState } from 'react';
import { FirebaseUser } from '../types';
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
  const [showLogin, setShowLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const siteUrl = window.location.origin;

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(siteUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
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
    <div className="min-h-screen bg-[#fff9f3] font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(196,20,46,0.12),transparent_27%),radial-gradient(circle_at_84%_80%,rgba(212,170,55,0.16),transparent_28%),linear-gradient(135deg,#fff7f4_0%,#fffdf7_48%,#fff2da_100%)]" />
      <div className="absolute -left-16 top-16 w-52 h-52 rounded-full border-[30px] border-vinho/5" />
      <div className="absolute right-[8%] top-[13%] w-16 h-16 rounded-full bg-ouro/12" />
      <div className="absolute right-[13%] bottom-[9%] w-40 h-40 rounded-full border border-vinho/10" />

      <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 min-h-screen flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-4xl text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="relative mb-5"
          >
            <div className="absolute inset-0 rounded-[30%] bg-ouro/25 blur-3xl scale-110" />
            <img src="/arrancha-plus-logo.png?v=6" alt="Símbolo ARRANCHA+" className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-[29%] object-cover shadow-[0_24px_70px_rgba(105,8,18,0.28)] border-4 border-white" />
            <motion.span animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }} className="absolute -inset-3 rounded-[32%] border border-ouro/45" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-vinho/10 text-vinho text-[10px] sm:text-xs font-black uppercase tracking-[0.18em] shadow-sm">
              <Shield className="w-3.5 h-3.5 text-ouro" /> 7º Regimento de Cavalaria Mecanizado
            </span>
            <p className="mt-6 text-xs sm:text-sm font-bold text-vinho/65">Planejamento simples. Efetivo conferido.</p>
            <h1 className="mt-2 text-5xl sm:text-7xl font-display font-black tracking-[-0.06em] text-[#42151b] leading-none">
              ARRANCHA<span className="text-vinho">+</span>
            </h1>
            <p className="max-w-2xl mx-auto mt-5 text-sm sm:text-lg text-[#694c50] leading-relaxed">
              Escolha suas refeições, respeite os prazos e ajude o rancho a preparar o quantitativo certo para cada dia.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42, duration: 0.6 }} className="mt-8">
            <button type="button" onClick={() => setShowLogin(true)} className="group min-w-[250px] bg-vinho hover:bg-vinho-escuro text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-[0_18px_40px_rgba(122,12,12,0.24)] transition-all hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-3">
              Entrar no arranchamento
              <ChevronRight className="w-5 h-5 text-ouro group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-10 grid grid-cols-3 gap-3 sm:gap-5 w-full max-w-xl">
            {[
              { icon: CalendarCheck, text: 'Até 7 dias' },
              { icon: Utensils, text: '3 refeições' },
              { icon: ClipboardCheck, text: 'Vale diário' }
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="bg-white/65 border border-white rounded-2xl px-2 py-3 text-[10px] sm:text-xs font-bold text-[#6b4b50] shadow-sm backdrop-blur-md flex flex-col sm:flex-row items-center justify-center gap-2">
                <Icon className="w-4 h-4 text-vinho" /> {text}
              </div>
            ))}
          </motion.div>
        </div>
      </motion.main>

      <AnimatePresence>
        {showLogin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-[#2b080d]/55 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.section
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ type: 'spring', damping: 24, stiffness: 240 }}
              className="w-full max-w-md relative bg-[#fffaf5] rounded-[2rem] shadow-2xl border border-white p-6 sm:p-8 my-auto"
            >
              <button type="button" onClick={() => { setShowLogin(false); setError(''); }} className="absolute right-5 top-5 w-10 h-10 rounded-full bg-vinho/5 hover:bg-vinho/10 text-vinho/60 flex items-center justify-center" aria-label="Fechar login">
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-7">
                <img src="/arrancha-plus-logo.png?v=6" alt="ARRANCHA+" className="w-20 h-20 mx-auto rounded-3xl object-cover shadow-xl border-2 border-white" />
                <h2 className="mt-4 text-3xl font-display font-black tracking-tight text-[#42151b]">Acesso ao sistema</h2>
                <p className="mt-1 text-xs text-[#795c60]">Entre com seu login único ou NUC.</p>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-5 p-3.5 bg-red-50 border border-red-100 border-l-4 border-l-vinho text-red-800 text-xs rounded-xl font-semibold">
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <label htmlFor="input-usuario" className="block text-[11px] font-black text-vinho/70 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-vinho" /> Login de acesso
                  </label>
                  <input id="input-usuario" type="text" autoComplete="username" required value={usuario} onChange={event => setUsuario(event.target.value)} placeholder="Login único ou NUC" className="w-full bg-white border border-vinho/15 focus:border-vinho rounded-xl px-4 py-3.5 text-sm text-[#42151b] placeholder-vinho/30 focus:outline-none focus:ring-4 focus:ring-vinho/5 transition-all font-semibold shadow-sm" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="input-senha" className="text-[11px] font-black text-vinho/70 uppercase tracking-widest flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-vinho" /> Senha
                    </label>
                    <button type="button" onClick={() => alert('Contate o Administrador para redefinir sua senha.')} className="text-[10px] font-bold text-vinho/60 hover:text-vinho hover:underline">Esqueceu?</button>
                  </div>
                  <div className="relative">
                    <input id="input-senha" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={senha} onChange={event => setSenha(event.target.value)} placeholder="Digite sua senha" className="w-full bg-white border border-vinho/15 focus:border-vinho rounded-xl pl-4 pr-12 py-3.5 text-sm text-[#42151b] placeholder-vinho/30 focus:outline-none focus:ring-4 focus:ring-vinho/5 transition-all font-mono shadow-sm" />
                    <button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-vinho/45 hover:text-vinho p-1">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button id="btn-entrar" type="submit" disabled={loading} className="w-full bg-vinho hover:bg-vinho-escuro disabled:opacity-60 text-white font-black py-4 px-6 rounded-xl text-sm tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 uppercase">
                  {loading ? 'Conectando...' : 'Entrar no sistema'}
                  {!loading && <ChevronRight className="w-4 h-4 text-ouro" />}
                </button>
              </form>

              <div className="mt-5 bg-vinho/5 border border-vinho/10 rounded-xl p-3 text-center">
                <p className="text-[11px] text-[#6b4b50] font-semibold">
                  <Shield className="w-3.5 h-3.5 text-ouro inline-block mr-1.5 -mt-0.5" />
                  Novos acessos são cadastrados exclusivamente pelo Administrador.
                </p>
              </div>

              <button type="button" onClick={() => setShowQRModal(true)} className="mt-3 w-full text-xs bg-white border border-vinho/15 text-vinho hover:bg-vinho/5 font-black py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 uppercase shadow-sm">
                <QrCode className="w-4 h-4" /> QR Code do site
              </button>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showQRModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 16 }} className="w-full max-w-sm bg-[#fffaf5] rounded-[2rem] p-6 text-center shadow-2xl relative">
              <button type="button" onClick={() => setShowQRModal(false)} className="absolute right-4 top-4 w-9 h-9 rounded-full bg-vinho/5 text-vinho/60 flex items-center justify-center"><X className="w-4 h-4" /></button>
              <h3 className="text-xl font-display font-black text-[#42151b]">Acesso pelo celular</h3>
              <p className="text-xs text-[#795c60] mt-1">Aponte a câmera para o código.</p>
              <div className="mt-5 mx-auto bg-white p-4 rounded-2xl border border-vinho/10 shadow-sm w-56 h-56">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&color=5f0914&data=${encodeURIComponent(siteUrl)}`} alt="QR Code ARRANCHA+" className="w-full h-full" />
              </div>
              <div className="mt-5 flex gap-2">
                <button type="button" onClick={handleCopyUrl} className="flex-1 bg-vinho/5 border border-vinho/10 text-vinho rounded-xl py-3 text-xs font-bold flex items-center justify-center gap-2">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? 'Copiado' : 'Copiar link'}
                </button>
                <a href={siteUrl} target="_blank" rel="noreferrer" className="flex-1 bg-vinho text-white rounded-xl py-3 text-xs font-bold flex items-center justify-center gap-2">
                  <ExternalLink className="w-4 h-4 text-ouro" /> Abrir site
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
