/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, ChangeEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    SaveIcon, BellIcon as BellIconLucide, UserIcon as UserIconLucide, SettingsIcon as SettingsIconLucide, 
    BellOffIcon, MoonIcon, SunIcon, 
    KeyIcon, LogOutIcon, AlertTriangleIcon, DatabaseIcon as DatabaseIconLucide, 
    MailIcon, MessageSquareIcon, CheckIcon, XIcon 
} from 'lucide-react';
import './styles/Configuracoes.css'; // Certifique-se que este CSS existe e está correto

// Tipagem para os estados de notificação e limites
interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  system: boolean;
}

interface LimiteSettings {
  producao: number;
  estoque: number;
  manutencao: number;
}

// Componente renderIcon para a navegação principal (similar aos outros layouts)
const renderAppIcon = (iconName: string) => {
    // Reutilize a função renderIcon das outras telas (Usinagem, Montagem, etc.)
    // Certifique-se que ela inclui todos os cases: "leaf", "dashboard", "production", "assembly", "status", "warehouse", "reports", "settings"
    switch (iconName) {
      case "leaf":
        return (
          <img
            alt="Logotipo da Empresa"
            src="/tela-principal-logo.svg" 
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/40x40/cccccc/333333?text=Logo'; }}
          />
        );
      case "dashboard": // Usado para Início
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        );
      case "production": // Ícone para Produção
          return (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="6" y1="20" x2="6" y2="14"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="18" y1="20" x2="18" y2="10"></line>
              </svg>
          );
      case "assembly": // Ícone para Montagem
          return (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
          );
      case "status": // Ícone para Usinagem
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
        );
      case "warehouse": // Ícone para Depósito
          return (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-6l-2-7h-4l-2 7H2"></path>
                  <path d="M12 12v8H3l2-4h14l2 4h-9v-8Z"></path>
                  <path d="M4 22v-2"></path><path d="M20 22v-2"></path>
                  <path d="M12 12L10 7h4l-2 5Z"></path>
              </svg>
          );
      case "reports": // Ícone para Relatórios
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        );
      case "settings": // Ícone para Configurações (na navegação principal)
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle>
          </svg>
        );
      default: return null;
    }
  };


