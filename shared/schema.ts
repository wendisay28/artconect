import { Timestamp } from 'firebase/firestore';

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
  availability?: any; //  Maintaining flexibility for now; could be improved with a specific type.
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

// Chats
export interface Chat {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: Timestamp;
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