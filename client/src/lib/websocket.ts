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

// Type for WebSocket connection state
export type ConnectionStatus = 'connecting' | 'open' | 'closed' | 'error';

/**
 * Hook to create and manage a WebSocket connection
 */
export function useWebSocket() {
  const [status, setStatus] = useState<ConnectionStatus>('closed');
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const socket = useRef<WebSocket | null>(null);

  // Initialize WebSocket connection
  const connect = useCallback(() => {
    if (socket.current?.readyState === WebSocket.OPEN) return;

    setStatus('connecting');
    
    // Create WebSocket with correct protocol based on current connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      setStatus('open');
      console.log('WebSocket connection established');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebSocketMessage;
        setMessages(prev => [...prev, data]);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
    
    ws.onclose = () => {
      setStatus('closed');
      console.log('WebSocket connection closed');
      
      // Attempt to reconnect after 2 seconds
      setTimeout(() => {
        if (status !== 'closed') {
          connect();
        }
      }, 2000);
    };
    
    ws.onerror = (error) => {
      setStatus('error');
      console.error('WebSocket error:', error);
    };
    
    socket.current = ws;
  }, [status]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      socket.current.close();
    }
    setStatus('closed');
  }, []);

  // Send message through WebSocket
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  // Send a chat message
  const sendChatMessage = useCallback((chatId: number, senderId: number, content: string) => {
    const message: ChatMessage = {
      type: 'chat_message',
      payload: {
        chatId,
        senderId,
        content,
        timestamp: Date.now()
      }
    };
    return sendMessage(message);
  }, [sendMessage]);

  // Update user status
  const updateUserStatus = useCallback((userId: number, status: 'online' | 'offline') => {
    const message: UserStatusUpdate = {
      type: 'user_status',
      payload: {
        userId,
        status
      }
    };
    return sendMessage(message);
  }, [sendMessage]);

  // Reset messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Connect on component mount, disconnect on unmount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    status,
    messages,
    sendMessage,
    sendChatMessage,
    updateUserStatus,
    connect,
    disconnect,
    clearMessages
  };
}

// Create a singleton WebSocket instance that can be imported and used throughout the app
let websocketInstance: ReturnType<typeof useWebSocket> | null = null;

export function getWebSocketInstance() {
  if (!websocketInstance) {
    throw new Error('WebSocket instance not initialized. Call initializeWebSocket first.');
  }
  return websocketInstance;
}

export function initializeWebSocket() {
  if (!websocketInstance) {
    // This is just to satisfy TypeScript, in reality this will be initialized properly when used in a component
    websocketInstance = {} as ReturnType<typeof useWebSocket>;
  }
  return websocketInstance;
}