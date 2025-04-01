import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "@/context/location-context";
import { useToast } from "@/hooks/use-toast";
import SearchFilters from "@/components/search-filters";
import SwipeableCard from "@/components/swipeable-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SlidersHorizontal, Smile } from "lucide-react";

export default function ExplorerPage() {
  const [activeTab, setActiveTab] = useState<"artists" | "events">("artists");
  const [currentIndex, setCurrentIndex] = useState(0);
  const { locationData } = useLocation();
  const { toast } = useToast();

  const { data: items = [], isLoading, refetch } = useQuery({
    queryKey: [
      activeTab === "artists" ? '/api/artists/explore' : '/api/events/explore',
      locationData?.coordinates?.latitude,
      locationData?.coordinates?.longitude
    ],
    enabled: !!locationData?.coordinates,
  });

  const handleLike = async (id: string | number) => {
    try {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab === "artists" ? "artist" : "event",
          itemId: id
        })
      });

      toast({
        title: "¡Guardado!",
        description: `${activeTab === "artists" ? "Artista" : "Evento"} añadido a favoritos`,
      });

      goToNextItem();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar en favoritos"
      });
    }
  };

  const handleDislike = () => {
    goToNextItem();
  };

  const goToNextItem = () => {
    if (items && currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleApplyFilters = () => {
    refetch();
    toast({
      title: "Filtros aplicados",
      description: "Los resultados han sido actualizados",
    });
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
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            }
          />
        </div>
      </header>

      <div className="relative h-[calc(100vh-13rem)] max-h-[700px] mx-auto max-w-md mt-4">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4 mx-auto"></div>
              <p>Cargando {activeTab === "artists" ? "artistas" : "eventos"}...</p>
            </div>
          </div>
        ) : items.length > 0 ? (
          <div className="relative w-full h-full">
            {items.map((item, idx) => (
              idx >= currentIndex && (
                <SwipeableCard
                  key={item.id}
                  id={item.id}
                  imageUrl={item.photoURL || item.image}
                  name={item.displayName || item.name}
                  role={item.role || item.category}
                  location={item.location}
                  distance={item.distance}
                  priceRange={`${new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    minimumFractionDigits: 0,
                  }).format(item.minPrice || item.price)} / ${item.priceUnit || 'hora'}`}
                  onLike={handleLike}
                  onDislike={handleDislike}
                  isLast={idx === items.length - 1}
                />
              )
            ))}
          </div>
        ) : (
          <Card className="absolute inset-0 rounded-xl overflow-hidden flex flex-col items-center justify-center text-center p-6">
            <Smile className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-xl mb-2">
              No hay más perfiles por mostrar
            </h3>
            <p className="text-muted-foreground mb-6">
              Intenta ajustar los filtros o vuelve más tarde
            </p>
            <Button onClick={() => refetch()}>
              Actualizar resultados
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}