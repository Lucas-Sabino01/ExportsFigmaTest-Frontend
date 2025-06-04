/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Profile.tsx (ou ProfilePage.tsx, como você chamou)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // <--- IMPORTAR Link PARA O BOTÃO
import { getUserProfile } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
// Se você criar um arquivo CSS separado, importe-o aqui:
import './../styles/profile-styles.css';

interface UserProfileData { // Tipagem mais específica para os dados do perfil
  id: number;
  name: string;
  email: string;
  createdAt: string; // Mantém como string, pois a API retorna assim
}

const Profile: React.FC = () => {
  const { user: authUser } = useAuth();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUserProfile();
        setProfileData(data);
      } catch (err: any) {
        setError(err.message || err.toString() || 'Erro desconhecido ao carregar perfil.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div className="profile-loading">Carregando perfil...</div>;
  if (error) return <div className="profile-error">Erro ao carregar perfil: {error}</div>;

  // Usar profileData se disponível, senão authUser (embora profileData seja o mais atualizado da API)
  const displayUser = profileData || authUser;

  return (
    // Container principal da página de perfil
    <div className="profile-page-container">
      {/* Card ou seção para o conteúdo do perfil */}
      <div className="profile-card">
        <h2 className="profile-title">Perfil do Usuário</h2>

        {displayUser ? (
          <div className="profile-info-section">
            <ul className="profile-details-list">
              <li><strong>ID:</strong> {displayUser.id}</li>
              <li><strong>Nome:</strong> {displayUser.name}</li>
              <li><strong>Email:</strong> {displayUser.email}</li>
              <li>
                <strong>Criado em:</strong>{' '}
                {new Date(displayUser.createdAt).toLocaleDateString('pt-BR', { // Formatação para pt-BR
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </li>
            </ul>
          </div>
        ) : (
          <p className="profile-no-data">Não foi possível carregar os dados do perfil.</p>
        )}

        {/* Seção para ações, como botões */}
        <div className="profile-actions-section">
          <Link to="/home">
            <button className="profile-button go-home-button">
              Ir para Home
            </button>
          </Link>
          {/* Aqui você poderá adicionar outros botões no futuro, como "Alterar Senha" */}
        </div>
      </div>
    </div>
  );
};

export default Profile;