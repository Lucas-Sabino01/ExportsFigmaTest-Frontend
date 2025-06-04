/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { loginUser, registerUser, logoutUser, hasAuthToken, getUserProfile } from '../services/authService';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate

// Tipagem para os dados do usuário
interface User {
  createdAt: string | number | Date;
  id: number;
  name: string;
  email: string;
  role: string;
}

// Tipagem para o contexto
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean; // Para indicar se estamos carregando algo (ex: perfil)
  error: string | null; // Para guardar mensagens de erro
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

// Cria o contexto com um valor padrão (null ou undefined)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// O Provider é o componente que vai "segurar" o estado e as funções
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(hasAuthToken());
  const [loading, setLoading] = useState<boolean>(true); // Começa true para tentar carregar o usuário
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // Usa o hook para navegação

  // Este useEffect roda UMA VEZ quando o componente carrega.
  // Ele verifica se já existe um token e, se houver, tenta buscar o perfil do usuário.
  useEffect(() => {
    const checkUser = async () => {
      const currentToken = hasAuthToken();
      if (currentToken) {
        setToken(currentToken);
        try {
          const profileData = await getUserProfile();
    setUser({
            id: profileData.id,
            name: profileData.name,
            email: profileData.email,
            role: profileData.role, // <--- SALVA O ROLE!
            createdAt: profileData.createdAt // Adiciona o createdAt
        }); // Salva os dados do usuário no estado
        } catch (err) {
          // Se falhar (ex: token expirado), faz logout.
          console.error("Falha ao buscar perfil com token existente:", err);
          logoutUser(); // Limpa o token inválido
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false); // Termina o carregamento inicial
    };
    checkUser();
  }, []); // O array vazio [] garante que rode só uma vez.

  const handleLogin = async (data: any) => {
    setError(null);
    setLoading(true);
    try {
      const response = await loginUser(data);
      setToken(response.token);
      // Após o login, buscamos o perfil para ter os dados do usuário
      const profileData = await getUserProfile();
      setUser(profileData);
      setLoading(false);
      navigate('/profile'); // Redireciona para o perfil após login
    } catch (err: any) {
      setError(err.toString());
      setLoading(false);
    }
  };

  const handleRegister = async (data: any) => {
      setError(null);
      setLoading(true);
      try {
          await registerUser(data);
          // Opcional: fazer login automaticamente após o registro
          // await handleLogin({ email: data.email, password: data.password });
          setLoading(false);
          alert('Registro bem-sucedido! Faça o login.'); // Ou redireciona para o login
          navigate('/login'); // Redireciona para o login após registro
      } catch (err: any) {
          setError(err.toString());
          setLoading(false);
      }
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setToken(null);
    navigate('/login'); // Redireciona para o login após logout
  };

  // O valor que será compartilhado pelo contexto.
  const value = {
    isAuthenticated: !!token, // Se há token, está autenticado.
    user,
    token,
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };

  // Retorna o Provider envolvendo os 'children' (o resto da sua app)
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook customizado para facilitar o uso do contexto em outros componentes.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};