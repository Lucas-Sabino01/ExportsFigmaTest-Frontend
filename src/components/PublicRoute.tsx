// src/components/PublicRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // Importa seu hook de autenticação
import { JSX } from 'react';

// Define as propriedades que o PublicRoute espera receber
interface PublicRouteProps {
  element: JSX.Element; // O componente/página a ser renderizado (ex: <LoginPage />)
}

const PublicRoute: React.FC<PublicRouteProps> = ({ element }) => {
  // Pega o estado de autenticação do seu contexto
  const { isAuthenticated} = useAuth();

  // Opcional: Se você quiser mostrar "Carregando..." enquanto
  // o AuthContext verifica o token inicial, pode adicionar isso.
  // Mas para rotas públicas, geralmente não é necessário,
  // pois se ele carregar e estiver logado, será redirecionado.
  // if (loading) {
  //   return <div>Carregando...</div>;
  // }

  // A MÁGICA: Se o usuário JÁ ESTIVER autenticado...
  if (isAuthenticated) {
    // ...redireciona ele para a página /home.
    // 'replace' impede que o usuário volte para a página de login
    // clicando no botão "Voltar" do navegador.
    return <Navigate to="/home" replace />;
  }

  // Se o usuário NÃO ESTIVER autenticado, mostra a página
  // que foi passada como 'element' (neste caso, a LoginPage).
  return element;
};

export default PublicRoute;