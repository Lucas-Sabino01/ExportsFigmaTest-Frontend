import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Se ainda estivermos verificando o token (carregamento inicial),
  // podemos mostrar um loader ou esperar. Aqui, vamos apenas esperar.
  // Em uma app real, um spinner seria bom.
  if (loading) {
      return <div>Carregando...</div>;
  }

  // Se estiver autenticado, renderiza o conteúdo da rota filha (usando <Outlet />).
  // Se não estiver autenticado, redireciona para a página de login.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;