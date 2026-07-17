import React, { useState } from 'react';
import { FirebaseUser, UserNivel } from '../types';
import { Shield, User, Lock, ChevronRight, HelpCircle, UserPlus, ArrowLeft, Eye, EyeOff, Sparkles, Building, QrCode, Copy, ExternalLink, Globe, Settings, Check, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cleanTextId } from '../utils/storage';

interface LoginProps {
  onLoginSuccess: (user: FirebaseUser) => void;
  users: FirebaseUser[];
  onRegisterUser: (newUser: FirebaseUser) => void;
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

export default function Login({ onLoginSuccess, users, onRegisterUser }: LoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // QR Code generator states
  const [showQRModal, setShowQRModal] = useState(false);
  const [siteUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.origin + window.location.pathname;
    }
    return 'https://ais-pre-45rpnwcobofcpdedbbd4ag-537545037284.us-west2.run.app/';
  });
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(siteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Login fields
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');

  // Register fields
  const [regUsuario, setRegUsuario] = useState('');
  const [regReparticao, setRegReparticao] = useState(REPARTICOES[0]);
  const [regSenha, setRegSenha] = useState('');
  const [regSenhaConfirm, setRegSenhaConfirm] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!usuario.trim() || !senha.trim()) {
      setError('Por favor, informe o usuário e a senha.');
      return;
    }

    // Try finding the user by Guerra name (normalized)
    const normalizedInput = cleanTextId(usuario);
    const foundUser = users.find(u => cleanTextId(u.usuario) === normalizedInput);

    if (!foundUser) {
      setError('Militar não encontrado. Se este é o seu primeiro acesso, clique em "Criar Primeiro Acesso" abaixo.');
      return;
    }

    if (foundUser.senha !== senha) {
      setError('Senha incorreta. Verifique e tente novamente.');
      return;
    }

    // Login successful
    onLoginSuccess(foundUser);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!regUsuario.trim() || !regSenha.trim()) {
      setError('Preencha todos os campos para realizar o cadastro.');
      return;
    }

    if (regSenha !== regSenhaConfirm) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    const normalizedInput = cleanTextId(regUsuario);
    if (users.some(u => cleanTextId(u.usuario) === normalizedInput)) {
      setError('Este nome de guerra já está cadastrado no sistema.');
      return;
    }

    // Determine default role: 'Militar'
    // REGRA MASTER ABSOLUTA: Se tiver 'simas' em qualquer lugar do nome, ganha Admin!
    let finalNivel: UserNivel = 'Militar';
    if (regUsuario.toLowerCase().includes('simas')) {
      finalNivel = 'Administrador';
    }

    const newUser: FirebaseUser = {
      id: normalizedInput,
      usuario: regUsuario.trim(),
      reparticao: regReparticao,
      senha: regSenha,
      nivel: finalNivel
    };

    onRegisterUser(newUser);

    if (finalNivel === 'Administrador') {
      setSuccess('Acesso de Administrador concedido automaticamente pela Regra Master!');
    } else {
      setSuccess(`Acesso criado com sucesso! Nível: Militar.`);
    }

    // Set credentials in login fields
    setUsuario(regUsuario);
    setSenha(regSenha);

    setTimeout(() => {
      setIsRegistering(false);
      setSuccess('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#1d0004] flex items-center justify-center font-sans relative overflow-hidden p-4 md:p-8">
      
      {/* Background Combat Horse Image with Red blend */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <img 
          src="/src/assets/images/combat_horse_head_1784226109177.jpg" 
          alt="7º RC Mec Cavalo de Combate" 
          className="w-full h-full object-cover opacity-45 mix-blend-luminosity brightness-[0.7] contrast-[1.2] animate-fade-in"
          referrerPolicy="no-referrer"
        />
        {/* Rich gradient overlays to blend the image perfectly with dark wine-red edges */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1d0004]/95 via-transparent to-[#1d0004]/85 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#3D0008]/40 via-transparent to-[#3D0008]/85" />
        {/* A balanced symmetrical dark vignette around the center to focus attention on the form */}
        <div className="absolute inset-0 bg-radial-gradient(circle at center, transparent 15%, rgba(29, 0, 4, 0.9) 95%)" />
      </div>

      {/* 7º RC Mec Large Stencil Watermark blended into the background */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-12 z-0 text-white/5 font-display font-black text-5xl sm:text-7xl tracking-widest uppercase select-none pointer-events-none">
        7º RC Mec
      </div>

      {/* Decorative Golden Corner lines on the screen boundaries */}
      <div className="absolute top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-ouro/40 z-10 hidden sm:block pointer-events-none" />
      <div className="absolute bottom-6 right-6 w-16 h-16 border-b-2 border-r-2 border-ouro/40 z-10 hidden sm:block pointer-events-none" />

      {/* Single Unified Centered Form Container - Centered directly on screen, fused with background */}
      <div className="w-full max-w-md relative z-10 flex flex-col justify-center py-6">
        
        <div className="flex flex-col">
          
          {/* Badge & App Branding directly integrated & centered */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="flex flex-col items-center gap-3 mb-2">
              <div className="w-14 h-14 rounded-2xl bg-[#6B0011]/95 flex flex-col items-center justify-center shadow-xl border-2 border-ouro p-1 shrink-0">
                <span className="text-ouro font-display font-black text-xl tracking-tighter leading-none">7º</span>
                <span className="text-[7px] text-white font-bold uppercase tracking-widest mt-0.5">RC Mec</span>
              </div>
              <div>
                <h1 className="text-4xl font-display font-black tracking-tighter text-white leading-none flex items-center justify-center gap-1 drop-shadow-md">
                  ARRANCHA<span className="text-ouro font-black">+</span>
                </h1>
                <p className="text-[10px] text-ouro font-bold tracking-widest uppercase mt-2.5 drop-shadow-sm">
                  Arranchamento Inteligente & Controle de Efetivo
                </p>
              </div>
            </div>
          </div>

          {/* Form Alerts */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-5 p-3.5 bg-red-950/85 border-l-4 border-ouro/70 text-red-100 text-xs rounded-r-xl flex items-center gap-2.5 backdrop-blur-md border border-red-900/35"
              >
                <span className="w-2 h-2 rounded-full bg-ouro shrink-0" />
                <span className="font-semibold drop-shadow-sm">{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-5 p-3.5 bg-emerald-950/85 border-l-4 border-emerald-500 text-emerald-100 text-xs rounded-r-xl flex items-center gap-2.5 backdrop-blur-md border border-emerald-900/35"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-ping" />
                <span className="font-semibold drop-shadow-sm">{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Switch Area */}
          {!isRegistering ? (
            // LOGIN SCREEN
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-200 uppercase tracking-widest mb-2 flex items-center gap-1.5 drop-shadow-sm">
                  <User className="w-4 h-4 text-ouro" />
                  Militar (Nome de Guerra)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ex: Marcos Simas"
                    value={usuario}
                    onChange={e => setUsuario(e.target.value)}
                    className="w-full bg-black/40 hover:bg-black/50 border border-white/20 focus:border-ouro focus:bg-black/60 rounded-xl pl-4 pr-10 py-3.5 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-ouro/30 backdrop-blur-md transition-all font-semibold shadow-inner"
                    id="input-usuario"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ouro text-xs font-mono font-bold uppercase tracking-tighter">7º</span>
                </div>
                <p className="text-[10px] text-gray-300 mt-1.5 drop-shadow-sm font-medium leading-relaxed">
                  Use <span className="text-ouro font-bold">Marcos Simas</span> (Admin) ou <span className="text-ouro font-bold">Carlos Silva</span> (Furriel) para testes rápidos (senha: 123).
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-bold text-gray-200 uppercase tracking-widest flex items-center gap-1.5 drop-shadow-sm">
                    <Lock className="w-4 h-4 text-ouro" />
                    Senha de Acesso
                  </label>
                  <button 
                    type="button" 
                    onClick={() => {
                      setError('');
                      alert('Contate a Seção de TI (S4) / Furriel para redefinição física de credenciais.');
                    }}
                    className="text-[10px] font-semibold text-ouro hover:text-white hover:underline focus:outline-none"
                  >
                    Esqueceu sua senha?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Digite sua senha"
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    className="w-full bg-black/40 hover:bg-black/50 border border-white/20 focus:border-ouro focus:bg-black/60 rounded-xl pl-4 pr-10 py-3.5 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-ouro/30 backdrop-blur-md transition-all font-mono shadow-inner"
                    id="input-senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-ouro p-1 rounded-md transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-vinho hover:bg-vinho-escuro border border-ouro/50 text-white font-display font-black py-4 px-6 rounded-xl text-sm tracking-wider transition-all shadow-lg hover:shadow-vinho/30 flex items-center justify-center gap-2 cursor-pointer uppercase"
                  id="btn-entrar"
                >
                  <span>ENTRAR NO SISTEMA</span>
                  <ChevronRight className="w-4 h-4 text-ouro" />
                </motion.button>
              </div>

              <div className="pt-5 text-center border-t border-white/10 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(true);
                    setError('');
                  }}
                  className="text-xs font-bold text-ouro hover:text-white underline flex items-center justify-center gap-1.5 group self-center focus:outline-none"
                  id="btn-cadastro-link"
                >
                  <UserPlus className="w-4 h-4 transition-transform group-hover:scale-110 text-ouro" />
                  Criar Primeiro Acesso (Auto-Cadastro)
                </button>
                
                {/* QR Code of GitHub Pages link for smartphones */}
                <button
                  type="button"
                  onClick={() => setShowQRModal(true)}
                  className="mt-1 text-xs bg-black/50 border-2 border-ouro/40 text-ouro hover:text-white hover:bg-ouro/25 hover:border-ouro/70 font-display font-black py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer uppercase backdrop-blur-sm shadow-md"
                >
                  <QrCode className="w-4 h-4" />
                  <span>QR CODE DO SITE (CELULAR)</span>
                </button>
              </div>
            </form>
          ) : (
            // FIRST ACCESS / AUTO-REGISTRATION
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(false);
                  setError('');
                }}
                className="text-xs font-bold text-gray-300 hover:text-ouro flex items-center gap-1.5 mb-2 self-start focus:outline-none"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao login
              </button>

              <div className="bg-ouro/10 text-[11px] text-ouro p-3 rounded-xl border border-ouro/30 font-semibold mb-2 backdrop-blur-sm">
                Atenção: Por determinação, novos acessos são criados por padrão com permissões de <span className="underline font-bold">Militar Comum</span> (visão de Arranchamento e Alteração de Senha).
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-200 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 drop-shadow-sm">
                  <User className="w-4 h-4 text-ouro" />
                  Nome de Guerra (Militar)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Soldado Gomes"
                  value={regUsuario}
                  onChange={e => setRegUsuario(e.target.value)}
                  className="w-full bg-black/40 hover:bg-black/50 border border-white/20 focus:border-ouro focus:bg-black/60 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none transition-all font-semibold shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-200 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 drop-shadow-sm">
                  <Building className="w-4 h-4 text-ouro" />
                  Esquadrão / Repartição
                </label>
                <select
                  value={regReparticao}
                  onChange={e => setRegReparticao(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 focus:border-ouro rounded-xl px-3 py-3 text-xs text-white focus:outline-none transition-all font-semibold cursor-pointer shadow-inner"
                >
                  {REPARTICOES.map(r => (
                    <option key={r} value={r} className="bg-vinho-escuro text-white">{r}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-200 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 drop-shadow-sm">
                    <Lock className="w-4 h-4 text-ouro" />
                    Criar Senha
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Senha"
                    value={regSenha}
                    onChange={e => setRegSenha(e.target.value)}
                    className="w-full bg-black/40 hover:bg-black/50 border border-white/20 focus:border-ouro focus:bg-black/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all font-mono shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-200 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 drop-shadow-sm">
                    <Lock className="w-4 h-4 text-ouro" />
                    Confirmar Senha
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Repita"
                    value={regSenhaConfirm}
                    onChange={e => setRegSenhaConfirm(e.target.value)}
                    className="w-full bg-black/40 hover:bg-black/50 border border-white/20 focus:border-ouro focus:bg-black/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all font-mono shadow-inner"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-vinho hover:bg-vinho-escuro border border-ouro/50 text-white font-display font-black py-4 px-4 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-5 uppercase tracking-wider"
              >
                <span>CRIAR ACESSO</span>
                <Sparkles className="w-4 h-4 text-ouro" />
              </motion.button>
            </form>
          )}

          {/* Footer info directly floating on the bottom */}
          <div className="mt-10 text-center flex flex-col items-center gap-3">
            <div className="text-[10px] text-gray-300 font-medium tracking-wide drop-shadow-md leading-relaxed">
              <p>7º Regimento de Cavalaria Mecanizado</p>
              <p className="mt-0.5 text-ouro font-semibold">Sant'Ana do Livramento - RS</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive QR Code Generator Modal Overlay */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#2d0006] border-2 border-ouro/50 rounded-3xl overflow-hidden shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/30">
              <div className="flex items-center gap-2.5">
                <QrCode className="w-5 h-5 text-ouro animate-pulse" />
                <p className="text-white font-display font-black text-xs sm:text-sm uppercase tracking-wider">
                  Acesso Rápido via Smartphone
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  setShowQRModal(false);
                }}
                className="text-gray-400 hover:text-ouro text-xs font-bold uppercase transition-colors cursor-pointer focus:outline-none"
              >
                Fechar
              </button>
            </div>

            {/* Modal Body / QR Display */}
            <div className="p-6 flex flex-col items-center justify-center text-center">
              
              <div className="mb-4 bg-white p-5 rounded-2xl border-4 border-ouro shadow-xl relative group max-w-[240px] aspect-square flex items-center justify-center">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=2d0006&data=${encodeURIComponent(siteUrl)}`}
                  alt="QR Code do Site"
                  className="w-full h-full object-contain select-none"
                  referrerPolicy="no-referrer"
                />
              </div>

              <p className="text-white font-display font-semibold text-sm px-4">
                Aponte a câmera do celular para o QR Code acima
              </p>
              
              <p className="text-[11px] text-gray-300 mt-1.5 px-4 leading-relaxed font-medium">
                Você será direcionado diretamente para este sistema hospedado em nosso Servidor de Nuvem.
              </p>

              {/* Action Toolbar */}
              <div className="mt-5 w-full flex items-center justify-center gap-2.5">
                {/* Copy Link */}
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="bg-black/50 hover:bg-ouro/20 border border-white/15 hover:border-ouro/60 py-2 px-4 rounded-xl text-xs text-white font-bold transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-400">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-ouro" />
                      <span>Copiar Link</span>
                    </>
                  )}
                </button>

                {/* Open Link */}
                <a
                  href={siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black/50 hover:bg-ouro/20 border border-white/15 hover:border-ouro/60 py-2 px-4 rounded-xl text-xs text-white font-bold transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-ouro" />
                  <span>Abrir Site</span>
                </a>
              </div>

              {/* iOS / Safari Warning Box */}
              <div className="mt-5 w-full text-left bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-amber-500 font-display font-bold text-xs uppercase tracking-wider">
                      Instruções para Celular (iOS / Safari)
                    </h4>
                    <p className="text-[11px] text-gray-300 mt-1 leading-relaxed font-medium">
                      O ambiente de testes da Google é seguro e privado. Se ao escanear o QR Code você ver uma tela com <strong>"Action required..."</strong> ou erro de <strong>"cookie"</strong>, resolva facilmente:
                    </p>
                    <ul className="list-disc list-inside text-[10px] text-gray-400 mt-1.5 space-y-1 font-medium leading-relaxed">
                      <li>Use o navegador <strong>Google Chrome</strong> ou similar no seu celular para ler/abrir o link.</li>
                      <li>No iPhone, acesse <strong>Ajustes &gt; Safari</strong> e desative a opção <strong className="text-white font-semibold">"Impedir Rastreamento entre Sites"</strong>.</li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
