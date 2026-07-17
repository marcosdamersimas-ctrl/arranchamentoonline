import React, { useState, useEffect } from 'react';
import { FirebaseUser, ArranchamentoRecord, UserNivel } from './types';
import { 
  loadUsers, 
  saveUsersList, 
  loadRecords, 
  saveRecordsList, 
  getTodayDateStr, 
  getTomorrowDateStr, 
  cleanTextId 
} from './utils/storage';
import Login from './components/Login';
import Arranchamento from './components/Arranchamento';
import Furriel from './components/Furriel';
import Admin from './components/Admin';
import AlterarSenha from './components/AlterarSenha';
import { 
  Home, 
  Coffee, 
  Utensils, 
  Moon, 
  History, 
  QrCode, 
  Users, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Smartphone, 
  Laptop, 
  Bell, 
  Check, 
  Minus, 
  Clock, 
  Award,
  ChevronRight,
  BookOpen,
  Copy,
  ExternalLink,
  Printer,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [users, setUsers] = useState<FirebaseUser[]>([]);
  const [meals, setMeals] = useState<ArranchamentoRecord[]>([]);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  // App viewport mode: 'responsive' (full-width desktop) or 'mobile' (phone simulator)
  const [viewportMode, setViewportMode] = useState<'responsive' | 'mobile'>('responsive');

  // Selected tab
  const [activeTab, setActiveTab] = useState<
    'inicio' | 'arranchamento' | 'historico' | 'qrcode' | 'usuarios' | 'furriel' | 'senha'
  >('inicio');

  const [slideDirection, setSlideDirection] = useState(1);
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  const TAB_ORDER: ('inicio' | 'arranchamento' | 'historico' | 'qrcode' | 'furriel' | 'usuarios' | 'senha')[] = [
    'inicio', 'arranchamento', 'historico', 'qrcode', 'furriel', 'usuarios', 'senha'
  ];

  const changeTab = (newTab: typeof activeTab) => {
    const currentIdx = TAB_ORDER.indexOf(activeTab);
    const newIdx = TAB_ORDER.indexOf(newTab);
    setSlideDirection(newIdx >= currentIdx ? 1 : -1);
    setActiveTab(newTab);
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
  const [siteUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.origin + window.location.pathname;
    }
    return 'https://ais-pre-45rpnwcobofcpdedbbd4ag-537545037284.us-west2.run.app/';
  });
  const [copied, setCopied] = useState(false);

  // Notification states
  const [notifications, setNotifications] = useState<string[]>([
    'Aviso: Arranchamento para amanhã encerra hoje às 18:00h.',
    'Alerta: Cardápio do almoço de hoje atualizado.'
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // QR Code refreshing timer simulation
  const [qrSeconds, setQrSeconds] = useState(28);

  const syncFromServer = async () => {
    try {
      const resUsers = await fetch('/api/users');
      if (resUsers.ok) {
        const data = await resUsers.json();
        setUsers(data);
        saveUsersList(data);
        if (currentUser) {
          const updatedMe = data.find((u: FirebaseUser) => u.id === currentUser.id);
          if (updatedMe) {
            setCurrentUser(updatedMe);
          }
        }
      }
      const resRecords = await fetch('/api/records');
      if (resRecords.ok) {
        const data = await resRecords.json();
        setMeals(data);
        saveRecordsList(data);
      }
    } catch (err) {
      console.warn("Offline ou erro de rede ao conectar com o banco de dados central:", err);
    }
  };

  useEffect(() => {
    // Load initial storage immediately
    setUsers(loadUsers());
    setMeals(loadRecords());
    
    // Fetch live shared data from server
    syncFromServer();

    // Check for updates every 8 seconds
    const interval = setInterval(() => {
      syncFromServer();
    }, 8000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  // Timer for QR code simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setQrSeconds((prev) => (prev > 0 ? prev - 1 : 30));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update lists and save to storage
  const handleUpdateUsers = async (updatedUsers: FirebaseUser[]) => {
    setUsers(updatedUsers);
    saveUsersList(updatedUsers);
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUsers),
      });
    } catch (err) {
      console.error("Erro de sincronização de usuários com o servidor:", err);
    }
  };

  const handleUpdateMeals = async (updatedMeals: ArranchamentoRecord[]) => {
    setMeals(updatedMeals);
    saveRecordsList(updatedMeals);
    try {
      await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMeals),
      });
    } catch (err) {
      console.error("Erro de sincronização de arranchamentos com o servidor:", err);
    }
  };

  // QR Code and printing actions
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(siteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintTableQRCode = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Imprimir QR Codes - 7º RC Mec</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Space+Grotesk:wght@500;700&display=swap');
    
    @page {
      size: A4 portrait;
      margin: 15mm 10mm;
    }
    
    body {
      font-family: 'Inter', sans-serif;
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
    
    .crest-icon {
      font-size: 24px;
      margin-bottom: 4px;
      color: #d4af37;
    }
    
    .unit-title {
      font-family: 'Space Grotesk', sans-serif;
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
      font-family: 'Space Grotesk', sans-serif;
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
    
    @media print {
      body {
        background-color: #white;
      }
      .qr-card {
        box-shadow: none;
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 14px; color: #7A0C0C; text-align: center; margin-top: 0; margin-bottom: 8mm; text-transform: uppercase; letter-spacing: 1px;">
    Placas de QR Code para as Mesas - Refeitório 7º RC Mec
  </h2>
  <div class="print-container">
    <!-- Card 1 -->
    <div class="qr-card">
      <div class="header-section">
        <div class="crest-icon">⚔️</div>
        <div class="unit-title">7º Regimento de Cavalaria Mecanizado</div>
        <div class="subunit-title">Regimento Sertório • Esqd C Ap</div>
      </div>
      <div class="divider"></div>
      <div class="doc-title">Arranchamento Rápido</div>
      <div class="doc-subtitle">Rancho do 7º RC Mec</div>
      <div>
        <div class="qr-wrapper">
          <img class="qr-image" src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=2d0006&data=\${encodeURIComponent(siteUrl)}" alt="QR Code" />
        </div>
      </div>
      <div class="steps-container">
        <div class="step-item">
          <span class="step-number">1</span>
          <span>Aponte a câmera do celular para o QR Code</span>
        </div>
        <div class="step-item">
          <span class="step-number">2</span>
          <span>Faça o login ou crie o seu acesso</span>
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
    
    <!-- Card 2 -->
    <div class="qr-card">
      <div class="header-section">
        <div class="crest-icon">⚔️</div>
        <div class="unit-title">7º Regimento de Cavalaria Mecanizado</div>
        <div class="subunit-title">Regimento Sertório • Esqd C Ap</div>
      </div>
      <div class="divider"></div>
      <div class="doc-title">Arranchamento Rápido</div>
      <div class="doc-subtitle">Rancho do 7º RC Mec</div>
      <div>
        <div class="qr-wrapper">
          <img class="qr-image" src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=2d0006&data=\${encodeURIComponent(siteUrl)}" alt="QR Code" />
        </div>
      </div>
      <div class="steps-container">
        <div class="step-item">
          <span class="step-number">1</span>
          <span>Aponte a câmera do celular para o QR Code</span>
        </div>
        <div class="step-item">
          <span class="step-number">2</span>
          <span>Faça o login ou crie o seu acesso</span>
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

    <!-- Card 3 -->
    <div class="qr-card" style="margin-top: 5mm;">
      <div class="header-section">
        <div class="crest-icon">⚔️</div>
        <div class="unit-title">7º Regimento de Cavalaria Mecanizado</div>
        <div class="subunit-title">Regimento Sertório • Esqd C Ap</div>
      </div>
      <div class="divider"></div>
      <div class="doc-title">Arranchamento Rápido</div>
      <div class="doc-subtitle">Rancho do 7º RC Mec</div>
      <div>
        <div class="qr-wrapper">
          <img class="qr-image" src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=2d0006&data=\${encodeURIComponent(siteUrl)}" alt="QR Code" />
        </div>
      </div>
      <div class="steps-container">
        <div class="step-item">
          <span class="step-number">1</span>
          <span>Aponte a câmera do celular para o QR Code</span>
        </div>
        <div class="step-item">
          <span class="step-number">2</span>
          <span>Faça o login ou crie o seu acesso</span>
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

    <!-- Card 4 -->
    <div class="qr-card" style="margin-top: 5mm;">
      <div class="header-section">
        <div class="crest-icon">⚔️</div>
        <div class="unit-title">7º Regimento de Cavalaria Mecanizado</div>
        <div class="subunit-title">Regimento Sertório • Esqd C Ap</div>
      </div>
      <div class="divider"></div>
      <div class="doc-title">Arranchamento Rápido</div>
      <div class="doc-subtitle">Rancho do 7º RC Mec</div>
      <div>
        <div class="qr-wrapper">
          <img class="qr-image" src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=2d0006&data=\${encodeURIComponent(siteUrl)}" alt="QR Code" />
        </div>
      </div>
      <div class="steps-container">
        <div class="step-item">
          <span class="step-number">1</span>
          <span>Aponte a câmera do celular para o QR Code</span>
        </div>
        <div class="step-item">
          <span class="step-number">2</span>
          <span>Faça o login ou crie o seu acesso</span>
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
  
  <p style="text-align: center; font-size: 10px; color: #888; font-weight: 500; margin-top: 10mm; font-family: 'Inter', sans-serif;">
    Placas prontas para recorte e fixação nas mesas do Rancho.
  </p>

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
    setActiveTab('inicio');
  };

  const handleRegisterUser = (newUser: FirebaseUser) => {
    const updated = [...users, newUser];
    handleUpdateUsers(updated);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // User details update
  const handleUpdatePassword = (newPass: string) => {
    if (!currentUser) return;
    const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, senha: newPass } : u);
    handleUpdateUsers(updatedUsers);
    setCurrentUser({ ...currentUser, senha: newPass });
  };

  const handleUpdateUser = (userId: string, updatedFields: Partial<FirebaseUser>) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      const checkRole = updatedFields.nivel !== undefined ? updatedFields.nivel : targetUser.nivel;
      const checkRep = updatedFields.reparticao !== undefined ? updatedFields.reparticao : targetUser.reparticao;
      if (checkRole === 'Furriel') {
        if (checkRep === 'Oficiais' || checkRep === 'St/Sgt') {
          alert('Os furriéis devem ser cadastrados por esquadrão. Oficiais e sargentos não precisam de furriel.');
          return;
        }
      }
    }
    const updatedUsers = users.map(u => u.id === userId ? { ...u, ...updatedFields } : u);
    handleUpdateUsers(updatedUsers);
    if (currentUser && currentUser.id === userId) {
      setCurrentUser({ ...currentUser, ...updatedFields });
    }
  };

  const handleDeleteUser = (userId: string) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    const updatedMeals = meals.filter(m => cleanTextId(m.usuario) !== userId);
    handleUpdateUsers(updatedUsers);
    handleUpdateMeals(updatedMeals);
  };

  const handleAddUserByAdmin = (newUser: FirebaseUser) => {
    const updatedUsers = [...users, newUser];
    handleUpdateUsers(updatedUsers);
  };

  // Arranchar / Desarranchar
  const handleUpdateMeal = (date: string, mealKey: 'cafe' | 'almoco' | 'jantar', value: boolean) => {
    if (!currentUser) return;

    const userKey = currentUser.usuario.toLowerCase();
    const existingIndex = meals.findIndex(m => m.usuario.toLowerCase() === userKey && m.dataRegistro === date);
    let updatedMeals = [...meals];

    if (existingIndex > -1) {
      updatedMeals[existingIndex] = {
        ...updatedMeals[existingIndex],
        [mealKey]: value
      };
    } else {
      const newRecord: ArranchamentoRecord = {
        idRegistro: `${cleanTextId(currentUser.usuario)}_${date}`,
        usuario: currentUser.usuario,
        reparticao: currentUser.reparticao,
        dataRegistro: date,
        cafe: mealKey === 'cafe' ? value : false,
        almoco: mealKey === 'almoco' ? value : false,
        jantar: mealKey === 'jantar' ? value : false
      };
      updatedMeals.push(newRecord);
    }

    handleUpdateMeals(updatedMeals);
  };

  const handleBulkUpdateMeals = (updates: { date: string; cafe: boolean; almoco: boolean; jantar: boolean }[]) => {
    if (!currentUser) return;

    let updatedMeals = [...meals];

    updates.forEach(({ date, cafe, almoco, jantar }) => {
      const userKey = currentUser.usuario.toLowerCase();
      const existingIndex = updatedMeals.findIndex(m => m.usuario.toLowerCase() === userKey && m.dataRegistro === date);

      if (existingIndex > -1) {
        updatedMeals[existingIndex] = {
          ...updatedMeals[existingIndex],
          cafe,
          almoco,
          jantar
        };
      } else {
        const newRecord: ArranchamentoRecord = {
          idRegistro: `${cleanTextId(currentUser.usuario)}_${date}`,
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

    handleUpdateMeals(updatedMeals);
  };

  // Access limits
  const isMilitar = currentUser?.nivel === 'Militar';
  const isFurriel = currentUser?.nivel === 'Furriel';
  const isAdmin = currentUser?.nivel === 'Administrador';

  // Allowed tabs based on access level
  const isTabAllowed = (tab: typeof activeTab) => {
    if (isMilitar) {
      return ['inicio', 'arranchamento', 'historico', 'qrcode', 'senha'].includes(tab);
    }
    if (isFurriel) {
      return ['inicio', 'arranchamento', 'historico', 'qrcode', 'furriel', 'senha'].includes(tab);
    }
    return true; // Admin can see everything!
  };

  // If not logged in, render the gorgeous login
  if (!currentUser) {
    return (
      <Login 
        onLoginSuccess={handleLoginSuccess}
        users={users}
        onRegisterUser={handleRegisterUser}
      />
    );
  }

  const todayStr = getTodayDateStr();

  // Find today's user records
  const todayRecord = meals.find(m => m.usuario.toLowerCase() === currentUser.usuario.toLowerCase() && m.dataRegistro === todayStr);

  // Calculate dynamic today statistics counters for the dashboard cards
  const todayMeals = meals.filter(m => m.dataRegistro === todayStr);
  const totalCafeToday = todayMeals.filter(m => m.cafe).length;
  const totalAlmocoToday = todayMeals.filter(m => m.almoco).length;
  const totalJantarToday = todayMeals.filter(m => m.jantar).length;
  const grandTotalToday = totalCafeToday + totalAlmocoToday + totalJantarToday;

  // Render correct tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'inicio':
        return (
          <div className="space-y-6">
            {/* Welcome banner */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200/60 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-display font-black text-vinho tracking-tight">
                  Bem-vindo, {currentUser.usuario}!
                </h2>
                <p className="text-xs text-gray-500 font-semibold mt-1">
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 bg-vinho/5 border border-vinho/10 rounded-2xl">
                <Award className="w-4 h-4 text-ouro animate-bounce" />
                <span className="text-xs font-display font-black uppercase text-vinho tracking-wider">{currentUser.nivel}</span>
              </div>
            </div>

            {/* Meal Status circle cards from image */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Café Circle Card */}
              <div className="bg-white p-6 border border-gray-200 rounded-3xl shadow-sm flex flex-col items-center justify-between min-h-[220px]">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CAFÉ</span>
                
                <div className="my-4 flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${
                    todayRecord?.cafe ? 'bg-amber-50 border-ouro text-amber-600' : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}>
                    <Coffee className="w-7 h-7" />
                  </div>
                  <span className={`text-xs font-bold uppercase mt-3 tracking-wider ${
                    todayRecord?.cafe ? 'text-emerald-600' : 'text-gray-400'
                  }`}>
                    {todayRecord?.cafe ? 'Arranchado' : 'Não solicitado'}
                  </span>
                </div>

                <div className="w-full flex justify-center">
                  {todayRecord?.cafe ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                      <Minus className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>

              {/* Almoço Circle Card */}
              <div className="bg-white p-6 border border-gray-200 rounded-3xl shadow-sm flex flex-col items-center justify-between min-h-[220px]">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ALMOÇO</span>
                
                <div className="my-4 flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${
                    todayRecord?.almoco ? 'bg-emerald-50 border-ouro text-emerald-600' : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}>
                    <Utensils className="w-7 h-7" />
                  </div>
                  <span className={`text-xs font-bold uppercase mt-3 tracking-wider ${
                    todayRecord?.almoco ? 'text-emerald-600' : 'text-gray-400'
                  }`}>
                    {todayRecord?.almoco ? 'Arranchado' : 'Não solicitado'}
                  </span>
                </div>

                <div className="w-full flex justify-center">
                  {todayRecord?.almoco ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                      <Minus className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>

              {/* Janta Circle Card */}
              <div className="bg-white p-6 border border-gray-200 rounded-3xl shadow-sm flex flex-col items-center justify-between min-h-[220px]">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">JANTA</span>
                
                <div className="my-4 flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${
                    todayRecord?.jantar ? 'bg-indigo-50 border-ouro text-indigo-600' : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}>
                    <Moon className="w-7 h-7" />
                  </div>
                  <span className={`text-xs font-bold uppercase mt-3 tracking-wider ${
                    todayRecord?.jantar ? 'text-emerald-600' : 'text-gray-400'
                  }`}>
                    {todayRecord?.jantar ? 'Arranchado' : 'Não solicitado'}
                  </span>
                </div>

                <div className="w-full flex justify-center">
                  {todayRecord?.jantar ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                      <Minus className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* RESUMO DE HOJE (Stats area from image) */}
            <div className="bg-white p-6 border border-gray-200 rounded-3xl shadow-sm">
              <h4 className="text-xs font-display font-black text-vinho uppercase tracking-widest mb-4">
                RESUMO DE HOJE
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* Café Count */}
                <div className="bg-[#F9F9F9] border border-gray-200 p-4 rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">CAFÉ</span>
                  <span className="text-2xl font-display font-black text-vinho mt-1 block font-mono">{totalCafeToday}</span>
                  <span className="text-[9px] text-gray-500 block mt-1">militares</span>
                </div>

                {/* Almoço Count */}
                <div className="bg-[#F9F9F9] border border-gray-200 p-4 rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">ALMOÇO</span>
                  <span className="text-2xl font-display font-black text-vinho mt-1 block font-mono">{totalAlmocoToday}</span>
                  <span className="text-[9px] text-gray-500 block mt-1">militares</span>
                </div>

                {/* Janta Count */}
                <div className="bg-[#F9F9F9] border border-gray-200 p-4 rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">JANTA</span>
                  <span className="text-2xl font-display font-black text-vinho mt-1 block font-mono">{totalJantarToday}</span>
                  <span className="text-[9px] text-gray-500 block mt-1">militares</span>
                </div>

                {/* Total Count */}
                <div className="bg-vinho/[0.03] border border-vinho/20 p-4 rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-vinho uppercase tracking-wider block">TOTAL</span>
                  <span className="text-2xl font-display font-black text-vinho mt-1 block font-mono">{grandTotalToday}</span>
                  <span className="text-[9px] text-gray-500 block mt-1">militares</span>
                </div>

              </div>
            </div>

            {/* Quick Action Button to go to Arranchamento */}
            <button
              onClick={() => setActiveTab('arranchamento')}
              className="w-full py-4 bg-vinho hover:bg-vinho-escuro text-white rounded-2xl font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-vinho/10 cursor-pointer"
            >
              <span>CONFIRMAR ARRANCHAMENTO</span>
              <ChevronRight className="w-4 h-4 text-ouro" />
            </button>
          </div>
        );
      case 'arranchamento':
        return (
          <Arranchamento 
            user={currentUser} 
            users={users} 
            meals={meals} 
            onUpdateMeal={handleUpdateMeal} 
            onBulkUpdateMeals={handleBulkUpdateMeals} 
          />
        );
      case 'historico':
        // Individual history screen
        const myRecords = meals.filter(m => m.usuario.toLowerCase() === currentUser.usuario.toLowerCase());
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 border border-gray-200/60 rounded-3xl shadow-sm">
              <h3 className="text-lg font-display font-black text-vinho uppercase tracking-tight flex items-center gap-2">
                <History className="w-5 h-5 text-ouro" />
                Histórico de Refeições
              </h3>
              <p className="text-xs text-gray-500 font-semibold mt-1">
                Acompanhe o registro consolidado das suas solicitações de rancho.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
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
      case 'qrcode':
        return (
          <div className="max-w-md mx-auto space-y-6 pb-12">
            {/* Header Card */}
            <div className="bg-white p-6 border border-gray-200 rounded-3xl shadow-sm text-center">
              <h3 className="text-lg font-display font-black text-vinho uppercase tracking-tight flex items-center justify-center gap-2">
                <QrCode className="w-5 h-5 text-ouro" />
                QR Code do Sistema
              </h3>
              <p className="text-xs text-gray-500 font-semibold mt-1">
                Acesse o Arrancha+ diretamente do seu smartphone.
              </p>
            </div>

            {/* QR Code Container and Actions */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center shadow-sm">
              
              {/* Actual QRCodeSVG pointing to siteUrl */}
              <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-md mb-6 relative">
                <QRCodeSVG value={siteUrl} size={180} level="H" />
                
                {/* Absolute centermost logo placeholder */}
                <div className="absolute inset-0 m-auto w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center p-0.5">
                  <span className="text-[#7A0C0C] font-display font-black text-xs leading-none">7º</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="w-full flex items-center justify-center gap-2.5 mb-2">
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="bg-gray-50 hover:bg-ouro/10 border border-gray-200 hover:border-ouro/50 py-2 px-4 rounded-xl text-xs text-gray-700 font-bold transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-vinho" />
                      <span>Copiar Link</span>
                    </>
                  )}
                </button>

                <a
                  href={siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-50 hover:bg-ouro/10 border border-gray-200 hover:border-ouro/50 py-2 px-4 rounded-xl text-xs text-gray-700 font-bold transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-vinho" />
                  <span>Testar Link</span>
                </a>
              </div>

              <p className="text-[10px] text-gray-400 font-medium text-center mb-4">
                Este QR Code aponta para o endereço do nosso servidor em nuvem atual.
              </p>

              {/* iOS / Safari Warning Box */}
              <div className="w-full text-left bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-amber-700 font-display font-bold text-xs uppercase tracking-wider">
                      Instruções para Celular (iOS / Safari)
                    </h4>
                    <p className="text-[11px] text-gray-600 mt-1 leading-relaxed font-medium">
                      O ambiente de testes da Google é seguro e privado. Se ao escanear o QR Code você ver uma tela com <strong>"Action required..."</strong> ou erro de <strong>"cookie"</strong>, resolva facilmente:
                    </p>
                    <ul className="list-disc list-inside text-[10px] text-gray-500 mt-1.5 space-y-1 font-medium leading-relaxed">
                      <li>Use o navegador <strong>Google Chrome</strong> no seu celular para ler/abrir o link.</li>
                      <li>No iPhone, acesse <strong>Ajustes &gt; Safari</strong> e desative a opção <strong className="text-gray-800 font-semibold">"Impedir Rastreamento entre Sites"</strong>.</li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>

            {/* Print Section Box */}
            <div className="bg-gradient-to-br from-vinho/5 to-ouro/5 border border-vinho/10 rounded-3xl p-6 shadow-sm text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-vinho/10 rounded-2xl">
                  <Printer className="w-6 h-6 text-vinho" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-display font-black text-vinho uppercase tracking-tight">
                  Imprimir para as Mesas do Rancho
                </h4>
                <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed px-4">
                  Gere uma folha perfeitamente formatada contendo <strong>4 placas de QR Code</strong> para recortar e colar nas mesas do refeitório. Permite acesso rápido dos celulares dos militares!
                </p>
              </div>

              <button
                type="button"
                onClick={handlePrintTableQRCode}
                className="w-full bg-vinho hover:bg-vinho-escuro border border-ouro/40 text-white font-display font-black py-4 px-6 rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
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
        return <Furriel user={currentUser} users={users} meals={meals} />;
      case 'senha':
        return <AlterarSenha user={currentUser} onUpdatePassword={handleUpdatePassword} />;
      default:
        return null;
    }
  };

  const isMobileSim = viewportMode === 'mobile';
  const showMobileLayout = isMobileSim || isMobileScreen;

  if (showMobileLayout) {
    const pageSlideVariants = {
      enter: (direction: number) => ({
        x: direction > 0 ? '100vw' : '-100vw',
        opacity: 0,
      }),
      center: {
        x: 0,
        opacity: 1,
      },
      exit: (direction: number) => ({
        x: direction > 0 ? '-100vw' : '100vw',
        opacity: 0,
      }),
    };

    const mobileContent = (
      <div className={`flex flex-col bg-[#F3F3F3] h-full w-full ${isMobileScreen ? 'min-h-screen' : ''} relative overflow-hidden select-none`}>
        {/* Phone App Inner Header bar */}
        <div className="bg-vinho text-white px-5 py-4 border-b border-ouro/20 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center border border-ouro shrink-0 p-0.5 shadow-sm">
              <span className="text-vinho font-display font-bold text-[12px]">7º</span>
            </div>
            <span className="text-base font-display font-black tracking-tight uppercase">
              ARRANCHA<span className="text-ouro">+</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] font-bold leading-none">{currentUser.usuario}</p>
              <p className="text-[8px] text-ouro font-medium leading-none mt-1 uppercase tracking-wider">{currentUser.nivel}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-white/80 hover:text-white shrink-0 cursor-pointer"
              title="Desconectar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* App Content scrolling zone */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-24 bg-[#F3F3F3] relative" id="mobile-scroll-container">
          <AnimatePresence mode="wait" custom={slideDirection}>
            <motion.div
              key={activeTab}
              custom={slideDirection}
              variants={pageSlideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
              className="w-full h-full"
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        <nav className={`fixed md:absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-1 flex justify-around items-center z-30 shadow-lg ${isMobileSim ? 'rounded-b-[42px]' : ''}`}>
          {isTabAllowed('inicio') && (
            <button
              onClick={() => changeTab('inicio')}
              className={`flex flex-col items-center gap-1 transition-all cursor-pointer flex-1 min-w-[45px] ${
                activeTab === 'inicio' ? 'text-vinho scale-105 font-bold' : 'text-gray-400'
              }`}
            >
              <Home className="w-4.5 h-4.5" />
              <span className="text-[8px] font-semibold tracking-tight">Início</span>
            </button>
          )}

          {isTabAllowed('arranchamento') && (
            <button
              onClick={() => changeTab('arranchamento')}
              className={`flex flex-col items-center gap-1 transition-all cursor-pointer flex-1 min-w-[45px] ${
                activeTab === 'arranchamento' ? 'text-vinho scale-105 font-bold' : 'text-gray-400'
              }`}
            >
              <Coffee className="w-4.5 h-4.5" />
              <span className="text-[8px] font-semibold tracking-tight">Rancho</span>
            </button>
          )}

          {isTabAllowed('historico') && (
            <button
              onClick={() => changeTab('historico')}
              className={`flex flex-col items-center gap-1 transition-all cursor-pointer flex-1 min-w-[45px] ${
                activeTab === 'historico' ? 'text-vinho scale-105 font-bold' : 'text-gray-400'
              }`}
            >
              <History className="w-4.5 h-4.5" />
              <span className="text-[8px] font-semibold tracking-tight">Histórico</span>
            </button>
          )}

          {isTabAllowed('qrcode') && (
            <button
              onClick={() => changeTab('qrcode')}
              className={`flex flex-col items-center gap-1 transition-all cursor-pointer flex-1 min-w-[45px] ${
                activeTab === 'qrcode' ? 'text-vinho scale-105 font-bold' : 'text-gray-400'
              }`}
            >
              <QrCode className="w-4.5 h-4.5" />
              <span className="text-[8px] font-semibold tracking-tight">QR Code</span>
            </button>
          )}

          {isTabAllowed('furriel') && (
            <button
              onClick={() => changeTab('furriel')}
              className={`flex flex-col items-center gap-1 transition-all cursor-pointer flex-1 min-w-[45px] ${
                activeTab === 'furriel' ? 'text-vinho scale-105 font-bold' : 'text-gray-400'
              }`}
            >
              <BookOpen className="w-4.5 h-4.5" />
              <span className="text-[8px] font-semibold tracking-tight">Furriel</span>
            </button>
          )}

          {isTabAllowed('usuarios') && (
            <button
              onClick={() => changeTab('usuarios')}
              className={`flex flex-col items-center gap-1 transition-all cursor-pointer flex-1 min-w-[45px] ${
                activeTab === 'usuarios' ? 'text-vinho scale-105 font-bold' : 'text-gray-400'
              }`}
            >
              <Users className="w-4.5 h-4.5" />
              <span className="text-[8px] font-semibold tracking-tight">Admin</span>
            </button>
          )}

          {isTabAllowed('senha') && (
            <button
              onClick={() => changeTab('senha')}
              className={`flex flex-col items-center gap-1 transition-all cursor-pointer flex-1 min-w-[45px] ${
                activeTab === 'senha' ? 'text-vinho scale-105 font-bold' : 'text-gray-400'
              }`}
            >
              <Settings className="w-4.5 h-4.5" />
              <span className="text-[8px] font-semibold tracking-tight">Senha</span>
            </button>
          )}
        </nav>
      </div>
    );

    if (isMobileSim) {
      return (
        <div className="min-h-screen bg-[#F3F3F3] text-grafite flex flex-col font-sans selection:bg-vinho/10 select-none">
          {/* Header ONLY for simulation toggle */}
          <header className="bg-vinho text-white border-b border-ouro/25 px-6 py-4 flex justify-between items-center z-20 shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border-2 border-ouro flex items-center justify-center p-1 shrink-0">
                <span className="text-vinho font-display font-black text-base tracking-tighter">7º</span>
              </div>
              <div>
                <span className="text-lg font-display font-black tracking-tight block">
                  ARRANCHA<span className="text-ouro">+</span>
                </span>
                <span className="text-[10px] text-ouro font-display font-bold tracking-wider block leading-none uppercase mt-0.5">
                  7º RC Mec (Simulação)
                </span>
              </div>
            </div>
            
            <div className="flex items-center bg-vinho-escuro border border-white/10 rounded-xl p-0.5 text-[11px] font-bold">
              <button
                onClick={() => setViewportMode('responsive')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                  viewportMode === 'responsive' ? 'bg-ouro text-vinho shadow' : 'text-white/75 hover:text-white'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Painel (Web)</span>
              </button>
              <button
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
              {/* Top Phone notch speaker and camera bar */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-5 bg-gray-800 rounded-full z-30 flex items-center justify-center gap-1.5">
                <div className="w-12 h-1 bg-gray-600 rounded-full" />
                <div className="w-2 h-2 bg-gray-700 rounded-full" />
              </div>

              {/* Phone Header Status indicators */}
              <div className="h-9 bg-white flex justify-between items-center px-8 text-[11px] font-bold text-gray-400 shrink-0 select-none pt-3">
                <span>09:30</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px]">5G</span>
                  <div className="flex gap-0.5 items-end h-2 shrink-0">
                    <div className="w-0.5 h-1 bg-gray-400" />
                    <div className="w-0.5 h-1.5 bg-gray-400" />
                    <div className="w-0.5 h-2 bg-gray-400" />
                  </div>
                  <div className="w-5 h-3 border border-gray-400 rounded-sm p-0.5 flex items-center">
                    <div className="h-full w-full bg-gray-400 rounded-2xs" />
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

  return (
    <div className="min-h-screen bg-[#F3F3F3] text-grafite flex flex-col font-sans selection:bg-vinho/10 select-none print:bg-white print:text-black">
      
      {/* Dynamic Header (Web Dashboard view) */}
      <header className="bg-vinho text-white border-b border-ouro/25 px-6 py-4 flex justify-between items-center z-20 print:hidden shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="w-10 h-10 rounded-xl bg-white border-2 border-ouro flex items-center justify-center p-1 shrink-0">
            <span className="text-vinho font-display font-black text-base tracking-tighter">7º</span>
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

        {/* Action Controls & Simulated Profile */}
        <div className="flex items-center gap-4">
          
          {/* Simulation Toggle Bar */}
          <div className="hidden lg:flex bg-vinho-escuro border border-white/10 rounded-xl p-0.5 text-[11px] font-bold">
            <button
              onClick={() => setViewportMode('responsive')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                viewportMode === 'responsive' ? 'bg-ouro text-vinho shadow' : 'text-white/75 hover:text-white'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Painel (Web)</span>
            </button>
            <button
              onClick={() => setViewportMode('mobile')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                viewportMode === 'mobile' ? 'bg-ouro text-vinho shadow' : 'text-white/75 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Celular (App)</span>
            </button>
          </div>

          {/* Notifications bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-white/10 rounded-xl relative transition-all cursor-pointer"
            >
              <Bell className="w-5 h-5 text-white" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-ouro rounded-full border-2 border-vinho" />
            </button>

            {/* Notification Dropdown */}
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
                    <h5 className="font-display font-black text-vinho uppercase tracking-wider mb-2 pb-1 border-b border-gray-100">Informativos</h5>
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

          {/* Profile Name info matching the web image */}
          <div className="hidden sm:flex items-center gap-2.5 border-l border-white/15 pl-4">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-ouro/30 flex items-center justify-center font-display font-black text-xs text-ouro">
              {currentUser.usuario.substring(0, 2).toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold leading-none">{currentUser.usuario}</p>
              <p className="text-[9px] text-ouro font-medium leading-none mt-0.5">{currentUser.nivel}</p>
            </div>
          </div>

          {/* Logout Trigger */}
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-white/10 rounded-xl transition-all cursor-pointer text-white/80 hover:text-white shrink-0"
            title="Desconectar do sistema"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className={`flex-1 flex flex-col md:flex-row min-h-0 relative ${isMobileSim ? 'items-center justify-center p-6 bg-gray-200/50' : ''}`}>
        
        {isMobileSim ? (
          /* =========================================================================
             IMMERSIVE MOBILE APP SIMULATOR MOCKUP (Exactly what user requested!)
             ========================================================================= */
          <div className="w-full max-w-[420px] h-[820px] bg-white border-8 border-gray-800 rounded-[50px] overflow-hidden flex flex-col shadow-2xl relative">
            
            {/* Top Phone notch speaker and camera bar */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-5 bg-gray-800 rounded-full z-30 flex items-center justify-center gap-1.5">
              <div className="w-12 h-1 bg-gray-600 rounded-full" />
              <div className="w-2 h-2 bg-gray-700 rounded-full" />
            </div>

            {/* Phone Header Status indicators */}
            <div className="h-9 bg-white flex justify-between items-center px-8 text-[11px] font-bold text-gray-400 shrink-0 select-none pt-3">
              <span>09:30</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px]">5G</span>
                {/* Wifi / Battery visual grids */}
                <div className="flex gap-0.5 items-end h-2 shrink-0">
                  <div className="w-0.5 h-1 bg-gray-400" />
                  <div className="w-0.5 h-1.5 bg-gray-400" />
                  <div className="w-0.5 h-2 bg-gray-400" />
                </div>
                <div className="w-5 h-3 border border-gray-400 rounded-sm p-0.5 flex items-center">
                  <div className="h-full w-full bg-gray-400 rounded-2xs" />
                </div>
              </div>
            </div>

            {/* Phone App Inner Header bar from image */}
            <div className="bg-vinho text-white px-5 py-3.5 border-b border-ouro/20 flex items-center justify-between shrink-0">
              <span className="text-sm font-display font-black tracking-tight">ARRANCHA+</span>
              <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center border border-ouro shrink-0 p-0.5">
                <span className="text-vinho font-display font-bold text-[10px]">7º</span>
              </div>
            </div>

            {/* App Content scrolling zone */}
            <div className="flex-1 overflow-y-auto p-5 pb-20 bg-[#F3F3F3]" id="mobile-scroll-container">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  {renderTabContent()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Phone App Native Bottom Nav bar from mobile image */}
            <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-3 flex justify-around items-center z-30 rounded-b-[42px] shadow-lg">
              
              <button
                onClick={() => setActiveTab('inicio')}
                className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'inicio' ? 'text-vinho scale-105 font-bold' : 'text-gray-400'
                }`}
              >
                <Home className="w-4.5 h-4.5" />
                <span className="text-[9px] font-semibold">Início</span>
              </button>

              <button
                onClick={() => setActiveTab('arranchamento')}
                className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'arranchamento' ? 'text-vinho scale-105 font-bold' : 'text-gray-400'
                }`}
              >
                <Coffee className="w-4.5 h-4.5" />
                <span className="text-[9px] font-semibold">Rancho</span>
              </button>

              <button
                onClick={() => setActiveTab('historico')}
                className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'historico' ? 'text-vinho scale-105 font-bold' : 'text-gray-400'
                }`}
              >
                <History className="w-4.5 h-4.5" />
                <span className="text-[9px] font-semibold">Histórico</span>
              </button>

              <button
                onClick={() => setActiveTab('qrcode')}
                className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'qrcode' ? 'text-vinho scale-105 font-bold' : 'text-gray-400'
                }`}
              >
                <QrCode className="w-4.5 h-4.5" />
                <span className="text-[9px] font-semibold">QR Code</span>
              </button>

              <button
                onClick={() => setActiveTab('senha')}
                className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'senha' ? 'text-vinho scale-105 font-bold' : 'text-gray-400'
                }`}
              >
                <Settings className="w-4.5 h-4.5" />
                <span className="text-[9px] font-semibold">Perfil</span>
              </button>

            </nav>
            
          </div>
        ) : (
          /* =========================================================================
             STANDARD WEB DASHBOARD LAYOUT (Elegant Sidebar + Main Content)
             ========================================================================= */
          <>
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 bg-vinho-escuro text-white shrink-0 flex flex-col justify-between print:hidden shadow-lg border-r border-ouro/15">
              
              {/* Menu listings */}
              <div className="py-6 px-3 space-y-1">
                
                {/* Início */}
                {isTabAllowed('inicio') && (
                  <button
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
                )}

                {/* Arranchamento */}
                {isTabAllowed('arranchamento') && (
                  <button
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
                )}

                {/* Histórico */}
                {isTabAllowed('historico') && (
                  <button
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
                )}

                {/* QR Code */}
                {isTabAllowed('qrcode') && (
                  <button
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
                )}

                {/* Furriel panel (Sees only if Furriel or Admin) */}
                {isTabAllowed('furriel') && (
                  <button
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
                {isTabAllowed('usuarios') && (
                  <button
                    onClick={() => setActiveTab('usuarios')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === 'usuarios' 
                        ? 'bg-vinho text-ouro shadow-inner border-l-4 border-ouro' 
                        : 'text-white/80 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Users className="w-4.5 h-4.5" />
                    <span>Admin</span>
                  </button>
                )}

                {/* Configurações (Change Pass) */}
                {isTabAllowed('senha') && (
                  <button
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
                )}



              </div>

              {/* Bottom sidebar brand footer */}
              <div className="p-4 border-t border-white/5 bg-black/10 text-[11px] text-white/60 text-center font-display font-black tracking-wider">
                <p>ARRANCHA+</p>
              </div>

            </aside>

            {/* Scrollable content container */}
            <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
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
          </>
        )}

      </div>
    </div>
  );
}
