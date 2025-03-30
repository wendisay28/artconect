import { db } from "./db";
import { 
  users, artists, services, events, favorites, chats, messages, products, serviceRequests,
  type User, type InsertUser,
  type Artist, type InsertArtist,
  type Service, type InsertService,
  type Event, type InsertEvent,
  type Favorite, type InsertFavorite,
  type Chat, type InsertChat,
  type Message, type InsertMessage,
  type Product, type InsertProduct,
  type ServiceRequest, type InsertServiceRequest
} from "../shared/schema";
import { and, eq, desc, asc, gt, lt, like, inArray, isNull, or } from "drizzle-orm";

// Mock blog post type (not in schema)
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  date: string;
  author: string;
}

// Mock review type (not in schema)
interface Review {
  id: string;
  artistId: number;
  userId: number;
  userName: string;
  userPhotoURL: string;
  rating: number;
  comment: string;
  date: string;
}

// Interface for storage
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
  getArtistReviews(artistId: number): Promise<Review[]>;
  
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
  getBlogPosts(): Promise<BlogPost[]>;
}

// PostgreSQL implementation of storage
export class DatabaseStorage implements IStorage {
  // Users
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
      return user;
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error("Error getting user by username:", error);
      throw error;
    }
  }
  
  async getUserByFirebaseUid(uid: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.firebaseUid, uid));
      return user;
    } catch (error) {
      console.error("Error getting user by firebase UID:", error);
      throw error;
    }
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    try {
      // Check if username is already taken
      const existingUser = await this.getUserByUsername(userData.username);
      if (existingUser) {
        throw new Error("Username already taken");
      }
      
      // Check if user with this firebase UID already exists
      const existingFirebaseUser = await this.getUserByFirebaseUid(userData.firebaseUid);
      if (existingFirebaseUser) {
        throw new Error("User already exists");
      }
      
      // Create user in database
      const [user] = await db.insert(users).values(userData).returning();
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }
  
  async updateUser(firebaseUid: string, userData: Partial<User>): Promise<User> {
    try {
      // Find user by firebase UID
      const existingUser = await this.getUserByFirebaseUid(firebaseUid);
      if (!existingUser) {
        throw new Error("User not found");
      }
      
      // Check if username is being changed and is already taken
      if (userData.username) {
        const userWithUsername = await this.getUserByUsername(userData.username);
        if (userWithUsername && userWithUsername.id !== existingUser.id) {
          throw new Error("Username already taken");
        }
      }
      
      // Update user in database
      const [updatedUser] = await db
        .update(users)
        .set(userData)
        .where(eq(users.firebaseUid, firebaseUid))
        .returning();
      
      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }
  
  async deleteUser(firebaseUid: string): Promise<void> {
    try {
      // Find user by firebase UID
      const existingUser = await this.getUserByFirebaseUid(firebaseUid);
      if (!existingUser) {
        throw new Error("User not found");
      }
      
      // Delete user from database
      await db.delete(users).where(eq(users.firebaseUid, firebaseUid));
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }
  
  // Artists
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
      
      // Return artist data with extra fields as any to avoid type issues
      return {
        ...artist,
        // Add user fields as additional data (not in the Artist type)
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
      
      // Combine artist and user data
      const combinedArtists = artistsList.map(artist => {
        const user = usersMap.get(artist.userId);
        
        // Calculate distance if coordinates are provided
        let distance = null;
        if (lat && lng && user?.latitude && user?.longitude) {
          distance = this.calculateDistance(lat, lng, user.latitude, user.longitude);
        }
        
        return {
          ...artist,
          displayName: user?.displayName,
          photoURL: user?.photoURL,
          location: user?.location,
          role: user?.role,
          distance
        };
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
  
  async getArtistsForExplorer(lat?: number, lng?: number): Promise<any[]> {
    try {
      // This method is similar to getRecommendedArtists but returns all artists
      // Get all artists
      const artistsList = await db.select().from(artists);
      
      if (artistsList.length === 0) {
        // Return mock data for testing when database is empty
        return [
          {
            id: "1",
            displayName: "Carlos Vives",
            role: "Músico",
            category: "Música",
            subcategory: "Cantante",
            photoURL: "https://randomuser.me/api/portraits/men/32.jpg",
            location: "Bogotá, Colombia",
            minPrice: 450000,
            maxPrice: 750000,
            priceUnit: "hora",
            distance: 2.5,
            rating: 4.8,
            reviewCount: 24
          },
          {
            id: "2",
            displayName: "María Fernández",
            role: "Fotógrafa",
            category: "Fotografía",
            subcategory: "Retrato",
            photoURL: "https://randomuser.me/api/portraits/women/44.jpg",
            location: "Medellín, Colombia",
            minPrice: 200000,
            maxPrice: 500000,
            priceUnit: "sesión",
            distance: 5.1,
            rating: 4.6,
            reviewCount: 18
          },
          {
            id: "3",
            displayName: "Diego Ramirez",
            role: "DJ",
            category: "Música",
            subcategory: "DJ",
            photoURL: "https://randomuser.me/api/portraits/men/22.jpg",
            location: "Cali, Colombia",
            minPrice: 380000,
            maxPrice: 600000,
            priceUnit: "evento",
            distance: 8.7,
            rating: 4.9,
            reviewCount: 35
          },
          {
            id: "4",
            displayName: "Laura Ortiz",
            role: "Bailarina",
            category: "Danza",
            subcategory: "Contemporánea",
            photoURL: "https://randomuser.me/api/portraits/women/67.jpg",
            location: "Barranquilla, Colombia",
            minPrice: 180000,
            maxPrice: 300000,
            priceUnit: "hora",
            distance: 12.3,
            rating: 4.7,
            reviewCount: 14
          },
          {
            id: "5",
            displayName: "Javier López",
            role: "Pintor",
            category: "Arte Visual",
            subcategory: "Pintura",
            photoURL: "https://randomuser.me/api/portraits/men/55.jpg",
            location: "Cartagena, Colombia",
            minPrice: 500000,
            maxPrice: 1200000,
            priceUnit: "obra",
            distance: 15.8,
            rating: 4.5,
            reviewCount: 22
          }
        ];
      }
      
      // Get all user data
      const userIds = artistsList.map(artist => artist.userId);
      const usersList = await db.select().from(users).where(inArray(users.id, userIds));
      
      // Create a map of user data for easy lookup
      const usersMap = new Map();
      usersList.forEach(user => {
        usersMap.set(user.id, user);
      });
      
      // Combine artist and user data
      const combinedArtists = artistsList.map(artist => {
        const user = usersMap.get(artist.userId);
        
        // Calculate distance if coordinates are provided
        let distance = null;
        if (lat && lng && user?.latitude && user?.longitude) {
          distance = this.calculateDistance(lat, lng, user.latitude, user.longitude);
        }
        
        return {
          ...artist,
          displayName: user?.displayName,
          photoURL: user?.photoURL,
          location: user?.location,
          role: user?.role,
          distance
        };
      });
      
      // Shuffle the array to provide variety in the explorer
      return this.shuffleArray(combinedArtists);
    } catch (error) {
      console.error("Error getting artists for explorer:", error);
      throw error;
    }
  }
  
  async createArtist(artistData: InsertArtist): Promise<Artist> {
    try {
      // Insert artist into database
      const [artist] = await db.insert(artists).values(artistData).returning();
      return artist;
    } catch (error) {
      console.error("Error creating artist:", error);
      throw error;
    }
  }
  
  async getArtistServices(artistId: number): Promise<Service[]> {
    try {
      const servicesList = await db.select().from(services).where(eq(services.artistId, artistId));
      return servicesList;
    } catch (error) {
      console.error("Error getting artist services:", error);
      throw error;
    }
  }
  
  async getArtistReviews(artistId: number): Promise<Review[]> {
    try {
      // Mock reviews data for testing
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
    } catch (error) {
      console.error("Error getting artist reviews:", error);
      throw error;
    }
  }
  
  // Services
  async createService(service: InsertService): Promise<Service> {
    try {
      const [newService] = await db.insert(services).values(service).returning();
      return newService;
    } catch (error) {
      console.error("Error creating service:", error);
      throw error;
    }
  }
  
  // Events
  async getAllEvents(): Promise<Event[]> {
    try {
      return await db.select().from(events);
    } catch (error) {
      console.error("Error getting events:", error);
      throw error;
    }
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    try {
      const [event] = await db.select().from(events).where(eq(events.id, id));
      return event;
    } catch (error) {
      console.error("Error getting event:", error);
      throw error;
    }
  }
  
  async createEvent(eventData: InsertEvent): Promise<Event> {
    try {
      const [event] = await db.insert(events).values(eventData).returning();
      return event;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  }
  
  async getEventAttendees(eventId: number): Promise<any[]> {
    try {
      // For now, return mock data
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
    } catch (error) {
      console.error("Error getting event attendees:", error);
      throw error;
    }
  }
  
  async getFeaturedEvents(): Promise<any[]> {
    try {
      const eventsList = await db.select().from(events).limit(5);
      
      if (eventsList.length === 0) {
        // Return mock data for testing when database is empty
        return [
          {
            id: "1",
            name: "Festival de Música Independiente",
            date: new Date(Date.now() + 86400000 * 10).toISOString(), // 10 days from now
            location: "Teatro Municipal, Bogotá",
            price: 150000,
            image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
            isFree: false,
            isVirtual: false
          },
          {
            id: "2",
            name: "Exposición de Arte Moderno",
            date: new Date(Date.now() + 86400000 * 15).toISOString(), // 15 days from now
            location: "Galería Nacional, Medellín",
            price: 50000,
            image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
            isFree: false,
            isVirtual: false
          },
          {
            id: "3",
            name: "Taller de Producción Musical",
            date: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
            location: "Evento Virtual",
            price: 0,
            image: "https://images.unsplash.com/photo-1588479060585-d2737a3ef976?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
            isFree: true,
            isVirtual: true
          }
        ];
      }
      
      // Get creator data for each event
      const creatorIds = eventsList.map(event => event.creatorId);
      const creatorsList = await db.select().from(users).where(inArray(users.id, creatorIds));
      
      // Create a map for easy lookup
      const creatorsMap = new Map();
      creatorsList.forEach(creator => {
        creatorsMap.set(creator.id, creator);
      });
      
      // Enrich events with creator data
      const featuredEvents = eventsList.map(event => {
        const creator = creatorsMap.get(event.creatorId);
        return {
          ...event,
          creatorName: creator?.displayName,
          creatorPhotoURL: creator?.photoURL
        };
      });
      
      return featuredEvents;
    } catch (error) {
      console.error("Error getting featured events:", error);
      throw error;
    }
  }
  
  async getNearbyEvents(lat?: number, lng?: number): Promise<any[]> {
    try {
      // Get all events
      const eventsList = await db.select().from(events);
      
      if (eventsList.length === 0) {
        // Return mock data for testing when database is empty
        return [
          {
            id: "4",
            name: "Concierto de Jazz en el Parque",
            date: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
            location: "Parque Simón Bolivar, Bogotá",
            price: 0,
            image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
            isFree: true,
            isVirtual: false,
            distance: 1.2
          },
          {
            id: "5",
            name: "Noche de Stand Up Comedy",
            date: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
            location: "Teatro Bar, Chapinero",
            price: 80000,
            image: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80",
            isFree: false,
            isVirtual: false,
            distance: 3.8
          },
          {
            id: "6",
            name: "Workshop de Fotografía Urbana",
            date: new Date(Date.now() + 86400000 * 9).toISOString(), // 9 days from now
            location: "Centro Cultural, La Candelaria",
            price: 120000,
            image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
            isFree: false,
            isVirtual: false,
            distance: 5.2
          }
        ];
      }
      
      // Filter only physical events (non-virtual)
      const physicalEvents = eventsList.filter(event => !event.eventType || event.eventType !== "virtual");
      
      // Calculate distance for each event if coordinates are provided
      const eventsWithDistance = physicalEvents.map(event => {
        let distance = null;
        if (lat && lng && event.latitude && event.longitude) {
          distance = this.calculateDistance(lat, lng, event.latitude, event.longitude);
        }
        
        return {
          ...event,
          distance
        };
      });
      
      // Sort by distance if coordinates are provided, otherwise by date
      if (lat && lng) {
        eventsWithDistance.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      } else {
        eventsWithDistance.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      }
      
      // Get only nearby events (within 50km or just the first few)
      const nearbyEvents = lat && lng
        ? eventsWithDistance.filter(event => event.distance && event.distance <= 50)
        : eventsWithDistance.slice(0, 5);
      
      return nearbyEvents;
    } catch (error) {
      console.error("Error getting nearby events:", error);
      throw error;
    }
  }
  
  async getEventsForExplorer(lat?: number, lng?: number): Promise<any[]> {
    try {
      // Get all events
      const eventsList = await db.select().from(events);
      
      if (eventsList.length === 0) {
        // Return mock data for testing when database is empty
        return [
          {
            id: "7",
            name: "Taller de Danza Contemporánea",
            date: new Date(Date.now() + 86400000 * 12).toISOString(), // 12 days from now
            location: "Academia de Artes, Usaquén",
            price: 200000,
            image: "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80",
            isFree: false,
            isVirtual: false,
            distance: 4.7
          },
          {
            id: "8",
            name: "Concierto Rock en Vivo",
            date: new Date(Date.now() + 86400000 * 22).toISOString(), // 22 days from now
            location: "Bar Auditorio, Zona T",
            price: 95000,
            image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
            isFree: false,
            isVirtual: false,
            distance: 6.3
          },
          {
            id: "9",
            name: "Exposición de Fotografía",
            date: new Date(Date.now() + 86400000 * 8).toISOString(), // 8 days from now
            location: "Museo de Arte Moderno",
            price: 25000,
            image: "https://images.unsplash.com/photo-1621886292650-520f76c747d6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80",
            isFree: false,
            isVirtual: false,
            distance: 7.9
          },
          {
            id: "10",
            name: "Masterclass de Piano",
            date: new Date(Date.now() + 86400000 * 14).toISOString(), // 14 days from now
            location: "Conservatorio Nacional",
            price: 180000,
            image: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
            isFree: false,
            isVirtual: false,
            distance: 9.2
          },
          {
            id: "11",
            name: "Festival de Cine Independiente",
            date: new Date(Date.now() + 86400000 * 16).toISOString(), // 16 days from now
            location: "Cinemateca Distrital",
            price: 30000,
            image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
            isFree: false,
            isVirtual: false,
            distance: 5.6
          }
        ];
      }
      
      // Calculate distance for each event if coordinates are provided
      const eventsWithDistance = eventsList.map(event => {
        let distance = null;
        if (lat && lng && event.latitude && event.longitude) {
          distance = this.calculateDistance(lat, lng, event.latitude, event.longitude);
        }
        
        return {
          ...event,
          distance
        };
      });
      
      // Shuffle the array to provide variety in the explorer
      return this.shuffleArray(eventsWithDistance);
    } catch (error) {
      console.error("Error getting events for explorer:", error);
      throw error;
    }
  }
  
  // Favorites
  async getFavoriteArtists(userId: number): Promise<any[]> {
    try {
      // Get all favorites for this user that are artists
      const favoritesList = await db
        .select()
        .from(favorites)
        .where(
          and(
            eq(favorites.userId, userId),
            eq(favorites.type, "artist")
          )
        );
      
      if (favoritesList.length === 0) {
        return [];
      }
      
      // Get artist ids
      const artistIds = favoritesList.map(favorite => favorite.itemId);
      
      // Get artist data
      const artistsList = await db
        .select()
        .from(artists)
        .where(inArray(artists.id, artistIds));
      
      // Enrich with user data
      const userIds = artistsList.map(artist => artist.userId);
      const usersList = await db.select().from(users).where(inArray(users.id, userIds));
      
      // Map for easy lookup
      const usersMap = new Map();
      usersList.forEach(user => {
        usersMap.set(user.id, user);
      });
      
      // Combine data
      const enrichedArtists = artistsList.map(artist => {
        const user = usersMap.get(artist.userId);
        return {
          ...artist,
          displayName: user?.displayName,
          photoURL: user?.photoURL,
          location: user?.location,
          role: user?.role
        };
      });
      
      return enrichedArtists;
    } catch (error) {
      console.error("Error getting favorite artists:", error);
      throw error;
    }
  }
  
  async getFavoriteEvents(userId: number): Promise<any[]> {
    try {
      // Get all favorites for this user that are events
      const favoritesList = await db
        .select()
        .from(favorites)
        .where(
          and(
            eq(favorites.userId, userId),
            eq(favorites.type, "event")
          )
        );
      
      if (favoritesList.length === 0) {
        return [];
      }
      
      // Get event ids
      const eventIds = favoritesList.map(favorite => favorite.itemId);
      
      // Get event data
      const eventsList = await db
        .select()
        .from(events)
        .where(inArray(events.id, eventIds));
      
      return eventsList;
    } catch (error) {
      console.error("Error getting favorite events:", error);
      throw error;
    }
  }
  
  async createFavorite(favoriteData: InsertFavorite): Promise<Favorite> {
    try {
      const [favorite] = await db.insert(favorites).values(favoriteData).returning();
      return favorite;
    } catch (error) {
      console.error("Error creating favorite:", error);
      throw error;
    }
  }
  
  async removeFavoriteArtist(userId: number, artistId: number): Promise<void> {
    try {
      await db
        .delete(favorites)
        .where(
          and(
            eq(favorites.userId, userId),
            eq(favorites.itemId, artistId),
            eq(favorites.type, "artist")
          )
        );
    } catch (error) {
      console.error("Error removing favorite artist:", error);
      throw error;
    }
  }
  
  async removeFavoriteEvent(userId: number, eventId: number): Promise<void> {
    try {
      await db
        .delete(favorites)
        .where(
          and(
            eq(favorites.userId, userId),
            eq(favorites.itemId, eventId),
            eq(favorites.type, "event")
          )
        );
    } catch (error) {
      console.error("Error removing favorite event:", error);
      throw error;
    }
  }
  
  // Chats
  async getUserChats(userId: number): Promise<any[]> {
    try {
      const chatsList = await db
        .select()
        .from(chats)
        .where(
          or(
            eq(chats.user1Id, userId),
            eq(chats.user2Id, userId)
          )
        );
      
      if (chatsList.length === 0) {
        return [];
      }
      
      // Get the other user's info for each chat
      const userIds = chatsList.flatMap(chat => 
        chat.user1Id === userId ? [chat.user2Id] : [chat.user1Id]
      );
      
      const usersList = await db
        .select()
        .from(users)
        .where(inArray(users.id, userIds));
      
      // Map for easy lookup
      const usersMap = new Map();
      usersList.forEach(user => {
        usersMap.set(user.id, user);
      });
      
      // Get last message for each chat
      const chatWithLastMessagePromises = chatsList.map(async chat => {
        const lastMessages = await db
          .select()
          .from(messages)
          .where(eq(messages.chatId, chat.id))
          .orderBy(desc(messages.createdAt))
          .limit(1);
        
        const lastMessage = lastMessages.length > 0 ? lastMessages[0] : null;
        const otherUserId = chat.user1Id === userId ? chat.user2Id : chat.user1Id;
        const otherUser = usersMap.get(otherUserId);
        
        return {
          ...chat,
          lastMessage,
          user: {
            id: otherUser?.id,
            displayName: otherUser?.displayName,
            photoURL: otherUser?.photoURL,
            username: otherUser?.username
          }
        };
      });
      
      const chatsWithLastMessage = await Promise.all(chatWithLastMessagePromises);
      
      // Sort by last message date (newest first)
      return chatsWithLastMessage.sort((a, b) => {
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
      });
    } catch (error) {
      console.error("Error getting user chats:", error);
      throw error;
    }
  }
  
  async getChat(id: number): Promise<any | undefined> {
    try {
      const [chat] = await db.select().from(chats).where(eq(chats.id, id));
      
      if (!chat) {
        return undefined;
      }
      
      // Get users data
      const [user1] = await db.select().from(users).where(eq(users.id, chat.user1Id));
      const [user2] = await db.select().from(users).where(eq(users.id, chat.user2Id));
      
      return {
        ...chat,
        user1: {
          id: user1?.id,
          displayName: user1?.displayName,
          photoURL: user1?.photoURL,
          username: user1?.username
        },
        user2: {
          id: user2?.id,
          displayName: user2?.displayName,
          photoURL: user2?.photoURL,
          username: user2?.username
        }
      };
    } catch (error) {
      console.error("Error getting chat:", error);
      throw error;
    }
  }
  
  async createChat(user1Id: number, user2Id: number): Promise<any> {
    try {
      // Check if chat already exists
      const existingChat = await db
        .select()
        .from(chats)
        .where(
          or(
            and(
              eq(chats.user1Id, user1Id),
              eq(chats.user2Id, user2Id)
            ),
            and(
              eq(chats.user1Id, user2Id),
              eq(chats.user2Id, user1Id)
            )
          )
        );
      
      if (existingChat.length > 0) {
        return existingChat[0];
      }
      
      // Create new chat
      const [chat] = await db
        .insert(chats)
        .values({
          user1Id,
          user2Id,
          createdAt: new Date()
        })
        .returning();
      
      return chat;
    } catch (error) {
      console.error("Error creating chat:", error);
      throw error;
    }
  }
  
  async getChatMessages(chatId: number): Promise<Message[]> {
    try {
      const messagesList = await db
        .select()
        .from(messages)
        .where(eq(messages.chatId, chatId))
        .orderBy(asc(messages.createdAt));
      
      return messagesList;
    } catch (error) {
      console.error("Error getting chat messages:", error);
      throw error;
    }
  }
  
  async createMessage(messageData: InsertMessage): Promise<Message> {
    try {
      const [message] = await db
        .insert(messages)
        .values({
          ...messageData,
          createdAt: new Date()
        })
        .returning();
      
      return message;
    } catch (error) {
      console.error("Error creating message:", error);
      throw error;
    }
  }
  
  // Products
  async getAllProducts(): Promise<any[]> {
    try {
      const productsList = await db.select().from(products);
      
      if (productsList.length === 0) {
        // Return mock data for testing
        return [
          {
            id: 1,
            name: "Pintura Original",
            description: "Pintura acrílica sobre lienzo, 60x80cm",
            price: 450000,
            artistId: 5,
            category: "Pintura",
            imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
          },
          {
            id: 2,
            name: "Fotografía Edición Limitada",
            description: "Fotografía en blanco y negro, impresión giclée, 30x40cm",
            price: 120000,
            artistId: 2,
            category: "Fotografía",
            imageUrl: "https://images.unsplash.com/photo-1501580242143-28a1c22e4faa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1025&q=80"
          },
          {
            id: 3,
            name: "Escultura de Cerámica",
            description: "Escultura en cerámica esmaltada, 25cm de altura",
            price: 180000,
            artistId: 3,
            category: "Escultura",
            imageUrl: "https://images.unsplash.com/photo-1482977036925-e8fcaa643657?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80"
          }
        ];
      }
      
      // Get artist data for each product
      const artistIds = productsList.map(product => product.artistId).filter(id => id !== null);
      
      if (artistIds.length > 0) {
        const artistsList = await db.select().from(artists).where(inArray(artists.id, artistIds));
        const userIds = artistsList.map(artist => artist.userId);
        const usersList = await db.select().from(users).where(inArray(users.id, userIds));
        
        // Maps for easy lookup
        const artistsMap = new Map();
        artistsList.forEach(artist => {
          artistsMap.set(artist.id, artist);
        });
        
        const usersMap = new Map();
        usersList.forEach(user => {
          usersMap.set(user.id, user);
        });
        
        // Combine data
        return productsList.map(product => {
          const artist = artistsMap.get(product.artistId);
          const user = artist ? usersMap.get(artist.userId) : null;
          
          return {
            ...product,
            artistName: user?.displayName || "Artista Desconocido"
          };
        });
      }
      
      return productsList;
    } catch (error) {
      console.error("Error getting products:", error);
      throw error;
    }
  }
  
  async createProduct(productData: InsertProduct): Promise<Product> {
    try {
      const [product] = await db.insert(products).values(productData).returning();
      return product;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }
  
  // Service Requests
  async createServiceRequest(requestData: InsertServiceRequest): Promise<ServiceRequest> {
    try {
      const [request] = await db.insert(serviceRequests).values({
        ...requestData,
        createdAt: new Date(),
        status: requestData.status || "pending"
      }).returning();
      
      return request;
    } catch (error) {
      console.error("Error creating service request:", error);
      throw error;
    }
  }
  
  // Search
  async searchArtists(query?: string, lat?: number, lng?: number, filters?: any): Promise<any[]> {
    try {
      // Get all artists
      let artistsList = await db.select().from(artists);
      
      // Get all user data for these artists
      const userIds = artistsList.map(artist => artist.userId);
      const usersList = await db.select().from(users).where(inArray(users.id, userIds));
      
      // Create a map of user data for easy lookup
      const usersMap = new Map();
      usersList.forEach(user => {
        usersMap.set(user.id, user);
      });
      
      // Combine artist and user data
      let combinedArtists = artistsList.map(artist => {
        const user = usersMap.get(artist.userId);
        
        // Calculate distance if coordinates are provided
        let distance = null;
        if (lat && lng && user?.latitude && user?.longitude) {
          distance = this.calculateDistance(lat, lng, user.latitude, user.longitude);
        }
        
        return {
          ...artist,
          displayName: user?.displayName,
          photoURL: user?.photoURL,
          location: user?.location,
          role: user?.role,
          distance
        };
      });
      
      // Filter by query if provided
      if (query) {
        const lowerQuery = query.toLowerCase();
        combinedArtists = combinedArtists.filter(artist => 
          artist.displayName?.toLowerCase().includes(lowerQuery) ||
          artist.category?.toLowerCase().includes(lowerQuery) ||
          artist.subcategory?.toLowerCase().includes(lowerQuery) ||
          artist.role?.toLowerCase().includes(lowerQuery) ||
          artist.location?.toLowerCase().includes(lowerQuery)
        );
      }
      
      // Apply additional filters if provided
      if (filters) {
        if (filters.category) {
          combinedArtists = combinedArtists.filter(artist => 
            artist.category?.toLowerCase() === filters.category.toLowerCase()
          );
        }
        
        if (filters.subcategory) {
          combinedArtists = combinedArtists.filter(artist => 
            artist.subcategory?.toLowerCase() === filters.subcategory.toLowerCase()
          );
        }
        
        if (filters.minPrice !== undefined) {
          combinedArtists = combinedArtists.filter(artist => 
            artist.minPrice !== null && artist.minPrice >= filters.minPrice
          );
        }
        
        if (filters.maxPrice !== undefined) {
          combinedArtists = combinedArtists.filter(artist => 
            artist.maxPrice !== null && artist.maxPrice <= filters.maxPrice
          );
        }
        
        if (filters.minRating !== undefined) {
          combinedArtists = combinedArtists.filter(artist => 
            artist.rating !== null && artist.rating >= filters.minRating
          );
        }
      }
      
      // Sort by distance if coordinates are provided, otherwise by rating
      if (lat && lng) {
        combinedArtists.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      } else {
        combinedArtists.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }
      
      return combinedArtists;
    } catch (error) {
      console.error("Error searching artists:", error);
      throw error;
    }
  }
  
  async searchEvents(query?: string, lat?: number, lng?: number, filters?: any): Promise<any[]> {
    try {
      // Get all events
      let eventsList = await db.select().from(events);
      
      // Calculate distance for each event if coordinates are provided
      let eventsWithDistance = eventsList.map(event => {
        let distance = null;
        if (lat && lng && event.latitude && event.longitude) {
          distance = this.calculateDistance(lat, lng, event.latitude, event.longitude);
        }
        
        return {
          ...event,
          distance
        };
      });
      
      // Filter by query if provided
      if (query) {
        const lowerQuery = query.toLowerCase();
        eventsWithDistance = eventsWithDistance.filter(event => 
          event.name?.toLowerCase().includes(lowerQuery) ||
          event.location?.toLowerCase().includes(lowerQuery) ||
          event.description?.toLowerCase().includes(lowerQuery)
        );
      }
      
      // Apply additional filters if provided
      if (filters) {
        if (filters.isFree !== undefined) {
          eventsWithDistance = eventsWithDistance.filter(event => 
            (filters.isFree && (!event.price || event.price === 0)) ||
            (!filters.isFree && event.price && event.price > 0)
          );
        }
        
        if (filters.isVirtual !== undefined) {
          eventsWithDistance = eventsWithDistance.filter(event => 
            (filters.isVirtual && event.eventType === "virtual") ||
            (!filters.isVirtual && event.eventType !== "virtual")
          );
        }
        
        if (filters.maxPrice !== undefined) {
          eventsWithDistance = eventsWithDistance.filter(event => 
            !event.price || event.price <= filters.maxPrice
          );
        }
        
        if (filters.startDate !== undefined) {
          const startDate = new Date(filters.startDate);
          eventsWithDistance = eventsWithDistance.filter(event => 
            new Date(event.date) >= startDate
          );
        }
        
        if (filters.endDate !== undefined) {
          const endDate = new Date(filters.endDate);
          eventsWithDistance = eventsWithDistance.filter(event => 
            new Date(event.date) <= endDate
          );
        }
      }
      
      // Sort by distance if coordinates are provided, otherwise by date
      if (lat && lng) {
        eventsWithDistance.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      } else {
        eventsWithDistance.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      }
      
      return eventsWithDistance;
    } catch (error) {
      console.error("Error searching events:", error);
      throw error;
    }
  }
  
  // Blog
  async getBlogPosts(): Promise<BlogPost[]> {
    try {
      // Return mock data for testing
      return [
        {
          id: "1",
          title: "Cómo Encontrar el Artista Perfecto para tu Evento",
          excerpt: "Descubre los mejores consejos para contratar artistas que eleven tus eventos al siguiente nivel.",
          content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.",
          imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
          date: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
          author: "María González"
        },
        {
          id: "2",
          title: "Las Tendencias Artísticas que Dominan el 2023",
          excerpt: "Un análisis de las nuevas tendencias en arte y entretenimiento que están definiendo el año.",
          content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.",
          imageUrl: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
          date: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
          author: "Carlos Rodríguez"
        },
        {
          id: "3",
          title: "Organiza tu Evento Cultural con Éxito",
          excerpt: "Guía completa para la planificación y ejecución de eventos culturales que dejen huella.",
          content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.",
          imageUrl: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1062&q=80",
          date: new Date(Date.now() - 86400000 * 14).toISOString(), // 14 days ago
          author: "Ana Martínez"
        }
      ];
    } catch (error) {
      console.error("Error getting blog posts:", error);
      throw error;
    }
  }
  
  // Helper methods
  
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Haversine formula to calculate distance between two coordinates in kilometers
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    
    // Round to 1 decimal place
    return Math.round(distance * 10) / 10;
  }
  
  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
  
  shuffleArray<T>(array: T[]): T[] {
    // Fisher-Yates shuffle algorithm
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
}

// Export an instance of the storage implementation to use
export const storage = new DatabaseStorage();

// Firebase implementation of storage
// This class is deprecated and should not be used
// It's kept for reference only and will be removed in the future
/* 
// Commented out Firebase implementation to avoid compilation errors
class FirebaseStorage implements IStorage {
  // Users
  async getAllUsers(): Promise<User[]> {
    try {
      const usersRef = collection(db, "users");
      const querySnapshot = await getDocs(usersRef);
      
      const users: User[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: data.id,
          firebaseUid: data.firebaseUid,
          username: data.username,
          email: data.email,
          displayName: data.displayName,
          photoURL: data.photoURL,
          bio: data.bio,
          role: data.role,
          location: data.location,
          latitude: data.latitude,
          longitude: data.longitude,
          skills: data.skills || [],
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString()
        });
      });
      
      return users;
    } catch (error) {
      console.error("Error getting users:", error);
      throw error;
    }
  }
  
  async getUser(id: number): Promise<User | undefined> {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("id", "==", id));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return undefined;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        id: data.id,
        firebaseUid: data.firebaseUid,
        username: data.username,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        bio: data.bio,
        role: data.role,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        skills: data.skills || [],
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString()
      };
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return undefined;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        id: data.id,
        firebaseUid: data.firebaseUid,
        username: data.username,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        bio: data.bio,
        role: data.role,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        skills: data.skills || [],
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString()
      };
    } catch (error) {
      console.error("Error getting user by username:", error);
      throw error;
    }
  }
  
  async getUserByFirebaseUid(uid: string): Promise<User | undefined> {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("firebaseUid", "==", uid));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return undefined;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        id: data.id,
        firebaseUid: data.firebaseUid,
        username: data.username,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        bio: data.bio,
        role: data.role,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        skills: data.skills || [],
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString()
      };
    } catch (error) {
      console.error("Error getting user by firebase UID:", error);
      throw error;
    }
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    try {
      // Check if username is already taken
      const existingUser = await this.getUserByUsername(userData.username);
      if (existingUser) {
        throw new Error("Username already taken");
      }
      
      // Check if user with this firebase UID already exists
      const existingFirebaseUser = await this.getUserByFirebaseUid(userData.firebaseUid);
      if (existingFirebaseUser) {
        throw new Error("User already exists");
      }
      
      // Get the next ID
      const usersRef = collection(db, "users");
      const querySnapshot = await getDocs(usersRef);
      const nextId = querySnapshot.size + 1;
      
      // Create user object
      const user: User = {
        id: nextId,
        firebaseUid: userData.firebaseUid,
        username: userData.username,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL || null,
        bio: userData.bio || null,
        role: userData.role || null,
        location: userData.location || null,
        latitude: userData.latitude || null,
        longitude: userData.longitude || null,
        skills: userData.skills || [],
        createdAt: new Date().toISOString()
      };
      
      // Add to Firestore
      await addDoc(usersRef, {
        ...user,
        createdAt: serverTimestamp()
      });
      
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }
  
  async updateUser(firebaseUid: string, userData: Partial<User>): Promise<User> {
    try {
      // Find user by firebase UID
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("firebaseUid", "==", firebaseUid));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error("User not found");
      }
      
      const userDoc = querySnapshot.docs[0];
      const userRef = doc(db, "users", userDoc.id);
      
      // Check if username is being changed and is already taken
      if (userData.username) {
        const existingUser = await this.getUserByUsername(userData.username);
        if (existingUser && existingUser.firebaseUid !== firebaseUid) {
          throw new Error("Username already taken");
        }
      }
      
      // Update user data
      await updateDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp()
      });
      
      // Get updated user
      const updatedUserDoc = await getDoc(userRef);
      const updatedData = updatedUserDoc.data();
      
      return {
        id: updatedData.id,
        firebaseUid: updatedData.firebaseUid,
        username: updatedData.username,
        email: updatedData.email,
        displayName: updatedData.displayName,
        photoURL: updatedData.photoURL,
        bio: updatedData.bio,
        role: updatedData.role,
        location: updatedData.location,
        latitude: updatedData.latitude,
        longitude: updatedData.longitude,
        skills: updatedData.skills || [],
        createdAt: updatedData.createdAt?.toDate().toISOString() || new Date().toISOString()
      };
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }
  
  async deleteUser(firebaseUid: string): Promise<void> {
    try {
      // Find user by firebase UID
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("firebaseUid", "==", firebaseUid));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error("User not found");
      }
      
      const userDoc = querySnapshot.docs[0];
      
      // Delete user from Firestore
      await deleteDoc(doc(db, "users", userDoc.id));
      
      // Delete user from Firebase Auth
      await auth.deleteUser(firebaseUid);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }
  
  // Artists
  async getAllArtists(): Promise<Artist[]> {
    try {
      const artistsRef = collection(db, "artists");
      const querySnapshot = await getDocs(artistsRef);
      
      const artists: Artist[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        artists.push({
          id: data.id,
          userId: data.userId,
          category: data.category,
          subcategory: data.subcategory,
          rating: data.rating,
          reviewCount: data.reviewCount || 0,
          minPrice: data.minPrice,
          maxPrice: data.maxPrice,
          priceUnit: data.priceUnit,
          gallery: data.gallery || [],
          availability: data.availability
        });
      });
      
      return artists;
    } catch (error) {
      console.error("Error getting artists:", error);
      throw error;
    }
  }
  
  async getArtist(id: number): Promise<Artist | undefined> {
    try {
      // Find artist
      const artistsRef = collection(db, "artists");
      const q = query(artistsRef, where("id", "==", id));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return undefined;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      // Get user data for the artist
      const user = await this.getUser(data.userId);
      
      // Combine artist and user data
      return {
        id: data.id,
        userId: data.userId,
        category: data.category,
        subcategory: data.subcategory,
        rating: data.rating,
        reviewCount: data.reviewCount || 0,
        minPrice: data.minPrice,
        maxPrice: data.maxPrice,
        priceUnit: data.priceUnit,
        gallery: data.gallery || [],
        availability: data.availability,
        // Include user data
        displayName: user?.displayName,
        photoURL: user?.photoURL,
        bio: user?.bio,
        location: user?.location,
        role: user?.role,
        skills: user?.skills
      };
    } catch (error) {
      console.error("Error getting artist:", error);
      throw error;
    }
  }
  
  async getRecommendedArtists(lat?: number, lng?: number): Promise<any[]> {
    try {
      // Get all artists
      const artistsRef = collection(db, "artists");
      const querySnapshot = await getDocs(artistsRef);
      
      const artists: any[] = [];
      const userPromises: Promise<User | undefined>[] = [];
      
      // Collect all artists and fetch user data
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        artists.push({
          id: data.id,
          userId: data.userId,
          category: data.category,
          subcategory: data.subcategory,
          rating: data.rating,
          reviewCount: data.reviewCount || 0,
          minPrice: data.minPrice,
          maxPrice: data.maxPrice,
          priceUnit: data.priceUnit
        });
        
        userPromises.push(this.getUser(data.userId));
      });
      
      // Wait for all user data to be fetched
      const users = await Promise.all(userPromises);
      
      // Combine artist and user data
      const recommendedArtists = artists.map((artist, index) => {
        const user = users[index];
        
        // Calculate distance if coordinates are provided
        let distance = null;
        if (lat && lng && user?.latitude && user?.longitude) {
          distance = this.calculateDistance(lat, lng, user.latitude, user.longitude);
        }
        
        return {
          ...artist,
          displayName: user?.displayName,
          photoURL: user?.photoURL,
          location: user?.location,
          role: user?.role,
          distance
        };
      });
      
      // Sort by distance if coordinates are provided, otherwise by rating
      if (lat && lng) {
        recommendedArtists.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      } else {
        recommendedArtists.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }
      
      // Return top 10 recommended artists
      return recommendedArtists.slice(0, 10);
    } catch (error) {
      console.error("Error getting recommended artists:", error);
      throw error;
    }
  }
  
  async getArtistsForExplorer(lat?: number, lng?: number): Promise<any[]> {
    try {
      // Similar to getRecommendedArtists, but return all artists
      const artistsRef = collection(db, "artists");
      const querySnapshot = await getDocs(artistsRef);
      
      const artists: any[] = [];
      const userPromises: Promise<User | undefined>[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        artists.push({
          id: data.id,
          userId: data.userId,
          category: data.category,
          subcategory: data.subcategory,
          rating: data.rating,
          reviewCount: data.reviewCount || 0,
          minPrice: data.minPrice,
          maxPrice: data.maxPrice,
          priceUnit: data.priceUnit
        });
        
        userPromises.push(this.getUser(data.userId));
      });
      
      const users = await Promise.all(userPromises);
      
      // Combine artist and user data
      const explorerArtists = artists.map((artist, index) => {
        const user = users[index];
        
        // Calculate distance if coordinates are provided
        let distance = null;
        if (lat && lng && user?.latitude && user?.longitude) {
          distance = this.calculateDistance(lat, lng, user.latitude, user.longitude);
        }
        
        // Randomly generate age (for display purposes only)
        const age = Math.floor(Math.random() * 20) + 20; // Random age between 20-40
        
        return {
          ...artist,
          displayName: user?.displayName,
          photoURL: user?.photoURL,
          location: user?.location,
          role: user?.role,
          distance,
          age
        };
      });
      
      // Shuffle array for explorer view
      return this.shuffleArray(explorerArtists);
    } catch (error) {
      console.error("Error getting artists for explorer:", error);
      throw error;
    }
  }
  
  async createArtist(artistData: InsertArtist): Promise<Artist> {
    try {
      // Check if user exists
      const user = await this.getUser(artistData.userId);
      if (!user) {
        throw new Error("User not found");
      }
      
      // Get the next ID
      const artistsRef = collection(db, "artists");
      const querySnapshot = await getDocs(artistsRef);
      const nextId = querySnapshot.size + 1;
      
      // Create artist object
      const artist: Artist = {
        id: nextId,
        userId: artistData.userId,
        category: artistData.category,
        subcategory: artistData.subcategory,
        rating: artistData.rating,
        reviewCount: artistData.reviewCount || 0,
        minPrice: artistData.minPrice,
        maxPrice: artistData.maxPrice,
        priceUnit: artistData.priceUnit,
        gallery: artistData.gallery || [],
        availability: artistData.availability
      };
      
      // Add to Firestore
      await addDoc(artistsRef, artist);
      
      return artist;
    } catch (error) {
      console.error("Error creating artist:", error);
      throw error;
    }
  }
  
  async getArtistServices(artistId: number): Promise<Service[]> {
    try {
      const servicesRef = collection(db, "services");
      const q = query(servicesRef, where("artistId", "==", artistId));
      const querySnapshot = await getDocs(q);
      
      const services: Service[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        services.push({
          id: data.id,
          artistId: data.artistId,
          name: data.name,
          description: data.description,
          price: data.price,
          unit: data.unit
        });
      });
      
      return services;
    } catch (error) {
      console.error("Error getting artist services:", error);
      throw error;
    }
  }
  
  async getArtistReviews(artistId: number): Promise<Review[]> {
    try {
      const reviewsRef = collection(db, "reviews");
      const q = query(reviewsRef, where("artistId", "==", artistId), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      
      const reviews: Review[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reviews.push({
          id: doc.id,
          artistId: data.artistId,
          userId: data.userId,
          userName: data.userName,
          userPhotoURL: data.userPhotoURL,
          rating: data.rating,
          comment: data.comment,
          date: data.date.toDate().toISOString()
        });
      });
      
      return reviews;
    } catch (error) {
      console.error("Error getting artist reviews:", error);
      throw error;
    }
  }
  
  // Services
  async createService(serviceData: InsertService): Promise<Service> {
    try {
      // Check if artist exists
      const artist = await this.getArtist(serviceData.artistId);
      if (!artist) {
        throw new Error("Artist not found");
      }
      
      // Get the next ID
      const servicesRef = collection(db, "services");
      const querySnapshot = await getDocs(servicesRef);
      const nextId = querySnapshot.size + 1;
      
      // Create service object
      const service: Service = {
        id: nextId,
        artistId: serviceData.artistId,
        name: serviceData.name,
        description: serviceData.description,
        price: serviceData.price,
        unit: serviceData.unit
      };
      
      // Add to Firestore
      await addDoc(servicesRef, service);
      
      return service;
    } catch (error) {
      console.error("Error creating service:", error);
      throw error;
    }
  }
  
  // Events
  async getAllEvents(): Promise<Event[]> {
    try {
      const eventsRef = collection(db, "events");
      const querySnapshot = await getDocs(eventsRef);
      
      const events: Event[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
          id: data.id,
          creatorId: data.creatorId,
          name: data.name,
          description: data.description,
          eventType: data.eventType,
          date: data.date.toDate().toISOString(),
          location: data.location,
          latitude: data.latitude,
          longitude: data.longitude,
          virtualLink: data.virtualLink,
          price: data.price,
          isFree: data.isFree,
          image: data.image,
          createdAt: data.createdAt.toDate().toISOString()
        });
      });
      
      return events;
    } catch (error) {
      console.error("Error getting events:", error);
      throw error;
    }
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    try {
      const eventsRef = collection(db, "events");
      const q = query(eventsRef, where("id", "==", id));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return undefined;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        id: data.id,
        creatorId: data.creatorId,
        name: data.name,
        description: data.description,
        eventType: data.eventType,
        date: data.date.toDate().toISOString(),
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        virtualLink: data.virtualLink,
        price: data.price,
        isFree: data.isFree,
        image: data.image,
        createdAt: data.createdAt.toDate().toISOString()
      };
    } catch (error) {
      console.error("Error getting event:", error);
      throw error;
    }
  }
  
  async getFeaturedEvents(): Promise<any[]> {
    try {
      const eventsRef = collection(db, "events");
      // Get events that are in the future
      const now = new Date();
      const q = query(eventsRef, where("date", ">", now), orderBy("date"), limit(5));
      const querySnapshot = await getDocs(q);
      
      const events: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
          id: data.id,
          name: data.name,
          description: data.description,
          date: data.date.toDate().toISOString(),
          image: data.image,
          isFree: data.isFree,
          price: data.price
        });
      });
      
      return events;
    } catch (error) {
      console.error("Error getting featured events:", error);
      throw error;
    }
  }
  
  async getNearbyEvents(lat?: number, lng?: number): Promise<any[]> {
    try {
      const eventsRef = collection(db, "events");
      // Get events that are in the future
      const now = new Date();
      const q = query(eventsRef, where("date", ">", now), orderBy("date"));
      const querySnapshot = await getDocs(q);
      
      const events: any[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Calculate distance if coordinates are provided
        let distance = null;
        if (lat && lng && data.latitude && data.longitude) {
          distance = this.calculateDistance(lat, lng, data.latitude, data.longitude);
        }
        
        events.push({
          id: data.id,
          name: data.name,
          description: data.description,
          eventType: data.eventType,
          date: data.date.toDate().toISOString(),
          location: data.location,
          virtualLink: data.virtualLink,
          price: data.price,
          isFree: data.isFree,
          image: data.image,
          distance
        });
      });
      
      // Sort by distance if coordinates are provided, otherwise by date
      if (lat && lng) {
        events.sort((a, b) => {
          // Virtual events first, then by distance
          if (a.eventType === 'virtual' && b.eventType !== 'virtual') return -1;
          if (a.eventType !== 'virtual' && b.eventType === 'virtual') return 1;
          if (a.eventType === 'virtual' && b.eventType === 'virtual') return 0;
          return (a.distance || Infinity) - (b.distance || Infinity);
        });
      }
      
      // Return top 5 nearby events
      return events.slice(0, 5);
    } catch (error) {
      console.error("Error getting nearby events:", error);
      throw error;
    }
  }
  
  async getEventsForExplorer(lat?: number, lng?: number): Promise<any[]> {
    try {
      // Similar to getNearbyEvents but returns more events and shuffles them
      const eventsRef = collection(db, "events");
      const now = new Date();
      const q = query(eventsRef, where("date", ">", now));
      const querySnapshot = await getDocs(q);
      
      const events: any[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Calculate distance if coordinates are provided
        let distance = null;
        if (lat && lng && data.latitude && data.longitude) {
          distance = this.calculateDistance(lat, lng, data.latitude, data.longitude);
        }
        
        events.push({
          id: data.id,
          name: data.name,
          description: data.description,
          eventType: data.eventType,
          date: data.date.toDate().toISOString(),
          location: data.location,
          virtualLink: data.virtualLink,
          price: data.price,
          isFree: data.isFree,
          image: data.image,
          distance
        });
      });
      
      // Shuffle events for explorer view
      return this.shuffleArray(events);
    } catch (error) {
      console.error("Error getting events for explorer:", error);
      throw error;
    }
  }
  
  async createEvent(eventData: InsertEvent): Promise<Event> {
    try {
      // Check if creator exists
      const user = await this.getUser(eventData.creatorId);
      if (!user) {
        throw new Error("Creator not found");
      }
      
      // Get the next ID
      const eventsRef = collection(db, "events");
      const querySnapshot = await getDocs(eventsRef);
      const nextId = querySnapshot.size + 1;
      
      // Create event object
      const event: Event = {
        id: nextId,
        creatorId: eventData.creatorId,
        name: eventData.name,
        description: eventData.description,
        eventType: eventData.eventType,
        date: eventData.date,
        location: eventData.location,
        latitude: eventData.latitude,
        longitude: eventData.longitude,
        virtualLink: eventData.virtualLink,
        price: eventData.price,
        isFree: eventData.isFree,
        image: eventData.image,
        createdAt: new Date().toISOString()
      };
      
      // Add to Firestore
      await addDoc(eventsRef, {
        ...event,
        date: Timestamp.fromDate(new Date(event.date)),
        createdAt: serverTimestamp()
      });
      
      return event;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  }
  
  async getEventAttendees(eventId: number): Promise<any[]> {
    try {
      const attendeesRef = collection(db, "eventAttendees");
      const q = query(attendeesRef, where("eventId", "==", eventId));
      const querySnapshot = await getDocs(q);
      
      const attendees: any[] = [];
      const userPromises: Promise<User | undefined>[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        userPromises.push(this.getUser(data.userId));
      });
      
      const users = await Promise.all(userPromises);
      
      users.forEach((user) => {
        if (user) {
          attendees.push({
            id: user.id,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: user.role
          });
        }
      });
      
      return attendees;
    } catch (error) {
      console.error("Error getting event attendees:", error);
      throw error;
    }
  }
  
  // Favorites
  async getFavoriteArtists(userId: number): Promise<any[]> {
    try {
      const favoritesRef = collection(db, "favorites");
      const q = query(favoritesRef, where("userId", "==", userId), where("artistId", "!=", null));
      const querySnapshot = await getDocs(q);
      
      const favorites: any[] = [];
      const artistPromises: Promise<Artist | undefined>[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        artistPromises.push(this.getArtist(data.artistId));
      });
      
      const artists = await Promise.all(artistPromises);
      
      // Filter out undefined artists
      return artists.filter(artist => artist !== undefined) as any[];
    } catch (error) {
      console.error("Error getting favorite artists:", error);
      throw error;
    }
  }
  
  async getFavoriteEvents(userId: number): Promise<any[]> {
    try {
      const favoritesRef = collection(db, "favorites");
      const q = query(favoritesRef, where("userId", "==", userId), where("eventId", "!=", null));
      const querySnapshot = await getDocs(q);
      
      const favorites: any[] = [];
      const eventPromises: Promise<Event | undefined>[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        eventPromises.push(this.getEvent(data.eventId));
      });
      
      const events = await Promise.all(eventPromises);
      
      // Filter out undefined events
      return events.filter(event => event !== undefined) as any[];
    } catch (error) {
      console.error("Error getting favorite events:", error);
      throw error;
    }
  }
  
  async createFavorite(favoriteData: InsertFavorite): Promise<Favorite> {
    try {
      // Check if user exists
      const user = await this.getUser(favoriteData.userId);
      if (!user) {
        throw new Error("User not found");
      }
      
      // Check if artist or event exists
      if (favoriteData.artistId) {
        const artist = await this.getArtist(favoriteData.artistId);
        if (!artist) {
          throw new Error("Artist not found");
        }
      } else if (favoriteData.eventId) {
        const event = await this.getEvent(favoriteData.eventId);
        if (!event) {
          throw new Error("Event not found");
        }
      } else {
        throw new Error("Artist ID or Event ID must be provided");
      }
      
      // Get the next ID
      const favoritesRef = collection(db, "favorites");
      const querySnapshot = await getDocs(favoritesRef);
      const nextId = querySnapshot.size + 1;
      
      // Create favorite object
      const favorite: Favorite = {
        id: nextId,
        userId: favoriteData.userId,
        artistId: favoriteData.artistId,
        eventId: favoriteData.eventId,
        createdAt: new Date().toISOString()
      };
      
      // Add to Firestore
      await addDoc(favoritesRef, {
        ...favorite,
        createdAt: serverTimestamp()
      });
      
      return favorite;
    } catch (error) {
      console.error("Error creating favorite:", error);
      throw error;
    }
  }
  
  async removeFavoriteArtist(userId: number, artistId: number): Promise<void> {
    try {
      const favoritesRef = collection(db, "favorites");
      const q = query(
        favoritesRef, 
        where("userId", "==", userId), 
        where("artistId", "==", artistId)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error("Favorite not found");
      }
      
      // Delete favorite
      await deleteDoc(doc(db, "favorites", querySnapshot.docs[0].id));
    } catch (error) {
      console.error("Error removing favorite artist:", error);
      throw error;
    }
  }
  
  async removeFavoriteEvent(userId: number, eventId: number): Promise<void> {
    try {
      const favoritesRef = collection(db, "favorites");
      const q = query(
        favoritesRef, 
        where("userId", "==", userId), 
        where("eventId", "==", eventId)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error("Favorite not found");
      }
      
      // Delete favorite
      await deleteDoc(doc(db, "favorites", querySnapshot.docs[0].id));
    } catch (error) {
      console.error("Error removing favorite event:", error);
      throw error;
    }
  }
  
  // Chats
  async getUserChats(userId: number): Promise<any[]> {
    try {
      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef, 
        where("user1Id", "==", userId)
      );
      const q2 = query(
        chatsRef, 
        where("user2Id", "==", userId)
      );
      
      const snapshot1 = await getDocs(q);
      const snapshot2 = await getDocs(q2);
      
      const chats: any[] = [];
      const messagesPromises: Promise<Message[]>[] = [];
      const userPromises: Promise<User | undefined>[] = [];
      
      // Process chats where user is user1
      snapshot1.forEach((doc) => {
        const data = doc.data();
        chats.push({
          id: data.id,
          user1Id: data.user1Id,
          user2Id: data.user2Id,
          createdAt: data.createdAt.toDate().toISOString()
        });
        
        messagesPromises.push(this.getChatMessages(data.id));
        userPromises.push(this.getUser(data.user2Id)); // Get the other user
      });
      
      // Process chats where user is user2
      snapshot2.forEach((doc) => {
        const data = doc.data();
        chats.push({
          id: data.id,
          user1Id: data.user1Id,
          user2Id: data.user2Id,
          createdAt: data.createdAt.toDate().toISOString()
        });
        
        messagesPromises.push(this.getChatMessages(data.id));
        userPromises.push(this.getUser(data.user1Id)); // Get the other user
      });
      
      // Wait for all messages and users to be fetched
      const allMessages = await Promise.all(messagesPromises);
      const users = await Promise.all(userPromises);
      
      // Combine chat data with messages and users
      return chats.map((chat, index) => {
        const messages = allMessages[index];
        const otherUser = users[index];
        
        return {
          ...chat,
          lastMessage: messages.length > 0 ? messages[0] : null,
          participants: [
            { id: userId },
            otherUser ? { 
              id: otherUser.id,
              displayName: otherUser.displayName,
              photoURL: otherUser.photoURL,
              online: Math.random() > 0.5 // Random online status
            } : null
          ].filter(Boolean)
        };
      });
    } catch (error) {
      console.error("Error getting user chats:", error);
      throw error;
    }
  }
  
  async getChat(id: number): Promise<any | undefined> {
    try {
      const chatsRef = collection(db, "chats");
      const q = query(chatsRef, where("id", "==", id));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return undefined;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      // Get both users
      const user1 = await this.getUser(data.user1Id);
      const user2 = await this.getUser(data.user2Id);
      
      return {
        id: data.id,
        user1Id: data.user1Id,
        user2Id: data.user2Id,
        createdAt: data.createdAt.toDate().toISOString(),
        participants: [
          user1 ? { 
            id: user1.id,
            displayName: user1.displayName,
            photoURL: user1.photoURL,
            online: Math.random() > 0.5 // Random online status
          } : null,
          user2 ? { 
            id: user2.id,
            displayName: user2.displayName,
            photoURL: user2.photoURL,
            online: Math.random() > 0.5 // Random online status
          } : null
        ].filter(Boolean)
      };
    } catch (error) {
      console.error("Error getting chat:", error);
      throw error;
    }
  }
  
  async createChat(user1Id: number, user2Id: number): Promise<any> {
    try {
      // Check if users exist
      const user1 = await this.getUser(user1Id);
      const user2 = await this.getUser(user2Id);
      
      if (!user1 || !user2) {
        throw new Error("One or both users not found");
      }
      
      // Check if chat already exists
      const chatsRef = collection(db, "chats");
      const q1 = query(
        chatsRef, 
        where("user1Id", "==", user1Id), 
        where("user2Id", "==", user2Id)
      );
      const q2 = query(
        chatsRef, 
        where("user1Id", "==", user2Id), 
        where("user2Id", "==", user1Id)
      );
      
      const snapshot1 = await getDocs(q1);
      const snapshot2 = await getDocs(q2);
      
      if (!snapshot1.empty || !snapshot2.empty) {
        // Chat already exists, return existing chat
        const existingDoc = snapshot1.empty ? snapshot2.docs[0] : snapshot1.docs[0];
        const existingData = existingDoc.data();
        
        return {
          id: existingData.id,
          user1Id: existingData.user1Id,
          user2Id: existingData.user2Id,
          createdAt: existingData.createdAt.toDate().toISOString(),
          participants: [
            { 
              id: user1.id,
              displayName: user1.displayName,
              photoURL: user1.photoURL
            },
            { 
              id: user2.id,
              displayName: user2.displayName,
              photoURL: user2.photoURL
            }
          ]
        };
      }
      
      // Get the next ID
      const querySnapshot = await getDocs(chatsRef);
      const nextId = querySnapshot.size + 1;
      
      // Create chat object
      const chat = {
        id: nextId,
        user1Id,
        user2Id,
        createdAt: new Date().toISOString()
      };
      
      // Add to Firestore
      await addDoc(chatsRef, {
        ...chat,
        createdAt: serverTimestamp()
      });
      
      return {
        ...chat,
        participants: [
          { 
            id: user1.id,
            displayName: user1.displayName,
            photoURL: user1.photoURL
          },
          { 
            id: user2.id,
            displayName: user2.displayName,
            photoURL: user2.photoURL
          }
        ]
      };
    } catch (error) {
      console.error("Error creating chat:", error);
      throw error;
    }
  }
  
  async getChatMessages(chatId: number): Promise<Message[]> {
    try {
      const messagesRef = collection(db, "messages");
      const q = query(
        messagesRef, 
        where("chatId", "==", chatId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      
      const messages: Message[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: data.id,
          chatId: data.chatId,
          senderId: data.senderId,
          content: data.content,
          createdAt: data.createdAt.toDate().toISOString(),
          read: data.read
        });
      });
      
      return messages;
    } catch (error) {
      console.error("Error getting chat messages:", error);
      throw error;
    }
  }
  
  async createMessage(messageData: InsertMessage): Promise<Message> {
    try {
      // Check if chat exists
      const chatsRef = collection(db, "chats");
      const q = query(chatsRef, where("id", "==", messageData.chatId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error("Chat not found");
      }
      
      // Get the next ID
      const messagesRef = collection(db, "messages");
      const messagesSnapshot = await getDocs(messagesRef);
      const nextId = messagesSnapshot.size + 1;
      
      // Create message object
      const message: Message = {
        id: nextId,
        chatId: messageData.chatId,
        senderId: messageData.senderId,
        content: messageData.content,
        createdAt: new Date().toISOString(),
        read: messageData.read || false
      };
      
      // Add to Firestore
      await addDoc(messagesRef, {
        ...message,
        createdAt: serverTimestamp()
      });
      
      return message;
    } catch (error) {
      console.error("Error creating message:", error);
      throw error;
    }
  }
  
  // Products
  async getAllProducts(): Promise<any[]> {
    try {
      const productsRef = collection(db, "products");
      const querySnapshot = await getDocs(productsRef);
      
      const products: any[] = [];
      const artistPromises: Promise<Artist | undefined>[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          id: data.id,
          artistId: data.artistId,
          name: data.name,
          description: data.description,
          price: data.price,
          image: data.image,
          createdAt: data.createdAt.toDate().toISOString()
        });
        
        artistPromises.push(this.getArtist(data.artistId));
      });
      
      const artists = await Promise.all(artistPromises);
      
      // Combine product and artist data
      return products.map((product, index) => {
        const artist = artists[index];
        
        return {
          ...product,
          artistName: artist?.displayName || "Unknown Artist"
        };
      });
    } catch (error) {
      console.error("Error getting products:", error);
      throw error;
    }
  }
  
  async createProduct(productData: InsertProduct): Promise<Product> {
    try {
      // Check if artist exists
      const artist = await this.getArtist(productData.artistId);
      if (!artist) {
        throw new Error("Artist not found");
      }
      
      // Get the next ID
      const productsRef = collection(db, "products");
      const querySnapshot = await getDocs(productsRef);
      const nextId = querySnapshot.size + 1;
      
      // Create product object
      const product: Product = {
        id: nextId,
        artistId: productData.artistId,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        image: productData.image,
        createdAt: new Date().toISOString()
      };
      
      // Add to Firestore
      await addDoc(productsRef, {
        ...product,
        createdAt: serverTimestamp()
      });
      
      return product;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }
  
  // Service Requests
  async createServiceRequest(requestData: InsertServiceRequest): Promise<ServiceRequest> {
    try {
      // Check if client exists
      const user = await this.getUser(requestData.clientId);
      if (!user) {
        throw new Error("Client not found");
      }
      
      // Get the next ID
      const requestsRef = collection(db, "serviceRequests");
      const querySnapshot = await getDocs(requestsRef);
      const nextId = querySnapshot.size + 1;
      
      // Create request object
      const request: ServiceRequest = {
        id: nextId,
        clientId: requestData.clientId,
        category: requestData.category,
        subcategory: requestData.subcategory,
        description: requestData.description,
        budget: requestData.budget,
        date: requestData.date,
        location: requestData.location,
        status: requestData.status || "open",
        createdAt: new Date().toISOString()
      };
      
      // Add to Firestore
      await addDoc(requestsRef, {
        ...request,
        date: request.date ? Timestamp.fromDate(new Date(request.date)) : null,
        createdAt: serverTimestamp()
      });
      
      return request;
    } catch (error) {
      console.error("Error creating service request:", error);
      throw error;
    }
  }
  
  // Search
  async searchArtists(query?: string, lat?: number, lng?: number, filters?: any): Promise<any[]> {
    try {
      // Get all artists
      let artists = await this.getAllArtists();
      const userPromises: Promise<User | undefined>[] = [];
      
      // Fetch user data for each artist
      artists.forEach(artist => {
        userPromises.push(this.getUser(artist.userId));
      });
      
      const users = await Promise.all(userPromises);
      
      // Combine artist and user data
      const artistsWithUserData = artists.map((artist, index) => {
        const user = users[index];
        
        // Calculate distance if coordinates are provided
        let distance = null;
        if (lat && lng && user?.latitude && user?.longitude) {
          distance = this.calculateDistance(lat, lng, user.latitude, user.longitude);
        }
        
        return {
          ...artist,
          displayName: user?.displayName,
          photoURL: user?.photoURL,
          bio: user?.bio,
          location: user?.location,
          role: user?.role,
          skills: user?.skills,
          distance
        };
      });
      
      // Apply search query if provided
      let filteredArtists = artistsWithUserData;
      if (query) {
        const lowerQuery = query.toLowerCase();
        filteredArtists = filteredArtists.filter(artist => {
          return (
            artist.displayName?.toLowerCase().includes(lowerQuery) ||
            artist.category?.toLowerCase().includes(lowerQuery) ||
            artist.subcategory?.toLowerCase().includes(lowerQuery) ||
            artist.location?.toLowerCase().includes(lowerQuery) ||
            artist.role?.toLowerCase().includes(lowerQuery) ||
            artist.skills?.some((skill: string) => skill.toLowerCase().includes(lowerQuery))
          );
        });
      }
      
      // Apply filters if provided
      if (filters) {
        if (filters.category) {
          filteredArtists = filteredArtists.filter(artist => 
            artist.category === filters.category
          );
        }
        
        if (filters.subcategory) {
          filteredArtists = filteredArtists.filter(artist => 
            artist.subcategory === filters.subcategory
          );
        }
        
        if (filters.priceRange) {
          filteredArtists = filteredArtists.filter(artist => 
            artist.minPrice >= filters.priceRange[0] && 
            (artist.maxPrice <= filters.priceRange[1] || filters.priceRange[1] === 0)
          );
        }
        
        if (filters.distance && lat && lng) {
          filteredArtists = filteredArtists.filter(artist => 
            artist.distance === null || artist.distance <= filters.distance
          );
        }
        
        // Handle date filters
        if (filters.dateFrom || filters.dateTo) {
          // Artists with availability that matches the date range
          // This is a simplified implementation
          // In a real app, you would check the artist's calendar
        }
      }
      
      // Sort results
      if (lat && lng) {
        // Sort by distance if coordinates are provided
        filteredArtists.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      } else {
        // Sort by rating otherwise
        filteredArtists.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }
      
      return filteredArtists;
    } catch (error) {
      console.error("Error searching artists:", error);
      throw error;
    }
  }
  
  async searchEvents(query?: string, lat?: number, lng?: number, filters?: any): Promise<any[]> {
    try {
      // Get all events
      let events = await this.getAllEvents();
      
      // Calculate distance for each event if coordinates are provided
      events = events.map(event => {
        let distance = null;
        if (lat && lng && event.latitude && event.longitude) {
          distance = this.calculateDistance(lat, lng, event.latitude, event.longitude);
        }
        
        return {
          ...event,
          distance
        };
      });
      
      // Apply search query if provided
      let filteredEvents = events;
      if (query) {
        const lowerQuery = query.toLowerCase();
        filteredEvents = filteredEvents.filter(event => {
          return (
            event.name.toLowerCase().includes(lowerQuery) ||
            event.description.toLowerCase().includes(lowerQuery) ||
            event.location?.toLowerCase().includes(lowerQuery)
          );
        });
      }
      
      // Apply filters if provided
      if (filters) {
        if (filters.eventType) {
          filteredEvents = filteredEvents.filter(event => 
            event.eventType === filters.eventType
          );
        }
        
        if (filters.priceRange) {
          filteredEvents = filteredEvents.filter(event => 
            (event.isFree && filters.priceRange[0] === 0) || 
            (!event.isFree && event.price >= filters.priceRange[0] && 
             (event.price <= filters.priceRange[1] || filters.priceRange[1] === 0))
          );
        }
        
        if (filters.distance && lat && lng) {
          filteredEvents = filteredEvents.filter(event => 
            event.eventType === 'virtual' || 
            event.distance === null || 
            event.distance <= filters.distance
          );
        }
        
        // Handle date filters
        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom);
          filteredEvents = filteredEvents.filter(event => 
            new Date(event.date) >= fromDate
          );
        }
        
        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo);
          filteredEvents = filteredEvents.filter(event => 
            new Date(event.date) <= toDate
          );
        }
      }
      
      // Sort results
      filteredEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      return filteredEvents;
    } catch (error) {
      console.error("Error searching events:", error);
      throw error;
    }
  }
  
  // Blog
  async getBlogPosts(): Promise<BlogPost[]> {
    try {
      const postsRef = collection(db, "blogPosts");
      const q = query(postsRef, orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      
      const posts: BlogPost[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        posts.push({
          id: doc.id,
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          imageUrl: data.imageUrl,
          date: data.date.toDate().toISOString(),
          author: data.author
        });
      });
      
      return posts;
    } catch (error) {
      console.error("Error getting blog posts:", error);
      
      // Return sample blog posts if no posts are found
      return [
        {
          id: "1",
          title: "10 Tips para Músicos Independientes",
          excerpt: "Consejos prácticos para destacar en la escena musical independiente y conseguir más presentaciones.",
          content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
          imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=300&q=80",
          date: new Date().toISOString(),
          author: "María González"
        },
        {
          id: "2",
          title: "La Evolución de la Industria Musical en 2023",
          excerpt: "Un análisis de las tendencias actuales y el futuro de la industria musical en la era digital.",
          content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
          imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=300&q=80",
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          author: "Carlos Rodríguez"
        }
      ];
    }
  }
  
  // Helper methods
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }
  
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
  
  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
}
*/
