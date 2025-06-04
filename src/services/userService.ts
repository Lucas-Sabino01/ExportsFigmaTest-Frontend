// src/services/userService.ts (novo arquivo)
import  api  from './apiService'; // Sua instância do axios

export interface UserDto {
    id: number;
    name: string; // ou UserName, FullName, conforme seu backend
}

export const getUsers = async (): Promise<UserDto[]> => {
    try {
        const response = await api.get<UserDto[]>('/users'); // Ajuste o endpoint se necessário
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        return [];
    }
};