export const LayoutConfiguracoes = () => {
  const navigate = useNavigate();
  const [activeConfigSection, setActiveConfigSection] = useState('geral'); 
  const [language, setLanguage] = useState(() => localStorage.getItem('valmetDashboardLanguage') || 'pt-BR');
  const [timezone, setTimezone] = useState(() => localStorage.getItem('valmetDashboardTimezone') || 'America/Sao_Paulo');
  
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const storedDarkModeRaw = localStorage.getItem('valmetDashboardDarkMode');
    return storedDarkModeRaw !== null ? JSON.parse(storedDarkModeRaw) : false;
  });

  const [notifications, setNotifications] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('valmetDashboardNotifications');
    return saved ? JSON.parse(saved) : { email: true, push: true, sms: false, system: true };
  });
  const [limites, setLimites] = useState<LimiteSettings>(() => {
    const saved = localStorage.getItem('valmetDashboardLimites');
    return saved ? JSON.parse(saved) : { producao: 80, estoque: 20, manutencao: 30 };
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('valmetDashboardDarkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => { localStorage.setItem('valmetDashboardLanguage', language); }, [language]);
  useEffect(() => { localStorage.setItem('valmetDashboardTimezone', timezone); }, [timezone]);
  useEffect(() => { localStorage.setItem('valmetDashboardNotifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('valmetDashboardLimites', JSON.stringify(limites)); }, [limites]);

  const handleAppNavigation = (path: string) => {
    navigate(path);
  };

  const handleChange = () => {
    setHasChanges(true);
    if (saveStatus === 'success' || saveStatus === 'error') {
        setSaveStatus(null);
    }
  };

  const handleSave = () => {
    setSaveStatus('saving');
    console.log("Salvando configurações:", { language, timezone, darkMode, notifications, limites });
    setTimeout(() => {
      const success = true; 
      if (success) {
        setSaveStatus('success');
        setHasChanges(false);
        console.log("Configurações salvas com sucesso!");
      } else {
        setSaveStatus('error');
        console.error("Erro ao salvar configurações!");
      }
      setTimeout(() => { setSaveStatus(null); }, 3000);
    }, 1500);
  };

  const handleCancel = () => {
    const storedLang = localStorage.getItem('valmetDashboardLanguage');
    const storedTimezone = localStorage.getItem('valmetDashboardTimezone');
    const storedDarkModeRaw = localStorage.getItem('valmetDashboardDarkMode');
    const storedNotificationsRaw = localStorage.getItem('valmetDashboardNotifications');
    const storedLimitesRaw = localStorage.getItem('valmetDashboardLimites');

    setLanguage(storedLang || 'pt-BR');
    setTimezone(storedTimezone || 'America/Sao_Paulo');
    setDarkMode(storedDarkModeRaw !== null ? JSON.parse(storedDarkModeRaw) : false);
    setNotifications(storedNotificationsRaw ? JSON.parse(storedNotificationsRaw) : { email: true, push: true, sms: false, system: true });
    setLimites(storedLimitesRaw ? JSON.parse(storedLimitesRaw) : { producao: 80, estoque: 20, manutencao: 30 });
    
    setHasChanges(false);
    setSaveStatus(null);
    console.log("Alterações canceladas.");
  };

  const toggleNotification = (type: keyof NotificationSettings) => {
    setNotifications(prev => ({ ...prev, [type]: !prev[type] }));
    handleChange();
  };

  const updateLimite = (type: keyof LimiteSettings, value: number) => {
    setLimites(prev => ({ ...prev, [type]: value }));
    handleChange();
  };

  const toggleThemePreference = (isDark: boolean) => {
    setDarkMode(isDark); 
    handleChange(); 
  };

  // Itens para a navegação principal da aplicação (ATUALIZADO)
  const appNavItems = [
    { name: "Início", icon: "dashboard", path: "/" }, // Supondo que HomePage é a rota "/"
    { name: "Produção", icon: "production", path: "/tela-producao" },
    { name: "Montagem", icon: "assembly", path: "/tela-montagem" },
    { name: "Usinagem", icon: "status", path: "/tela-usinagem" },
    { name: "Depósito", icon: "warehouse", path: "/tela-deposito" },
    // { name: "Relatórios", icon: "reports", path: "/relatorios" }, // Removido temporariamente
    { name: "Configurações", icon: "settings", path: "/configuracoes" }
  ];
  const currentAppPath = "/configuracoes"; // Para destacar o item "Configurações"

  // Itens para a navegação interna da página de Configurações
  const configSidebarItems = [
    { id: 'geral', name: 'Geral', icon: <SettingsIconLucide size={20} /> },
    { id: 'usuario', name: 'Usuário', icon: <UserIconLucide size={20} /> },
    { id: 'sistema', name: 'Sistema', icon: <DatabaseIconLucide size={20} /> },
    { id: 'notificacoes', name: 'Notificações', icon: <BellIconLucide size={20} /> }
  ];

  const renderSaveStatus = () => {
    if (!saveStatus) return null;
    let message = "";
    let className = "save-status";
    switch (saveStatus) {
      case 'saving': message = "Salvando..."; className += " saving"; break;
      case 'success': message = "Salvo com sucesso!"; className += " success"; break;
      case 'error': message = "Erro ao salvar"; className += " error"; break;
      default: return null;
    }
    return <span className={className}>{message}</span>;
  };


  return (
    <div id="configuracoes-page" className="configuracoes-container">
      {/* Sidebar Principal da Aplicação */}
      <aside className="app-sidebar"> 
        <div className="app-sidebar-header">
          <div className="app-sidebar-logo">{renderAppIcon("leaf")}</div>
          <span className="app-sidebar-title">VALMET</span>
        </div>
        <nav className="app-nav">
          {appNavItems.map((item) => (
            <div 
              key={item.path}
              className={`app-nav-item ${currentAppPath === item.path ? 'app-nav-item-active' : 'app-nav-item-inactive'}`}
              onClick={() => handleAppNavigation(item.path)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAppNavigation(item.path);}}
            >
              <span className="app-nav-icon">{renderAppIcon(item.icon)}</span>
              <span className="app-nav-text">{item.name}</span>
            </div>
          ))}
        </nav>
        <div className="app-user-profile">
          <div className="app-user-avatar">
            <UserIconLucide size={24} /> 
          </div>
          <div className="app-user-info">
            <div className="app-user-name">Administrador</div>
            <div className="app-user-role">Admin</div>
          </div>
        </div>
      </aside>

      {/* Conteúdo principal da página de Configurações */}
      <main className="main-content-config"> 
        <header className="header">
          <div className="header-content">
            <h1 className="page-title">Configurações</h1>
            <p className="page-description">
              Gerencie as configurações do sistema, usuário e notificações
            </p>
          </div>
          <div className="header-actions">
            {hasChanges && (
              <>
                <button className="btn btn-outline" onClick={handleCancel}>
                  <XIcon size={16} />
                  <span>Cancelar</span>
                </button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saveStatus === 'saving'}>
                  <SaveIcon size={16} />
                  <span>{saveStatus === 'saving' ? 'Salvando...' : 'Salvar Alterações'}</span>
                </button>
              </>
            )}
            {renderSaveStatus()}
          </div>
        </header>

        <nav className="config-sections-nav">
          {configSidebarItems.map((item) => (
            <button
              key={item.id}
              className={`config-section-nav-item ${activeConfigSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveConfigSection(item.id)}
            >
              <span className="config-section-nav-icon">{item.icon}</span>
              <span className="config-section-nav-text">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="section-content">
          {activeConfigSection === 'geral' && (
            <div className="settings-section-container animate-fade-in">
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Preferências Gerais</h2>
                  <p className="card-description">Configure as preferências básicas do sistema</p>
                </div>
                <div className="card-content">
                  <div className="form-group">
                    <label htmlFor="language">Idioma</label>
                    <select 
                      id="language" 
                      value={language} 
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => { setLanguage(e.target.value); handleChange(); }}
                      className="select-input"
                    >
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en-US">English (United States)</option>
                      <option value="es-ES">Español</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="timezone">Fuso Horário</label>
                    <select 
                      id="timezone" 
                      value={timezone} 
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => { setTimezone(e.target.value); handleChange(); }}
                      className="select-input"
                    >
                      <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                      <option value="America/Manaus">Manaus (GMT-4)</option>
                      <option value="America/New_York">New York (GMT-5)</option>
                      <option value="Europe/London">London (GMT+0)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Aparência</h2>
                  <p className="card-description">Personalize a aparência da interface.</p>
                </div>
                <div className="card-content">
                  <div className="theme-selector">
                    <div 
                      className={`theme-option ${!darkMode ? 'active' : ''}`}
                      onClick={() => toggleThemePreference(false) } 
                      role="button" tabIndex={0} onKeyPress={(e) => { if(e.key === 'Enter' || e.key === ' ') toggleThemePreference(false);}}
                    >
                      <div className="theme-icon"><SunIcon size={24} /></div>
                      <span>Claro</span>
                    </div>
                    <div 
                      className={`theme-option ${darkMode ? 'active' : ''}`}
                      onClick={() => toggleThemePreference(true)} 
                      role="button" tabIndex={0} onKeyPress={(e) => { if(e.key === 'Enter' || e.key === ' ') toggleThemePreference(true);}}
                    >
                      <div className="theme-icon"><MoonIcon size={24} /></div>
                      <span>Escuro</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeConfigSection === 'usuario' && (
             <div className="settings-section-container animate-fade-in">
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Perfil do Usuário</h2>
                        <p className="card-description">Atualize suas informações pessoais</p>
                    </div>
                    <div className="card-content">
                        <div className="form-group">
                            <label htmlFor="name">Nome completo</label>
                            <input 
                                type="text" 
                                id="name" 
                                defaultValue="Administrador do Sistema" 
                                onChange={(_e: ChangeEvent<HTMLInputElement>) => handleChange()}
                                className="text-input"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                defaultValue="admin@valmet.com" 
                                onChange={(_e: ChangeEvent<HTMLInputElement>) => handleChange()}
                                className="text-input"
                            />
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Segurança</h2>
                        <p className="card-description">Gerencie sua senha e segurança da conta</p>
                    </div>
                    <div className="card-content">
                        <div className="form-group">
                            <label htmlFor="current-password">Senha atual</label>
                            <input 
                                type="password" 
                                id="current-password" 
                                placeholder="Digite sua senha atual" 
                                onChange={(_e: ChangeEvent<HTMLInputElement>) => handleChange()}
                                className="text-input"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="new-password">Nova senha</label>
                            <input 
                                type="password" 
                                id="new-password" 
                                placeholder="Digite sua nova senha" 
                                onChange={(_e: ChangeEvent<HTMLInputElement>) => handleChange()}
                                className="text-input"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirm-password">Confirmar nova senha</label>
                            <input 
                                type="password" 
                                id="confirm-password" 
                                placeholder="Confirme sua nova senha" 
                                onChange={(_e: ChangeEvent<HTMLInputElement>) => handleChange()}
                                className="text-input"
                            />
                        </div>
                        <button className="btn btn-secondary" onClick={handleChange}>
                            <KeyIcon size={16} />
                            <span>Alterar senha</span>
                        </button>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Sessões</h2>
                        <p className="card-description">Gerencie suas sessões ativas</p>
                    </div>
                    <div className="card-content">
                        <div className="session-item">
                            <div className="session-info">
                                <div className="session-device">Chrome - Windows</div>
                                <div className="session-details">São Paulo, Brasil • Ativo agora</div>
                            </div>
                            <div className="session-actions">
                                <span className="session-current">Sessão atual</span>
                            </div>
                        </div>
                        <div className="session-item">
                            <div className="session-info">
                                <div className="session-device">Safari - iPhone</div>
                                <div className="session-details">São Paulo, Brasil • 2 horas atrás</div>
                            </div>
                            <div className="session-actions">
                                <button className="btn btn-text btn-danger-text" onClick={handleChange}>Encerrar</button>
                            </div>
                        </div>
                        <button className="btn btn-danger-outline mt-4" onClick={handleChange}>
                            <LogOutIcon size={16} />
                            <span>Encerrar todas as outras sessões</span>
                        </button>
                    </div>
                </div>
            </div>
          )}

          {activeConfigSection === 'sistema' && (
            <div className="settings-section-container animate-fade-in">
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Parâmetros de Produção</h2>
                        <p className="card-description">Configure os parâmetros de produção do sistema</p>
                    </div>
                    <div className="card-content">
                        <div className="form-group">
                            <label htmlFor="limite-producao">
                                Meta de produção diária (%)
                                <span className="value-display">{limites.producao}%</span>
                            </label>
                            <input 
                                type="range" 
                                id="limite-producao" 
                                min="0" 
                                max="100" 
                                value={limites.producao} 
                                onChange={(e) => updateLimite('producao', parseInt(e.target.value))}
                                className="range-input"
                            />
                            <div className="range-labels"><span>0%</span><span>50%</span><span>100%</span></div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="limite-estoque">
                                Limite mínimo de estoque (%)
                                <span className="value-display">{limites.estoque}%</span>
                            </label>
                            <input 
                                type="range" 
                                id="limite-estoque" 
                                min="0" 
                                max="100" 
                                value={limites.estoque} 
                                onChange={(e) => updateLimite('estoque', parseInt(e.target.value))}
                                className="range-input"
                            />
                            <div className="range-labels"><span>0%</span><span>50%</span><span>100%</span></div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="limite-manutencao">
                                Intervalo de manutenção (dias)
                                <span className="value-display">{limites.manutencao}</span>
                            </label>
                            <input 
                                type="range" 
                                id="limite-manutencao" 
                                min="0" 
                                max="90" 
                                value={limites.manutencao} 
                                onChange={(e) => updateLimite('manutencao', parseInt(e.target.value))}
                                className="range-input"
                            />
                            <div className="range-labels"><span>0</span><span>45</span><span>90</span></div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Integrações</h2>
                        <p className="card-description">Gerencie as integrações com outros sistemas</p>
                    </div>
                    <div className="card-content">
                        <div className="toggle-item">
                            <div className="toggle-info">
                                <div className="toggle-title">Sistema ERP</div>
                                <div className="toggle-description">Integração com o sistema ERP da empresa</div>
                            </div>
                            <div className="toggle-switch">
                                <label className="switch"><input type="checkbox" defaultChecked onChange={handleChange} /><span className="slider"></span></label>
                            </div>
                        </div>
                        <div className="toggle-item">
                            <div className="toggle-info">
                                <div className="toggle-title">Sistema de RH</div>
                                <div className="toggle-description">Integração com o sistema de recursos humanos</div>
                            </div>
                            <div className="toggle-switch">
                                <label className="switch"><input type="checkbox" onChange={handleChange} /><span className="slider"></span></label>
                            </div>
                        </div>
                         <div className="toggle-item">
                            <div className="toggle-info">
                                <div className="toggle-title">API Externa</div>
                                <div className="toggle-description">Conexão com API de fornecedores</div>
                            </div>
                            <div className="toggle-switch">
                                <label className="switch"><input type="checkbox" defaultChecked onChange={handleChange} /><span className="slider"></span></label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Backup e Restauração</h2>
                        <p className="card-description">Gerencie backups do sistema</p>
                    </div>
                    <div className="card-content">
                        <div className="backup-info">
                            <div className="backup-status">
                                <div className="status-icon success"><CheckIcon size={20} /></div>
                                <div className="status-text">
                                    <div className="status-title">Último backup realizado com sucesso</div>
                                    <div className="status-time">21/05/2025 - 01:30</div>
                                </div>
                            </div>
                        </div>
                        <div className="backup-actions">
                            <button className="btn btn-secondary" onClick={handleChange}><span>Fazer backup agora</span></button>
                            <button className="btn btn-outline" onClick={handleChange}><span>Restaurar backup</span></button>
                        </div>
                    </div>
                </div>
            </div>
          )}

          {activeConfigSection === 'notificacoes' && (
            <div className="settings-section-container animate-fade-in">
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Canais de Notificação</h2>
                        <p className="card-description">Configure como deseja receber notificações</p>
                    </div>
                    <div className="card-content">
                        <div className="toggle-item">
                            <div className="toggle-info">
                                <div className="toggle-icon"><MailIcon size={20} /></div>
                                <div>
                                    <div className="toggle-title">Email</div>
                                    <div className="toggle-description">Receba notificações por email</div>
                                </div>
                            </div>
                            <div className="toggle-switch">
                                <label className="switch"><input type="checkbox" checked={notifications.email} onChange={() => toggleNotification('email')} /><span className="slider"></span></label>
                            </div>
                        </div>
                        <div className="toggle-item">
                            <div className="toggle-info">
                                <div className="toggle-icon"><BellIconLucide size={20} /></div>
                                <div>
                                    <div className="toggle-title">Push</div>
                                    <div className="toggle-description">Receba notificações push no navegador</div>
                                </div>
                            </div>
                            <div className="toggle-switch">
                                <label className="switch"><input type="checkbox" checked={notifications.push} onChange={() => toggleNotification('push')} /><span className="slider"></span></label>
                            </div>
                        </div>
                        <div className="toggle-item">
                            <div className="toggle-info">
                                <div className="toggle-icon"><MessageSquareIcon size={20} /></div>
                                <div>
                                    <div className="toggle-title">SMS</div>
                                    <div className="toggle-description">Receba notificações por SMS</div>
                                </div>
                            </div>
                            <div className="toggle-switch">
                                <label className="switch"><input type="checkbox" checked={notifications.sms} onChange={() => toggleNotification('sms')} /><span className="slider"></span></label>
                            </div>
                        </div>
                        <div className="toggle-item">
                            <div className="toggle-info">
                                <div className="toggle-icon"><AlertTriangleIcon size={20} /></div>
                                <div>
                                    <div className="toggle-title">Sistema</div>
                                    <div className="toggle-description">Receba notificações no sistema</div>
                                </div>
                            </div>
                            <div className="toggle-switch">
                                <label className="switch"><input type="checkbox" checked={notifications.system} onChange={() => toggleNotification('system')} /><span className="slider"></span></label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Tipos de Notificação</h2>
                        <p className="card-description">Configure quais eventos geram notificações</p>
                    </div>
                    <div className="card-content">
                        <div className="toggle-item">
                            <div className="toggle-info">
                                <div className="toggle-title">Alertas críticos</div>
                                <div className="toggle-description">Notificações sobre problemas críticos no sistema</div>
                            </div>
                            <div className="toggle-switch">
                                <label className="switch"><input type="checkbox" defaultChecked onChange={handleChange} /><span className="slider"></span></label>
                            </div>
                        </div>
                        <div className="toggle-item">
                            <div className="toggle-info">
                                <div className="toggle-title">Manutenção programada</div>
                                <div className="toggle-description">Avisos sobre manutenções agendadas</div>
                            </div>
                            <div className="toggle-switch">
                                <label className="switch"><input type="checkbox" defaultChecked onChange={handleChange} /><span className="slider"></span></label>
                            </div>
                        </div>
                        <div className="toggle-item">
                            <div className="toggle-info">
                                <div className="toggle-title">Atualizações do sistema</div>
                                <div className="toggle-description">Informações sobre atualizações disponíveis</div>
                            </div>
                            <div className="toggle-switch">
                                <label className="switch"><input type="checkbox" onChange={handleChange} /><span className="slider"></span></label>
                            </div>
                        </div>
                        <div className="toggle-item">
                            <div className="toggle-info">
                                <div className="toggle-title">Relatórios periódicos</div>
                                <div className="toggle-description">Envio de relatórios de desempenho</div>
                            </div>
                            <div className="toggle-switch">
                                <label className="switch"><input type="checkbox" defaultChecked onChange={handleChange} /><span className="slider"></span></label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Horários Permitidos</h2>
                        <p className="card-description">Configure os horários para receber notificações</p>
                    </div>
                    <div className="card-content">
                        <div className="form-group">
                            <label>Dias da semana</label>
                            <div className="weekday-selector">
                                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => (
                                    <div key={index} className={`weekday-item ${index > 0 && index < 6 ? 'active' : ''}`}
                                        onClick={handleChange} role="button" tabIndex={0}
                                        onKeyPress={(e) => { if(e.key === 'Enter' || e.key === ' ') handleChange();}}
                                    >{day}</div>
                                ))}
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group flex-1">
                                <label htmlFor="start-time">Horário inicial</label>
                                <input type="time" id="start-time" defaultValue="08:00" onChange={(_e: ChangeEvent<HTMLInputElement>) => handleChange()} className="time-input"/>
                            </div>
                            <div className="form-group flex-1">
                                <label htmlFor="end-time">Horário final</label>
                                <input type="time" id="end-time" defaultValue="18:00" onChange={(_e: ChangeEvent<HTMLInputElement>) => handleChange()} className="time-input"/>
                            </div>
                        </div>
                        <div className="toggle-item mt-4">
                            <div className="toggle-info">
                                <div className="toggle-icon"><BellOffIcon size={20} /></div>
                                <div>
                                    <div className="toggle-title">Modo não perturbe</div>
                                    <div className="toggle-description">Pausar todas as notificações</div>
                                </div>
                            </div>
                            <div className="toggle-switch">
                                <label className="switch"><input type="checkbox" onChange={handleChange} /><span className="slider"></span></label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          )}
        </div>

        <footer className="footer">
          <div className="footer-info">
            <span className="version">Versão 2.5.0</span>
            <span className="separator">•</span>
            <a href="#documentacao" className="footer-link" onClick={(e)=> e.preventDefault()}>Documentação</a>
            <span className="separator">•</span>
            <a href="#suporte" className="footer-link" onClick={(e)=> e.preventDefault()}>Suporte</a>
          </div>
          <div className="footer-status">
            {hasChanges && <span className="unsaved-changes"><AlertTriangleIcon size={14}/> Alterações não salvas</span>}
          </div>
        </footer>
      </main>
    </div>
  );
};

export default LayoutConfiguracoes;
