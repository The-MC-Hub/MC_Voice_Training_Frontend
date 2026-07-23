import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const getSocketUrl = () => {
  try {
    const url = new URL(API_URL);
    return `${url.protocol}//${url.host}/ws-chat`;
  } catch {
    return "http://localhost:5000/ws-chat";
  }
};

// Subscribes to /topic/notifications/{userId} and invokes onNotification for each push.
// No poll fallback — relies on STOMP's built-in reconnectDelay to recover from drops.
export const useNotificationSocket = (userId, token, onNotification) => {
  const clientRef = useRef(null);

  useEffect(() => {
    if (!userId || !token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(getSocketUrl()),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      client.subscribe(`/topic/notifications/${userId}`, (frame) => {
        if (frame.body) {
          try {
            onNotification(JSON.parse(frame.body));
          } catch {
            // malformed payload — ignore rather than crash the socket handler
          }
        }
      });
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [userId, token]);
};
