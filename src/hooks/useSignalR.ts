// src/hooks/useSignalR.ts
import { useEffect, useRef } from 'react';
import * as signalR from "@microsoft/signalr";
import { useAuth } from '@/contexts/AuthContext';

type ConfigureConnectionCallback = (connection: signalR.HubConnection) => void;

export const useSignalR = (hubPath: string, configureConnection: ConfigureConnectionCallback, enabled: boolean = true) => {
    const { token } = useAuth();
    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const configureConnectionRef = useRef(configureConnection);

    useEffect(() => {
        configureConnectionRef.current = configureConnection;
    }, [configureConnection]);

    useEffect(() => {
        if (!enabled || !token) {
            if (connectionRef.current && connectionRef.current.state === signalR.HubConnectionState.Connected) {
                console.log(`SignalR: Conexão existente encontrada para ${hubPath}, parando devido a 'enabled' ou 'token' inválido.`);
                connectionRef.current.stop().catch(err => console.error("SignalR: Erro ao parar conexão existente:", err));
            }
            return;
        }

        // Assume que VITE_APP_BASE_API_URL é algo como "https://localhost:7250" (sem /api)
        // Se VITE_API_BASE_URL inclui /api, você precisa de uma URL base diferente para SignalR
        // ou construir a URL do Hub de forma diferente.

        // Opção 1: Se hubPath já é o caminho completo (ex: "/notificationHub")
        // e você tem uma URL base do domínio.
        const backendDomain = import.meta.env.VITE_BACKEND_DOMAIN || 'https://localhost:7250'; // Ex: https://localhost:7250
        const fullHubUrl = `${backendDomain}${hubPath}`; // Ex: https://localhost:7250/notificationHub

        // Opção 2: Se você quer usar VITE_API_BASE_URL mas ele tem /api e você não quer /api para o hub
        // let fullHubUrl = (import.meta.env.VITE_API_BASE_URL || 'https://localhost:7250/api').replace('/api', '') + hubPath;


        console.log(`SignalR: Tentando conectar a: ${fullHubUrl}`); // VERIFIQUE ESTA URL NO CONSOLE

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(fullHubUrl, {
                accessTokenFactory: () => token as string
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        connectionRef.current = newConnection;

        if (configureConnectionRef.current) {
            configureConnectionRef.current(newConnection);
        }

        newConnection.start()
            .then(() => console.log(`SignalR: Conectado a ${fullHubUrl}`))
            .catch(err => {
                console.error(`SignalR: Falha na conexão com ${fullHubUrl}: `, err);
                // Adicione um log mais detalhado do erro, se disponível
                if (err && err.message) {
                    console.error(`SignalR: Mensagem de erro: ${err.message}`);
                }
                if (err && err.statusCode) { // Alguns erros de negociação podem ter statusCode
                    console.error(`SignalR: StatusCode do erro: ${err.statusCode}`);
                }
            });

        return () => {
            if (newConnection) {
                console.log(`SignalR: Parando conexão com ${fullHubUrl}`);
                newConnection.stop()
                    .then(() => console.log(`SignalR: Desconectado de ${fullHubUrl}`))
                    .catch(err => console.error(`SignalR: Erro ao parar conexão com ${fullHubUrl}: `, err));
            }
        };
    }, [hubPath, token, enabled]);

    return connectionRef.current;
};