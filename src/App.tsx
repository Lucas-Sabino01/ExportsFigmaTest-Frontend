// Exemplo de correção em src/App.tsx

import { AppRoutes } from './router/routes';
// import Navbar from './components/layout/Navbar';

function App() {
  return (
    // Faça este container principal ocupar a tela e ser flexível na vertical
    <div className="flex flex-col h-screen"> {/* h-screen = 100% da altura da viewport */}

      {/* Sua Navbar (se tiver) */}
      {/* <Navbar /> */}

      {/* Faça a área de conteúdo principal crescer e ter scroll se necessário */}
      <main className="flex-grow overflow-auto">
        <AppRoutes /> {/* Suas páginas serão renderizadas aqui dentro */}
      </main>

      {/* Seu Footer (se tiver) */}
      {/* <Footer /> */}

    </div>
  );
}

export default App;