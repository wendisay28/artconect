import { useState, useEffect } from "react";
import { useLocation as useWouterLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "@/context/location-context";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import SearchFilters from "@/components/search-filters";
import ArtistCard from "@/components/artist-card";
import EventCard from "@/components/event-card";
import { ArrowLeft, Search as SearchIcon, Filter } from "lucide-react";

export default function SearchPage() {
  const [searchParams] = useWouterLocation();
  const params = new URLSearchParams(searchParams);
  const initialType = params.get("type") === "events" ? "events" : "artists";
  
  const [activeTab, setActiveTab] = useState(initialType);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>(null);
  const { locationData } = useLocation();
  const { toast } = useToast();

  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  // Search artists
  const { data: artists, isLoading: isLoadingArtists } = useQuery({
    queryKey: [
      '/api/search/artists', 
      debouncedSearchTerm,
      locationData?.coordinates?.latitude, 
      locationData?.coordinates?.longitude,
      appliedFilters
    ],
    enabled: activeTab === "artists",
    throwOnError: false,
  });

  // Search events
  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: [
      '/api/search/events', 
      debouncedSearchTerm,
      locationData?.coordinates?.latitude, 
      locationData?.coordinates?.longitude,
      appliedFilters
    ],
    enabled: activeTab === "events",
    throwOnError: false,
  });

  const handleApplyFilters = (filters: any) => {
    setAppliedFilters(filters);
    setShowFilters(false);
    toast({
      title: "Filtros aplicados",
      description: "Los resultados han sido actualizados según tus filtros",
    });
  };

  const handleSaveEvent = (id: string) => {
    toast({
      title: "Evento guardado",
      description: "El evento ha sido añadido a tus favoritos",
    });
  };

  const handleShareEvent = (id: string) => {
    toast({
      title: "Compartir evento",
      description: "Funcionalidad de compartir en desarrollo",
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild>
          <a href="/">
            <ArrowLeft className="h-5 w-5" />
          </a>
        </Button>
        <h1 className="font-bold text-2xl ml-2">Buscar</h1>
      </header>

      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar artistas o eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute right-1 top-1/2 transform -translate-y-1/2"
            onClick={() => setShowFilters(true)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="artists" className="flex-1">Artistas</TabsTrigger>
            <TabsTrigger value="events" className="flex-1">Eventos</TabsTrigger>
          </TabsList>

          {/* Artists Results */}
          <TabsContent value="artists" className="mt-4">
            {isLoadingArtists ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Array(6).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full rounded-xl" />
                ))}
              </div>
            ) : artists && artists.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {artists.map(artist => (
                  <ArtistCard
                    key={artist.id}
                    id={artist.id}
                    name={artist.displayName}
                    role={artist.role}
                    price={artist.minPrice}
                    priceUnit={artist.priceUnit || "hora"}
                    imageUrl={artist.photoURL}
                    variant="horizontal"
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  {debouncedSearchTerm ? (
                    <>
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="font-semibold text-xl mb-2">No se encontraron artistas</h3>
                      <p className="text-muted-foreground">
                        No hay resultados para "{debouncedSearchTerm}"
                      </p>
                      <p className="text-muted-foreground mt-1">
                        Intenta con otros términos o ajusta los filtros
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-6xl mb-4">🎸</div>
                      <h3 className="font-semibold text-xl mb-2">Busca artistas</h3>
                      <p className="text-muted-foreground">
                        Escribe en la barra de búsqueda para encontrar artistas
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Events Results */}
          <TabsContent value="events" className="mt-4">
            {isLoadingEvents ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
              </div>
            ) : events && events.length > 0 ? (
              <div className="space-y-4">
                {events.map(event => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    name={event.name}
                    date={new Date(event.date)}
                    location={event.location}
                    price={event.price}
                    imageUrl={event.image}
                    isFree={event.isFree}
                    isVirtual={event.eventType === 'virtual'}
                    onSave={handleSaveEvent}
                    onShare={handleShareEvent}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  {debouncedSearchTerm ? (
                    <>
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="font-semibold text-xl mb-2">No se encontraron eventos</h3>
                      <p className="text-muted-foreground">
                        No hay resultados para "{debouncedSearchTerm}"
                      </p>
                      <p className="text-muted-foreground mt-1">
                        Intenta con otros términos o ajusta los filtros
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-6xl mb-4">🎭</div>
                      <h3 className="font-semibold text-xl mb-2">Busca eventos</h3>
                      <p className="text-muted-foreground">
                        Escribe en la barra de búsqueda para encontrar eventos
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Search Filters */}
      <SearchFilters 
        onApplyFilters={handleApplyFilters}
        triggerButton={<div />} // Hidden trigger, we show manually
      />
    </div>
  );
}
