import React, { useState, useEffect } from 'react';
import { FirebaseUser, ArranchamentoRecord } from './types';
import { 
  saveUsersList, 
  saveRecordsList, 
  getTodayDateStr, 
  cleanTextId,
  formatMilitaryName,
  isSameUser,
  deduplicateUsersList,
  isMealForUser,
  getMilitarGroupFromGraduacao,
  isDateLocked
} from './utils/storage';
import Login from './components/Login';
import Arranchamento from './components/Arranchamento';
import Furriel from './components/Furriel';
import Admin from './components/Admin';
import AlterarSenha from './components/AlterarSenha';
import NoticeBanner from './components/NoticeBanner';
import MobileDrawer, { ActiveTabType } from './components/MobileDrawer';
import arranchaLogo from './assets/logo-brand-v7.png';
import { 
  Home, 
  Coffee, 
  Utensils, 
  Moon, 
  History, 
  QrCode, 
  Users, 
  Settings, 
  LogOut, 
  Smartphone, 
  Laptop, 
  Bell, 
  Check, 
  Minus, 
  Award,
  ChevronRight,
  BookOpen,
  Copy,
  ExternalLink,
  Printer,
  AlertTriangle,
  Menu,
  Shield,
  Clock,
  Calendar,
  Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [users, setUsers] = useState<FirebaseUser[]>([]);
  const [meals, setMeals] = useState<ArranchamentoRecord[]>([]);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  // App viewport mode: 'responsive' (full-width desktop) or 'mobile' (phone simulator)
  const [viewportMode, setViewportMode] = useState<'responsive' | 'mobile'>('responsive');

  // Selected tab
  const [activeTab, setActiveTab] = useState<ActiveTabType>('inicio');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [slideDirection, setSlideDirection] = useState(1);
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  const TAB_ORDER: ActiveTabType[] = [
    'inicio', 'arranchamento', 'historico', 'qrcode', 'furriel', 'usuarios', 'senha'
  ];

  const changeTab = (newTab: ActiveTabType) => {
    const currentIdx = TAB_ORDER.indexOf(activeTab);
    const newIdx = TAB_ORDER.indexOf(newTab);
    setSlideDirection(newIdx >= currentIdx ? 1 : -1);
    setActiveTab(newTab);
    setIsDrawerOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // QR Code Site URL states
  const [siteUrl] = useState(() => window.location.origin);
  const [copied, setCopied] = useState(false);

  // Notification states
  const [notifications] = useState<string[]>([
    'Aviso: Arranchamento para amanhã encerra hoje às 15:30h.',
    'Alerta: Cardápio do almoço de hoje atualizado.'
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const authHeaders = (user: FirebaseUser | null = currentUser): Record<string, string> => ({
    'X-Arrancha-User': user?.id || user?.login || '',
    'X-Arrancha-Password': user?.senha || ''
  });

  const syncFromServer = async (requester: FirebaseUser | null = currentUser) => {
    if (!requester) {
      setUsers([]);
      setMeals([]);
      return { users: [] as FirebaseUser[], meals: [] as ArranchamentoRecord[] };
    }
    try {
      const headers = authHeaders(requester);
      const [resUsers, resRecords] = await Promise.all([
        fetch('/api/users', { headers }),
        fetch('/api/records', { headers })
      ]);
      if (resUsers.ok && resRecords.ok) {
        const serverUsers: FirebaseUser[] = await resUsers.json();
        const serverMeals: ArranchamentoRecord[] = await resRecords.json();
        const finalUsers = deduplicateUsersList(serverUsers || []);
        const mergedMeals = Array.from(new Map((serverMeals || []).map(meal => [meal.idRegistro, meal])).values());
        setUsers(finalUsers);
        saveUsersList(finalUsers);
        setMeals(mergedMeals);
        saveRecordsList(mergedMeals);

        const updatedMe = finalUsers.find(user => user.id === requester.id || user.login === requester.login);
        if (updatedMe && JSON.stringify(updatedMe) !== JSON.stringify(requester)) setCurrentUser(updatedMe);
        if (!updatedMe) {
          setCurrentUser(null);
          alert('Sua conta foi excluída pelo administrador.');
        }
        return { users: finalUsers, meals: mergedMeals };
      }
      if (resUsers.status === 401 || resRecords.status === 401) setCurrentUser(null);
    } catch (err) {
      console.warn('Offline ou erro de rede ao conectar com o banco de dados central:', err);
    }
    return { users, meals };
  };

  useEffect(() => {
    if (!currentUser) {
      setUsers([]);
      setMeals([]);
      return;
    }
    syncFromServer(currentUser);
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') syncFromServer(currentUser);
    };
    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [currentUser?.id]);

  useEffect(() => {
    fetch('/api/server-time').then(response => response.json()).then(({ now }) => {
      (window as any).__ARRANCHA_SERVER_OFFSET_MS__ = new Date(now).getTime() - Date.now();
    }).catch(() => undefined);
  }, []);

  // QR Code actions
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(siteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintTableQRCode = () => {
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=2d0006&data=${encodeURIComponent(siteUrl)}`;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Imprimir QR Codes - 7º RC Mec</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800&family=Raleway:wght@700;900&display=swap');
    
    @page {
      size: A4 portrait;
      margin: 15mm 10mm;
    }
    
    body {
      font-family: 'Montserrat', sans-serif;
      margin: 0;
      padding: 0;
      background-color: #fff;
      color: #1e1e1e;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
    }
    
    .print-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15mm;
      width: 100%;
      max-width: 190mm;
      margin: 0 auto;
    }
    
    .qr-card {
      border: 4px solid #7A0C0C;
      border-radius: 20px;
      padding: 20px;
      text-align: center;
      background-color: #fff;
      position: relative;
      box-sizing: border-box;
      page-break-inside: avoid;
    }
    
    .qr-card::after {
      content: '';
      position: absolute;
      top: 3px;
      left: 3px;
      right: 3px;
      bottom: 3px;
      border: 1.5px solid #d4af37;
      border-radius: 16px;
      pointer-events: none;
    }
    
    .header-section {
      margin-bottom: 10px;
    }
    
    .unit-title {
      font-family: 'Raleway', sans-serif;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: #7A0C0C;
      text-transform: uppercase;
      margin: 0;
    }
    
    .subunit-title {
      font-size: 8px;
      font-weight: 600;
      color: #555;
      text-transform: uppercase;
      margin: 1px 0 0 0;
    }
    
    .divider {
      height: 1.5px;
      background: linear-gradient(to right, transparent, #d4af37, transparent);
      margin: 8px auto;
      width: 60%;
    }
    
    .doc-title {
      font-family: 'Raleway', sans-serif;
      font-size: 13px;
      font-weight: 800;
      color: #1e1e1e;
      text-transform: uppercase;
      margin: 0 0 2px 0;
    }
    
    .doc-subtitle {
      font-size: 8.5px;
      font-weight: 600;
      color: #7A0C0C;
      background-color: #fcf6e6;
      border: 1px solid #f3e5c8;
      padding: 3px 8px;
      border-radius: 6px;
      display: inline-block;
      margin-bottom: 12px;
      text-transform: uppercase;
    }
    
    .qr-wrapper {
      background: white;
      padding: 8px;
      border: 2px solid #eaeaea;
      border-radius: 12px;
      display: inline-block;
      margin-bottom: 12px;
    }
    
    .qr-image {
      width: 140px;
      height: 140px;
      display: block;
    }
    
    .steps-container {
      text-align: left;
      max-width: 240px;
      margin: 0 auto 10px auto;
      background-color: #f9f9f9;
      border: 1px solid #f0f0f0;
      padding: 10px 12px;
      border-radius: 10px;
    }
    
    .step-item {
      font-size: 9px;
      color: #333;
      margin-bottom: 6px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .step-item:last-child {
      margin-bottom: 0;
    }
    
    .step-number {
      background-color: #7A0C0C;
      color: #fff;
      font-size: 8px;
      font-weight: 800;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .footer-text {
      font-size: 7.5px;
      color: #777;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <h2 style="font-family: 'Raleway', sans-serif; font-size: 14px; color: #7A0C0C; text-align: center; margin-top: 0; margin-bottom: 8mm; text-transform: uppercase; letter-spacing: 1px;">
    Placas de QR Code para as Mesas - Refeitório 7º RC Mec
  </h2>
  <div class="print-container">
    <div class="qr-card">
      <div class="header-section">
        <div class="unit-title">7º Regimento de Cavalaria Mecanizado</div>
        <div class="subunit-title">Regimento Sertório</div>
      </div>
      <div class="divider"></div>
      <div class="doc-title">Arranchamento Rápido</div>
      <div class="doc-subtitle">Rancho do 7º RC Mec</div>
      <div>
        <div class="qr-wrapper">
          <img class="qr-image" src="${qrImageUrl}" alt="QR Code" />
        </div>
      </div>
      <div class="steps-container">
        <div class="step-item">
          <span class="step-number">1</span>
          <span>Aponte a câmera do celular para o QR Code</span>
        </div>
        <div class="step-item">
          <span class="step-number">2</span>
          <span>Entre com seu login de acesso</span>
        </div>
        <div class="step-item">
          <span class="step-number">3</span>
          <span>Solicite ou altere seu rancho diário</span>
        </div>
      </div>
      <div class="footer-text">
        Evite Desperdício • Garanta a sua Etapa Diária
      </div>
    </div>
  </div>
  
  <script>
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        window.print();
      }, 500);
    });
  </script>
</body>
</html>
    `);
    printWindow.document.close();
  };

  // Auth triggers
  const handleLoginSuccess = (user: FirebaseUser) => {
    setCurrentUser(user);
    setUsers([user]);
    syncFromServer(user);
    if (user.trocarSenhaNoPrimeiroAcesso || user.senha === '123456') {
      setActiveTab('senha');
    } else {
      setActiveTab('inicio');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUsers([]);
    setMeals([]);
    setActiveTab('inicio');
    setIsDrawerOpen(false);
  };

  // User details update
  const handleUpdatePassword = async (newPass: string) => {
    if (!currentUser) return;
    const response = await fetch(`/api/users/${encodeURIComponent(currentUser.id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ senha: newPass, trocarSenhaNoPrimeiroAcesso: false })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      alert(result.error || 'Não foi possível alterar a senha.');
      return;
    }
    const updatedUser = result as FirebaseUser;
    setCurrentUser(updatedUser);
    setUsers(previous => previous.map(user => user.id === updatedUser.id ? updatedUser : user));
    setActiveTab('inicio');
  };

  const handleUpdateUser = async (userId: string, updatedFields: Partial<FirebaseUser>) => {
    const targetUser = users.find(u => u.id === userId || (u.login && cleanTextId(u.login) === cleanTextId(userId)));
    const finalFields = { ...updatedFields };

    if (targetUser) {
      const newGrad = finalFields.graduacao || targetUser.graduacao;
      const newRep = finalFields.reparticao || targetUser.reparticao;
      const calculatedGrupo = getMilitarGroupFromGraduacao(newGrad, newRep, finalFields.grupo || targetUser.grupo);
      finalFields.grupo = calculatedGrupo;
    }
    const response = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(finalFields)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      alert(result.error || 'Não foi possível atualizar o usuário.');
      return;
    }
    const savedUser = result as FirebaseUser;
    setUsers(previous => deduplicateUsersList(previous.map(user => isSameUser(user, savedUser) ? savedUser : user)));
    if (currentUser && isSameUser(currentUser, savedUser)) setCurrentUser(savedUser);
  };

  const handleDeleteUser = async (userId: string) => {
    const response = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      alert(result.error || 'Não foi possível excluir o usuário.');
      return;
    }
    await syncFromServer();
  };

  const handleAddUserByAdmin = async (newUser: FirebaseUser) => {
    const userToAdd: FirebaseUser = {
      ...newUser,
      nuc: newUser.nuc || newUser.id || Math.floor(10000000 + Math.random() * 90000000).toString(),
      senha: newUser.senha || '123456',
      trocarSenhaNoPrimeiroAcesso: true
    };
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(userToAdd)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      alert(result.error || 'Não foi possível cadastrar o usuário.');
      return;
    }
    setUsers(previous => deduplicateUsersList([...previous, result as FirebaseUser]));
  };

  const saveIndividualMeal = async (record: ArranchamentoRecord) => {
    if (!currentUser) return false;
    const response = await fetch(`/api/records/${encodeURIComponent(currentUser.id)}/${record.dataRegistro}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ cafe: record.cafe, almoco: record.almoco, jantar: record.jantar })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      alert(result.error || 'Não foi possível salvar o arranchamento.');
      return false;
    }
    const savedRecord = result as ArranchamentoRecord;
    setMeals(previous => [...previous.filter(item => item.idRegistro !== savedRecord.idRegistro), savedRecord]);
    return true;
  };

  // Arranchar / Desarranchar
  const handleUpdateMeal = async (date: string, mealKey: 'cafe' | 'almoco' | 'jantar', value: boolean) => {
    if (!currentUser) return;
    if (isDateLocked(date)) {
      alert(`Arranchamento bloqueado para a data ${date.split('-').reverse().join('/')}.`);
      return;
    }

    const existingIndex = meals.findIndex(m => isMealForUser(m, currentUser, date));
    let updatedMeals = [...meals];

    if (existingIndex > -1) {
      updatedMeals[existingIndex] = {
        ...updatedMeals[existingIndex],
        [mealKey]: value
      };
    } else {
      const userPrefix = cleanTextId(currentUser.id || currentUser.login || currentUser.usuario);
      const newRecord: ArranchamentoRecord = {
        idRegistro: `${userPrefix}_${date}`,
        usuario: currentUser.usuario,
        reparticao: currentUser.reparticao,
        dataRegistro: date,
        cafe: mealKey === 'cafe' ? value : false,
        almoco: mealKey === 'almoco' ? value : false,
        jantar: mealKey === 'jantar' ? value : false
      };
      updatedMeals.push(newRecord);
    }

    const record = updatedMeals.find(meal => isMealForUser(meal, currentUser, date));
    if (record) await saveIndividualMeal(record);
  };

  const handleBulkUpdateMeals = async (updates: { date: string; cafe: boolean; almoco: boolean; jantar: boolean }[]) => {
    if (!currentUser) return;

    let updatedMeals = [...meals];

    updates.forEach(({ date, cafe, almoco, jantar }) => {
      const existingIndex = updatedMeals.findIndex(m => isMealForUser(m, currentUser, date));

      if (existingIndex > -1) {
        updatedMeals[existingIndex] = {
          ...updatedMeals[existingIndex],
          cafe,
          almoco,
          jantar
        };
      } else {
        const userPrefix = cleanTextId(currentUser.id || currentUser.login || currentUser.usuario);
        const newRecord: ArranchamentoRecord = {
          idRegistro: `${userPrefix}_${date}`,
          usuario: currentUser.usuario,
          reparticao: currentUser.reparticao,
          dataRegistro: date,
          cafe,
          almoco,
          jantar
        };
        updatedMeals.push(newRecord);
      }
    });

    setMeals(updatedMeals);
    for (const { date } of updates) {
      const record = updatedMeals.find(meal => isMealForUser(meal, currentUser, date));
      if (record && !(await saveIndividualMeal(record))) break;
    }
  };

  const handleCloseDaily = async (date: string) => {
    const response = await fetch(`/api/closures/${date}`, { method: 'POST', headers: authHeaders() });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Não foi possível fechar o vale diário.');
    return result;
  };

  // If not logged in, render the login screen
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const todayStr = getTodayDateStr();

  // Find today's user records
  const todayRecord = meals.find(m => isMealForUser(m, currentUser, todayStr));

  // Render correct tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'inicio':
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Welcome banner */}
            <div className="bg-white p-4 sm:p-6 rounded-3xl border-2 border-ouro/30 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Sistema Ativo • 7º RC Mec
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-black text-vinho tracking-tight">
                  Bem-vindo, {formatMilitaryName(currentUser.usuario, currentUser.graduacao)}!
                </h2>
                <p className="text-xs text-grafite-suave font-semibold flex items-center gap-1.5 pt-0.5">
                  <Building className="w-3.5 h-3.5 text-ouro shrink-0" />
                  <span>{currentUser.reparticao}</span>
                  <span className="text-gray-300">•</span>
                  <span className="capitalize">{new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-1.5 bg-oliva/10 border border-oliva/30 rounded-2xl shadow-2xs">
                <Award className="w-4 h-4 text-ouro" />
                <span className="text-xs font-display font-black uppercase text-oliva-escuro tracking-wider">
                  {currentUser.nivel}
                </span>
              </div>
            </div>

            {/* Section Header: Situação de Hoje */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-display font-black uppercase text-vinho tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-ouro" />
                Suas Refeições de Hoje
              </span>
              <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">
                {todayStr.split('-').reverse().join('/')}
              </span>
            </div>

            {/* Meal Status cards (Responsive grid: 1 col on mobile, 3 cols on desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
              
              {/* 1. Café Card */}
              <div className={`p-4 sm:p-6 border-2 rounded-3xl shadow-sm flex flex-col justify-between transition-all ${
                todayRecord?.cafe 
                  ? 'bg-gradient-to-b from-amber-50/50 to-white border-ouro/50 ring-1 ring-ouro/20' 
                  : 'bg-white border-gray-200/80'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 shadow-xs flex items-center justify-center shrink-0">
                      <Coffee className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">Refeição 01</span>
                      <h4 className="text-sm sm:text-base font-display font-black text-vinho uppercase tracking-wider leading-tight">
                        Café da Manhã
                      </h4>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-semibold">Status:</span>
                  {todayRecord?.cafe ? (
                    <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Arranchado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                      <Minus className="w-3.5 h-3.5 text-gray-400" />
                      Não Solicitado
                    </span>
                  )}
                </div>
              </div>

              {/* 2. Almoço Card */}
              <div className={`p-4 sm:p-6 border-2 rounded-3xl shadow-sm flex flex-col justify-between transition-all ${
                todayRecord?.almoco 
                  ? 'bg-gradient-to-b from-emerald-50/50 to-white border-emerald-500/40 ring-1 ring-emerald-500/20' 
                  : 'bg-white border-gray-200/80'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-xs flex items-center justify-center shrink-0">
                      <Utensils className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">Refeição 02</span>
                      <h4 className="text-sm sm:text-base font-display font-black text-vinho uppercase tracking-wider leading-tight">
                        Almoço
                      </h4>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-semibold">Status:</span>
                  {todayRecord?.almoco ? (
                    <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Arranchado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                      <Minus className="w-3.5 h-3.5 text-gray-400" />
                      Não Solicitado
                    </span>
                  )}
                </div>
              </div>

              {/* 3. Jantar Card */}
              <div className={`p-4 sm:p-6 border-2 rounded-3xl shadow-sm flex flex-col justify-between transition-all ${
                todayRecord?.jantar 
                  ? 'bg-gradient-to-b from-vinho/5 to-white border-vinho/40 ring-1 ring-vinho/20' 
                  : 'bg-white border-gray-200/80'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-vinho/10 border border-vinho/20 text-vinho shadow-xs flex items-center justify-center shrink-0">
                      <Moon className="w-6 h-6 text-ouro" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">Refeição 03</span>
                      <h4 className="text-sm sm:text-base font-display font-black text-vinho uppercase tracking-wider leading-tight">
                        Jantar
                      </h4>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-semibold">Status:</span>
                  {todayRecord?.jantar ? (
                    <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Arranchado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                      <Minus className="w-3.5 h-3.5 text-gray-400" />
                      Não Solicitado
                    </span>
                  )}
                </div>
              </div>

            </div>

            {/* Quick Action Button: REALIZAR ARRANCHAMENTO */}
            <button
              type="button"
              onClick={() => changeTab('arranchamento')}
              className="w-full py-4 px-6 bg-vinho hover:bg-vinho-escuro active:scale-98 text-white rounded-2xl font-display font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-md border border-ouro/40 cursor-pointer min-h-[52px] transition-all"
            >
              <Coffee className="w-5 h-5 text-ouro" />
              <span>REALIZAR ARRANCHAMENTO</span>
              <ChevronRight className="w-4 h-4 text-ouro" />
            </button>

            {/* Quick Shortcuts Grid */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => changeTab('historico')}
                className="p-3.5 bg-white border border-gray-200/80 hover:border-vinho/30 rounded-2xl shadow-2xs flex items-center gap-2.5 text-left cursor-pointer transition-all active:scale-98"
              >
                <div className="w-9 h-9 rounded-xl bg-vinho/5 text-vinho flex items-center justify-center shrink-0">
                  <History className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-display font-bold text-vinho block truncate">Histórico</span>
                  <span className="text-[10px] text-gray-400 block truncate">Suas solicitações</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => changeTab('qrcode')}
                className="p-3.5 bg-white border border-gray-200/80 hover:border-vinho/30 rounded-2xl shadow-2xs flex items-center gap-2.5 text-left cursor-pointer transition-all active:scale-98"
              >
                <div className="w-9 h-9 rounded-xl bg-ouro/15 text-vinho flex items-center justify-center shrink-0">
                  <QrCode className="w-4.5 h-4.5 text-ouro" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-display font-bold text-vinho block truncate">QR Code</span>
                  <span className="text-[10px] text-gray-400 block truncate">Acesso rápido</span>
                </div>
              </button>
            </div>

          </div>
        );
      case 'arranchamento':
        return (
          <Arranchamento 
            user={currentUser} 
            meals={meals} 
            onUpdateMeal={handleUpdateMeal} 
            onBulkUpdateMeals={handleBulkUpdateMeals} 
          />
        );
      case 'historico': {
        const myRecords = meals
          .filter(m => isMealForUser(m, currentUser, m.dataRegistro))
          .sort((a, b) => b.dataRegistro.localeCompare(a.dataRegistro));

        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white p-4 sm:p-6 border border-gray-200/60 rounded-3xl shadow-sm">
              <h3 className="text-base sm:text-lg font-display font-black text-vinho uppercase tracking-tight flex items-center gap-2">
                <History className="w-5 h-5 text-ouro" />
                Histórico de Refeições
              </h3>
              <p className="text-xs text-gray-500 font-semibold mt-1">
                Acompanhe o registro consolidado das suas solicitações de rancho.
              </p>
            </div>

            {/* Mobile Cards View (Hidden on Desktop md+) */}
            <div className="block md:hidden space-y-3">
              {myRecords.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center text-gray-400 border border-gray-200">
                  <History className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-xs font-semibold">Nenhum registro encontrado no seu histórico.</p>
                </div>
              ) : (
                myRecords.map(r => (
                  <div key={r.idRegistro} className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="text-xs font-display font-black text-vinho flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-ouro" />
                        {r.dataRegistro.split('-').reverse().join('/')}
                      </span>
                      <span className="text-[10px] text-gray-400 font-semibold">
                        {r.cafe || r.almoco || r.jantar ? 'Arranchamento registrado' : 'Sem solicitações'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      {/* Café */}
                      <div className={`p-2 rounded-xl border ${r.cafe ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                        <span className="text-[9px] font-bold uppercase block mb-0.5">Café</span>
                        <span className="text-[10px] font-black">{r.cafe ? '✓ Arranchado' : '—'}</span>
                      </div>

                      {/* Almoço */}
                      <div className={`p-2 rounded-xl border ${r.almoco ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                        <span className="text-[9px] font-bold uppercase block mb-0.5">Almoço</span>
                        <span className="text-[10px] font-black">{r.almoco ? '✓ Arranchado' : '—'}</span>
                      </div>

                      {/* Jantar */}
                      <div className={`p-2 rounded-xl border ${r.jantar ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                        <span className="text-[9px] font-bold uppercase block mb-0.5">Jantar</span>
                        <span className="text-[10px] font-black">{r.jantar ? '✓ Arranchado' : '—'}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View (Hidden on Mobile) */}
            <div className="hidden md:block bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
              <div className="overflow-x-auto border border-gray-100 rounded-2xl">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100 text-[9px]">
                      <th className="px-5 py-3">Data</th>
                      <th className="px-5 py-3 text-center">Café</th>
                      <th className="px-5 py-3 text-center">Almoço</th>
                      <th className="px-5 py-3 text-center">Jantar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-semibold text-gray-600">
                    {myRecords.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-gray-400">
                          Nenhum registro de arranchamento encontrado no seu histórico.
                        </td>
                      </tr>
                    ) : (
                      myRecords.map(r => (
                        <tr key={r.idRegistro} className="hover:bg-gray-50/50">
                          <td className="px-5 py-3 text-vinho font-bold">
                            {r.dataRegistro.split('-').reverse().join('/')}
                          </td>
                          <td className="px-5 py-3 text-center">
                            {r.cafe ? (
                              <span className="text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 font-extrabold text-[10px]">Arranchado</span>
                            ) : (
                              <span className="text-gray-400 bg-gray-50 px-2.5 py-0.5 rounded-full border border-gray-100 text-[10px]">Não solicitado</span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-center">
                            {r.almoco ? (
                              <span className="text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 font-extrabold text-[10px]">Arranchado</span>
                            ) : (
                              <span className="text-gray-400 bg-gray-50 px-2.5 py-0.5 rounded-full border border-gray-100 text-[10px]">Não solicitado</span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-center">
                            {r.jantar ? (
                              <span className="text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 font-extrabold text-[10px]">Arranchado</span>
                            ) : (
                              <span className="text-gray-400 bg-gray-50 px-2.5 py-0.5 rounded-full border border-gray-100 text-[10px]">Não solicitado</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }
      case 'qrcode':
        return (
          <div className="max-w-md mx-auto space-y-4 sm:space-y-6 pb-12">
            {/* Header Card */}
            <div className="bg-white p-4 sm:p-6 border border-gray-200 rounded-3xl shadow-sm text-center">
              <h3 className="text-base sm:text-lg font-display font-black text-vinho uppercase tracking-tight flex items-center justify-center gap-2">
                <QrCode className="w-5 h-5 text-ouro" />
                QR Code do Sistema
              </h3>
              <p className="text-xs text-gray-500 font-semibold mt-1">
                Acesse o Arrancha+ diretamente do seu smartphone.
              </p>
            </div>

            {/* QR Code Container and Actions */}
            <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-8 flex flex-col items-center justify-center shadow-sm">
              
              <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-gray-200 shadow-md mb-5 relative">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=2d0006&data=${encodeURIComponent(siteUrl)}`}
                  alt="QR Code"
                  className="w-[170px] h-[170px] sm:w-[190px] sm:h-[190px] object-contain select-none"
                  referrerPolicy="no-referrer"
                />
                
                <div className="absolute inset-0 m-auto w-10 h-10 bg-[#8B0000] rounded-xl border-2 border-white flex items-center justify-center shadow-md overflow-hidden p-0.5">
                  <img src={arranchaLogo} alt="ARRANCHA+" className="w-full h-full object-cover rounded-lg" />
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="w-full flex items-center justify-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="bg-gray-50 hover:bg-ouro/10 border border-gray-200 hover:border-ouro/50 py-2.5 px-4 rounded-xl text-xs text-gray-700 font-bold transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none min-h-[44px]"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-600">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-vinho" />
                      <span>Copiar Link</span>
                    </>
                  )}
                </button>

                <a
                  href={siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-50 hover:bg-ouro/10 border border-gray-200 hover:border-ouro/50 py-2.5 px-4 rounded-xl text-xs text-gray-700 font-bold transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none min-h-[44px]"
                >
                  <ExternalLink className="w-4 h-4 text-vinho" />
                  <span>Testar Link</span>
                </a>
              </div>

              <p className="text-[10px] text-gray-400 font-medium text-center mb-4">
                Endereço do servidor em nuvem sincronizado em tempo real.
              </p>

              {/* iOS / Safari Warning Box */}
              <div className="w-full text-left bg-amber-500/5 border border-amber-500/20 rounded-2xl p-3.5 sm:p-4">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-amber-800 font-display font-bold text-xs uppercase tracking-wider">
                      Dica para Celular (iOS / Safari / Chrome)
                    </h4>
                    <p className="text-[11px] text-gray-600 mt-1 leading-relaxed font-medium">
                      Para salvar o ARRANCHA+ na tela de início do seu celular:
                    </p>
                    <ul className="list-disc list-inside text-[10px] text-gray-500 mt-1 space-y-0.5 font-medium">
                      <li>No iPhone: Toque no botão de <strong>Compartilhar</strong> e selecione <strong>"Adicionar à Tela de Início"</strong>.</li>
                      <li>No Android: Toque nos <strong>três pontinhos</strong> e selecione <strong>"Instalar aplicativo"</strong>.</li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>

            {/* Print Section Box */}
            <div className="bg-gradient-to-br from-vinho/5 to-ouro/5 border border-vinho/10 rounded-3xl p-5 sm:p-6 shadow-sm text-center space-y-3 sm:space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-vinho/10 rounded-2xl">
                  <Printer className="w-5 h-5 sm:w-6 sm:h-6 text-vinho" />
                </div>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-display font-black text-vinho uppercase tracking-tight">
                  Imprimir para as Mesas do Rancho
                </h4>
                <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed px-2">
                  Gere uma folha para recorte com as placas de QR Code das mesas do refeitório.
                </p>
              </div>

              <button
                type="button"
                onClick={handlePrintTableQRCode}
                className="w-full bg-vinho hover:bg-vinho-escuro border border-ouro/40 text-white font-display font-black py-3.5 px-5 rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider min-h-[46px]"
              >
                <Printer className="w-4 h-4 text-ouro" />
                <span>Imprimir Placas para Mesas</span>
              </button>
            </div>
          </div>
        );
      case 'usuarios':
        return (
          <Admin 
            user={currentUser}
            users={users}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onAddUserByAdmin={handleAddUserByAdmin}
          />
        );
      case 'furriel':
        return (
          <Furriel
            user={currentUser}
            users={users}
            meals={meals}
            onRefresh={() => syncFromServer(currentUser)}
            onCloseDaily={handleCloseDaily}
          />
        );
      case 'senha':
        return <AlterarSenha user={currentUser} onUpdatePassword={handleUpdatePassword} />;
      default:
        return null;
    }
  };

  const isMobileSim = viewportMode === 'mobile';
  const showMobileLayout = isMobileSim || isMobileScreen;

  // Render Mobile View with MobileDrawer and Compact Header
  if (showMobileLayout) {
    const mobileContent = (
      <div className={`flex flex-col bg-marfim h-full w-full ${isMobileScreen ? 'min-h-[100dvh]' : ''} relative select-none`}>
        
        {/* Mobile Drawer */}
        <MobileDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          currentUser={currentUser}
          activeTab={activeTab}
          onSelectTab={changeTab}
          onLogout={handleLogout}
        />

        {/* Compact, Clean Mobile App Header */}
        <header className="pt-safe bg-vinho text-white px-3.5 py-3 border-b border-ouro/25 flex items-center justify-between shrink-0 shadow-md z-30">
          
          {/* Left: Hamburger Menu Button & Logo */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer border border-white/10"
              title="Abrir Menu de Navegação"
            >
              <Menu className="w-5 h-5 text-ouro" />
            </button>

            <div className="flex items-center gap-2" onClick={() => changeTab('inicio')}>
              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center border border-ouro shrink-0 p-0.5 shadow-sm overflow-hidden">
                <img src={arranchaLogo} alt="ARRANCHA+" className="w-full h-full object-cover rounded-md" />
              </div>
              <span className="text-sm font-display font-black tracking-tight uppercase">
                ARRANCHA<span className="text-ouro">+</span>
              </span>
            </div>
          </div>

          {/* Right: Notifications & Quick User Tag */}
          <div className="flex items-center gap-2">
            
            {/* Notification Bell */}
            <div className="relative">
              <button 
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center relative transition-all cursor-pointer text-white"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-ouro rounded-full border border-vinho" />
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-72 bg-white text-grafite rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 text-xs"
                    >
                      <h5 className="font-display font-black text-vinho uppercase tracking-wider mb-2 pb-1 border-b border-gray-100 flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-ouro" />
                        Informativos
                      </h5>
                      <div className="space-y-2">
                        {notifications.map((n, idx) => (
                          <div key={idx} className="flex gap-2 items-start text-gray-600 font-semibold leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-ouro shrink-0 mt-1.5" />
                            <span>{n}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Compact User Tag */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/25 rounded-xl border border-white/10">
              <span className="text-[10px] font-display font-black text-ouro uppercase">
                {currentUser.graduacao}
              </span>
              <span className="text-[10px] font-bold text-white max-w-[70px] truncate">
                {currentUser.usuario.split(' ')[0]}
              </span>
            </div>

          </div>
        </header>

        {/* Mobile Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-4 pb-safe bg-marfim relative overflow-touch" id="mobile-scroll-container">
          <NoticeBanner />
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="w-full h-full"
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    );

    if (isMobileSim) {
      return (
        <div className="min-h-screen bg-marfim text-grafite flex flex-col font-sans selection:bg-vinho/10 select-none">
          {/* Header ONLY for simulation toggle */}
          <header className="bg-vinho text-white border-b border-ouro/25 px-6 py-4 flex justify-between items-center z-20 shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border-2 border-ouro flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
                <img src={arranchaLogo} alt="ARRANCHA+" className="w-full h-full object-contain rounded-lg" />
              </div>
              <div>
                <span className="text-lg font-display font-black tracking-tight block">
                  ARRANCHA<span className="text-ouro">+</span>
                </span>
                <span className="text-[10px] text-ouro font-display font-bold tracking-wider block leading-none uppercase mt-0.5">
                  7º RC Mec (Simulação Mobile)
                </span>
              </div>
            </div>
            
            <div className="flex items-center bg-vinho-escuro border border-white/10 rounded-xl p-0.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setViewportMode('responsive')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                  viewportMode === 'responsive' ? 'bg-ouro text-vinho shadow' : 'text-white/75 hover:text-white'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Painel (Web)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewportMode('mobile')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                  viewportMode === 'mobile' ? 'bg-ouro text-vinho shadow' : 'text-white/75 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Celular (App)</span>
              </button>
            </div>
          </header>

          <div className="flex-1 flex items-center justify-center p-6 bg-gray-200/50">
            <div className="w-full max-w-[420px] h-[820px] bg-white border-8 border-gray-800 rounded-[50px] overflow-hidden flex flex-col shadow-2xl relative">
              {/* Phone notch bar */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-5 bg-gray-800 rounded-full z-40 flex items-center justify-center gap-1.5">
                <div className="w-12 h-1 bg-gray-600 rounded-full" />
                <div className="w-2 h-2 bg-gray-700 rounded-full" />
              </div>

              {/* Phone Status indicators */}
              <div className="h-9 bg-vinho flex justify-between items-center px-8 text-[11px] font-bold text-white/70 shrink-0 select-none pt-2">
                <span>09:30</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px]">5G</span>
                  <div className="flex gap-0.5 items-end h-2 shrink-0">
                    <div className="w-0.5 h-1 bg-white/70" />
                    <div className="w-0.5 h-1.5 bg-white/70" />
                    <div className="w-0.5 h-2 bg-white/70" />
                  </div>
                  <div className="w-5 h-3 border border-white/70 rounded-sm p-0.5 flex items-center">
                    <div className="h-full w-full bg-white/70 rounded-2xs" />
                  </div>
                </div>
              </div>

              {mobileContent}
            </div>
          </div>
        </div>
      );
    } else {
      return mobileContent;
    }
  }

  // =========================================================================
  // DESKTOP FULL-SCREEN DASHBOARD VIEW
  // =========================================================================
  return (
    <div className="min-h-screen bg-marfim text-grafite flex flex-col font-sans selection:bg-vinho/10 select-none print:bg-white print:text-black">
      
      {/* Desktop Header */}
      <header className="bg-vinho text-white border-b border-ouro/25 px-6 py-4 flex justify-between items-center z-20 print:hidden shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border-2 border-ouro flex items-center justify-center p-0.5 shrink-0 overflow-hidden shadow-sm">
            <img src={arranchaLogo} alt="ARRANCHA+" className="w-full h-full object-cover rounded-lg" />
          </div>
          <div>
            <span className="text-lg font-display font-black tracking-tight block">
              ARRANCHA<span className="text-ouro">+</span>
            </span>
            <span className="text-[10px] text-ouro font-display font-bold tracking-wider block leading-none uppercase mt-0.5">
              7º RC Mec
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          
          {/* Simulation Toggle Bar */}
          <div className="hidden lg:flex bg-vinho-escuro border border-white/10 rounded-xl p-0.5 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setViewportMode('responsive')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                viewportMode === 'responsive' ? 'bg-ouro text-vinho shadow' : 'text-white/75 hover:text-white'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Painel (Web)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('mobile')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                viewportMode === 'mobile' ? 'bg-ouro text-vinho shadow' : 'text-white/75 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Celular (App)</span>
            </button>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button 
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-white/10 rounded-xl relative transition-all cursor-pointer"
            >
              <Bell className="w-5 h-5 text-white" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-ouro rounded-full border-2 border-vinho" />
            </button>

            <AnimatePresence>
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-72 bg-white text-grafite rounded-2xl shadow-xl border border-gray-100 p-4 z-50 text-xs"
                  >
                    <h5 className="font-display font-black text-vinho uppercase tracking-wider mb-2 pb-1 border-b border-gray-100 flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-ouro" />
                      Informativos
                    </h5>
                    <div className="space-y-2">
                      {notifications.map((n, idx) => (
                        <div key={idx} className="flex gap-2 items-start text-gray-600 font-semibold leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-ouro shrink-0 mt-1.5" />
                          <span>{n}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Name */}
          <div className="hidden sm:flex items-center gap-2.5 border-l border-white/15 pl-4">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-ouro/30 flex items-center justify-center font-display font-black text-xs text-ouro">
              {formatMilitaryName(currentUser.usuario, currentUser.graduacao).substring(0, 2).toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold leading-none">{formatMilitaryName(currentUser.usuario, currentUser.graduacao)}</p>
              <p className="text-[9px] text-ouro font-medium leading-none mt-0.5">{currentUser.nivel}</p>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="p-2 hover:bg-white/10 rounded-xl transition-all cursor-pointer text-white/80 hover:text-white shrink-0"
            title="Desconectar do sistema"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 relative">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-vinho-escuro text-white shrink-0 flex flex-col justify-between print:hidden shadow-lg border-r border-ouro/15">
          
          <div className="py-6 px-3 space-y-1">
            
            {/* Início */}
            <button
              type="button"
              onClick={() => setActiveTab('inicio')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'inicio' 
                  ? 'bg-vinho text-ouro shadow-inner border-l-4 border-ouro' 
                  : 'text-white/80 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Home className="w-4.5 h-4.5" />
              <span>Início</span>
            </button>

            {/* Arranchamento */}
            <button
              type="button"
              onClick={() => setActiveTab('arranchamento')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'arranchamento' 
                  ? 'bg-vinho text-ouro shadow-inner border-l-4 border-ouro' 
                  : 'text-white/80 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Coffee className="w-4.5 h-4.5" />
              <span>Arranchamento</span>
            </button>

            {/* Histórico */}
            <button
              type="button"
              onClick={() => setActiveTab('historico')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'historico' 
                  ? 'bg-vinho text-ouro shadow-inner border-l-4 border-ouro' 
                  : 'text-white/80 hover:bg-white/5 hover:text-white'
              }`}
            >
              <History className="w-4.5 h-4.5" />
              <span>Histórico</span>
            </button>

            {/* QR Code */}
            <button
              type="button"
              onClick={() => setActiveTab('qrcode')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'qrcode' 
                  ? 'bg-vinho text-ouro shadow-inner border-l-4 border-ouro' 
                  : 'text-white/80 hover:bg-white/5 hover:text-white'
              }`}
            >
              <QrCode className="w-4.5 h-4.5" />
              <span>QR Code</span>
            </button>

            {/* Furriel panel (Sees only if Furriel or Admin) */}
            {(currentUser.nivel === 'Furriel' || currentUser.nivel === 'Administrador') && (
              <button
                type="button"
                onClick={() => setActiveTab('furriel')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'furriel' 
                    ? 'bg-vinho text-ouro shadow-inner border-l-4 border-ouro' 
                    : 'text-white/80 hover:bg-white/5 hover:text-white'
                }`}
              >
                <BookOpen className="w-4.5 h-4.5" />
                <span>Furriel</span>
              </button>
            )}

            {/* Administrador panel (Sees only if Admin) */}
            {currentUser.nivel === 'Administrador' && (
              <button
                type="button"
                onClick={() => setActiveTab('usuarios')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'usuarios' 
                    ? 'bg-vinho text-ouro shadow-inner border-l-4 border-ouro' 
                    : 'text-white/80 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Shield className="w-4.5 h-4.5" />
                <span>Admin</span>
              </button>
            )}

            {/* Alterar Senha */}
            <button
              type="button"
              onClick={() => setActiveTab('senha')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'senha' 
                  ? 'bg-vinho text-ouro shadow-inner border-l-4 border-ouro' 
                  : 'text-white/80 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Settings className="w-4.5 h-4.5" />
              <span>Alterar Senha</span>
            </button>

          </div>

          {/* Bottom sidebar brand footer */}
          <div className="p-4 border-t border-white/5 bg-black/10 text-[11px] text-white/60 text-center font-display font-bold tracking-wider space-y-0.5">
            <p className="font-black">ARRANCHA+</p>
            <p className="text-[9px] text-white/40 uppercase font-semibold">7º RC Mec</p>
          </div>

        </aside>

        {/* Scrollable content container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
          <NoticeBanner />
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18 }}
              className="max-w-6xl mx-auto"
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>

    </div>
  );
}
