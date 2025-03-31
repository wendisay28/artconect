import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "@/context/location-context";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import SearchFilters from "@/components/search-filters";
import SwipeableCard from "@/components/swipeable-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SlidersHorizontal, Smile, MoveRight } from "lucide-react";

export default function ExplorerPage() {
  const [activeTab, setActiveTab] = useState<"artists" | "events">("artists");
  const [currentIndex, setCurrentIndex] = useState(0);
  const { locationData } = useLocation();
  const { toast } = useToast();

  // Define types for items
  interface ExplorerItem {
    id: string | number;
    name?: string;
    displayName?: string;
    photoURL?: string;
    image?: string;
    role?: string;
    category?: string;
    location?: string;
    distance?: number;
    minPrice?: number;
    maxPrice?: number;
    priceUnit?: string;
    price?: number;
    isFree?: boolean;
    age?: number;
  }

  // Fetch artists or events based on active tab
  const { data: items, isLoading, refetch } = useQuery<ExplorerItem[]>({
    queryKey: [activeTab === "artists" ? '/api/artists/explore' : '/api/events/explore', 
               locationData?.coordinates?.latitude, 
               locationData?.coordinates?.longitude],
    throwOnError: false,
  });

  // Importamos lo necesario para hacer la petición
  const [loadingLike, setLoadingLike] = useState(false);
  const { user } = useAuth();

  const handleLike = async (id: string | number) => {
    if (!user) {
      toast({
        title: "Necesitas iniciar sesión",
        description: "Para añadir a favoritos, inicia sesión primero",
      });
      return;
    }

    if (!id) {
      console.error('ID inválido:', id);
      return;
    }

    try {
      setLoadingLike(true);

      // Creamos el objeto de favorito según el tipo
    } catch (error) {
      console.error('Error al dar like:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar en favoritos"
      });
    } finally {
      setLoadingLike(false);
    }
      const favoriteData = {
        type: "artists", // Siempre es "artists" para artistas
        itemId: parseInt(id), // Convertir a número
      };

      // Hacemos la petición para guardar en favoritos
      try {
        await apiRequest("POST", "/api/favorites", favoriteData);
        
        // Refrescamos la caché de favoritos
        queryClient.invalidateQueries({ queryKey: [`/api/favorites/${activeTab}`] });
        
        toast({
          title: "¡Éxito!",
          description: "Se ha añadido a favoritos",
        });
      } catch (error) {
        console.error('Error al añadir a favoritos:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo añadir a favoritos",
        });
      }

      toast({
        title: `${activeTab === "artists" ? "Artista" : "Evento"} guardado`,
        description: `Se ha añadido a tus favoritos`,
      });
    } catch (error) {
      console.error("Error al guardar en favoritos:", error);
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "No se pudo añadir a favoritos, inténtalo de nuevo",
      });
    } finally {
      setLoadingLike(false);
      goToNextItem();
    }
  };

  const handleDislike = (id: string) => {
    // Skip to next item
    goToNextItem();
  };

  const goToNextItem = () => {
    if (items && currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleApplyFilters = (filters: any) => {
    // Apply filters and refetch data
    refetch();
    toast({
      title: "Filtros aplicados",
      description: "Los resultados han sido actualizados",
    });
  };

  const formatPriceRange = (minPrice: number, maxPrice: number, unit: string = "hora") => {
    const formatter = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    if (maxPrice) {
      return `${formatter.format(minPrice)} - ${formatter.format(maxPrice)} / ${unit}`;
    }
    return `${formatter.format(minPrice)} / ${unit}`;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="font-bold text-2xl">Explorar</h1>

        <div className="flex items-center">
          <SearchFilters 
            onApplyFilters={handleApplyFilters}
            filterType={activeTab}
            triggerButton={
              <Button variant="outline" size="sm" className="mr-2">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            }
          />
          <div className="flex border border-border rounded-full">
            <Button 
              variant={activeTab === "artists" ? "default" : "ghost"} 
              className="rounded-full"
              onClick={() => setActiveTab("artists")}
            >
              Artistas
            </Button>
            <Button 
              variant={activeTab === "events" ? "default" : "ghost"} 
              className="rounded-full"
              onClick={() => setActiveTab("events")}
            >
              Eventos
            </Button>
          </div>
        </div>
      </header>

      {/* Swipeable Cards Area */}
      <div className="relative h-[calc(100vh-13rem)] max-h-[700px] mx-auto max-w-md mt-4">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4 mx-auto"></div>
              <p>Cargando {activeTab === "artists" ? "artistas" : "eventos"}...</p>
            </div>
          </div>
        ) : items && items.length > 0 ? (
          <div className="relative w-full h-full">
            {items.map((item, idx) => (
              idx >= currentIndex && (
                <SwipeableCard
                  key={item.id}
                  id={item.id}
                  imageUrl={item.photoURL || item.image}
                  name={item.name || item.displayName}
                  age={item.age}
                  role={item.role || item.category}
                  location={item.location}
                  distance={item.distance}
                  priceRange={
                    activeTab === "artists" 
                      ? formatPriceRange(item.minPrice, item.maxPrice, item.priceUnit) 
                      : item.isFree ? "Gratis" : formatPriceRange(item.price, 0, "entrada")
                  }
                  onLike={handleLike}
                  onDislike={handleDislike}
                  isLast={idx === items.length - 1}
                />
              )
            ))}

            {/* Empty state (shown when all cards are swiped) */}
            {currentIndex >= items.length && (
              <Card className="absolute inset-0 rounded-xl overflow-hidden flex flex-col items-center justify-center text-center p-6">
                <Smile className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-xl mb-2">
                  ¡Has visto todos los perfiles por hoy!
                </h3>
                <p className="text-muted-foreground mb-6">
                  Vuelve más tarde para descubrir nuevos {activeTab === "artists" ? "artistas" : "eventos"}
                </p>
                <Button onClick={() => {
                  setCurrentIndex(0);
                  refetch();
                }}>
                  Ajustar filtros
                </Button>
              </Card>
            )}
          </div>
        ) : (
          <Card className="absolute inset-0 rounded-xl overflow-hidden flex flex-col items-center justify-center text-center p-6">
            <div className="text-muted-foreground mb-4 text-7xl">🔍</div>
            <h3 className="font-semibold text-xl mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-muted-foreground mb-6">
              Intenta ajustar los filtros o cambiar tu ubicación
            </p>
            <SearchFilters 
              onApplyFilters={handleApplyFilters}
              filterType={activeTab}
              triggerButton={
                <Button>
                  Ajustar filtros
                  <MoveRight className="ml-2 h-4 w-4" />
                </Button>
              }
            />
          </Card>
        )}
      </div>
    </div>
  );
}