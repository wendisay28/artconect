import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { storage } from './storage';

interface ChatMessage {
  type: 'chat_message';
  payload: {
    chatId: number;
    senderId: number;
    content: string;
    timestamp: number;
  };
}

interface UserStatusUpdate {
  type: 'user_status';
  payload: {
    userId: number;
    status: 'online' | 'offline';
  };
}

interface ErrorMessage {
  type: 'error';
  payload: {
    message: string;
  };
}

type WebSocketMessage = ChatMessage | UserStatusUpdate | ErrorMessage;

const clients = new Map<string, WebSocket>();
const userSockets = new Map<number, string[]>();

export function setupWebSocketServer(httpServer: Server) {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  console.log('WebSocket server initialized on path: /ws');
  
  wss.on('connection', (ws: WebSocket) => {
    const clientId = Math.random().toString(36).substring(2, 15);
    clients.set(clientId, ws);
    
    console.log(`WebSocket client connected: ${clientId}`);
    
    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message) as WebSocketMessage;
        
        switch (data.type) {
          case 'chat_message':
            await handleChatMessage(data, clientId);
            break;
          case 'user_status':
            handleUserStatus(data, clientId);
            break;
          default:
            ws.send(JSON.stringify({
              type: 'error',
              payload: { message: 'Unknown message type' }
            }));
        }
      } catch (error) {
        console.error('Error processing message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          payload: { message: 'Failed to process message' }
        }));
      }
    });
    
    ws.on('close', () => {
      // Clean up when client disconnects
      clients.delete(clientId);
      
      // Find and remove client from userSockets
      for (const [userId, socketIds] of userSockets.entries()) {
        const index = socketIds.indexOf(clientId);
        if (index !== -1) {
          socketIds.splice(index, 1);
          if (socketIds.length === 0) {
            userSockets.delete(userId);
            broadcastUserStatus(userId, 'offline');
          }
        }
      }
      
      console.log(`WebSocket client disconnected: ${clientId}`);
    });
    
    // Send initial connection confirmation
    ws.send(JSON.stringify({
      type: 'connection_established',
      payload: { clientId }
    }));
  });
  
  async function handleChatMessage(data: ChatMessage, senderId: string) {
    try {
      // Save message to database
      const newMessage = await storage.createMessage({
        chatId: data.payload.chatId,
        senderId: data.payload.senderId,
        content: data.payload.content,
        read: false
      });
      
      // Get the chat to find the other user
      const chat = await storage.getChat(data.payload.chatId);
      if (!chat) return;
      
      const otherUserId = chat.user1Id === data.payload.senderId ? chat.user2Id : chat.user1Id;
      
      // Send to all connected clients of the other user
      const otherUserSockets = userSockets.get(otherUserId) || [];
      
      otherUserSockets.forEach(socketId => {
        const client = clients.get(socketId);
        if (client && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'new_message',
            payload: {
              message: newMessage,
              chatId: data.payload.chatId
            }
          }));
        }
      });
    } catch (error) {
      console.error('Error handling chat message:', error);
    }
  }
  
  function handleUserStatus(data: UserStatusUpdate, clientId: string) {
    const { userId, status } = data.payload;
    
    if (status === 'online') {
      // Add this socket to the user's list
      const userSocketList = userSockets.get(userId) || [];
      if (!userSocketList.includes(clientId)) {
        userSocketList.push(clientId);
        userSockets.set(userId, userSocketList);
      }
      
      // Broadcast user status if this is the first socket
      if (userSocketList.length === 1) {
        broadcastUserStatus(userId, 'online');
      }
    } else {
      // Remove this socket from the user's list
      const userSocketList = userSockets.get(userId) || [];
      const index = userSocketList.indexOf(clientId);
      
      if (index !== -1) {
        userSocketList.splice(index, 1);
        
        if (userSocketList.length === 0) {
          userSockets.delete(userId);
          broadcastUserStatus(userId, 'offline');
        } else {
          userSockets.set(userId, userSocketList);
        }
      }
    }
  }
  
  function broadcastUserStatus(userId: number, status: 'online' | 'offline') {
    // Get all users who might be interested in this status update
    // For simplicity, we'll broadcast to all connected clients
    // In a real app, you'd only send to users who have chats with this user
    
    for (const client of clients.values()) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'user_status_update',
          payload: {
            userId,
            status
          }
        }));
      }
    }
  }
  
  return wss;
}