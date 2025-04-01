
import { Timestamp } from 'firebase/firestore';
import { z } from 'zod';

// Validation Schemas
export const insertUserSchema = z.object({
  firebaseUid: z.string(),
  username: z.string().optional(),
  email: z.string().email(),
  displayName: z.string(),
  photoURL: z.string().optional(),
  bio: z.string().optional(),
  role: z.string(),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  skills: z.array(z.string()).optional()
});

export const insertArtistSchema = z.object({
  userId: z.string(),
  category: z.string(),
  subcategory: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  priceUnit: z.string().optional(),
  gallery: z.array(z.string()).optional()
});

export const insertEventSchema = z.object({
  creatorId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  eventType: z.string(),
  date: z.any(),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  virtualLink: z.string().optional(),
  price: z.number().optional(),
  isFree: z.boolean(),
  image: z.string().optional()
});

export const insertFavoriteSchema = z.object({
  userId: z.string(),
  itemId: z.string(),
  type: z.enum(['artist', 'event'])
});

export const insertServiceSchema = z.object({
  artistId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  unit: z.string().optional()
});

export const insertMessageSchema = z.object({
  chatId: z.string(),
  senderId: z.string(),
  content: z.string(),
  read: z.boolean()
});

export const insertProductSchema = z.object({
  artistId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  image: z.string().optional()
});

export const insertServiceRequestSchema = z.object({
  clientId: z.string(),
  category: z.string(),
  subcategory: z.string().optional(),
  description: z.string(),
  budget: z.number().optional(),
  date: z.any().optional(),
  location: z.string().optional(),
  status: z.string()
});

// Users
export interface User {
  id: string;
  firebaseUid: string;
  username: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  role?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  skills?: string[];
  createdAt: Timestamp;
}

// Events
export interface Event {
  id: string;
  creatorId: string;
  name: string;
  description?: string;
  eventType: string;
  date: Timestamp;
  location?: string;
  latitude?: number;
  longitude?: number;
  virtualLink?: string;
  price?: number;
  isFree: boolean;
  image?: string;
  createdAt: Timestamp;
}

// Favorites
export interface Favorite {
  id: string;
  userId: string;
  itemId: string;
  type: 'artist' | 'event';
  createdAt: Timestamp;
}

// Artists
export interface Artist {
  id: string;
  userId: string;
  category: string;
  subcategory?: string;
  rating?: number;
  reviewCount?: number;
  minPrice?: number;
  maxPrice?: number;
  priceUnit?: string;
  gallery?: string[];
  availability?: any;
}

// Services
export interface Service {
  id: string;
  artistId: string;
  name: string;
  description?: string;
  price: number;
  unit?: string;
}

// Messages
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: Timestamp;
  read: boolean;
}

// Chats
export interface Chat {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: Timestamp;
}

// Products
export interface Product {
  id: string;
  artistId: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  createdAt: Timestamp;
}

// Service Requests
export interface ServiceRequest {
  id: string;
  clientId: string;
  category: string;
  subcategory?: string;
  description: string;
  budget?: number;
  date?: Timestamp;
  location?: string;
  status: string;
  createdAt: Timestamp;
}
