// src/components/AuthLayout.tsx
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // Importe o hook useAuth

const AuthLayout: React.FC = () => {
  const { isAuthenticated, loading } = useAuth(); // Use o hook useAuth

  // Enquanto o contexto está carregando (verificando o token inicial)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <p className="text-lg text-gray-700">Carregando autenticação...</p>
        {/* Aqui você pode colocar um spinner ou um loader */}
      </div>
    );
  }

  // Se não estiver autenticado, redireciona para a página de login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se estiver autenticado, renderiza as rotas filhas
  return <Outlet />;
};

export default AuthLayout;