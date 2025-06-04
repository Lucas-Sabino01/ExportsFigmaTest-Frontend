/* eslint-disable @typescript-eslint/no-explicit-any */
//src/pages/home/HomePage.tsx
import { Link, useNavigate } from "react-router-dom";
import { JSX, useState, useEffect, useRef } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Separator } from "../../components/ui/separator";
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import './styles/homepage-styles.css';
import ScaleWrapper from './ScaleWrapper';
import './styles/homepage-scale-solution.css';

// Importe o hook useAuth
import { useAuth } from '@/contexts/AuthContext'; // Ajuste o caminho se necessário

interface NavItem {
  name: string;
  path?: string;
  isExternal?: boolean;
  url?: string;
}

interface Position {
  top: string;
  left: string;
}
interface FacilitySection {
  id: number;
  name: string;
  description: string;
  image: string;
  color: string;
  position: Position;
  markerPosition: Position;
  numberPosition: Position;
  infoPosition: Position;
  path?: string;
}

// Language type and data
type Language = {
  code: string;
  name: string;
  flag: string;
};

const languages: Language[] = [
  { code: 'pt', name: 'Português', flag: '/images/languageptbr.png' },
  { code: 'es', name: 'Español', flag: 'https://placehold.co/40x30/FFC400/000000?text=ES' },
  { code: 'en', name: 'English', flag: 'https://placehold.co/40x30/0052B4/FFFFFF?text=EN' },
];

// SVG Icons for Dark Mode Toggle
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="dark-mode-icon">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="dark-mode-icon">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const markerColorMap: { [key: string]: string } = {
  "#9ac998": "marcador-usinagem.svg",
  "#418e5e": "marcador-montagem.svg",
  "#009b3a": "marcador-deposito.svg",
  "#006927": "marcador-producao.svg",
  "default": "marcador-padrao.svg"
};

const facilitySections: FacilitySection[] = [
  {
    id: 1,
    name: "Usinagem",
    description: "Área responsável pelo processamento de peças metálicas com alta precisão. Equipada com tornos CNC e fresadoras de última geração para garantir qualidade e eficiência.",
    image: "/images/map-usinagem.png",
    color: "#9ac998",
    position: { top: "538px", left: "0" },
    markerPosition: { top: "33px", left: "71px" },
    numberPosition: { top: "34px", left: "37px" },
    infoPosition: { top: "1500px", left: "125px" },
    path: "/tela-usinagem",
  },
  {
    id: 2,
    name: "Montagem",
    description: "Setor onde os componentes são integrados para formar produtos finais. Conta com estações de trabalho ergonômicas e sistemas de verificação de qualidade em cada etapa.",
    image: "/images/map-montagem.png",
    color: "#418e5e",
    position: { top: "0", left: "361px" },
    markerPosition: { top: "156px", left: "599px" },
    numberPosition: { top: "60px", left: "35px" },
    infoPosition: { top: "1500px", left: "660px" },
    path: "/tela-montagem",
  },
  {
    id: 3,
    name: "Depósito",
    description: "Centro logístico com sistema automatizado de armazenamento e recuperação. Gerencia o fluxo de matérias-primas e produtos acabados com eficiência e rastreabilidade total.",
    image: "/images/map-deposito.png",
    color: "#009b3a",
    position: { top: "1074px", left: "537px" },
    markerPosition: { top: "523px", left: "650px" },
    numberPosition: { top: "34px", left: "34px" },
    infoPosition: { top: "1500px", left: "1295px" },
    path: "/tela-deposito",
  },
  {
    id: 4,
    name: "Produção",
    description: "Coração da fábrica onde ocorre a transformação principal dos materiais. Equipada com linhas de produção flexíveis e sistemas de monitoramento em tempo real para máxima produtividade.",
    image: "/images/map-produção.png",
    color: "#006927",
    position: { top: "426px", left: "859px" },
    markerPosition: { top: "187px", left: "774px" },
    numberPosition: { top: "33px", left: "8px" },
    infoPosition: { top: "1500px", left: "1854px" },
    path: "/tela-producao",
  },
];

const navItems: NavItem[] = [
  {
    name: "Kanban",
    path: "http://localhost:3000",
    isExternal: true,
  },
  { name: "Day@Shop", path: "/gantt" },
  { name: "Status", path: "/status" },
  { name: "Mapa Geral", path: "/mapas" },
  { name: "Configuração", path: "/configuracoes" },
];

