import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';
import { FirebaseStorage } from './storage';

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

export function setupWebSocketServer(httpServer: Server, storage: FirebaseStorage) {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Map to store user connections
  const userConnections = new Map<number, Set<WebSocket>>();
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket connection established');
    let userId: number | null = null;
    
    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message) as WebSocketMessage;
        
        switch (data.type) {
          case 'chat_message':
            await handleChatMessage(data, ws);
            break;
            
          case 'user_status':
            userId = data.payload.userId;
            handleUserStatus(data, ws);
            break;
            
          default:
            ws.send(JSON.stringify({
              type: 'error',
              payload: { message: 'Unknown message type' }
            }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          payload: { message: 'Invalid message format' }
        }));
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket connection closed');
      if (userId) {
        // Remove this connection from the user's connections
        const connections = userConnections.get(userId);
        if (connections) {
          connections.delete(ws);
          if (connections.size === 0) {
            userConnections.delete(userId);
            
            // Broadcast offline status
            broadcastUserStatus(userId, 'offline');
          }
        }
      }
    });
    
    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
  
  async function handleChatMessage(data: ChatMessage, ws: WebSocket) {
    try {
      // Store message in database
      const newMessage = await storage.createMessage({
        chatId: data.payload.chatId,
        senderId: data.payload.senderId,
        content: data.payload.content,
        read: false
      });
      
      // Get chat details to find recipient
      const chat = await storage.getChat(data.payload.chatId);
      if (!chat) {
        throw new Error('Chat not found');
      }
      
      // Find recipient's user ID
      const recipientId = 
        chat.user1Id === data.payload.senderId ? chat.user2Id : chat.user1Id;
      
      // Send message to all connections of the recipient
      const recipientConnections = userConnections.get(recipientId);
      if (recipientConnections) {
        recipientConnections.forEach((connection) => {
          if (connection.readyState === WebSocket.OPEN) {
            connection.send(JSON.stringify({
              type: 'chat_message',
              payload: {
                id: newMessage.id,
                chatId: newMessage.chatId,
                senderId: newMessage.senderId,
                content: newMessage.content,
                createdAt: newMessage.createdAt,
                read: newMessage.read
              }
            }));
          }
        });
      }
      
      // Send confirmation to sender
      ws.send(JSON.stringify({
        type: 'message_sent',
        payload: {
          id: newMessage.id,
          chatId: newMessage.chatId,
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error) {
      console.error('Error handling chat message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        payload: { message: 'Failed to send message' }
      }));
    }
  }
  
  function handleUserStatus(data: UserStatusUpdate, ws: WebSocket) {
    const userId = data.payload.userId;
    const status = data.payload.status;
    
    // Add this connection to the user's connections
    if (!userConnections.has(userId)) {
      userConnections.set(userId, new Set());
    }
    userConnections.get(userId)!.add(ws);
    
    // Broadcast online status
    broadcastUserStatus(userId, status);
  }
  
  function broadcastUserStatus(userId: number, status: 'online' | 'offline') {
    // Broadcast status to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'user_status',
          payload: {
            userId,
            status
          }
        }));
      }
    });
  }
  
  return wss;
}
