// src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '@/services/authService'; // Ajuste o caminho se necessário
import { toast } from 'sonner'; // Assumindo que você usa sonner para toasts
import '@/styles/register-styles.css'; // <--- IMPORTE SEU ARQUIVO CSS AQUI

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (!name || !email || !password) {
      toast.error('Nome, email e senha são obrigatórios.');
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      setIsLoading(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        toast.error('Por favor, insira um formato de email válido.');
        setIsLoading(false);
        return;
    }

    try {
      const response = await registerUser({ name, email, password, phoneNumber });
      toast.success(response.message || 'Utilizador registado com sucesso! Já pode fazer login.');
      navigate('/login');
    } catch (error: any) {
      const errorMessage = typeof error === 'string' ? error : (error.message || 'Erro desconhecido ao registar. Tente novamente.');
      toast.error(errorMessage);
      console.error("Erro no registo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page-container">
      {/* Opcional: Logo
      <div className="register-logo-container">
        <img src="/path-to-your-logo.svg" alt="Logo da Empresa" />
      </div>
      */}
      <div className="register-form-card">
        <h1 className="register-title">Criar Nova Conta</h1>
        <p className="register-description">Preencha os campos abaixo para se registar.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="register-form-group">
            <label htmlFor="name" className="register-label">Nome Completo</label>
            <input
              id="name"
              type="text"
              className="register-input"
              placeholder="O seu Nome Completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="email" className="register-label">Email</label>
            <input
              id="email"
              type="email"
              className="register-input"
              placeholder="oseuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="phoneNumber" className="register-label">Número de Telefone (Opcional)</label>
            <input
              id="phoneNumber"
              type="tel"
              className="register-input"
              placeholder="(XX) XXXXX-XXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="password" className="register-label">Senha</label>
            <input
              id="password"
              type="password"
              className="register-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              minLength={6}
            />
            {/* Se você quiser exibir mensagens de erro abaixo do input:
            <p className="register-error-message">A senha é muito curta.</p> 
            */}
          </div>

          <button type="submit" className="register-submit-button" disabled={isLoading}>
            {isLoading ? 'A registar...' : 'Registar'}
          </button>
        </form>

        <div className="register-login-link-container">
          Já possui uma conta?{' '}
          <Link to="/login" className="register-login-link">
            Faça Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
