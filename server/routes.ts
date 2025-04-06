import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
// Removed import { storage } from "./storage";
import { setupWebSocketServer } from "./websocket";
import { z } from "zod";
// Removed Zod schemas that were used only with storage

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Setup WebSocket server for real-time chat
  // This might need to be adjusted or moved depending on how chat data is handled now
  setupWebSocketServer(httpServer);

  // API Routes (Most are removed as data fetching moves to client)

  // === Kept Routes (Potentially) ===
  // These routes might be needed if they handle logic beyond simple data fetching
  // or if certain operations must remain server-side (e.g., complex validation, specific auth flows)

  // Example: User Profile - Might be kept if server-side logic is needed (e.g., merging data)
  // app.get('/api/users/profile', async (req: Request, res: Response) => {
  //   try {
  //     // Logic to get user profile (e.g., from Firebase Admin SDK if needed)
  //     res.json({ message: "User profile endpoint - implement with Firebase Admin if needed" });
  //   } catch (error) {
  //     console.error('Error en /api/users/profile:', error);
  //     res.status(500).json({ message: 'Error fetching user profile' });
  //   }
  // });
  
  // Example: Creating Chat - Might involve server logic
  // app.post('/api/chats', async (req: Request, res: Response) => {
  //   try {
  //     // Logic to create a chat session
  //     res.status(201).json({ message: "Chat created endpoint - implement if needed" });
  //   } catch (error) {
  //     res.status(500).json({ message: 'Error creating chat' });
  //   }
  // });

  // === Removed Routes (Examples) ===
  // Routes for fetching lists (users, artists, events, products, blog posts, favorites)
  // Routes for fetching specific items (artist/:id, event/:id)
  // Routes for creating/updating/deleting items that can be done via client-side Firebase SDK
  // Routes for search (can be implemented client-side with Firestore queries)

  // Catch-all for undefined API routes
  app.all('/api/*', (req: Request, res: Response) => {
    res.status(404).json({ message: `API route not found: ${req.method} ${req.path}` });
  });

  return httpServer;
}
