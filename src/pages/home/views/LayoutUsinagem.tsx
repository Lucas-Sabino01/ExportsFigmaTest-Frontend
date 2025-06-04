import { useState, ChangeEvent, FormEvent, JSX, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar, { TileArgs } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/LayoutUsinagem.css'; // Certifique-se que este caminho está correto

// Tipos
type ValuePiece = Date | null;
type CalendarLibValue = ValuePiece | [ValuePiece, ValuePiece];

interface Appointment {
  text: string;
}
interface Appointments {
  [dateString: string]: Appointment;
}

// Componente renderIcon (atualizado para incluir todos os ícones necessários)
const renderIcon = (iconName: string) => {
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
    case "production": // Usado para Produção
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
    case "status": // Usado para Usinagem
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
    case "reports":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      );
    case "settings":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle>
        </svg>
      );
    // case "trendingUp": // Removido se não for usado na navegação principal
    //   return (
    //     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    //       <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>
    //     </svg>
    //   );
    default: return null;
  }
};

export const LayoutUsinagem = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentTime] = useState(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  
  const [appointments, setAppointments] = useState<Appointments>(() => {
    const savedAppointments = localStorage.getItem('usinagemAppointments');
    return savedAppointments ? JSON.parse(savedAppointments) : {};
  });
  const [lastClickTime, setLastClickTime] = useState(0);
  const [lastClickedDateString, setLastClickedDateString] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<Date | null>(null);
  const [appointmentInput, setAppointmentInput] = useState("");

  useEffect(() => {
    const applyTheme = (isDark: boolean | null) => {
      const themeToApply = isDark ? 'dark' : 'light';
      document.body.setAttribute('data-theme', themeToApply);
    };

    const storedDarkModeRaw = localStorage.getItem('valmetDashboardDarkMode');
    const initialIsDark = storedDarkModeRaw !== null ? JSON.parse(storedDarkModeRaw) : false;
    applyTheme(initialIsDark);

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'valmetDashboardDarkMode' && event.newValue !== null) {
        try {
          const newIsDark = JSON.parse(event.newValue);
          applyTheme(newIsDark);
        } catch (error) {
          console.error("Erro ao parsear valmetDashboardDarkMode do localStorage:", error);
          applyTheme(false);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('usinagemAppointments', JSON.stringify(appointments));
  }, [appointments]);


  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleDateChange = (value: CalendarLibValue) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    } else if (Array.isArray(value)) {
      const firstDateInRange = value[0];
      if (firstDateInRange instanceof Date) {
        setSelectedDate(firstDateInRange);
      }
    }
  };
  
  const openAppointmentModal = (date: Date) => {
    setModalDate(date);
    setAppointmentInput(appointments[date.toDateString()]?.text || "");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalDate(null);
    setAppointmentInput("");
  };

  const handleSaveAppointment = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (modalDate) {
      const dateString = modalDate.toDateString();
      setAppointments(prev => {
        const newAppointments = { ...prev };
        if (appointmentInput.trim() === "") {
          delete newAppointments[dateString];
        } else {
          newAppointments[dateString] = { text: appointmentInput };
        }
        return newAppointments;
      });
      handleCloseModal();
    }
  };
  
  const handleDeleteAppointment = () => {
    if (modalDate) {
      const dateString = modalDate.toDateString();
      setAppointments(prev => {
        const newAppointments = { ...prev };
        delete newAppointments[dateString];
        return newAppointments;
      });
      handleCloseModal();
    }
  };

  const handleDayClick = (value: Date) => {
    const clickTime = new Date().getTime();
    const dateString = value.toDateString();

    if (lastClickedDateString === dateString && (clickTime - lastClickTime) < 300) { 
      openAppointmentModal(value);
      setLastClickTime(0); 
      setLastClickedDateString(null);
    } else {
      setLastClickTime(clickTime);
      setLastClickedDateString(dateString);
    }
  };
  
  const tileContent = ({ date, view }: TileArgs): JSX.Element | null => {
    if (view === 'month') {
      const dateString = date.toDateString();
      if (appointments[dateString]) {
        return <div className="appointment-dot" title={appointments[dateString].text}></div>;
      }
    }
    return null;
  };

  // ATUALIZADO: navItems com caminhos corretos e ícones consistentes
  const navItems = [
    { name: "Início", icon: "dashboard", path: "/" },
    { name: "Produção", icon: "production", path: "/tela-producao" },
    { name: "Montagem", icon: "assembly", path: "/tela-montagem" },
    { name: "Usinagem", icon: "status", path: "/tela-usinagem" }, // Caminho corrigido
    { name: "Depósito", icon: "warehouse", path: "/tela-deposito" },
    { name: "Relatórios", icon: "reports", path: "/relatorios" }, // Assumindo que esta rota existirá
    { name: "Configurações", icon: "settings", path: "/configuracoes" }
  ];

  const equipmentStatuses = [
    { id: 1, name: "Torno CNC #1", status: "maintenance", details: "Manutenção preventiva programada. Retorno: 15/06/2025" },
    { id: 2, name: "Fresadora #3", status: "operational", details: "Operando normalmente. Última manutenção: 10/05/2025" },
    { id: 3, name: "Retificadora #2", status: "offline", details: "Equipamento desligado para troca de ferramentas" }
  ];
  
  const taskProgress = [
    { id: 1, name: "Produção de peças A-123", progress: 75, details: "Previsão de conclusão: 25/05/2025" },
    { id: 2, name: "Usinagem de componentes B-456", progress: 30, details: "Iniciado em 18/05/2025" }
  ];
  
  const alerts = [
    { id: 1, level: "high", message: "Estoque de ferramentas de corte abaixo do mínimo", timestamp: "21/05/2025 - 03:45" },
    { id: 2, level: "medium", message: "Manutenção preventiva do Torno CNC #2 agendada para amanhã", timestamp: "21/05/2025 - 02:30" }
  ];
  
  const performanceMetrics = [
    { id: 1, name: "Taxa de Produção", value: "127 pçs/h", trend: "up", details: "Aumento de 5% vs semana anterior" },
    { id: 2, name: "Tempo de Ciclo", value: "4.2 min", trend: "down", details: "Redução de 0.3 min pós-otimização" },
    { id: 3, name: "Taxa de Rejeição", value: "1.8%", trend: "stable", details: "Dentro dos parâmetros de qualidade" }
  ];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "maintenance": return "alert-badge alert-badge-medium";
      case "operational": return "alert-badge alert-badge-low";
      case "offline": return "alert-badge alert-badge-high";
      default: return "alert-badge";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "maintenance": return "Manutenção";
      case "operational": return "Operacional";
      case "offline": return "Offline";
      default: return status;
    }
  };

  const getAlertBadgeClass = (level: string) => {
    switch (level) {
      case "high": return "alert-badge alert-badge-high";
      case "medium": return "alert-badge alert-badge-medium";
      case "low": return "alert-badge alert-badge-low";
      default: return "alert-badge";
    }
  };

  const getAlertLevelText = (level: string) => {
    switch (level) {
      case "high": return "Alto";
      case "medium": return "Médio";
      case "low": return "Baixo";
      default: return level;
    }
  };

  const getTrendClass = (trend: string) => {
    switch (trend) {
      case "up": return "trend-up";
      case "down": return "trend-down";
      case "stable": return "trend-stable";
      default: return "";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return "↑";
      case "down": return "↓";
      case "stable": return "→";
      default: return "";
    }
  };

  const currentPath = "/tela-usinagem"; // ATUALIZADO: para refletir o path correto da rota

  return (
    <div id="usinagem-page" className="usinagem-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">{renderIcon("leaf")}</div>
          <span className="sidebar-title">VALMET</span>
        </div>
        <nav className="nav">
          {navItems.map((item) => (
            <div 
              key={item.path}
              className={`nav-item ${currentPath === item.path ? 'nav-item-active' : 'nav-item-inactive'}`}
              onClick={() => handleNavigation(item.path)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') handleNavigation(item.path);}}
            >
              <span className="nav-icon">{renderIcon(item.icon)}</span>
              <span>{item.name}</span>
            </div>
          ))}
        </nav>
        <div className="user-profile">
          <div className="user-avatar">UA</div>
          <div className="user-info">
            <div className="user-name">Utilizador Admin</div>
            <div className="user-role">Administrador</div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="header">
          <h1 className="page-title">USINAGEM</h1>
          <p className="page-description">Visão geral e controle de operações</p>
        </header>

        <div className="update-info">
          <div className="update-badge">
            <span className="update-dot animate-pulse"></span>
            <span>Dados atualizados às <span className="update-time">{currentTime}</span></span>
          </div>
        </div>

        <div className="grid">
          <div className="card card-wide animate-scale-in hover-shadow">
            <div className="card-content">
              <h2 className="card-title">Mensagens</h2>
              <p>
                Bem-vindo ao painel de controle da Usinagem. Aqui você encontra informações 
                sobre o status dos equipamentos, progresso das tarefas e métricas de desempenho.
              </p>
              <p>
                A produção de hoje está seguindo conforme o planejado, com todos os indicadores 
                dentro dos parâmetros esperados. Verifique os alertas para ações necessárias.
              </p>
            </div>
          </div>
          
          <div className="card animate-scale-in hover-shadow" style={{ animationDelay: "0.1s" }}>
            <div className="card-content">
              <h2 className="card-title">Calendário</h2>
              <div className="calendar-container">
                <Calendar 
                  onChange={handleDateChange}
                  onClickDay={handleDayClick}
                  value={selectedDate}
                  selectRange={false}
                  className="usinagem-calendar" 
                  tileContent={tileContent}
                  locale="pt-BR"
                />
                <div className="data-selecionada">
                  Data selecionada: {selectedDate.toLocaleDateString('pt-BR')}
                </div>
                <div className="calendar-legend">
                    <span className="appointment-legend-dot"></span>
                    Compromisso agendado
                </div> 
              </div>
            </div>
          </div>
        </div>

        <div className="grid">
          <div className="card animate-slide-in-up hover-shadow" style={{ animationDelay: "0.1s" }}>
            <div className="card-content">
              <h2 className="card-title">Status dos Equipamentos</h2>
              <div className="list-container">
                {equipmentStatuses.map((equipment) => (
                  <div key={equipment.id} className="alert-item">
                    <div className="alert-header">
                      <span className="alert-title">{equipment.name}</span>
                      <span className={getStatusBadgeClass(equipment.status)}>
                        {getStatusText(equipment.status)}
                      </span>
                    </div>
                    <p className="alert-description">{equipment.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card animate-slide-in-up hover-shadow" style={{ animationDelay: "0.2s" }}>
            <div className="card-content">
              <h2 className="card-title">Progresso das Tarefas</h2>
              <div className="list-container">
                {taskProgress.map((task) => (
                  <div key={task.id} className="task-item">
                    <div className="task-header">
                      <span className="task-title">{task.name}</span>
                      <span className="task-progress">{task.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill progress-fill-blue"
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                    <p className="task-description">{task.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid-wide">
          <div className="card animate-slide-in-up hover-shadow" style={{ animationDelay: "0.3s" }}>
            <div className="card-content">
              <h2 className="card-title">Alertas</h2>
              <div className="list-container">
                {alerts.map((alert) => (
                  <div key={alert.id} className="alert-item">
                    <div className="alert-header">
                      <span className={getAlertBadgeClass(alert.level)}>
                        {getAlertLevelText(alert.level)}
                      </span>
                      <span className="alert-timestamp">{alert.timestamp}</span>
                    </div>
                    <p className="alert-description">{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid-wide">
            <div className="card animate-slide-in-up hover-shadow" style={{ animationDelay: "0.4s" }}>
                <div className="card-content">
                <h2 className="card-title">Cronograma de Produção (Gantt)</h2>
                <div className="gantt-container">
                    <img 
                    src="/images/gantt-chart.png" 
                    alt="Cronograma Gantt" 
                    className="gantt-image"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/800x400/e0e0e0/757575?text=Cronograma+Gantt'; }}
                    />
                </div>
                </div>
            </div>
        </div>

        <div className="grid-wide">
          <div className="card animate-slide-in-up hover-shadow" style={{ animationDelay: "0.5s" }}>
            <div className="card-content">
              <h2 className="card-title">Métricas de Desempenho</h2>
              <div className="metrics-grid">
                {performanceMetrics.map((metric) => (
                  <div key={metric.id} className="metric-card">
                    <h3 className="metric-title">{metric.name}</h3>
                    <div className="metric-value">
                      {metric.value}
                      <span className={`trend-indicator ${getTrendClass(metric.trend)}`}>
                        {getTrendIcon(metric.trend)}
                      </span>
                    </div>
                    <p className="metric-description">{metric.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {isModalOpen && modalDate && (
        <div className={`modal-overlay ${isModalOpen ? 'open' : ''}`} onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSaveAppointment}>
              <div className="modal-header">
                <h3 className="modal-title">Compromisso</h3>
                <p className="modal-date">{modalDate.toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="modal-body">
                <label htmlFor="appointment-text">Descrição do Compromisso:</label>
                <textarea
                  id="appointment-text"
                  value={appointmentInput}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setAppointmentInput(e.target.value)}
                  rows={4}
                  placeholder="Digite o seu compromisso..."
                />
              </div>
              <div className="modal-footer">
                {appointments[modalDate.toDateString()] && (
                     <button type="button" className="modal-button modal-button-delete" onClick={handleDeleteAppointment}>
                        Remover
                     </button>
                )}
                <button type="button" className="modal-button modal-button-cancel" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="modal-button modal-button-save">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayoutUsinagem;
