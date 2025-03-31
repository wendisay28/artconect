import { useEffect, useState, useRef, useCallback } from 'react';

// Define WebSocket message types
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

export function useWebSocket() {
  const [status, setStatus] = useState<ConnectionStatus>('closed');
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const socket = useRef<WebSocket | null>(null);

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

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const wsUrl = `${protocol}//${host}:5000/ws`;
    
    console.log('Connecting to WebSocket URL:', wsUrl);

    try {
      socket.current = new WebSocket(wsUrl);

      socket.current.onopen = () => {
        console.log('WebSocket connected');
        setStatus('open');
      };

      socket.current.onclose = () => {
        console.log('WebSocket disconnected');
        setStatus('closed');
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
    if (socket.current) {
      socket.current.close();
      socket.current = null;
    }
  }, []);

  const send = useCallback((message: WebSocketMessage) => {
    if (socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    status,
    messages,
    connect,
    disconnect,
    send
  };
}

// Singleton instance
let websocketInstance: ReturnType<typeof useWebSocket> | null = null;

export function getWebSocketInstance() {
  if (!websocketInstance) {
    throw new Error('WebSocket instance not initialized. Call initializeWebSocket first.');
  }
  return websocketInstance;
}

export function initializeWebSocket() {
  if (!websocketInstance) {
    websocketInstance = {} as ReturnType<typeof useWebSocket>;
  }
  return websocketInstance;
}