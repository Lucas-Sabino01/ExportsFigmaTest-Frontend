import { useState, useEffect, JSX } from "react";
import { useNavigate } from "react-router-dom"; // Adicionado useNavigate
import "./styles/Status.css";
import "./styles/StatusAnimations.css";
import ProductionChart from "./components/ProductionChart";

// --- Interfaces ---
interface BottleneckItem { id: number; area: string; impacto: "Alto" | "Médio" | "Baixo" | string; descricao: string; }
interface DelayItem { id: number; processo: string; tempo: string; motivo: string; impacto: string; }
interface ProductionDataPoint { name: string; real: number; meta: number; }
interface SectorData { name: string; atual: number; capacidade: number; }

// --- Componente renderIcon para a navegação principal ---
const renderAppIcon = (iconName: string) => {
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
      case "status": // Ícone para Usinagem E Status (usaremos este para Status)
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
      case "settings": // Ícone para Configurações
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle>
          </svg>
        );
        // Ícones do Status.tsx original que podem ser reutilizados ou adaptados
      case "trendingUp":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>
          </svg>
        );
      case "zap": // Eficiência OEE
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
        );
      case "alertTriangle": // Alertas Ativos
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        );
      default: return null;
    }
  };


// --- Componente Principal ---
export const Status = (): JSX.Element => {
  const navigate = useNavigate(); // Adicionado useNavigate
  const [, setProductionData] = useState<ProductionDataPoint[]>([]);
  const [bottlenecks, setBottlenecks] = useState<BottleneckItem[]>([]);
  const [delays, setDelays] = useState<DelayItem[]>([]);
  const [overallProgress] = useState<number>(68);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("semana");
  const [sectorData, setSectorData] = useState<SectorData[]>([]);
  const [activeTab, setActiveTab] = useState<"gargalos" | "atrasos">("gargalos");
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));

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


  // Efeito para carregar dados e atualizar o tempo
  useEffect(() => {
    const generateProductionData = (): ProductionDataPoint[] => {
        const periods: Record<string, number> = { dia: 24, semana: 7, mes: 30 };
        const count = periods[selectedPeriod] || 7;
        const labels: Record<string, string> = { dia: "h", semana: "", mes: ""};
        return Array.from({ length: count }, (_, i) => ({
            name: `${i + 1}${labels[selectedPeriod]}`,
            real: Math.floor(Math.random() * 50) + 50,
            meta: Math.floor(Math.random() * 20) + 80,
        }));
    };
    const generateBottlenecks = (): BottleneckItem[] => [
      { id: 1, area: "Linha de Montagem A", impacto: "Alto", descricao: "Atraso na entrega de componentes essenciais causando paralisação parcial." },
      { id: 2, area: "Setor de Embalagem", impacto: "Médio", descricao: "Equipamento com funcionamento intermitente reduzindo capacidade operacional." },
    ];
    const generateDelays = (): DelayItem[] => [
      { id: 1, processo: "Produção Linha B", tempo: "2 dias", motivo: "Manutenção não programada", impacto: "Atraso em 150 unidades" },
    ];
    const generateSectorData = (): SectorData[] => [
      { name: "Montagem", atual: 85, capacidade: 100 }, 
      { name: "Pintura", atual: 65, capacidade: 100 },
      { name: "Teste", atual: 90, capacidade: 100 }, 
      { name: "Embalagem", atual: 72, capacidade: 100 },
      { name: "Expedição", atual: 78, capacidade: 100 },
    ];

    setProductionData(generateProductionData());
    setBottlenecks(generateBottlenecks());
    setDelays(generateDelays());
    setSectorData(generateSectorData());
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit'})), 60000); 
    return () => clearInterval(timer);
  }, [selectedPeriod]);

  const getImpactBadgeClass = (impacto: string): string => {
    switch (impacto) {
      case "Alto": return "alert-badge alert-badge-high animate-fade-in";
      case "Médio": return "alert-badge alert-badge-medium animate-fade-in";
      case "Baixo": return "alert-badge alert-badge-low animate-fade-in";
      default: return "alert-badge animate-fade-in";
    }
  };

  const getProgressBarClass = (value: number): string => {
    if (value > 80) return "progress-fill progress-fill-green";
    if (value > 60) return "progress-fill progress-fill-amber";
    return "progress-fill progress-fill-red";
  };

  // Itens da barra de navegação principal da aplicação
  const appNavItems = [
    { name: "Início", icon: "dashboard", path: "/" },
    { name: "Produção", icon: "production", path: "/tela-producao" },
    { name: "Montagem", icon: "assembly", path: "/tela-montagem" },
    { name: "Usinagem", icon: "status", path: "/tela-usinagem" }, // Note: 'status' icon is used for Usinagem
    { name: "Depósito", icon: "warehouse", path: "/tela-deposito" },
    { name: "Status", icon: "zap", path: "/status" }, // Usando ícone 'zap' para diferenciar de Usinagem
 // { name: "Relatórios", icon: "reports", path: "/relatorios" }, // Omitido pois não há rota em router.tsx
    { name: "Configurações", icon: "settings", path: "/configuracoes" }
  ];
  const currentAppPath = "/status"; // Caminho desta página

  const handleAppNavigation = (path: string) => {
    navigate(path);
  };


  return (
    <div id="status-page-container" className="status-container"> {/* ID Adicionado */}
      {/* --- Sidebar Principal da Aplicação --- */}
      <aside className="app-sidebar"> {/* Classe para a sidebar principal */}
        <div className="app-sidebar-header">
          <div className="app-sidebar-logo">{renderAppIcon("leaf")}</div>
          <span className="app-sidebar-title ml-[10px]">VALMET</span>
        </div>
        <nav className="app-nav">
          {appNavItems.map((item) => (
            <div 
              key={item.path} 
              className={`app-nav-item ${currentAppPath === item.path ? 'app-nav-item-active' : 'app-nav-item-inactive'} transition-colors`}
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
        <div className="app-user-profile animate-slide-in-up">
          <div className="app-user-avatar">SA</div> {/* Status Admin ou similar */}
          <div className="app-user-info">
            <div className="app-user-name">Utilizador Status</div>
            <div className="app-user-role">Analista</div>
          </div>
        </div>
      </aside>

      {/* --- Conteúdo Principal da Página de Status --- */}
      <main className="main"> {/* Esta classe já existe no seu CSS original */}
        <header className="header animate-fade-in">
          <h1 className="page-title">Visão Geral do Status</h1>
          <p className="page-description">Acompanhe o desempenho e alertas da produção em tempo real.</p>
        </header>

        <div className="update-info">
          <div className="update-badge animate-slide-in-right">
            <span className="update-dot animate-pulse"></span>
            <span>Dados atualizados às <span className="update-time">{currentTime}</span></span>
          </div>
        </div>

        <div className="grid">
          <div className="card animate-scale-in hover-shadow">
            <div className="card-content">
              <div className="kpi-label">Progresso Geral</div>
              <div className="flex items-center">
                <div className="kpi-value">{overallProgress}%</div>
                <div className="kpi-meta">Meta: 80%</div>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill progress-fill-blue"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
              <div className="icon-container">
                <div className="icon-badge icon-badge-blue transition-transform">
                  {renderAppIcon("trendingUp")}
                </div>
              </div>
            </div>
          </div>
          
          <div className="card animate-scale-in hover-shadow" style={{ animationDelay: "0.1s" }}>
            <div className="card-content">
              <div className="kpi-label">Eficiência OEE</div>
              <div className="flex items-center">
                <div className="kpi-value">92%</div>
                <div className="kpi-delta">+2.5%</div>
              </div>
              <div className="text-sm text-gray-600">Comparado à semana anterior</div>
              <div className="icon-container">
                <div className="icon-badge icon-badge-green transition-transform">
                  {renderAppIcon("zap")}
                </div>
              </div>
            </div>
          </div>
          
          <div className="card animate-scale-in hover-shadow" style={{ animationDelay: "0.2s" }}>
            <div className="card-content">
              <div className="kpi-label">Alertas Ativos</div>
              <div className="flex items-center">
                <div className="kpi-value">{bottlenecks.length + delays.length}</div>
                <div className="kpi-delta kpi-delta-negative">
                  {bottlenecks.filter(b => b.impacto === "Alto").length} Críticos
                </div>
              </div>
              <div className="text-sm text-gray-600">Requer atenção imediata</div>
              <div className="icon-container">
                <div className="icon-badge icon-badge-red transition-transform">
                  {renderAppIcon("alertTriangle")}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid-wide">
          <div className="card animate-slide-in-up hover-shadow" style={{ animationDelay: "0.1s" }}>
            <div className="card-content">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="card-title">Desempenho da Produção</div>
                  <div className="card-description">Visualização do volume produzido vs. meta.</div>
                </div>
                <div className="period-selector">
                  {["dia", "semana", "mes"].map((period) => (
                    <div
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`period-button ${selectedPeriod === period ? 'period-button-active' : 'period-button-inactive'} transition-colors`}
                    >
                      {period === "dia" ? "Dia" : period === "semana" ? "Semana" : "Mês"}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="animate-fade-in">
                <ProductionChart period={selectedPeriod as 'dia' | 'semana' | 'mes'} />
              </div>
            </div>
          </div>

          <div className="card animate-slide-in-up hover-shadow" style={{ animationDelay: "0.2s" }}>
            <div className="card-content">
              <div className="card-title">Pontos de Atenção</div>
              <div className="card-description">Gargalos e atrasos identificados.</div>
              
              <div className="tab-container">
                <div 
                  onClick={() => setActiveTab("gargalos")}
                  className={`tab ${activeTab === "gargalos" ? 'tab-active' : 'tab-inactive'} transition-colors`}
                >
                  Gargalos ({bottlenecks.length})
                </div>
                <div 
                  onClick={() => setActiveTab("atrasos")}
                  className={`tab ${activeTab === "atrasos" ? 'tab-active' : 'tab-inactive'} transition-colors`}
                >
                  Atrasos ({delays.length})
                </div>
              </div>
              
              <div className="mt-4 list-container"> {/* Adicionada classe list-container */}
                {activeTab === "gargalos" ? (
                  bottlenecks.length > 0 ? (
                    bottlenecks.map((item, index) => (
                      <div key={item.id} className="alert-item animate-slide-in-right hover-shadow" style={{ animationDelay: `${0.1 * index}s` }}>
                        <div className="alert-header">
                          <div className="alert-title">{item.area}</div>
                          <div className={getImpactBadgeClass(item.impacto)}>
                            {item.impacto}
                          </div>
                        </div>
                        <div className="alert-description">{item.descricao}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-4 text-gray-600 text-sm animate-fade-in">
                      Nenhum gargalo identificado.
                    </div>
                  )
                ) : (
                  delays.length > 0 ? (
                    delays.map((item, index) => (
                      <div key={item.id} className="alert-item animate-slide-in-right hover-shadow" style={{ animationDelay: `${0.1 * index}s` }}>
                        <div className="alert-header">
                          <div className="alert-title">{item.processo}</div>
                          <div className="alert-badge alert-badge-medium animate-fade-in">
                            {item.tempo}
                          </div>
                        </div>
                        <div className="alert-description">{item.motivo}</div>
                        <div className="alert-description mt-1">{item.impacto}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-4 text-gray-600 text-sm animate-fade-in">
                      Nenhum atraso identificado.
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card animate-slide-in-up hover-shadow" style={{ animationDelay: "0.3s" }}>
          <div className="card-content">
            <div className="card-title">Capacidade por Setor</div>
            <div className="card-description">Utilização atual da capacidade em cada setor produtivo.</div>
            
            <div className="sector-grid">
              {sectorData.map((item, index) => (
                <div key={index} className="sector-card animate-scale-in hover-shadow" style={{ animationDelay: `${0.1 * index}s` }}>
                  <div className="sector-name">{item.name}</div>
                  <div className="sector-progress-bar">
                    <div 
                      className={getProgressBarClass(item.atual)}
                      style={{ width: `${item.atual}%` }}
                    ></div>
                  </div>
                  <div className="sector-stats">
                    <span>Utilização</span>
                    <span className="font-medium">{item.atual}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card animate-slide-in-up hover-shadow" style={{ animationDelay: "0.4s" }}>
          <div className="critical-alert-header">
            <div className="critical-alert-title">
              <span className="critical-alert-icon animate-pulse">{renderAppIcon("alertTriangle")}</span>
              Alertas Críticos Detalhados
            </div>
            <div className="card-description">
              Problemas que necessitam de resolução urgente.
            </div>
          </div>
          
          <div className="card-content list-container"> {/* Adicionada classe list-container */}
            {bottlenecks.filter(b => b.impacto === "Alto").length > 0 ? (
              bottlenecks
                .filter(b => b.impacto === "Alto")
                .map((item, index) => (
                  <div key={item.id} className="critical-alert-item animate-slide-in-right hover-shadow" style={{ animationDelay: `${0.1 * index}s` }}>
                    <div className="alert-header">
                      <div className="alert-title">{item.area}</div>
                      <div className="alert-badge alert-badge-high animate-fade-in">
                        Impacto Crítico
                      </div>
                    </div>
                    <div className="alert-description mb-4">{item.descricao}</div>
                    <div className="flex justify-end">
                      <button className="action-button transition-colors hover:bg-red-50">
                        Ver Ações
                      </button>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center p-8 animate-fade-in">
                <div className="icon-badge icon-badge-green mx-auto mb-3 animate-scale-in" style={{ width: "48px", height: "48px" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <div className="font-semibold text-gray-800 text-base">Nenhum alerta crítico no momento</div>
                <div className="text-sm text-gray-600 mt-1">Todos os sistemas estão operando normalmente</div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
