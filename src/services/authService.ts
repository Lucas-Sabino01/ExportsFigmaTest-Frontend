import api from './apiService';

// Interfaces para tipar os dados (se você usa TypeScript, isso é ótimo!)
interface RegisterData {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  email: string;
  name: string;
  message: string;
}

// Função para registrar um usuário.
export const registerUser = async (data: RegisterData) => {
  try {
    // Usamos nossa instância 'api' para fazer um POST para /auth/register.
    // O axios automaticamente junta a baseURL com '/auth/register'.
    const response = await api.post('/auth/register', data);
    return response.data; // Retorna a resposta do back-end (ex: { message: "..." })
  } catch (error: any) {
    // Se der erro, pegamos a mensagem de erro do back-end (se houver)
    // ou a mensagem de erro padrão do axios.
    throw error.response?.data?.message || error.message || 'Erro ao registrar.';
  }
};

// Função para logar um usuário.
export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  try {
    // Fazemos um POST para /auth/login.
    const response = await api.post<AuthResponse>('/auth/login', data);
    
    // Se o login for bem-sucedido e tivermos um token...
    if (response.data && response.data.token) {
        // ...SALVAMOS o token no localStorage! Este é o passo chave.
        localStorage.setItem('authToken', response.data.token);
    }
    
    return response.data; // Retorna a resposta completa (com token, usuário, etc.)
  } catch (error: any) {
    throw error.response?.data?.message || error.message || 'Erro ao fazer login.';
  }
};

// Função para fazer logout.
export const logoutUser = () => {
    // Simplesmente removemos o token do localStorage.
    localStorage.removeItem('authToken');
    // Você também precisará limpar o estado global da sua aplicação aqui.
};

// Função para buscar o perfil (exemplo de chamada protegida).
export const getUserProfile = async () => {
    try {
        // Fazemos um GET para /auth/profile.
        // O interceptor do apiService cuidará de adicionar o token automaticamente!
        const response = await api.get('/auth/profile');
        return response.data;
    } catch (error: any) {
         // Se der erro (ex: 401 Unauthorized se o token for inválido/expirado),
         // podemos tratar aqui, talvez fazendo logout.
         if (error.response?.status === 401) {
             logoutUser();
         }
        throw error.response?.data?.message || error.message || 'Erro ao buscar perfil.';
    }
}

// Função para verificar se há um token (útil para saber se deve tentar manter logado).
export const hasAuthToken = (): string | null => {
    return localStorage.getItem('authToken');
}