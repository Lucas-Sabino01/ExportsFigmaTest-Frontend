import { useEffect, useRef } from 'react';
// Não é necessário importar o CSS aqui se ele já é importado globalmente ou no componente pai (HomePage.tsx)
// import '../../styles/homepage-scale-solution.css'; 

// Wrapper de escala para tornar o layout fixo responsivo
const ScaleWrapper = ({ children }) => {
  const containerRef = useRef(null);
  const wrapperRef = useRef(null); // Ref para o elemento wrapper

  // Função para calcular e aplicar a escala e o posicionamento
  const applyScaleAndPosition = () => {
    if (!containerRef.current || !wrapperRef.current) return;

    // Obtém as dimensões do elemento wrapper (que deve ocupar o espaço desejado, ex: 100vw/100vh)
    const wrapperWidth = wrapperRef.current.offsetWidth;
    const wrapperHeight = wrapperRef.current.offsetHeight;

    // Dimensões originais do layout que está sendo escalado
    const originalWidth = 3840; // Largura original do seu conteúdo
    const originalHeight = 2160; // Altura original do seu conteúdo

    // Calcula o fator de escala baseado na largura e altura
    // Isso garante que o conteúdo caiba sem cortar, mantendo a proporção
    const scaleX = wrapperWidth / originalWidth;
    const scaleY = wrapperHeight / originalHeight;
    const scale = Math.min(scaleX, scaleY);

    // Aplica o fator de escala via CSS custom property
    containerRef.current.style.setProperty('--scale-factor', scale.toString());

    // Calcula as dimensões do conteúdo após o escalonamento
    const scaledContentWidth = originalWidth * scale;
    const scaledContentHeight = originalHeight * scale;

    // Calcula os deslocamentos (offsets) para centralizar o conteúdo escalado
    const offsetX = (wrapperWidth - scaledContentWidth) / 2;
    const offsetY = (wrapperHeight - scaledContentHeight) / 2;

    // Aplica os deslocamentos para centralizar o container de conteúdo
    containerRef.current.style.left = `${offsetX}px`;
    containerRef.current.style.top = `${offsetY}px`;

    // Garante que a classe 'scaled' seja aplicada para ativar a transformação de escala no CSS
    if (!containerRef.current.classList.contains('scaled')) {
      containerRef.current.classList.add('scaled');
    }
  };

  // Aplica a escala e o posicionamento no carregamento inicial e em redimensionamentos da janela
  useEffect(() => {
    applyScaleAndPosition(); // Aplica na montagem do componente

    window.addEventListener('resize', applyScaleAndPosition); // Adiciona listener para redimensionamento

    // Limpa o listener quando o componente é desmontado para evitar vazamentos de memória
    return () => {
      window.removeEventListener('resize', applyScaleAndPosition);
    };
  }, []); // Array de dependências vazio para executar apenas na montagem e desmontagem

  return (
    // O wrapperRef é usado para obter as dimensões do contêiner pai disponível
    <div ref={wrapperRef} className="scale-wrapper">
      {/* O containerRef é o elemento que realmente será escalado e posicionado */}
      <div ref={containerRef} className="scale-container">
        {children}
      </div>
    </div>
  );
};

export default ScaleWrapper;
