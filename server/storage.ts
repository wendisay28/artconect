import { Artist, Service, Event, User, Favorite, Chat, Message, Product, ServiceRequest } from "@shared/schema";
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { db } from './db';
import { Timestamp } from 'firebase-admin/firestore';

// Initialize Firebase (replace with your config)
const firebaseConfig = {
  // Your Firebase config here
};
const app = initializeApp(firebaseConfig);
const dbFirebase = getFirestore(app); // Keep this for potential future use

export class Storage {
  // Users
  async getAllUsers(): Promise<User[]> {
    const snapshot = await db.collection('users').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  }

  async getUser(id: string): Promise<User | undefined> {
    const doc = await db.collection('users').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as User : undefined;
  }

  async getUserByFirebaseUid(uid: string): Promise<User | undefined> {
    const snapshot = await db.collection('users').where('firebaseUid', '==', uid).get();
    return snapshot.empty ? undefined : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as User;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const docRef = await db.collection('users').add({
      ...userData,
      createdAt: Timestamp.now()
    });
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as User;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const docRef = db.collection('users').doc(id);
    await docRef.update(userData);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as User;
  }

  async deleteUser(id: string): Promise<void> {
    await db.collection('users').doc(id).delete();
  }

  // Artists
  async getAllArtists(): Promise<Artist[]> {
    const snapshot = await db.collection('artists').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Artist));
  }

  async getArtist(id: string): Promise<Artist | undefined> {
    const doc = await db.collection('artists').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as Artist : undefined;
  }

  async createArtist(artistData: Omit<Artist, 'id'>): Promise<Artist> {
    const docRef = await db.collection('artists').add(artistData);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as Artist;
  }
  async getRecommendedArtists(lat?: number, lng?: number): Promise<any[]> { 
    return [
      { id: 1, name: "Laura Restrepo", role: "Fotógrafa", minPrice: 200000, photoURL: "https://randomuser.me/api/portraits/women/22.jpg", rating: 4.8 },
      { id: 2, name: "Carlos Ruiz", role: "Músico", minPrice: 150000, photoURL: "https://randomuser.me/api/portraits/men/32.jpg", rating: 4.9 },
      { id: 3, name: "María Jiménez", role: "Pintora", minPrice: 300000, photoURL: "https://randomuser.me/api/portraits/women/45.jpg", rating: 4.7 },
      { id: 4, name: "Santiago López", role: "Diseñador gráfico", minPrice: 180000, photoURL: "https://randomuser.me/api/portraits/men/67.jpg", rating: 4.5 }
    ];
  }
  async getArtistsForExplorer(lat?: number, lng?: number): Promise<any[]> { return []; }
  async getArtistServices(artistId: number): Promise<Service[]> { return []; }
  async getArtistReviews(artistId: number): Promise<any[]> { return []; }


  // Events
  async getAllEvents(): Promise<Event[]> {
    const snapshot = await db.collection('events').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const doc = await db.collection('events').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as Event : undefined;
  }

  async createEvent(eventData: Omit<Event, 'id' | 'createdAt'>): Promise<Event> {
    const docRef = await db.collection('events').add({
      ...eventData,
      createdAt: Timestamp.now()
    });
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as Event;
  }
  async getFeaturedEvents(): Promise<any[]> { return []; }
  async getNearbyEvents(lat?: number, lng?: number): Promise<any[]> { return []; }
  async getEventsForExplorer(lat?: number, lng?: number): Promise<any[]> { return []; }
  async getEventAttendees(eventId: number): Promise<any[]> { return []; }

  // Favorites
  async getFavorites(userId: string): Promise<Favorite[]> {
    const snapshot = await db.collection('favorites')
      .where('userId', '==', userId)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Favorite));
  }

  async createFavorite(favoriteData: Omit<Favorite, 'id' | 'createdAt'>): Promise<Favorite> {
    const docRef = await db.collection('favorites').add({
      ...favoriteData,
      createdAt: Timestamp.now()
    });
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as Favorite;
  }

  async removeFavorite(id: string): Promise<void> {
    await db.collection('favorites').doc(id).delete();
  }
  async getFavoriteArtists(userId: number): Promise<any[]> { return []; }
  async getFavoriteEvents(userId: number): Promise<any[]> { return []; }
  async removeFavoriteArtist(userId: number, artistId: number): Promise<void> { return; }
  async removeFavoriteEvent(userId: number, eventId: number): Promise<void> { return; }


  // Chats - Retaining mock data functionality for now
  async getUserChats(userId: number): Promise<any[]> { return []; }
  async getChat(id: number): Promise<any | undefined> { return undefined; }
  async createChat(user1Id: number, user2Id: number): Promise<any> { return {}; }

  // Messages
  async getMessages(chatId: string): Promise<Message[]> {
    const snapshot = await db.collection('messages')
      .where('chatId', '==', chatId)
      .orderBy('createdAt', 'asc')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
  }

  async createMessage(messageData: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
    const docRef = await db.collection('messages').add({
      ...messageData,
      createdAt: Timestamp.now()
    });
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as Message;
  }
  async getChatMessages(chatId: number): Promise<Message[]> { return []; }
  async createMessage(messageData: InsertMessage): Promise<Message> { return {} as Message; }

  // Products - Retaining mock data functionality for now
  async getAllProducts(): Promise<any[]> { return []; }
  async createProduct(productData: InsertProduct): Promise<Product> { return {} as Product; }

  // Service Requests - Retaining mock data functionality for now
  async createServiceRequest(requestData: InsertServiceRequest): Promise<ServiceRequest> { return {} as ServiceRequest; }

  // Search - Retaining mock data functionality for now
  async searchArtists(query?: string, lat?: number, lng?: number, filters?: any): Promise<any[]> { return []; }
  async searchEvents(query?: string, lat?: number, lng?: number, filters?: any): Promise<any[]> { return []; }

  // Blog - Retaining mock data functionality for now
  async getBlogPosts(): Promise<any[]> { return []; }
}

export const storage = new Storage();