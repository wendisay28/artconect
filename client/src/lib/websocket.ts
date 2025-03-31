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

  // Initialize WebSocket connection with better error handling
  const connect = useCallback(() => {
    // No conectar si ya está abierta la conexión
    if (socket.current) {
      // Verificar si el socket ya está conectado o en proceso de conexión
      if (socket.current.readyState === WebSocket.OPEN) {
        console.log('WebSocket already connected');
        return;
      } else if (socket.current.readyState === WebSocket.CONNECTING) {
        console.log('WebSocket already connecting');
        return;
      }
    }

    setStatus('connecting');
    
    // Create WebSocket with correct protocol and host
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.hostname;
    const port = 5000; // Use the server port directly
    const wsUrl = `${protocol}//${host}:${port}/ws`;
    
    console.log("Connecting to WebSocket URL:", wsUrl);
    
    try {
      // Cerrar cualquier conexión existente antes de crear una nueva
      if (socket.current) {
        try {
          socket.current.close();
        } catch (e) {
          console.log('Error cerrando el socket previo:', e);
        }
      }

      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setStatus('open');
        console.log('WebSocket connection established successfully');
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketMessage;
          console.log('WebSocket message received:', data.type);
          setMessages(prev => [...prev, data]);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      ws.onclose = (event) => {
        setStatus('closed');
        console.log(`WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason || 'No reason provided'}`);
        
        // Solo intentamos reconectar si no fue un cierre intencional (código 1000)
        if (event.code !== 1000) {
          // Attempt to reconnect after 3 seconds
          console.log('Attempting to reconnect in 3 seconds...');
          setTimeout(() => {
            connect();
          }, 3000);
        }
      };
      
      ws.onerror = (error) => {
        setStatus('error');
        console.error('WebSocket error occurred:', error);
        
        // No hacemos nada aquí, ya que onclose se llamará automáticamente después de un error
      };
      
      socket.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setStatus('error');
      
      // Intentar reconectar después de un error de creación
      setTimeout(() => {
        connect();
      }, 5000);
    }
  }, []);

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