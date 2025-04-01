import { Artist, Service, Event, User, Favorite, Chat, Message, Product, ServiceRequest } from "@shared/schema";
import { getFirestore } from 'firebase-admin/firestore';
import { db } from './db';

// Exportamos las funciones del storage que usan la instancia de db importada
export const storage = {
  // Users
  async createUser(userData: Partial<User>) {
    const userRef = db.collection('users').doc(userData.firebaseUid);
    await userRef.set(userData);
    return { id: userData.firebaseUid, ...userData };
  },

  async getUserByFirebaseUid(firebaseUid: string) {
    const userDoc = await db.collection('users').doc(firebaseUid).get();
    if (!userDoc.exists) return null;
    return { id: userDoc.id, ...userDoc.data() };
  },

  async getAllUsers() {
    const snapshot = await db.collection('users').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async updateUser(firebaseUid: string, userData: Partial<User>) {
    const userRef = db.collection('users').doc(firebaseUid);
    await userRef.update(userData);
    const updatedDoc = await userRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  },

  async deleteUser(firebaseUid: string) {
    await db.collection('users').doc(firebaseUid).delete();
  },

  // Artists
  async createArtist(artistData: Partial<Artist>) {
    const docRef = await db.collection('artists').add(artistData);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() };
  },

  async getArtist(id: number) {
    const doc = await db.collection('artists').doc(String(id)).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  async getAllArtists() {
    const snapshot = await db.collection('artists').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  async getRecommendedArtists(lat?: number, lng?: number): Promise<any[]> { 
    return [
      { id: 1, name: "Laura Restrepo", role: "Fotógrafa", minPrice: 200000, photoURL: "https://randomuser.me/api/portraits/women/22.jpg", rating: 4.8 },
      { id: 2, name: "Carlos Ruiz", role: "Músico", minPrice: 150000, photoURL: "https://randomuser.me/api/portraits/men/32.jpg", rating: 4.9 },
      { id: 3, name: "María Jiménez", role: "Pintora", minPrice: 300000, photoURL: "https://randomuser.me/api/portraits/women/45.jpg", rating: 4.7 },
      { id: 4, name: "Santiago López", role: "Diseñador gráfico", minPrice: 180000, photoURL: "https://randomuser.me/api/portraits/men/67.jpg", rating: 4.5 }
    ];
  },
  async getArtistsForExplorer(lat?: number, lng?: number): Promise<any[]> { return []; }
  async getArtistServices(artistId: number): Promise<Service[]> { return []; }
  async getArtistReviews(artistId: number): Promise<any[]> { return []; }


  // Events
  async createEvent(eventData: Partial<Event>) {
    const docRef = await db.collection('events').add(eventData);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() };
  },

  async getEvent(id: number) {
    const doc = await db.collection('events').doc(String(id)).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  async getAllEvents() {
    const snapshot = await db.collection('events').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
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
  },

  async createFavorite(favoriteData: Omit<Favorite, 'id' | 'createdAt'>): Promise<Favorite> {
    const docRef = await db.collection('favorites').add({
      ...favoriteData,
      createdAt: Timestamp.now()
    });
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as Favorite;
  },

  async removeFavorite(id: string): Promise<void> {
    await db.collection('favorites').doc(id).delete();
  },
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
  },

  async createMessage(messageData: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
    const docRef = await db.collection('messages').add({
      ...messageData,
      createdAt: Timestamp.now()
    });
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as Message;
  },
  async getChatMessages(chatId: number): Promise<Message[]> { return []; }
  async createMessage(messageData: any): Promise<Message> { return {} as Message; }

  // Products - Retaining mock data functionality for now
  async getAllProducts(): Promise<any[]> { return []; }
  async createProduct(productData: any): Promise<Product> { return {} as Product; }

  // Service Requests - Retaining mock data functionality for now
  async createServiceRequest(requestData: any): Promise<ServiceRequest> { return {} as ServiceRequest; }

  // Search - Retaining mock data functionality for now
  async searchArtists(query?: string, lat?: number, lng?: number, filters?: any): Promise<any[]> { return []; }
  async searchEvents(query?: string, lat?: number, lng?: number, filters?: any): Promise<any[]> { return []; }

  // Blog - Retaining mock data functionality for now
  async getBlogPosts(): Promise<any[]> { return []; }
};