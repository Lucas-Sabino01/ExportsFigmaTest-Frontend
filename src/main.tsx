// No SEU arquivo src/main.tsx
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Se estiver usando router
import App from './App'; // O SEU App principal
import './styles/index.css'; // Estilos globais, se necessário
import { LocaleManager } from '@bryntum/gantt'; // ou @bryntum/gantt-react? Verifique a doc.
import { AuthProvider } from './contexts/AuthContext'; // Importe o AuthProvider
import './pages/DayShop/locales/gantt.locale.PtBr.js'; 
LocaleManager.applyLocale('PtBr');


ReactDOM.createRoot(document.getElementById('root')!).render(
//<React.StrictMode>
    <BrowserRouter> {/* Se usar router */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  //</React.StrictMode>
);