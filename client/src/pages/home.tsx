import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "@/context/location-context";
import BannerCarousel from "@/components/banner-carousel";
import ArtistCard from "@/components/artist-card";
import EventCard from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, Search, Bell, BookmarkCheck, Share2 } from "lucide-react";

// Definición de tipos para los datos de API
interface Event {
  id: number;
  name: string;
  description?: string;
  date: string;
  location: string;
  price: number;
  isFree: boolean;
  eventType: string;
  image?: string;
}

interface Artist {
  id: number;
  name: string;
  role: string;
  minPrice: number;
  photoURL?: string;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  date: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  artistName: string;
}

// Importar la interfaz BannerItem
interface BannerItem {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
}

export default function HomePage() {
  const { locationData } = useLocation();
  const { toast } = useToast();
  
  const { data: featuredEvents, isLoading: isLoadingEvents } = useQuery<Event[]>({
    queryKey: ['/api/events/featured'],
    throwOnError: false,
  });
  
  const { data: recommendedArtists, isLoading: isLoadingArtists } = useQuery<Artist[]>({
    queryKey: ['/api/artists/recommended', locationData?.coordinates?.latitude, locationData?.coordinates?.longitude],
    throwOnError: false,
  });
  
  const { data: nearbyEvents, isLoading: isLoadingNearbyEvents } = useQuery<Event[]>({
    queryKey: ['/api/events/nearby', locationData?.coordinates?.latitude, locationData?.coordinates?.longitude],
    throwOnError: false,
  });
  
  const { data: blogPosts, isLoading: isLoadingBlogPosts } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog/posts'],
    throwOnError: false,
  });
  
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    throwOnError: false,
  });

  const handleSaveEvent = (id: string) => {
    toast({
      title: "Evento guardado",
      description: "El evento ha sido añadido a tus favoritos",
    });
  };

  const handleShareEvent = (id: string) => {
    // Implement share functionality
    toast({
      title: "Compartir evento",
      description: "Funcionalidad de compartir en desarrollo",
    });
  };

  // Inicializar los arrays para evitar errores de undefined
  const safeEvents = featuredEvents || [];
  const safeArtists = recommendedArtists || [];
  const safeNearbyEvents = nearbyEvents || [];
  const safeBlogPosts = blogPosts || [];
  const safeProducts = products || [];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header with logo and search */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="font-bold text-2xl text-primary">ArtistConnect</h1>
        
        <div className="flex items-center space-x-2">
          <Link href="/search">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Search className="h-5 w-5" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </header>
      
      {/* Banner Section */}
      <section className="mb-8">
        {isLoadingEvents ? (
          <Skeleton className="h-44 w-full rounded-xl" />
        ) : (
          <BannerCarousel 
            items={safeEvents.map(event => ({
              id: String(event.id),
              imageUrl: event.image || '',
              title: event.name,
              subtitle: event.description ? event.description.slice(0, 60) + (event.description.length > 60 ? '...' : '') : ''
            }))}
          />
        )}
      </section>
      
      {/* Recommendations Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-xl">Artistas Recomendados</h2>
          <Link href="/explore" className="block">
            <span className="text-primary text-sm flex items-center cursor-pointer">
              Ver todos
              <ChevronRight className="h-4 w-4 ml-1" />
            </span>
          </Link>
        </div>
        
        <div className="overflow-x-auto pb-2 -mx-4 px-4">
          <div className="flex space-x-4">
            {isLoadingArtists ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-40">
                  <Skeleton className="h-40 w-40 rounded-lg" />
                  <Skeleton className="h-4 w-32 mt-2" />
                  <Skeleton className="h-3 w-20 mt-1" />
                </div>
              ))
            ) : (
              safeArtists.map(artist => (
                <div key={artist.id} className="flex-shrink-0 w-40">
                  <ArtistCard
                    id={String(artist.id)}
                    name={artist.name}
                    role={artist.role}
                    price={artist.minPrice}
                    priceUnit="hora"
                    imageUrl={artist.photoURL || ''}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </section>
      
      {/* Events Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-xl">Eventos Cercanos</h2>
          <Link href="/search?type=events" className="block">
            <span className="text-primary text-sm flex items-center cursor-pointer">
              Ver todos
              <ChevronRight className="h-4 w-4 ml-1" />
            </span>
          </Link>
        </div>
        
        {isLoadingNearbyEvents ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-lg" />
            ))}
          </div>
        ) : safeNearbyEvents.length === 0 ? (
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-muted-foreground">No hay eventos cercanos disponibles</p>
              <p className="text-sm text-muted-foreground mt-1">Intenta cambiar tu ubicación o buscar en un área más amplia</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeNearbyEvents.map(event => (
              <EventCard
                key={event.id}
                id={String(event.id)}
                name={event.name}
                date={new Date(event.date)}
                location={event.location}
                price={event.price}
                imageUrl={event.image || ''}
                isFree={event.isFree}
                isVirtual={event.eventType === 'virtual'}
                onSave={handleSaveEvent}
                onShare={handleShareEvent}
              />
            ))}
          </div>
        )}
      </section>
      
      {/* Blog Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-xl">Blog & Noticias</h2>
          <Link href="/blog" className="block">
            <span className="text-primary text-sm flex items-center cursor-pointer">
              Ver todo
              <ChevronRight className="h-4 w-4 ml-1" />
            </span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoadingBlogPosts ? (
            Array(2).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-40 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-3 w-16 mb-1" />
                  <Skeleton className="h-5 w-full mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mt-1" />
                </CardContent>
              </Card>
            ))
          ) : (
            safeBlogPosts.map(post => (
              <Card key={post.id} className="overflow-hidden">
                <div className="relative h-40">
                  <img 
                    src={post.imageUrl || "https://via.placeholder.com/600x300"}
                    alt={post.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <p className="text-muted-foreground text-xs mb-1">
                    {new Date(post.date).toLocaleDateString('es-ES', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                  <h3 className="font-semibold">{post.title}</h3>
                  <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <Link href={`/blog/${post.id}`} className="block">
                    <span className="text-primary text-sm mt-2 inline-block cursor-pointer">
                      Leer más
                    </span>
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>
      
      {/* Shop Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-xl">Tienda de Artistas</h2>
          <Link href="/shop" className="block">
            <span className="text-primary text-sm flex items-center cursor-pointer">
              Ver todo
              <ChevronRight className="h-4 w-4 ml-1" />
            </span>
          </Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {isLoadingProducts ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-40 w-full rounded-lg aspect-square" />
                <Skeleton className="h-4 w-3/4 mt-2" />
                <Skeleton className="h-3 w-1/2 mt-1" />
                <Skeleton className="h-4 w-1/3 mt-1" />
              </div>
            ))
          ) : (
            safeProducts.map(product => (
              <Card key={product.id} className="overflow-hidden">
                <div className="relative pb-[100%]">
                  <img 
                    src={product.image || "https://via.placeholder.com/300"}
                    alt={product.name} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-2">
                  <h3 className="font-medium text-sm truncate">{product.name}</h3>
                  <p className="text-muted-foreground text-xs">Por: {product.artistName}</p>
                  <p className="text-primary font-medium mt-1">
                    {new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(product.price)}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
