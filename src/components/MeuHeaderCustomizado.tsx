import React, { useState, useEffect, useCallback } from 'react';
import { BellIcon, CheckCheck } from 'lucide-react'; // Ícones

// Seus imports existentes
import { BryntumFullscreenButton } from './BryntumFullscreenButton'; 
import { BryntumThemeCombo } from './BryntumThemeCombo';
import UploadComponent from '../components/UploadComponent'; 

// Componentes Shadcn/ui
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
// import { toast } from "sonner"; // Para notificações toast em tempo real

// Nosso novo serviço e tipos
import { 
    fetchNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    Notification 
} from '@/services/notificationService'; // <<< AJUSTE O CAMINHO

import './MeuHeaderCustomizado.css'; // Seu CSS existente

// Hook para SignalR (coloque em um arquivo separado, ex: src/hooks/useSignalR.ts)
// Vou incluir o código do hook no final desta resposta para referência.
import { useSignalR } from '@/hooks/useSignalR'; // <<< AJUSTE O CAMINHO

interface MeuHeaderCustomizadoProps {
    title: string;
    projectId: number;
    onUploadSuccess: () => void;
    isAdmin: boolean;
    currentViewType: string;
}

const MeuHeaderCustomizado: React.FC<MeuHeaderCustomizadoProps> = ({
    title,
    projectId,
    onUploadSuccess,
    isAdmin,
    currentViewType
}) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

    const loadNotificationsAPI = useCallback(async (showLoadingSpinner = true) => {
        if (showLoadingSpinner) setIsLoadingNotifications(true);
        try {
            const response = await fetchNotifications({ pageNumber: 1, pageSize: 7 }); // Busca as 7 mais recentes
            setNotifications(response.items);
            setUnreadCount(response.unreadCount);
            console.log("Notificações carregadas do backend:", response);
        } catch (error) {
            console.error("Falha ao buscar notificações do backend:", error);
            // toast.error("Falha ao carregar notificações."); // Exemplo de feedback
        } finally {
            if (showLoadingSpinner) setIsLoadingNotifications(false);
        }
    }, []);

    useEffect(() => {
        loadNotificationsAPI(); // Carga inicial
    }, [loadNotificationsAPI]);

    // Configuração do SignalR para receber notificações em tempo real
    useSignalR(
    "/notificationHub", 
    (connection) => {
        connection.on("ReceiveNotification", (newNotification: Notification) => { // Notification é sua interface/tipo
            console.log("FRONTEND (MeuHeaderCustomizado): Nova notificação RECEBIDA via SignalR:", newNotification); // << ESTE LOG É CRUCIAL

            // Verifique se newNotification tem a estrutura esperada (id, message, isRead, createdAt, etc.)
            if (!newNotification || typeof newNotification.id === 'undefined' || typeof newNotification.message === 'undefined') {
                console.error("FRONTEND: Payload da notificação SignalR inválido ou incompleto:", newNotification);
                return;
            }

            // toast.info(`Nova: ${newNotification.message}`); // Descomente se tiver 'sonner' ou similar

            setNotifications(prev => {
                // Evitar duplicatas se a notificação já existir (improvável com novas, mas bom para robustez)
                const exists = prev.find(n => n.id === newNotification.id);
                if (exists) return prev;
                // Adiciona no topo e mantém a lista com um tamanho máximo
                const updatedNotifications = [newNotification, ...prev].slice(0, 10); 
                console.log("FRONTEND: Estado 'notifications' atualizado após SignalR:", updatedNotifications);
                return updatedNotifications;
            });

            // Só incrementa se a notificação recebida for para o usuário atual e não estiver lida
            // O backend já deve enviar apenas para o usuário correto.
            // A propriedade isRead no payload da notificação SignalR deve ser false.
            if (newNotification.isRead === false) { 
               setUnreadCount(prev => {
                   const newCount = prev + 1;
                   console.log("FRONTEND: Estado 'unreadCount' atualizado após SignalR para:", newCount);
                   return newCount;
               });
            }
        });
    },
    true // enabled
);


    const handleMarkAsRead = async (notificationId: number) => {
        const notification = notifications.find(n => n.id === notificationId);
        if (!notification || notification.isRead) return;

        // Atualização otimista
        setNotifications(prev => 
            prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));

        try {
            await markNotificationAsRead(notificationId);
        } catch (error) {
            console.error("Falha ao marcar notificação como lida (API):", error);
            // Reverter UI em caso de erro
            setNotifications(prev => 
               prev.map(n => n.id === notificationId ? { ...n, isRead: false } : n)
            );
            setUnreadCount(prev => prev + 1); // Reverte a contagem
            // toast.error("Erro ao marcar notificação como lida.");
        }
    };
    
    const handleMarkAllRead = async () => {
        if (unreadCount === 0) return;
        const previouslyUnreadCount = unreadCount;
        const originalNotifications = notifications.map(n => ({...n})); // Cópia profunda para rollback

        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        try {
            await markAllNotificationsAsRead();
        } catch (error) {
            console.error("Falha ao marcar todas como lidas (API):", error);
            setNotifications(originalNotifications);
            setUnreadCount(previouslyUnreadCount);
            // toast.error("Erro ao marcar todas as notificações como lidas.");
        }
    };
    
    const formatTimeAgo = (dateString: string) => {
        // ... (sua função formatTimeAgo) ...
        const date = new Date(dateString);
        const now = new Date();
        const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);

        if (diffSeconds < 60) return `${diffSeconds}s`;
        const diffMinutes = Math.round(diffSeconds / 60);
        if (diffMinutes < 60) return `${diffMinutes}m`;
        const diffHours = Math.round(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}h`;
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    };

    return (
        <header className="meu-header-customizado"> {/* Suas classes de header existentes */}
            <div className="header-left">
                 <img src="/Icon-Header.svg" alt="Valmet Logo" className="header-logo" />
                 <a href="/" className="header-title-link">{title}</a>
            </div>

            <div className="header-right">
                {isAdmin && (
                    <div className="header-upload-section">
                        <UploadComponent
                            projectId={projectId}
                            onUploadSuccess={onUploadSuccess}
                            currentViewType={currentViewType}
                        />
                    </div>
                )}

                <Popover open={isPanelOpen} onOpenChange={setIsPanelOpen}>
                    <PopoverTrigger asChild>
                        <Button 
                            variant="ghost" // Mantém o fundo transparente por padrão
                            size="icon"     // Tamanho adequado para um ícone
                            className="notification-icon-button relative text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700" // Classes para cor e hover
                        >
                            <BellIcon className="h-5 w-5" /> {/* Ícone em si */}
                            {unreadCount > 0 && (
                                <span className="notification-badge"> {/* Sua classe CSS para o badge */}
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 sm:w-96 p-0 notification-popover-content" align="end">
                        <div className="notification-popover-header"> {/* Use sua classe CSS */}
                            <h4>Notificações</h4>
                            {unreadCount > 0 && (
                                <Button variant="link" size="sm" onClick={handleMarkAllRead} className="button-link-sm">
                                    Marcar todas como lidas
                                </Button>
                            )}
                        </div>
                        <div className="notification-list">
                            {isLoadingNotifications && <p className="p-4 text-sm text-center">Carregando...</p>}
                            {!isLoadingNotifications && notifications.length === 0 && (
                                <p className="p-10 text-sm text-center">Nenhuma notificação.</p>
                            )}
                            {!isLoadingNotifications && notifications.map(notif => (
                                <div 
                                    key={notif.id} 
                                    className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                                >
                                    <div className="notification-content">
                                      <p className="notification-message">{notif.message}</p>
                                      <p className="notification-time">{formatTimeAgo(notif.createdAt)}</p>
                                    </div>
                                    {!notif.isRead && (
                                        <Button 
                                            variant="ghost" 
                                            size="icon" // Para um botão menor, apenas com ícone
                                            onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif.id); }} 
                                            className="notification-mark-read" // Use sua classe CSS
                                            title="Marcar como lida"
                                        >
                                            <CheckCheck size={16} />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <Separator /> {/* Separador do shadcn/ui */}
                        <div className="notification-popover-footer"> {/* Use sua classe CSS */}
                            <Button variant="link" size="sm" className="button-link-sm w-full">
                                Ver todas as notificações {/* TODO: Link para página */}
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
                
                <div className="header-theme-section">
                    <BryntumThemeCombo />
                </div>
                <div className="header-fullscreen-section">
                    <BryntumFullscreenButton />
                </div>
            </div>
        </header>
    );
};

export default MeuHeaderCustomizado;