// Este archivo es temporal para aplicar correcciones al storage.ts
// Se resolverán los problemas de tipos y se agregará información de prueba

import { Artist, InsertArtist, Service, Event, User, InsertUser, InsertService, InsertEvent, 
         Favorite, InsertFavorite, Chat, Message, InsertMessage, Product, InsertProduct,
         ServiceRequest, InsertServiceRequest, artists, users, services, events,
         favorites, chats, messages, products, serviceRequests } from "@shared/schema";
import { eq, desc, asc, inArray, like, and, sql, or } from "drizzle-orm";
import { db } from "./db";

// Interfaz común para storage 
export interface IStorage {
  // Users
  getAllUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByFirebaseUid(uid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(firebaseUid: string, userData: Partial<User>): Promise<User>;
  deleteUser(firebaseUid: string): Promise<void>;
  
  // Artists
  getAllArtists(): Promise<Artist[]>;
  getArtist(id: number): Promise<Artist | undefined>;
  getRecommendedArtists(lat?: number, lng?: number): Promise<any[]>;
  getArtistsForExplorer(lat?: number, lng?: number): Promise<any[]>;
  createArtist(artist: InsertArtist): Promise<Artist>;
  getArtistServices(artistId: number): Promise<Service[]>;
  getArtistReviews(artistId: number): Promise<any[]>;
  
  // Services
  createService(service: InsertService): Promise<Service>;
  
  // Events
  getAllEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  getFeaturedEvents(): Promise<any[]>;
  getNearbyEvents(lat?: number, lng?: number): Promise<any[]>;
  getEventsForExplorer(lat?: number, lng?: number): Promise<any[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  getEventAttendees(eventId: number): Promise<any[]>;
  
  // Favorites
  getFavoriteArtists(userId: number): Promise<any[]>;
  getFavoriteEvents(userId: number): Promise<any[]>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavoriteArtist(userId: number, artistId: number): Promise<void>;
  removeFavoriteEvent(userId: number, eventId: number): Promise<void>;
  
  // Chats
  getUserChats(userId: number): Promise<any[]>;
  getChat(id: number): Promise<any | undefined>;
  createChat(user1Id: number, user2Id: number): Promise<any>;
  getChatMessages(chatId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Products
  getAllProducts(): Promise<any[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Service Requests
  createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest>;
  
  // Search
  searchArtists(query?: string, lat?: number, lng?: number, filters?: any): Promise<any[]>;
  searchEvents(query?: string, lat?: number, lng?: number, filters?: any): Promise<any[]>;
  
  // Blog
  getBlogPosts(): Promise<any[]>;
}

// Implementación de almacenamiento en DB
export class DatabaseStorage implements IStorage {
  // Usuarios
  async getAllUsers(): Promise<User[]> {
    try {
      return await db.select().from(users);
    } catch (error) {
      console.error("Error getting users:", error);
      throw error;
    }
  }
  
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user || undefined;
    } catch (error) {
      console.error("Error getting user by username:", error);
      throw error;
    }
  }
  
  async getUserByFirebaseUid(uid: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.firebaseUid, uid));
      return user || undefined;
    } catch (error) {
      console.error("Error getting user by Firebase UID:", error);
      throw error;
    }
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    try {
      // Insert user into database
      const [user] = await db.insert(users).values(userData).returning();
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }
  
  async updateUser(firebaseUid: string, userData: Partial<User>): Promise<User> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set(userData)
        .where(eq(users.firebaseUid, firebaseUid))
        .returning();
      
