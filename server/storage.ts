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
        title: "El arte urbano en Colombia",
        excerpt: "Descubre cómo el arte callejero está transformando nuestras ciudades",
        imageUrl: "https://images.unsplash.com/photo-1571432574544-25dfb9c0f27c?w=800&auto=format",
        date: new Date().toISOString(),
        content: "El arte urbano se ha convertido en una forma poderosa de expresión..."
      },
      {
        id: "2",
        title: "Música independiente en auge",
        excerpt: "La escena musical independiente está creciendo más que nunca",
        imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format",
        date: new Date().toISOString(),
        content: "Los artistas independientes están encontrando nuevas formas..."
      }
    ];
  }

  async getProducts(): Promise<any[]> {
    return [
      {
        id: 1,
        name: "Óleo sobre lienzo - Atardecer",
        price: 450000,
        image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&auto=format",
        artistName: "Maria González",
        category: "Pintura"
      },
      {
        id: 2,
        name: "Guitarra Acústica Artesanal",
        price: 890000,
        image: "https://images.unsplash.com/photo-1556449895-a33c9dba33dd?w=800&auto=format",
        artistName: "Carlos Rodríguez",
        category: "Instrumentos"
      },
      {
        id: 3,
        name: "Arte y Cultura en Colombia - Libro",
        price: 85000,
        image: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=800&auto=format",
        artistName: "Editorial Cultural",
        category: "Libros"
      },
      {
        id: 4,
        name: "Escultura en Bronce - Libertad",
        price: 1200000,
        image: "https://images.unsplash.com/photo-1561839561-b13bcfe95249?w=800&auto=format",
        artistName: "Ana Martinez",
        category: "Escultura"
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