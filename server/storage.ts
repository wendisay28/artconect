
import { Artist, Service, Event, User, Favorite, Chat, Message, Product, ServiceRequest } from "@shared/schema";
import { getFirestore } from 'firebase-admin/firestore';
import { db } from './db';

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

  async getRecommendedArtists(lat?: number, lng?: number) {
    return [
      { id: 1, name: "Laura Restrepo", role: "Fotógrafa", minPrice: 200000, photoURL: "https://randomuser.me/api/portraits/women/22.jpg", rating: 4.8 },
      { id: 2, name: "Carlos Ruiz", role: "Músico", minPrice: 150000, photoURL: "https://randomuser.me/api/portraits/men/32.jpg", rating: 4.9 },
      { id: 3, name: "María Jiménez", role: "Pintora", minPrice: 300000, photoURL: "https://randomuser.me/api/portraits/women/45.jpg", rating: 4.7 },
      { id: 4, name: "Santiago López", role: "Diseñador gráfico", minPrice: 180000, photoURL: "https://randomuser.me/api/portraits/men/67.jpg", rating: 4.5 }
    ];
  },

  async getArtistsForExplorer(lat?: number, lng?: number) { 
    return []; 
  },

  async getArtistServices(artistId: number) { 
    return []; 
  },

  async getArtistReviews(artistId: number) { 
    return []; 
  },

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

  async getFeaturedEvents() { 
    return []; 
  },

  async getNearbyEvents(lat?: number, lng?: number) { 
    return []; 
  },

  async getEventsForExplorer(lat?: number, lng?: number) { 
    return []; 
  },

  async getEventAttendees(eventId: number) { 
    return []; 
  },

  // Messages
  async getMessages(chatId: string) {
    const snapshot = await db.collection('messages')
      .where('chatId', '==', chatId)
      .orderBy('createdAt', 'asc')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async createMessage(messageData: any) {
    const docRef = await db.collection('messages').add(messageData);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() };
  },

  // Favorites
  async getFavorites(userId: string) {
    const snapshot = await db.collection('favorites')
      .where('userId', '==', userId)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async createFavorite(favoriteData: any) {
    const docRef = await db.collection('favorites').add(favoriteData);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() };
  },

  async removeFavorite(id: string) {
    await db.collection('favorites').doc(id).delete();
  }
};
