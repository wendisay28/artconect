import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { FirebaseStorage } from "./storage";
import { auth } from "../client/src/lib/firebase";
import { z } from "zod";
import { insertUserSchema, insertArtistSchema, insertEventSchema, insertFavoriteSchema, insertServiceRequestSchema, insertServiceSchema, insertMessageSchema, insertProductSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize the Firebase storage
  const storage = new FirebaseStorage();
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Setup WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // WebSocket connection handler
  wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        if (data.type === 'chat_message') {
          // Store message in database
          const newMessage = await storage.createMessage(data.payload);
          
          // Broadcast to all connected clients
          wss.clients.forEach(client => {
            if (client !== ws && client.readyState === ws.OPEN) {
              client.send(JSON.stringify({
                type: 'chat_message',
                payload: newMessage
              }));
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
  });

  // API Routes
  
  // Users
  app.get('/api/users', async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users' });
    }
  });
  
  app.get('/api/users/profile', async (req: Request, res: Response) => {
    try {
      // Get user from Firebase Auth
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const decodedToken = await auth.verifyIdToken(token);
      const user = await storage.getUserByFirebaseUid(decodedToken.uid);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user profile' });
    }
  });
  
  app.post('/api/users', async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const newUser = await storage.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid user data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error creating user' });
    }
  });
  
  app.patch('/api/users/profile', async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const decodedToken = await auth.verifyIdToken(token);
      const updatedUser = await storage.updateUser(decodedToken.uid, req.body);
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: 'Error updating user profile' });
    }
  });
  
  app.delete('/api/users', async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const decodedToken = await auth.verifyIdToken(token);
      await storage.deleteUser(decodedToken.uid);
      
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting user' });
    }
  });
  
  // Artists
  app.get('/api/artists', async (req: Request, res: Response) => {
    try {
      const artists = await storage.getAllArtists();
      res.json(artists);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching artists' });
    }
  });
  
  app.get('/api/artists/:id', async (req: Request, res: Response) => {
    try {
      const artist = await storage.getArtist(parseInt(req.params.id));
      
      if (!artist) {
        return res.status(404).json({ message: 'Artist not found' });
      }
      
      res.json(artist);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching artist' });
    }
  });
  
  app.get('/api/artists/recommended', async (req: Request, res: Response) => {
    try {
      const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
      const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;
      
      const artists = await storage.getRecommendedArtists(lat, lng);
      res.json(artists);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching recommended artists' });
    }
  });
  
  app.get('/api/artists/explore', async (req: Request, res: Response) => {
    try {
      const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
      const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;
      
      const artists = await storage.getArtistsForExplorer(lat, lng);
      res.json(artists);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching artists for explorer' });
    }
  });
  
  app.post('/api/artists', async (req: Request, res: Response) => {
    try {
      const artistData = insertArtistSchema.parse(req.body);
      const newArtist = await storage.createArtist(artistData);
      res.status(201).json(newArtist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid artist data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error creating artist' });
    }
  });
  
  app.get('/api/artists/:id/services', async (req: Request, res: Response) => {
    try {
      const artistId = parseInt(req.params.id);
      const services = await storage.getArtistServices(artistId);
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching artist services' });
    }
  });
  
  app.get('/api/artists/:id/reviews', async (req: Request, res: Response) => {
    try {
      const artistId = parseInt(req.params.id);
      const reviews = await storage.getArtistReviews(artistId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching artist reviews' });
    }
  });
  
  // Services
  app.post('/api/services', async (req: Request, res: Response) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const newService = await storage.createService(serviceData);
      res.status(201).json(newService);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid service data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error creating service' });
    }
  });
  
  // Events
  app.get('/api/events', async (req: Request, res: Response) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching events' });
    }
  });
  
  app.get('/api/events/featured', async (req: Request, res: Response) => {
    try {
      const events = await storage.getFeaturedEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching featured events' });
    }
  });
  
  app.get('/api/events/nearby', async (req: Request, res: Response) => {
    try {
      const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
      const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;
      
      const events = await storage.getNearbyEvents(lat, lng);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching nearby events' });
    }
  });
  
  app.get('/api/events/explore', async (req: Request, res: Response) => {
    try {
      const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
      const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;
      
      const events = await storage.getEventsForExplorer(lat, lng);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching events for explorer' });
    }
  });
  
  app.get('/api/events/:id', async (req: Request, res: Response) => {
    try {
      const event = await storage.getEvent(parseInt(req.params.id));
      
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching event' });
    }
  });
  
  app.post('/api/events', async (req: Request, res: Response) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const newEvent = await storage.createEvent(eventData);
      res.status(201).json(newEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid event data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error creating event' });
    }
  });
  
  app.get('/api/events/:id/attendees', async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      const attendees = await storage.getEventAttendees(eventId);
      res.json(attendees);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching event attendees' });
    }
  });
  
  // Favorites
  app.get('/api/favorites/artists', async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const decodedToken = await auth.verifyIdToken(token);
      const user = await storage.getUserByFirebaseUid(decodedToken.uid);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const favorites = await storage.getFavoriteArtists(user.id);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching favorite artists' });
    }
  });
  
  app.get('/api/favorites/events', async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const decodedToken = await auth.verifyIdToken(token);
      const user = await storage.getUserByFirebaseUid(decodedToken.uid);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const favorites = await storage.getFavoriteEvents(user.id);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching favorite events' });
    }
  });
  
  app.post('/api/favorites', async (req: Request, res: Response) => {
    try {
      const favoriteData = insertFavoriteSchema.parse(req.body);
      const newFavorite = await storage.createFavorite(favoriteData);
      res.status(201).json(newFavorite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid favorite data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error creating favorite' });
    }
  });
  
  app.delete('/api/favorites/artist/:id', async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const decodedToken = await auth.verifyIdToken(token);
      const user = await storage.getUserByFirebaseUid(decodedToken.uid);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      await storage.removeFavoriteArtist(user.id, parseInt(req.params.id));
      res.json({ message: 'Artist removed from favorites' });
    } catch (error) {
      res.status(500).json({ message: 'Error removing artist from favorites' });
    }
  });
  
  app.delete('/api/favorites/event/:id', async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const decodedToken = await auth.verifyIdToken(token);
      const user = await storage.getUserByFirebaseUid(decodedToken.uid);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      await storage.removeFavoriteEvent(user.id, parseInt(req.params.id));
      res.json({ message: 'Event removed from favorites' });
    } catch (error) {
      res.status(500).json({ message: 'Error removing event from favorites' });
    }
  });
  
  // Chats
  app.get('/api/chats', async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const decodedToken = await auth.verifyIdToken(token);
      const user = await storage.getUserByFirebaseUid(decodedToken.uid);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const chats = await storage.getUserChats(user.id);
      res.json(chats);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching chats' });
    }
  });
  
  app.get('/api/chats/:id', async (req: Request, res: Response) => {
    try {
      const chat = await storage.getChat(parseInt(req.params.id));
      
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }
      
      res.json(chat);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching chat' });
    }
  });
  
  app.post('/api/chats', async (req: Request, res: Response) => {
    try {
      const { userId, artistId } = req.body;
      
      if (!userId || !artistId) {
        return res.status(400).json({ message: 'User ID and Artist ID are required' });
      }
      
      const artist = await storage.getArtist(artistId);
      if (!artist) {
        return res.status(404).json({ message: 'Artist not found' });
      }
      
      const newChat = await storage.createChat(parseInt(userId), artist.userId);
      res.status(201).json(newChat);
    } catch (error) {
      res.status(500).json({ message: 'Error creating chat' });
    }
  });
  
  app.get('/api/chats/:id/messages', async (req: Request, res: Response) => {
    try {
      const chatId = parseInt(req.params.id);
      const messages = await storage.getChatMessages(chatId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching chat messages' });
    }
  });
  
  app.post('/api/chats/:id/messages', async (req: Request, res: Response) => {
    try {
      const chatId = parseInt(req.params.id);
      const { senderId, content } = req.body;
      
      if (!senderId || !content) {
        return res.status(400).json({ message: 'Sender ID and content are required' });
      }
      
      const messageData = {
        chatId,
        senderId: parseInt(senderId),
        content,
        read: false
      };
      
      const newMessage = await storage.createMessage(messageData);
      res.status(201).json(newMessage);
    } catch (error) {
      res.status(500).json({ message: 'Error creating message' });
    }
  });
  
  // Products
  app.get('/api/products', async (req: Request, res: Response) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching products' });
    }
  });
  
  app.post('/api/products', async (req: Request, res: Response) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const newProduct = await storage.createProduct(productData);
      res.status(201).json(newProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid product data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error creating product' });
    }
  });
  
  // Service Requests
  app.post('/api/service-requests', async (req: Request, res: Response) => {
    try {
      const requestData = insertServiceRequestSchema.parse(req.body);
      const newRequest = await storage.createServiceRequest(requestData);
      res.status(201).json(newRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid request data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error creating service request' });
    }
  });
  
  // Search
  app.get('/api/search/artists', async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string | undefined;
      const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
      const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;
      const filters = req.query.filters ? JSON.parse(req.query.filters as string) : undefined;
      
      const artists = await storage.searchArtists(query, lat, lng, filters);
      res.json(artists);
    } catch (error) {
      res.status(500).json({ message: 'Error searching artists' });
    }
  });
  
  app.get('/api/search/events', async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string | undefined;
      const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
      const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;
      const filters = req.query.filters ? JSON.parse(req.query.filters as string) : undefined;
      
      const events = await storage.searchEvents(query, lat, lng, filters);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: 'Error searching events' });
    }
  });
  
  // Blog posts
  app.get('/api/blog/posts', async (req: Request, res: Response) => {
    try {
      const posts = await storage.getBlogPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching blog posts' });
    }
  });

  return httpServer;
}
