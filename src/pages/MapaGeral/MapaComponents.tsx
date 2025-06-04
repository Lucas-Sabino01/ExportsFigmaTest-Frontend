import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import './MapaStyles.css'; // Certifique-se de que este ficheiro CSS está atualizado e importado

// Dados das áreas da fábrica
const facilityAreas = [
  {
    id: 1,
    title: "Usinagem de Precisão",
    subtitle: "Onde a Precisão Encontra a Potência",
    description: "A tecnologia de usinagem avançada da Valmet é um exemplo de como a precisão e a potência podem coexistir. É um testemunho do compromisso da Valmet com a inovação e a qualidade.",
    image: "/images/Usinagem.svg",
    thumbnail: "/images/Thusinagem.svg",
  },
  {
    id: 2,
    title: "Linha de Produção da Valmet",
    subtitle: "Inovação em Ação",
    description: "Esta imagem oferece uma visão detalhada da linha de produção da Valmet, onde a mais avançada tecnologia é aplicada para a fabricação de equipamentos para as indústrias de celulose, papel e energia.",
    image: "/images/Producao.svg",
    thumbnail: "/images/Thproducao.svg",
  },
  {
    id: 3,
    title: "Instalações Valmet",
    subtitle: "Um Centro de Excelência em Tecnologia Industrial",
    description: "A visão aérea deste complexo industrial da Valmet demonstra a extensão e a modernidade de suas instalações. Cada edifício e cada detalhe são projetados para otimizar a produção e garantir a qualidade dos produtos e serviços da Valmet.",
    image: "/images/Instalacoes.svg",
    thumbnail: "/images/Thinstalacao.svg",
  },
  {
    id: 4,
    title: "Organização e Fluxo",
    subtitle: "A Eficiência da Valmet",
    description: "Esta imagem oferece um vislumbre da área de armazenamento e logística da Valmet, onde a organização e a eficiência são cruciais. A disposição dos materiais demonstra o compromisso da Valmet com a otimização do fluxo de trabalho.",
    image: "/images/OrganizacaoFluxo.svg",
    thumbnail: "/images/Thorganizacao.svg",
  },
];

export const MapaComponent = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDarkMode] = useState(() => {
    const storedDarkMode = localStorage.getItem('valmetDashboardDarkMode');
    return storedDarkMode ? JSON.parse(storedDarkMode) : false;
  });
  const selectedArea = facilityAreas[currentIndex];
  const navigate = useNavigate();

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('valmetDashboardDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % facilityAreas.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + facilityAreas.length) % facilityAreas.length);
  };

  const handleCarouselCardClick = (index: number) => {
    setCurrentIndex(index);
  };

  const handleNavigateToMenu = () => {
    navigate('/'); 
  };

  return (
    <div className="mapa-geral-container">
      <div className="mapa-sidebar">
        <div className="mapa-logo">
          <img src="https://c.animaapp.com/mavw8qfrfSJ0de/img/logo.png" alt="Logótipo Valmet" />
        </div>
        <button 
          id="mapaScreenCustomButton" // ID ATUALIZADO para o botão base
          className="mapa-voltar-button-custom" // Classe para ajustes específicos do botão voltar
          onClick={handleNavigateToMenu}
        >
          <span className="button-text">Voltar</span>
        </button>
      </div>

      <div
        className="mapa-main-content"
        style={{ backgroundImage: `url(${selectedArea.image})` }}
      >
        <div className="mapa-content-overlay">
          <div className="mapa-area-detail-card">
            <div className="mapa-card-content-main">
              <div className="mapa-separator-main"></div>
              <p className="mapa-area-subtitle-main">{selectedArea.subtitle}</p>
              <h2 className="mapa-area-title-main">{selectedArea.title}</h2>
              <p className="mapa-area-description-main">"{selectedArea.description}"</p>
            </div>
          </div>

          <div className="mapa-areas-carousel-wrapper">
            <div className="mapa-areas-carousel">
              {facilityAreas.map((area, index) => (
                <div
                  key={area.id}
                  className={`mapa-area-card ${index === currentIndex ? 'active' : ''}`}
                  style={{ backgroundImage: `url(${area.thumbnail})` }}
                  onClick={() => handleCarouselCardClick(index)}
                >
                  <div className="mapa-card-content-carousel">
                    <div className="mapa-separator-carousel"></div>
                    <h3 className="mapa-card-title-carousel">{area.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mapa-navigation-footer">
          <div className="mapa-navigation-controls">
            <div className="mapa-yellow-circle">
              <img src="https://c.animaapp.com/mavw8qfrfSJ0de/img/vector.svg" alt="Ícone Valmet" />
            </div>
            <button className="mapa-qual-area-button">Qual Área?</button>
          </div>

          <div className="mapa-carousel-controls-main">
            <button className="mapa-prev-button" onClick={handlePrev}>
              <img src="https://c.animaapp.com/mavw8qfrfSJ0de/img/vector-15.svg" alt="Anterior" />
            </button>
            <div className="mapa-progress-bar">
              {facilityAreas.map((_, index) => (
                <div
                  key={index}
                  className={`mapa-progress-segment ${index === currentIndex ? 'active' : ''}`}
                ></div>
              ))}
            </div>
            <button className="mapa-next-button" onClick={handleNext}>
              <img src="https://c.animaapp.com/mavw8qfrfSJ0de/img/vector-16.svg" alt="Próximo" />
            </button>
          </div>
          
          <div className="mapa-page-indicator">
            {String(currentIndex + 1).padStart(2, '0')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapaComponent;
