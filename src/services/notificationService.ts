import apiClient from './apiService'; // Ou o caminho para sua configuração do Axios

// Interface para uma notificação (deve espelhar seu NotificationDto do backend)
export interface Notification {
    id: number;
    message: string;
    link?: string | null;
    isRead: boolean;
    createdAt: string; // string ISO da data
    notificationTypeKey: string;
    severity: string; // 'Information', 'Warning', 'Error', 'Critical', 'Success'
    emitterUserName?: string | null;
}

// Interface para a resposta da API de busca de notificações
export interface FetchNotificationsResponse {
    items: Notification[];
    unreadCount: number;
    totalItems: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

interface FetchNotificationsParams {
    pageNumber?: number;
    pageSize?: number;
    unreadOnly?: boolean;
    // Adicione outros filtros se necessário (ex: sortBy, sortDirection)
}

// Busca notificações do backend
export const fetchNotifications = async (params?: FetchNotificationsParams): Promise<FetchNotificationsResponse> => {
    try {
        const response = await apiClient.get<FetchNotificationsResponse>('/notifications', { params });
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar notificações:", error);
        throw error;
    }
};

// Marca uma notificação como lida
export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
    try {
        await apiClient.post(`/notifications/${notificationId}/mark-as-read`);
    } catch (error) {
        console.error(`Erro ao marcar notificação ${notificationId} como lida:`, error);
        throw error;
    }
};

// Marca todas as notificações como lidas
export const markAllNotificationsAsRead = async (): Promise<void> => {
    try {
        await apiClient.post('/notifications/mark-all-as-read');
    } catch (error) {
        console.error("Erro ao marcar todas as notificações como lidas:", error);
        throw error;
    }
};