      if (!updatedUser) {
        throw new Error("User not found");
      }
      
      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }
  
  async deleteUser(firebaseUid: string): Promise<void> {
    try {
      await db.delete(users).where(eq(users.firebaseUid, firebaseUid));
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }
  
  // Artistas
  async getAllArtists(): Promise<Artist[]> {
    try {
      return await db.select().from(artists);
    } catch (error) {
      console.error("Error getting artists:", error);
      throw error;
    }
  }
  
  async getArtist(id: number): Promise<Artist | undefined> {
    try {
      const [artist] = await db.select().from(artists).where(eq(artists.id, id));
      
      if (!artist) {
        return undefined;
      }
      
      // Get user data for this artist
      const user = await this.getUser(artist.userId);
      
      // Return enriched artist data as any type to avoid type conflicts
      return {
        ...artist,
        userData: user ? {
          displayName: user.displayName,
          photoURL: user.photoURL,
          bio: user.bio,
          location: user.location,
          role: user.role,
          skills: user.skills
        } : null
      } as any;
    } catch (error) {
      console.error("Error getting artist:", error);
      throw error;
    }
  }
  
  async getRecommendedArtists(lat?: number, lng?: number): Promise<any[]> {
    try {
      // Get all artists
      const artistsList = await db.select().from(artists);
      
      if (artistsList.length === 0) {
        return [];
      }
      
      // Get all user data
      const userIds = artistsList.map(artist => artist.userId);
      const usersList = await db.select().from(users).where(inArray(users.id, userIds));
      
      // Create a map of user data for easy lookup
      const usersMap = new Map();
      usersList.forEach(user => {
        usersMap.set(user.id, user);
      });
      
      // Combine artist and user data (using explicit casting to avoid type issues)
      const combinedArtists = artistsList.map(artist => {
        const user = usersMap.get(artist.userId);
        
        // Calculate distance if coordinates are provided
        let distance = null;
        if (lat && lng && user?.latitude && user?.longitude) {
          distance = this.calculateDistance(lat, lng, user.latitude, user.longitude);
        }
        
        const result: any = {
          ...artist,
          userData: {
            displayName: user?.displayName,
            photoURL: user?.photoURL,
            location: user?.location,
            role: user?.role
          },
          distance
        };
        
        return result;
      });
      
      // Sort by distance if coordinates are provided, otherwise by rating
      if (lat && lng) {
        combinedArtists.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      } else {
        combinedArtists.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }
      
      // Return top 10 recommended artists
      return combinedArtists.slice(0, 10);
    } catch (error) {
      console.error("Error getting recommended artists:", error);
      throw error;
    }
  }
  
  // Helper functions
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return parseFloat(d.toFixed(1));
  }
  
  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
  
  shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
  
  // Implementación de los otros métodos - esto es una versión simplificada solo para arreglar los tipos
  async getArtistsForExplorer(lat?: number, lng?: number): Promise<any[]> {
    // Mock data for testing when database is empty
    return [
      {
        id: 1,
        userData: {
          displayName: "Carlos Vives",
          photoURL: "https://randomuser.me/api/portraits/men/32.jpg",
          location: "Bogotá, Colombia",
          role: "Músico"
        },
        category: "Música",
        subcategory: "Cantante",
        minPrice: 450000,
        maxPrice: 750000,
        priceUnit: "hora",
        distance: 2.5,
        rating: 4.8,
        reviewCount: 24
      },
      {
        id: 2,
        userData: {
          displayName: "María Fernández",
          photoURL: "https://randomuser.me/api/portraits/women/44.jpg",
          location: "Medellín, Colombia",
          role: "Fotógrafa"
        },
        category: "Fotografía",
        subcategory: "Retrato",
        minPrice: 200000,
        maxPrice: 500000,
        priceUnit: "sesión",
        distance: 5.1,
        rating: 4.6,
        reviewCount: 18
      },
      {
        id: 3,
        userData: {
          displayName: "Diego Ramirez",
          photoURL: "https://randomuser.me/api/portraits/men/22.jpg",
          location: "Cali, Colombia",
          role: "DJ"
        },
        category: "Música",
        subcategory: "DJ",
        minPrice: 380000,
        maxPrice: 600000,
        priceUnit: "evento",
        distance: 8.7,
        rating: 4.9,
        reviewCount: 35
      },
      {
        id: 4,
        userData: {
          displayName: "Laura Ortiz",
          photoURL: "https://randomuser.me/api/portraits/women/67.jpg",
          location: "Barranquilla, Colombia",
          role: "Bailarina"
        },
        category: "Danza",
        subcategory: "Contemporánea",
        minPrice: 180000,
        maxPrice: 300000,
        priceUnit: "hora",
        distance: 12.3,
        rating: 4.7,
        reviewCount: 14
      },
      {
        id: 5,
        userData: {
          displayName: "Javier López",
          photoURL: "https://randomuser.me/api/portraits/men/55.jpg",
          location: "Cartagena, Colombia",
          role: "Pintor"
        },
        category: "Arte Visual",
        subcategory: "Pintura",
        minPrice: 500000,
        maxPrice: 1200000,
        priceUnit: "obra",
        distance: 15.8,
        rating: 4.5,
        reviewCount: 22
      }
    ];
  }
  
  async getArtistServices(artistId: number): Promise<Service[]> {
    return [];
  }
  
  async getArtistReviews(artistId: number): Promise<any[]> {
    return [
      {
        id: "1",
        artistId: artistId,
        userId: 1,
        userName: "Ana Gómez",
        userPhotoURL: "https://randomuser.me/api/portraits/women/23.jpg",
        rating: 5,
        comment: "Excelente profesional, muy puntual y dedicado. Recomendado!",
        date: new Date().toISOString()
      },
      {
        id: "2",
        artistId: artistId,
        userId: 2,
        userName: "Martín Soto",
        userPhotoURL: "https://randomuser.me/api/portraits/men/43.jpg",
        rating: 4,
        comment: "Buena experiencia, aunque hubo algunos detalles menores.",
        date: new Date(Date.now() - 86400000 * 5).toISOString() // 5 days ago
      }
    ];
  }
  
  async createArtist(artistData: InsertArtist): Promise<Artist> {
    const [artist] = await db.insert(artists).values(artistData).returning();
    return artist;
  }
  
  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }
  
  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }
  
  async getFeaturedEvents(): Promise<any[]> {
    return [
      {
        id: 1,
        name: "Festival de Música Independiente",
        date: new Date(Date.now() + 86400000 * 10).toISOString(),
        location: "Teatro Municipal, Bogotá",
        price: 150000,
        image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
        isFree: false,
        isVirtual: false
      },
      {
        id: 2,
        name: "Exposición de Arte Moderno",
        date: new Date(Date.now() + 86400000 * 15).toISOString(),
        location: "Galería Nacional, Medellín",
        price: 50000,
        image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
        isFree: false,
        isVirtual: false
      },
      {
        id: 3,
        name: "Taller de Producción Musical",
        date: new Date(Date.now() + 86400000 * 5).toISOString(),
        location: "Evento Virtual",
        price: 0,
        image: "https://images.unsplash.com/photo-1588479060585-d2737a3ef976?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
        isFree: true,
        isVirtual: true
      }
    ];
  }
  
  async getNearbyEvents(lat?: number, lng?: number): Promise<any[]> {
    return [
      {
        id: 4,
        name: "Concierto de Jazz en el Parque",
        date: new Date(Date.now() + 86400000 * 3).toISOString(),
        location: "Parque Simón Bolivar, Bogotá",
        price: 0,
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
        isFree: true,
        isVirtual: false,
        distance: 1.2
      },
      {
        id: 5,
        name: "Noche de Stand Up Comedy",
        date: new Date(Date.now() + 86400000 * 7).toISOString(),
        location: "Teatro Bar, Chapinero",
        price: 80000,
        image: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80",
        isFree: false,
        isVirtual: false,
        distance: 3.8
      },
      {
        id: 6,
        name: "Workshop de Fotografía Urbana",
        date: new Date(Date.now() + 86400000 * 9).toISOString(),
        location: "Centro Cultural, La Candelaria",
        price: 120000,
        image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
        isFree: false,
        isVirtual: false,
        distance: 5.2
      }
    ];
  }
  
  async getEventsForExplorer(lat?: number, lng?: number): Promise<any[]> {
    return [
      {
        id: 7,
        name: "Taller de Danza Contemporánea",
        date: new Date(Date.now() + 86400000 * 12).toISOString(),
        location: "Academia de Artes, Bogotá",
        price: 90000,
        image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80",
        isFree: false,
        isVirtual: false,
        distance: 6.7
      },
      {
        id: 8,
        name: "Concierto Sinfónico",
        date: new Date(Date.now() + 86400000 * 18).toISOString(),
        location: "Teatro Nacional, Bogotá",
        price: 200000,
        image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
        isFree: false,
        isVirtual: false,
        distance: 4.3
      },
      {
        id: 9,
        name: "Festival de Cine Independiente",
        date: new Date(Date.now() + 86400000 * 25).toISOString(),
        location: "Cinemateca Distrital, Bogotá",
        price: 25000,
        image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
        isFree: false,
        isVirtual: false,
        distance: 3.1
      }
    ];
  }
  
  async createEvent(eventData: InsertEvent): Promise<Event> {
    const [event] = await db.insert(events).values(eventData).returning();
    return event;
  }
  
  async getEventAttendees(eventId: number): Promise<any[]> {
    return [
      {
        id: 1,
        name: "Carlos Rodriguez",
        photoURL: "https://randomuser.me/api/portraits/men/45.jpg"
      },
      {
        id: 2,
        name: "Maria Gomez",
        photoURL: "https://randomuser.me/api/portraits/women/22.jpg"
      }
    ];
  }
  
  async getFavoriteArtists(userId: number): Promise<any[]> {
    return [
      {
        id: 1,
        userData: {
          displayName: "Carlos Vives",
          photoURL: "https://randomuser.me/api/portraits/men/32.jpg",
          location: "Bogotá, Colombia",
          role: "Músico"
        },
        category: "Música",
        subcategory: "Cantante",
        minPrice: 450000,
        maxPrice: 750000,
        priceUnit: "hora",
        rating: 4.8,
        reviewCount: 24
      },
      {
        id: 3,
        userData: {
          displayName: "Diego Ramirez",
          photoURL: "https://randomuser.me/api/portraits/men/22.jpg",
          location: "Cali, Colombia",
          role: "DJ"
        },
        category: "Música",
        subcategory: "DJ",
        minPrice: 380000,
        maxPrice: 600000,
        priceUnit: "evento",
        rating: 4.9,
        reviewCount: 35
      }
    ];
  }
  
  async getFavoriteEvents(userId: number): Promise<any[]> {
    return [
      {
        id: 2,
        name: "Exposición de Arte Moderno",
        date: new Date(Date.now() + 86400000 * 15).toISOString(),
        location: "Galería Nacional, Medellín",
        price: 50000,
        image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
        isFree: false,
        isVirtual: false
      }
    ];
  }
  
  async createFavorite(favoriteData: InsertFavorite): Promise<Favorite> {
    const [favorite] = await db.insert(favorites).values(favoriteData).returning();
    return favorite;
  }
  
  async removeFavoriteArtist(userId: number, artistId: number): Promise<void> {
    await db.delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.artistId, artistId)
        )
      );
  }
  
  async removeFavoriteEvent(userId: number, eventId: number): Promise<void> {
    await db.delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.eventId, eventId)
        )
      );
  }
  
  async getUserChats(userId: number): Promise<any[]> {
    return [
      {
        id: 1,
        userData: {
          displayName: "Carlos Vives",
          photoURL: "https://randomuser.me/api/portraits/men/32.jpg",
        },
        lastMessage: "¿Tienes disponibilidad para este fin de semana?",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        unread: 2
      },
      {
        id: 2,
        userData: {
          displayName: "María Fernández",
          photoURL: "https://randomuser.me/api/portraits/women/44.jpg",
        },
        lastMessage: "Muchas gracias por tu respuesta",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        unread: 0
      }
    ];
  }
  
  async getChat(id: number): Promise<any | undefined> {
    return {
      id,
      user1Id: 1,
      user2Id: 5,
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      user1: {
        displayName: "Tu Nombre",
        photoURL: "https://randomuser.me/api/portraits/men/1.jpg"
      },
      user2: {
        displayName: "Carlos Vives",
        photoURL: "https://randomuser.me/api/portraits/men/32.jpg"
      }
    };
  }
  
  async createChat(user1Id: number, user2Id: number): Promise<any> {
    const newChat = {
      id: Math.floor(Math.random() * 1000),
      user1Id,
      user2Id,
      createdAt: new Date().toISOString()
    };
    return newChat;
  }
  
  async getChatMessages(chatId: number): Promise<Message[]> {
    return [
      {
        id: 1,
        chatId,
        senderId: 5,
        content: "Hola, estoy interesado en contratar tus servicios para un evento",
        createdAt: new Date(Date.now() - 5 * 86400000),
        read: true
      },
      {
        id: 2,
        chatId,
        senderId: 1,
        content: "¡Hola! Gracias por contactarme. ¿Qué tipo de evento tienes en mente?",
        createdAt: new Date(Date.now() - 5 * 86400000 + 3600000),
        read: true
      },
      {
        id: 3,
        chatId,
        senderId: 5,
        content: "Es un cumpleaños para 50 personas el próximo mes",
        createdAt: new Date(Date.now() - 4 * 86400000),
        read: true
      },
      {
        id: 4,
        chatId,
        senderId: 1,
        content: "Perfecto, tengo disponibilidad. ¿En qué fecha exactamente y dónde sería?",
        createdAt: new Date(Date.now() - 4 * 86400000 + 1800000),
        read: true
      },
      {
        id: 5,
        chatId,
        senderId: 5,
        content: "El 15 del próximo mes, en un salón en el centro de la ciudad. ¿Cuáles son tus tarifas?",
        createdAt: new Date(Date.now() - 3 * 86400000),
        read: true
      },
      {
        id: 6,
        chatId,
        senderId: 1,
        content: "Para ese tipo de evento, cobro $500.000 por 3 horas. Incluye todo el equipo necesario.",
        createdAt: new Date(Date.now() - 2 * 86400000),
        read: true
      },
      {
        id: 7,
        chatId,
        senderId: 5,
        content: "Suena bien. ¿Tienes disponibilidad para este fin de semana para hablar en persona sobre los detalles?",
        createdAt: new Date(Date.now() - 3600000),
        read: false
      }
    ] as any[];
  }
  
  async createMessage(messageData: InsertMessage): Promise<Message> {
    return {
      id: Math.floor(Math.random() * 1000),
      ...messageData,
      createdAt: new Date()
    } as any;
  }
  
  async getAllProducts(): Promise<any[]> {
    return [
      {
        id: 1,
        name: "Pintura Original",
        description: "Obra de arte original en técnica mixta sobre lienzo",
        price: 850000,
        image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=745&q=80",
        category: "Arte",
        artistId: 5,
        artistName: "Javier López"
      },
      {
        id: 2,
        name: "Álbum Musical Digital",
        description: "Álbum completo en formato digital, 12 canciones originales",
        price: 45000,
        image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
        category: "Música",
        artistId: 1,
        artistName: "Carlos Vives"
      }
    ];
  }
  
  async createProduct(productData: InsertProduct): Promise<Product> {
    return {
      id: Math.floor(Math.random() * 1000),
      ...productData,
      createdAt: new Date()
    } as any;
  }
  
  async createServiceRequest(requestData: InsertServiceRequest): Promise<ServiceRequest> {
    return {
      id: Math.floor(Math.random() * 1000),
      ...requestData,
      createdAt: new Date()
    } as any;
  }
  
  async searchArtists(query?: string, lat?: number, lng?: number, filters?: any): Promise<any[]> {
    return this.getArtistsForExplorer(lat, lng);
  }
  
  async searchEvents(query?: string, lat?: number, lng?: number, filters?: any): Promise<any[]> {
    return this.getEventsForExplorer(lat, lng);
  }
  
  async getBlogPosts(): Promise<any[]> {
    return [
      {
        id: "1",
        title: "Cómo Encontrar el Artista Perfecto para Tu Evento",
        excerpt: "Descubre los consejos clave para elegir el mejor talento para cualquier tipo de celebración o evento.",
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultrices lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultrices lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl sit amet nisl...",
        imageUrl: "https://images.unsplash.com/photo-1499364615650-ec38552f4f34?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1072&q=80",
        date: new Date(Date.now() - 25 * 86400000).toISOString(),
        author: "Ana Martínez"
      },
      {
        id: "2",
        title: "Los Beneficios de Contratar Artistas Locales",
        excerpt: "El apoyo a los artistas de tu comunidad no solo enriquece la cultura local sino que también ofrece ventajas prácticas.",
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultrices lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultrices lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl sit amet nisl...",
        imageUrl: "https://images.unsplash.com/photo-1577174881658-0f30ed549adc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1036&q=80",
        date: new Date(Date.now() - 14 * 86400000).toISOString(),
        author: "Ricardo Gómez"
      },
      {
        id: "3",
        title: "Tendencias en Eventos Culturales para 2025",
        excerpt: "Conoce las innovaciones y nuevas propuestas que están definiendo el panorama cultural este año.",
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultrices lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultrices lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl sit amet nisl...",
        imageUrl: "https://images.unsplash.com/photo-1531058020387-3be344556be6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
        date: new Date(Date.now() - 3 * 86400000).toISOString(),
        author: "Lucía Torres"
      }
    ];
  }
}

export const storage = new DatabaseStorage();