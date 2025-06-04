// src/services/apiService.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7250/api'; // <--- GARANTA QUE A PORTA 7250 SEJA USADA!

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    console.log("ApiService: Interceptor EXECUTADO para:", config.url); // <-- LOG 1

    const token = localStorage.getItem('authToken');
    console.log("ApiService: Token encontrado no localStorage?", token ? `Sim (inicia com ${token.substring(0, 10)}...)` : 'Não'); // <-- LOG 2

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("ApiService: Header Authorization ADICIONADO!"); // <-- LOG 3
    } else {
      console.log("ApiService: Header Authorization NÃO adicionado (sem token)."); // <-- LOG 4
    }

    return config;
  },
  (error) => {
    console.error("ApiService: ERRO no interceptor:", error); // <-- LOG 5
    return Promise.reject(error);
  }
);

export default api;