const FacilityMapDisplay: React.FC<{ sections: FacilitySection[] }> = ({ sections }) => {
  const navigate = useNavigate();
  return (
    <div className="absolute w-[1828px] h-[1877px] top-[175px] left-[1854px]">
      <img
        className="absolute w-[859px] h-[773px] top-[502px] left-[452px] object-cover"
        alt="Rua"
        src="/images/rua1.svg"
        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/859x773/cccccc/333333?text=Rua+Indisponível'; }}
      />
      <div className="absolute w-[1752px] h-[1803px] top-0 left-[76px]">
        <div className="relative h-[1803px]">
          {sections.map((section) => {
            const markerSvgFileName = markerColorMap[section.color] || markerColorMap["default"];
            const markerSvgUrl = `/images/${markerSvgFileName}`;

            return (
              <div
                key={section.id}
                className="absolute bg-cover bg-center opacity-90 hover:opacity-100 cursor-pointer facility-section"
                style={{
                  width: section.id === 4 ? "893px" : section.id === 3 ? "729px" : section.id === 2 ? "784px" : "753px",
                  height: section.id === 4 ? "759px" : section.id === 3 ? "729px" : section.id === 2 ? "784px" : "678px",
                  top: section.position.top,
                  left: section.position.left,
                  backgroundImage: `url(${section.image})`,
                }}
                onClick={() => {
                  if (section.path) {
                    navigate(section.path);
                  }
                }}
                aria-label={`Área da ${section.name}`}
              >
                <div
                  className="absolute facility-marker"
                  style={{
                    top: section.markerPosition.top,
                    left: section.markerPosition.left,
                    width: '97px',
                    height: '128px',
                  }}
                >
                  <div
                    className="relative w-full h-full bg-no-repeat bg-contain bg-center"
                    style={{ backgroundImage: `url('${markerSvgUrl}')` }}
                  >
                    <span
                      className="absolute text-white font-bold text-2xl"
                      style={{
                        top: section.numberPosition.top,
                        left: section.numberPosition.left,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1
                      }}
                    >
                      {/* {section.id} */}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          <img
            src="/images/separator.svg"
            alt="Linha de conexão entre seções"
            className="absolute"
            style={{ top: '1380px', left: '-1319px', zIndex: 2 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <img
            src="/images/separator.svg"
            alt="Linha de conexão entre seções"
            className="absolute"
            style={{ top: '1380px', left: '-700px', zIndex: 2 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <img
            src="/images/separator.svg"
            alt="Linha de conexão entre seções"
            className="absolute"
            style={{ top: '1380px', left: '-110px', zIndex: 2 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      </div>
    </div>
  );
};

const CustomButton: React.FC<{
  name: string;
  path?: string;
  isExternal?: boolean;
}> = ({ name, path, isExternal }) => {
  const getWidth = () => {
    switch (name) {
      case "Kanban":
      case "Status":
        return "w-[222px]";
      case "Day@Shop":
      case "Mapa Geral":
        return "w-[266px]";
      case "Configuração":
        return "w-[351px]";
      default:
        return "w-[222px]";
    }
  };

  const buttonClass = `custom-button ${getWidth()} h-[90px]`;

  if (isExternal && path) {
    return (
      <a href={path} className={buttonClass} target="_blank" rel="noopener noreferrer">
        <span className="button-text">{name}</span>
      </a>
    );
  }

  return (
    <Link to={path || "#"} className={buttonClass}>
      <span className="button-text">{name}</span>
    </Link>
  );
};


export const HomePage = (): JSX.Element => {
  const [showWith, setShowWith] = useState(true);
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const keyboard = useRef<any>(null);
  const [layoutName, setLayoutName] = useState("default");

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const storedDarkMode = localStorage.getItem('valmetDashboardDarkMode');
    if (storedDarkMode) {
      try {
        return JSON.parse(storedDarkMode);
      } catch (e) {
        console.error("Error parsing valmetDashboardDarkMode from localStorage", e);
        localStorage.removeItem('valmetDashboardDarkMode');
        return false;
      }
    }
    return false;
  });

  const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages[0]);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // Importe o hook useAuth
  const { user, /*isEditor,*/ logout } = useAuth();
  const navigate = useNavigate();

  // Apply theme and update localStorage
  useEffect(() => {
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('valmetDashboardDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Listener for localStorage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'valmetDashboardDarkMode' && event.newValue !== null) {
        try {
          const newIsDark = JSON.parse(event.newValue);
          setIsDarkMode(newIsDark);
        } catch (error) {
          console.error("Erro ao parsear valmetDashboardDarkMode do localStorage:", error);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  useEffect(() => {
    const intervalId = setInterval(() => {
      setShowWith((prevShowWith) => !prevShowWith);
    }, 2800);
    return () => clearInterval(intervalId);
  }, []);

  const toggleVirtualKeyboard = () => {
    setShowVirtualKeyboard(!showVirtualKeyboard);
  };

  const onKeyPress = (button: string) => {
    let currentInput = searchTerm;
    if (button === "{shift}" || button === "{lock}") {
      setLayoutName(layoutName === "default" ? "shift" : "default");
      return;
    }
    if (button === "{bksp}") {
      currentInput = currentInput.slice(0, -1);
    } else if (button === "{space}") {
      currentInput += " ";
    } else if (button === "{enter}") {
      return;
    } else if (button === "{tab}") {
      currentInput += "\t";
    }
    else if (!button.startsWith("{") || !button.endsWith("}")) {
      currentInput += button;
    }
    setSearchTerm(currentInput);
    if (keyboard.current) {
      keyboard.current.setInput(currentInput);
    }
  };

  const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    setSearchTerm(input);
    if (keyboard.current) {
      keyboard.current.setInput(input);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode: boolean) => !prevMode);
  };

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
    setIsLangDropdownOpen(false);
    console.log("Idioma selecionado:", language.name);
    // Add logic to change app language (e.g., using i18next.changeLanguage(language.code))
  };

  // Função para lidar com o logout
  const handleLogout = () => {
    logout(); // Chama a função de logout do contexto
    navigate('/login'); // Redireciona para a página de login
  };

  return (
    <ScaleWrapper>
      <div id="homepage-container" className="bg-white flex flex-row justify-center w-full">
        <div className="bg-white w-[3840px] h-[2160px] relative">

          <FacilityMapDisplay sections={facilitySections} />

          {/* Botões de navegação no topo (Kanban, Day@Shop, etc.) */}
          <div className="absolute top-[52px] left-[900px] gap-[200px] flex space-x-6">
            {navItems.map((item, index) => (
              <CustomButton
                key={index}
                name={item.name}
                path={item.path}
                isExternal={item.isExternal}
              />
            ))}
          </div>

          {/* Header Controls: Notificação, Idioma, Modo Escuro (mantidos no topo) */}
          {/* Este div permanece no topo e contém os controles do cabeçalho */}
          <div className="absolute top-[52px] right-[50px] flex items-center space-x-5 z-20">
            {/* Botão de Notificação */}
            <Button
              variant="ghost"
              className="w-[72px] h-[72px] mr-[40px] p-0 bg-transparent hover:bg-transparent focus:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 border-none cursor-pointer"
              aria-label="Notificações"
            >
              <img
                className="w-full h-full"
                alt="Botão de notificação"
                src="/images/btn-Notification.svg"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/72x72/cccccc/333333?text=Notif'; }}
              />
            </Button>

            {/* Language Selector */}
            <div className="language-selector-wrapper">
              <div className="language-selector-container">
                <img
                  className="language-flag-selected"
                  alt={`Bandeira ${selectedLanguage.name}`}
                  src={selectedLanguage.flag}
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/50x37/cccccc/333333?text=${selectedLanguage.code.toUpperCase()}`; }}
                />
                <button
                  type="button"
                  className="language-dropdown-button"
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  aria-haspopup="true"
                  aria-expanded={isLangDropdownOpen}
                  aria-label="Selecionar idioma"
                >
                  <img
                    className="language-arrow-icon"
                    alt="Seta para baixo"
                    src="/images/setaparabaixo.svg"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </button>
              </div>
              {isLangDropdownOpen && (
                <ul className="language-options-list" role="listbox">
                  {languages.map((language) => (
                    <li
                      key={language.code}
                      onClick={() => handleLanguageSelect(language)}
                      role="option"
                      aria-selected={language.code === selectedLanguage.code}
                      tabIndex={0}
                      onKeyPress={(e) => e.key === 'Enter' && handleLanguageSelect(language)}
                      className="language-option-item"
                    >
                      <img
                        className="language-flag-option"
                        src={language.flag}
                        alt={`Bandeira ${language.name}`}
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/32x24/cccccc/333333?text=${language.code.toUpperCase()}`; }}
                      />
                      <span className="language-name-option">{language.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Dark Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="dark-mode-toggle-button"
              aria-label={isDarkMode ? "Ativar modo claro" : "Ativar modo escuro"}
            >
              <div className="dark-mode-toggle-track">
                <div className="dark-mode-toggle-thumb">
                  {isDarkMode ? <MoonIcon /> : <SunIcon />}
                </div>
              </div>
            </button>
          </div>

          {/* Informações do Utilizador e Botão de Logout - MOVIDO PARA O CANTO INFERIOR DIREITO */}
          {/* ESTE DIV AGORA É UM IRMÃO DO DIV DE CONTROLES DO CABEÇALHO, NÃO UM FILHO */}
          {/*// ... dentro do seu return JSX ...*/}
            {user && (
              <div className="homepage-bottom-right-controls user-info-controls">
                <span className="user-info-text">
                  Olá, {user.name || user.email || 'Usuário'} (
                  {user.role?.toLowerCase() === 'admin' ? 'Administrador' :
                  user.role?.toLowerCase() === 'viewer' ? 'Visualizador' :
                  user.role || 'Visualizador'}
                  )</span>
                <Button
                  onClick={handleLogout}
                  className="logout-button"
                >
                  Sair
                </Button>
              </div>
            )}
          </div>


          <div className="absolute w-[684px] h-[226px] top-[14px] left-[38px]">
            <img
              className="absolute w-[114px] h-[107px] top-[52px] left-[570px]"
              alt="Logotipo da empresa"
              src="/images/tela-principal-logo.svg"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/114x107/cccccc/333333?text=Logo'; }}
            />
            <div className="absolute w-[522px] h-[119px] top-[52px] left-0">
              <div className="relative h-[119px]">
                <img
                  className="absolute w-[517px] h-[119px] top-0 left-[5px]"
                  alt="Nome da empresa estilizado"
                  src="/images/Name-Valmet.svg"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/517x119/cccccc/333333?text=VALMET'; }}
                />
              </div>
            </div>

            <div className="absolute w-auto top-[223px] left-[61px] flex items-center h-[60px]">
              <div className="[font-family:'Tauri',Helvetica] font-normal text-black text-[43px] tracking-[0] leading-none mr-[14px] slogan-move-forward">
                MOVE FORWARD
              </div>
              <div className="[font-family:'Tauri',Helvetica] font-normal text-[#009b3a] text-[43px] tracking-[0] leading-none slogan-animation slogan-with-us">
                {showWith ? "WITH" : "US!"}
              </div>
            </div>
          </div>

          <Separator
            orientation="vertical"
            className="absolute w-1 h-[512px] top-[1540px] left-[658px] bg-black separator-line"
          />
          {facilitySections.map((section) => (
            <div
              key={`info-${section.id}`}
              className="absolute h-[469px] facility-info-card"
              style={{
                width: section.id === 2 ? "564px" : section.id === 3 ? "536px" : "531px",
                top: section.infoPosition.top,
                left: section.infoPosition.left,
              }}
            >
              <div
                className="absolute font-roboto text-black text-[40px] tracking-[0] leading-normal break-words facility-description"
                style={{
                  width: section.id === 1 ? "480px" : "478px",
                  top: "179px",
                  left: section.id === 1 ? "0" : "15px",
                }}
              >
                {section.description}
              </div>

              <Badge
                className="absolute w-[104px] h-[104px] top-0 rounded-[52px] flex items-center justify-center font-roboto facility-badge"
                style={{
                  left: section.id === 1 ? "2px" : "0",
                  backgroundColor: section.color,
                }}
              >
                <span className="font-roboto text-[#FFF] text-[48px] facility-badge-number">
                  {section.id}
                </span>
              </Badge>

              <div
                className="absolute top-[23px] font-roboto text-[#050404] text-[48px] tracking-[0] leading-[normal] facility-name"
                style={{ left: section.id === 1 ? "130px" : "164px" }}
              >
                {section.name}
              </div>

              {section.id === 2 && (
                <Separator
                  orientation="vertical"
                  className="absolute w-1 h-[512px] top-[46px] left-[556px] bg-black separator-line"
                />
              )}
            </div>
          ))}

          <div className="absolute w-[1093px] top-[800px] left-[51px] font-roboto search-bar-container">
            <Card className="relative w-full h-[98px] bg-[#E0E0E0] rounded-[49px] shadow-lg border-none search-card">
              <CardContent className="p-0 h-full flex items-center px-6">
                <img
                  className="w-[48px] h-[48px] mr-[25px] ml-[25px] text-gray-600 search-icon-img"
                  alt="Ícone de pesquisa"
                  src="/images/searchicon.svg"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/48x48/cccccc/333333?text=S'; }}
                />
                <Separator orientation="vertical" className="h-[60px] bg-gray-400 mr-4 search-separator" />
                <Input
                  value={searchTerm}
                  onChange={onChangeInput}
                  className="flex-grow bg-transparent border-0 text-[36px] font-roboto font-normal text-gray-800 tracking-wider leading-[normal] placeholder:text-gray-500/90 px-2 focus:ring-0 search-input-field"
                  placeholder="SEARCH"
                  onFocus={() => setShowVirtualKeyboard(false)}
                />
                <button
                  type="button"
                  onClick={toggleVirtualKeyboard}
                  className="cursor-pointer mr-[24px] border-none bg-transparent keyboard-toggle-button"
                  aria-label="Mostrar teclado virtual"
                >
                  <img
                    className="w-[85px] text-gray-800 keyboard-icon-img"
                    alt="Ícone de teclado"
                    src="/images/Keyboardicon.svg"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/85x72/cccccc/333333?text=KB'; }}
                  />
                </button>
              </CardContent>
            </Card>

            {showVirtualKeyboard && (
              <div
                className="absolute bottom-[calc(100%_+_10px)] left-0 w-full max-w-[860px] z-20
                               font-roboto myVirtualKeyboardTheme virtual-keyboard-wrapper"
              >
                <div className="flex justify-between items-center keyboard-header">
                  <span className="txt-tecladovirtual">Teclado Virtual</span>
                  <Button
                    variant="outline"
                    onClick={toggleVirtualKeyboard}
                    className="close-keyboard-button px-3 py-1 h-auto rounded-md text-xs font-medium"
                    aria-label="Fechar teclado virtual"
                  >
                    Fechar
                  </Button>
                </div>
                <Keyboard
                  keyboardRef={r => (keyboard.current = r)}
                  layoutName={layoutName}
                  onChange={setSearchTerm}
                  onKeyPress={onKeyPress}
                  inputName={"searchTerm"}
                  theme={"hg-theme-default hg-layout-default"}
                  display={{
                    '{bksp}': 'Apagar',
                    '{enter}': 'Enter',
                    '{space}': 'Espaço',
                    '{shift}': 'Shift',
                    '{lock}': 'Caps Lock',
                    '{tab}': 'Tab',
                    '{//}':'/',
                  }}
                  mergeDisplay={true}
                  layout={{
                    default: [
                      "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
                      "{tab} q w e r t y u i o p [ ] \\",
                      "{lock} a s d f g h j k l ; ' {enter}",
                      "{shift} z x c v b n m , . / {shift}",
                      ".com @ {space}",
                    ],
                    shift: [
                      "~ ! @ # $ % ^ & * ( ) _ + {bksp}",
                      "{tab} Q W E R T Y U I O P { } |",
                      '{lock} A S D F G H J K L : " {enter}',
                      "{shift} Z X C V B N M < > ? {shift}",
                      ".com @ {space}",
                    ],
                  }}
                  buttonTheme={[
                    {
                      class: "hg-button-space",
                      buttons: "{space}"
                    },
                    {
                      class: "hg-button-enter",
                      buttons: "{enter}"
                    },
                    {
                      class: "hg-button-bksp",
                      buttons: "{bksp}"
                    }
                  ]}
                />
              </div>
            )}
        </div>
      </div>
    </ScaleWrapper>
  );
};

export default HomePage;