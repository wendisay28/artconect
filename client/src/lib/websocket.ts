
import { useEffect, useState, useRef, useCallback } from 'react';

export interface ChatMessage {
  type: 'chat_message';
  payload: {
    chatId: number;
    senderId: number;
    content: string;
    timestamp: number;
  };
}

export interface UserStatusUpdate {
  type: 'user_status';
  payload: {
    userId: number;
    status: 'online' | 'offline';
  };
}

export interface ErrorMessage {
  type: 'error';
  payload: {
    message: string;
  };
}

export type WebSocketMessage = ChatMessage | UserStatusUpdate | ErrorMessage;
export type ConnectionStatus = 'connecting' | 'open' | 'closed' | 'error';

let websocketInstance: ReturnType<typeof useWebSocket> | null = null;

export function getWebSocketInstance() {
  if (!websocketInstance) {
    throw new Error('WebSocket instance not initialized');
  }
  return websocketInstance;
}

export function initializeWebSocket() {
  if (!websocketInstance) {
    websocketInstance = {} as ReturnType<typeof useWebSocket>;
  }
  return websocketInstance;
}

export function useWebSocket() {
  const [status, setStatus] = useState<ConnectionStatus>('closed');
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const socket = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (socket.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    if (socket.current?.readyState === WebSocket.CONNECTING) {
      console.log('WebSocket already connecting');
      return;
    }

    setStatus('connecting');

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      console.log('Connecting to WebSocket URL:', wsUrl);

      socket.current = new WebSocket(wsUrl);

      socket.current.onopen = () => {
        console.log('WebSocket connected successfully');
        setStatus('open');
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
        }
      };

      socket.current.onclose = () => {
        console.log('WebSocket connection closed');
        setStatus('closed');
        // Intento de reconexión después de 3 segundos
        reconnectTimeout.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 3000);
      };

      socket.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setStatus('error');
      };

      socket.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setMessages(prev => [...prev, message]);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setStatus('error');
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    if (socket.current) {
      socket.current.close();
      socket.current = null;
    }
    setStatus('closed');
  }, []);

  const send = useCallback((message: WebSocketMessage) => {
    if (socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected. Current status:', status);
    }
  }, [status]);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    status,
    messages,
    connect,
    disconnect,
    send
  };
}
