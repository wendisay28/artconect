import { InsertProduct, InsertServiceRequest, Product, ServiceRequest } from '@/shared/schema';

class FixStorage {
  async getArtistsForExplorer(lat?: number, lng?: number): Promise<any[]> {
    return [
      {
        id: 1,
        name: "Maria González",
        role: "Pintora",
        minPrice: 250000,
        photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format"
      },
      {
        id: 2,
        name: "Carlos Rodríguez",
        role: "Músico",
        minPrice: 350000,
        photoURL: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=800&auto=format"
      },
      {
        id: 3,
        name: "Ana Martinez",
        role: "Escultora",
        minPrice: 450000,
        photoURL: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format"
      }
    ];
  }

  async getFeaturedEvents(): Promise<any[]> {
    return [
      {
        id: 1,
        name: "Festival de Arte Contemporáneo",
        date: new Date(Date.now() + 86400000 * 10).toISOString(),
        location: "Centro Cultural La Candelaria",
        price: 75000,
        image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&auto=format",
        isFree: false,
        description: "Una experiencia única de arte contemporáneo"
      },
      {
        id: 2,
        name: "Concierto de Jazz en Vivo",
        date: new Date(Date.now() + 86400000 * 15).toISOString(),
        location: "Teatro Nacional",
        price: 120000,
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format",
        isFree: false,
        description: "Una noche mágica con los mejores músicos de jazz"
      }
    ];
  }

  async getBlogPosts(): Promise<any[]> {
    return [
      {
        id: "1",
        title: "Los 10 Festivales de Arte Más Importantes de Colombia",
        excerpt: "Un recorrido por los eventos culturales más destacados del país y sus artistas más representativos.",
        imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&q=80",
        date: new Date("2024-02-15").toISOString(),
        category: "Eventos"
      },
      {
        id: "2",
        title: "Tendencias en Arte Digital para 2024",
        excerpt: "Descubre cómo la tecnología está transformando el mundo del arte y las nuevas formas de expresión.",
        imageUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&q=80",
        date: new Date("2024-02-10").toISOString(),
        category: "Tecnología"
      },
      {
        id: "3",
        title: "Guía para Músicos Independientes",
        excerpt: "Todo lo que necesitas saber para impulsar tu carrera musical de manera profesional.",
        imageUrl: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?auto=format&q=80",
        date: new Date("2024-02-05").toISOString(),
        category: "Música"
      }
    ];
  }

  async getEventsForExplorer(lat?: number, lng?: number): Promise<any[]> {
    return [
      {
        id: 1,
        name: "Festival de Jazz bajo las Estrellas",
        description: "Una noche mágica de jazz contemporáneo con artistas internacionales",
        date: new Date("2024-03-15T19:00:00").toISOString(),
        location: "Parque de la 93, Bogotá",
        price: 150000,
        isFree: false,
        eventType: "presencial",
        image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&q=80",
        category: "Música"
      },
      {
        id: 2,
        name: "Exposición de Arte Digital",
        description: "Muestra interactiva de las últimas tendencias en arte digital",
        date: new Date("2024-03-20T10:00:00").toISOString(),
        location: "Museo de Arte Moderno, Medellín",
        price: 45000,
        isFree: false,
        eventType: "presencial",
        image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&q=80",
        category: "Arte"
      }
    ];
  }

  async getProducts(): Promise<any[]> {
    return [
      {
        id: 1,
        name: "Guitarra Acústica Artesanal",
        description: "Guitarra hecha a mano con maderas seleccionadas",
        price: 2500000,
        image: "https://images.unsplash.com/photo-1555638769-a5f99464b3c0?auto=format&q=80",
        artistName: "Carlos Martínez",
        category: "Instrumentos"
      },
      {
        id: 2,
        name: "Óleo sobre Lienzo - Atardecer Urbano",
        description: "Obra original, técnica mixta",
        price: 1800000,
        image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&q=80",
        artistName: "María González",
        category: "Pintura"
      },
      {
        id: 3,
        name: "Arte Digital - Cosmos NFT",
        description: "Colección limitada de arte digital",
        price: 500000,
        image: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&q=80",
        artistName: "Digital Dreams Studio",
        category: "Arte Digital"
      },
      {
        id: 4,
        name: "Libro - Historia del Arte Colombiano",
        description: "Edición especial ilustrada",
        price: 180000,
        image: "https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&q=80",
        artistName: "Editorial Cultura",
        category: "Libros"
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
}

export const storage = new FixStorage();