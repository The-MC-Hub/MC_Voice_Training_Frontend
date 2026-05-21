import { useEffect, useRef, useState, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuthStore } from "../store/useAuthStore";



const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

const getSocketUrl = () => {
  try {
    const url = new URL(API_URL);
    return `${url.protocol}//${url.host}/ws-chat`;
  } catch (e) {
    return "http://localhost:8080/ws-chat";
  }
};

const SOCKET_URL = getSocketUrl();

export const useSocket = () => {
  const { token, user } = useAuthStore();
  const stompClientRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  
  const handlersRef = useRef({});

  useEffect(() => {
    if (!token || !user?.id) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setIsConnected(true);
      console.log("STOMP Socket connected");

      
      client.subscribe(`/topic/chat/${user.id}`, (frame) => {
        if (frame.body) {
          const message = JSON.parse(frame.body);
          const newMsgHandlers = handlersRef.current["new_message"];
          if (newMsgHandlers) {
            newMsgHandlers.forEach((h) => h(message));
          }
        }
      });
    };

    client.onStompError = (frame) => {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Additional details: " + frame.body);
    };

    client.onDisconnect = () => {
      setIsConnected(false);
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
      stompClientRef.current = null;
      setIsConnected(false);
    };
  }, [token, user]);

  const emit = useCallback((event, data) => {
    
    
  }, []);

  const on = useCallback((event, handler) => {
    if (!handlersRef.current[event]) {
      handlersRef.current[event] = [];
    }
    handlersRef.current[event].push(handler);
    return () => {
      handlersRef.current[event] = handlersRef.current[event].filter(
        (h) => h !== handler
      );
    };
  }, []);

  const off = useCallback((event, handler) => {
    if (!handlersRef.current[event]) return;
    handlersRef.current[event] = handlersRef.current[event].filter(
      (h) => h !== handler
    );
  }, []);

  const joinConversation = useCallback((conversationId) => {
    
    
  }, []);

  const leaveConversation = useCallback((conversationId) => {
    
  }, []);

  return {
    socket: stompClientRef.current,
    isConnected,
    emit,
    on,
    off,
    joinConversation,
    leaveConversation,
    userId: user?.id,
  };
};
