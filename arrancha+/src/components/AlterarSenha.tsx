import React, { useState } from 'react';
import { FirebaseUser } from '../types';
import { KeyRound, ShieldCheck, Eye, EyeOff, AlertCircle, AlertTriangle, Lock } from 'lucide-react';
import { motion } from 'motion/react';

interface AlterarSenhaProps {
  user: FirebaseUser;
  onUpdatePassword: (newPass: string) => void;
}

export default function AlterarSenha({ user, onUpdatePassword }: AlterarSenhaProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isFirstAccess = user.trocarSenhaNoPrimeiroAcesso || user.senha === '123456';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (currentPassword !== user.senha) {
      setError('A senha atual digitada está incorreta.');
      return;
    }

    if (newPassword.length < 3) {
      setError('A nova senha deve possuir no mínimo 3 caracteres.');
      return;
    }

    if (isFirstAccess && newPassword === '123456') {
      setError('Você não pode utilizar a senha inicial padrão (123456). Escolha uma nova senha pessoal.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('A nova senha e a confirmação não conferem.');
      return;
    }

    // Update state & persistence
    onUpdatePassword(newPassword);
    setSuccess('Senha alterada com sucesso! Acesso liberado no sistema.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="max-w-md mx-auto space-y-6 font-sans">
      
      {isFirstAccess && (
        <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-4 text-amber-900 text-xs font-semibold flex items-start gap-3 shadow-md animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold uppercase tracking-wider text-amber-800">Troca de Senha Obrigatória no Primeiro Acesso</p>
            <p className="mt-1 text-gray-700 font-medium leading-relaxed">
              Sua conta foi cadastrada com a senha inicial padrão (<strong className="text-vinho font-bold">123456</strong>). Por segurança, é obrigatório definir uma nova senha pessoal para ter acesso completo ao sistema.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white p-6 border border-gray-200/60 rounded-2xl shadow-sm">
        <h3 className="text-lg font-display font-black text-vinho uppercase tracking-tight flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-ouro animate-pulse" />
          {isFirstAccess ? 'Cadastrar Nova Senha Pessoal' : 'Alterar Senha de Acesso'}
        </h3>
        <p className="text-xs text-gray-500 mt-1 font-medium">
          Mantenha sua conta de arranchamento protegida. Escolha uma senha segura e individual.
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xl"
      >
        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-vinho rounded-r-xl text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-vinho shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border-l-4 border-emerald-600 rounded-r-xl text-emerald-800 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
              Senha Atual (Senha Inicial)
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              placeholder="Digite sua senha atual (ex: 123456)"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full bg-[#F9F9F9] border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-grafite placeholder-gray-400 focus:outline-none focus:border-vinho focus:bg-white transition-colors font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
              Nova Senha Pessoal
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              placeholder="Digite sua nova senha"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full bg-[#F9F9F9] border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-grafite placeholder-gray-400 focus:outline-none focus:border-vinho focus:bg-white transition-colors font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
              Confirmar Nova Senha
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              placeholder="Repita a nova senha"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full bg-[#F9F9F9] border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-grafite placeholder-gray-400 focus:outline-none focus:border-vinho focus:bg-white transition-colors font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="text-xs text-gray-500 hover:text-vinho transition-colors flex items-center gap-1.5 cursor-pointer font-semibold"
            >
              {showPass ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span>Ocultar Senhas</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Mostrar Senhas</span>
                </>
              )}
            </button>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-vinho hover:bg-vinho-escuro text-white font-display font-bold py-3.5 px-4 rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2 uppercase tracking-wider"
          >
            <Lock className="w-4 h-4 text-ouro" />
            <span>Salvar Nova Senha</span>
          </motion.button>
        </form>
      </motion.div>

    </div>
  );
}
