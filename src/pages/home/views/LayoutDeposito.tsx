import { useState, JSX, ChangeEvent, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar, { TileArgs } from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 
import '../styles/LayoutDeposito.css'; // CSS específico para esta página

// Tipos (reutilizados)
type ValuePiece = Date | null;
type CalendarLibValue = ValuePiece | [ValuePiece, ValuePiece];

interface Appointment {
  text: string;
}
interface Appointments {
  [dateString: string]: Appointment;
}

// Componente renderIcon (reutilizado)
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
    case "dashboard": 
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      );
    case "production": 
        return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="6" y1="20" x2="6" y2="14"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="18" y1="20" x2="18" y2="10"></line>
            </svg>
        );
    case "assembly": 
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
    default: return null;
  }
};

export const LayoutDeposito = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentTime] = useState(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  
  const [appointments, setAppointments] = useState<Appointments>(() => {
    const savedAppointments = localStorage.getItem('depositoAppointments'); // Chave específica
    return savedAppointments ? JSON.parse(savedAppointments) : {};
  });
  const [lastClickTime, setLastClickTime] = useState(0);
  const [lastClickedDateString, setLastClickedDateString] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<Date | null>(null);
  const [appointmentInput, setAppointmentInput] = useState("");

  // Efeito para carregar o tema do localStorage e aplicar ao body
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

  // Salvar compromissos do depósito no localStorage
  useEffect(() => {
    localStorage.setItem('depositoAppointments', JSON.stringify(appointments));
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

  // Dados específicos para Depósito
  const navItems = [
    { name: "Início", icon: "dashboard", path: "/" },
    { name: "Produção", icon: "production", path: "/tela-producao" }, 
    { name: "Montagem", icon: "assembly", path: "/tela-montagem" },
    { name: "Usinagem", icon: "status", path: "/tela-usinagem" },
    { name: "Depósito", icon: "warehouse", path: "/tela-deposito" }, // Ativo
    { name: "Relatórios", icon: "reports", path: "/tela-relatorios" },
    { name: "Configurações", icon: "settings", path: "/configuracoes" }
  ];

  const equipmentStatus = [
    { id: 1, name: "Empilhadeira EL-01", status: "operational", details: "Operando no corredor C." },
    { id: 2, name: "Transelevador TR-02", status: "maintenance", details: "Manutenção preventiva agendada para 22/05." },
    { id: 3, name: "Coletor de Dados CD-05", status: "low_battery", details: "Bateria baixa, necessita recarga." },
    { id: 4, name: "Porta Paletes P-15", status: "full", details: "Capacidade máxima atingida." }
  ];
  
  const inventoryLevels = [
    { id: 1, name: "Componente XA-100", level: 75, unit: "unidades", details: "Estoque ideal: 100 unidades." },
    { id: 2, name: "Matéria Prima MP-B02", level: 30, unit: "Kg", details: "Ponto de reposição: 25 Kg." },
    { id: 3, name: "Produto Acabado PA-Z50", level: 90, unit: "caixas", details: "Pronto para expedição." }
  ];
  
  const warehouseAlerts = [
    { id: 1, level: "high", message: "Nível crítico de estoque para Componente XB-200. Risco de parada na Montagem.", timestamp: "21/05/2025 - 11:15" },
    { id: 2, level: "medium", message: "Empilhadeira EL-03 reportou falha no sistema hidráulico.", timestamp: "21/05/2025 - 10:30" },
    { id: 3, level: "low", message: "Recebimento de material agendado para hoje às 14:00 (NF 12345).", timestamp: "21/05/2025 - 09:00" }
  ];
  
  const warehousePerformanceMetrics = [
    { id: 1, name: "Acuracidade do Estoque", value: "99.2%", trend: "up", details: "Melhora após contagem cíclica." },
    { id: 2, name: "Tempo Médio de Separação", value: "15 min", trend: "stable", details: "Dentro da meta." },
    { id: 3, name: "Utilização do Espaço", value: "85%", trend: "up", details: "Otimização de layout em andamento." }
  ];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "operational": return "alert-badge alert-badge-low"; 
      case "maintenance": return "alert-badge alert-badge-medium"; 
      case "low_battery": return "alert-badge alert-badge-medium";
      case "full": return "alert-badge alert-badge-high"; 
      default: return "alert-badge";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "operational": return "Operacional";
      case "maintenance": return "Manutenção";
      case "low_battery": return "Bateria Baixa";
      case "full": return "Lotado";
      default: return status;
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
  const getAlertBadgeClass = (level: string) => { 
    switch (level) {
      case "high": return "alert-badge alert-badge-high";
      case "medium": return "alert-badge alert-badge-medium";
      case "low": return "alert-badge alert-badge-low";
      default: return "alert-badge";
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
  const getTrendClass = (trend: string) => {
    switch (trend) {
      case "up": return "trend-up";
      case "down": return "trend-down";
      case "stable": return "trend-stable";
      default: return "";
    }
  };

  const currentPath = "/deposito";

  return (
    <div id="deposito-page" className="deposito-container"> 
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
          <div className="user-avatar">UD</div> {/* Usuário Depósito */}
          <div className="user-info">
            <div className="user-name">Utilizador Depósito</div>
            <div className="user-role">Almoxarife</div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="header">
          <h1 className="page-title">DEPÓSITO</h1>
          <p className="page-description">Gestão de estoque e movimentação de materiais</p>
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
              <h2 className="card-title">Painel do Depósito</h2>
              <p>
                Visualize o status dos equipamentos de movimentação, níveis de estoque e alertas importantes.
              </p>
              <p>
                Utilize o calendário para agendar recebimentos, expedições ou inventários.
              </p>
            </div>
          </div>
          
          <div className="card animate-scale-in hover-shadow" style={{ animationDelay: "0.1s" }}>
            <div className="card-content">
              <h2 className="card-title">Agenda do Depósito</h2>
              <div className="calendar-container">
                <Calendar 
                  onChange={handleDateChange}
                  onClickDay={handleDayClick}
                  value={selectedDate}
                  selectRange={false}
                  className="deposito-calendar" 
                  tileContent={tileContent}
                  locale="pt-BR"
                />
                <div className="data-selecionada">
                  Data selecionada: {selectedDate.toLocaleDateString('pt-BR')}
                </div>
                <div className="calendar-legend">
                    <span className="appointment-legend-dot"></span>
                    Recebimento/Expedição Agendada
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
                {equipmentStatus.map((equip) => (
                  <div key={equip.id} className="alert-item">
                    <div className="alert-header">
                      <span className="alert-title">{equip.name}</span>
                      <span className={getStatusBadgeClass(equip.status)}>
                        {getStatusText(equip.status)}
                      </span>
                    </div>
                    <p className="alert-description">{equip.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card animate-slide-in-up hover-shadow" style={{ animationDelay: "0.2s" }}>
            <div className="card-content">
              <h2 className="card-title">Níveis de Estoque</h2>
              <div className="list-container">
                {inventoryLevels.map((item) => (
                  <div key={item.id} className="task-item"> 
                    <div className="task-header">
                      <span className="task-title">{item.name}</span>
                      <span className="task-progress">{item.level} {item.unit}</span> 
                    </div>
                    <p className="task-description">{item.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid-wide">
          <div className="card animate-slide-in-up hover-shadow" style={{ animationDelay: "0.3s" }}>
            <div className="card-content">
              <h2 className="card-title">Alertas do Depósito</h2>
              <div className="list-container">
                {warehouseAlerts.map((alert) => (
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
                <h2 className="card-title">Mapa de Localização (Layout do Depósito)</h2>
                <div className="gantt-container"> 
                    <img 
                    src="/images/deposito-layout-placeholder.png" 
                    alt="Layout do Depósito" 
                    className="gantt-image"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/800x400/ffffff/999999?text=Layout+Depósito'; }}
                    />
                </div>
                </div>
            </div>
        </div>

        <div className="grid-wide">
          <div className="card animate-slide-in-up hover-shadow" style={{ animationDelay: "0.5s" }}>
            <div className="card-content">
              <h2 className="card-title">Métricas de Performance do Depósito</h2>
              <div className="metrics-grid">
                {warehousePerformanceMetrics.map((metric) => (
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
                <h3 className="modal-title">Agendamento Depósito</h3>
                <p className="modal-date">{modalDate.toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="modal-body">
                <label htmlFor="appointment-text">Descrição do Evento:</label>
                <textarea
                  id="appointment-text"
                  value={appointmentInput}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setAppointmentInput(e.target.value)}
                  rows={4}
                  placeholder="Ex: Recebimento NF 5678, Inventário Setor A, etc."
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

export default LayoutDeposito;
