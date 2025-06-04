// src/pages/LoginPage.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, /*useNavigate*/ } from 'react-router-dom'; // Importe Link e useNavigate
import { useAuth } from '@/contexts/AuthContext';

import './../styles/login-styles.css'; // Seu CSS personalizado
import { toast } from 'sonner'; // Para feedback

interface LoginFormInputs {
  email?: string;
  password?: string;
}

const LoginPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<LoginFormInputs>();
  const { login, loading, error: authError } = useAuth();
  //const navigate = useNavigate(); // Para navegação

  const onSubmit = async (data: LoginFormInputs) => {
    if (data.email && data.password) {
      try {
        await login({ email: data.email, password: data.password });
        // O AuthContext ou um componente superior deve lidar com o redirecionamento
      } catch (err: any) {
        const errorMessage = err.message || 'Email ou senha inválidos.';
        setError('email', { type: 'manual', message: errorMessage });
        // setError('password', { type: 'manual', message: errorMessage }); // Opcional, para mostrar erro em ambos
        console.error('Login falhou:', errorMessage);
      }
    }
  };

  const handleForgotPassword = () => {
    // Por enquanto, podemos apenas mostrar um toast ou navegar para uma página placeholder
    // navigate('/forgot-password'); // Exemplo de navegação para uma futura página
    toast.info('A funcionalidade "Esqueceu sua senha?" está em desenvolvimento.');
  };

  return (
    <div className="login-page-container">
      <div className="login-logo-container">
        <img src="/images/tela-principal-logo.svg" alt="Valmet Logo" /> {/* Ajuste o caminho */}
      </div>
      <div className="login-form-card">
        <h2 className="login-title">Login Valmet Day@shop</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="login-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="login-input"
              placeholder="seu_email@dominio.com"
              {...register('email', {
                required: 'Email é obrigatório.',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Endereço de email inválido"
                }
              })}
            />
            {errors.email && (
              <p className="login-error-message">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="login-label">
              Senha
            </label>
            <input
              id="password"
              type="password"
              className="login-input"
              placeholder="Sua senha"
              {...register('password', { required: 'Senha é obrigatória.' })}
            />
            {errors.password && (
              <p className="login-error-message">{errors.password.message}</p>
            )}
          </div>

          {authError && !errors.email?.message && !errors.password?.message && (
             <p className="login-error-message text-center">
               {authError}
             </p>
           )}

          <button
            type="submit"
            className="login-submit-button"
            disabled={isSubmitting || loading}
          >
            {isSubmitting || loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="login-extra-links"> {/* Substitui o div com mt-6 e space-y-2 */}
          {/* Link para "Esqueceu sua senha?" */}
          <button
            type="button"
            onClick={handleForgotPassword}
            className="forgot-password-link"
          >
            Esqueceu sua senha?
          </button>

          {/* Link para a página de Registro */}
          <p> {/* O texto "Não tem uma conta?" herda de .login-extra-links p */}
            Não tem uma conta?{' '}
            <Link to="/register" className="register-link-inline"> {/* Nova classe para o link */}
              Registe-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
