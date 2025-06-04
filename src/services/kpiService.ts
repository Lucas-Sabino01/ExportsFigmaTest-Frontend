/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/kpiService.ts (EXEMPLO - você precisará criar este arquivo e adaptar)
import { hasAuthToken } from './authService'; // Supondo que você tenha uma forma de pegar o token

const API_BASE_URL = 'https://localhost:7250/api'; // Sua URL base da API

export const getKpiAnswers = async (kpiId: number, day: number): Promise<Record<string, any>> => {
    const token = hasAuthToken(); // Função para pegar o token atual
    const response = await fetch(`${API_BASE_URL}/KpiAnswers/${kpiId}/${day}`, { // Ajuste o endpoint
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        if (response.status === 404) return {}; // Sem respostas ainda, retorna objeto vazio
        throw new Error('Falha ao buscar respostas do KPI');
    }
    try {
        return await response.json();
    } catch (error) {
        console.error('Erro ao converter resposta para JSON:', error);
        return {}; // Se a resposta for vazia ou não JSON, retorna objeto vazio
    }
};