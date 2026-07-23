import { useEffect, useRef, useCallback, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const buildSocketUrl = () => {
  const parts = BASE_URL.split('/');
  const origin = parts.slice(0, 3).join('/');
  return origin + '/ws-chat';
};

export function useAppSocket(userId, token, handlers) {
  const clientRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!userId || !token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(buildSocketUrl()),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setIsConnected(true);

        client.subscribe(`/topic/notifications/${userId}`, (frame) => {
          try {
            const notification = JSON.parse(frame.body);
            handlersRef.current?.onNotification?.(notification);
          } catch { /* ignore malformed */ }
        });

        client.subscribe(`/topic/chat/${userId}`, (frame) => {
          try {
            const message = JSON.parse(frame.body);
            handlersRef.current?.onChatMessage?.(message);
          } catch { /* ignore malformed */ }
        });
      },
      onDisconnect: () => setIsConnected(false),
      onStompError: () => setIsConnected(false),
      onWebSocketClose: () => setIsConnected(false),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      setIsConnected(false);
      client.deactivate();
    };
  }, [userId, token]);

  return { isConnected };
}
