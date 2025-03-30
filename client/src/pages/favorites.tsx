import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ArtistCard from "@/components/artist-card";
import EventCard from "@/components/event-card";
import { Link } from "wouter";
import { UserX, Calendar, UserCheck, Trash2 } from "lucide-react";

export default function FavoritesPage() {
  const [activeTab, setActiveTab] = useState("artists");
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: favoriteArtists, isLoading: isLoadingArtists } = useQuery({
    queryKey: ['/api/favorites/artists'],
    enabled: !!user,
    throwOnError: false,
  });

  const { data: favoriteEvents, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['/api/favorites/events'],
    enabled: !!user,
    throwOnError: false,
  });

  const handleRemoveFavorite = async (id: string, type: 'artist' | 'event') => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para eliminar favoritos",
      });
      return;
    }

    try {
      await apiRequest("DELETE", `/api/favorites/${type}/${id}`, {
        userId: user.uid,
      });

      // Invalidate favorites queries
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${type}s`] });

      toast({
        title: "Favorito eliminado",
        description: `El ${type === 'artist' ? 'artista' : 'evento'} ha sido eliminado de tus favoritos`,
      });
    } catch (error) {
      console.error(`Error removing ${type} from favorites:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Hubo un problema al eliminar el ${type === 'artist' ? 'artista' : 'evento'} de tus favoritos`,
      });
    }
  };

  const handleShareEvent = (id: string) => {
    // Implementation for sharing functionality
    toast({
      title: "Compartir evento",
      description: "La funcionalidad de compartir está en desarrollo"
    });
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold mb-2">Inicio de sesión requerido</h1>
        <p className="text-muted-foreground mb-6">Debes iniciar sesión para ver tus favoritos</p>
        <Link href="/">
          <Button>Ir al inicio</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="font-bold text-2xl">Mis Favoritos</h1>
        <p className="text-muted-foreground">Guarda artistas y eventos para acceder rápidamente</p>
      </header>

      <Tabs defaultValue="artists" onValueChange={setActiveTab}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="artists" className="flex-1">
            <UserCheck className="h-4 w-4 mr-2" />
            Artistas
          </TabsTrigger>
          <TabsTrigger value="events" className="flex-1">
            <Calendar className="h-4 w-4 mr-2" />
            Eventos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="artists">
          {isLoadingArtists ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-xl" />
              ))}
            </div>
          ) : favoriteArtists && favoriteArtists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {favoriteArtists.map(artist => (
                <div key={artist.id} className="relative group">
                  <ArtistCard
                    id={artist.id}
                    name={artist.displayName}
                    role={artist.role}
                    price={artist.minPrice}
                    priceUnit={artist.priceUnit || "hora"}
                    imageUrl={artist.photoURL}
                    variant="horizontal"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveFavorite(artist.id, 'artist')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <UserX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-xl mb-2">No tienes artistas favoritos</h3>
                <p className="text-muted-foreground mb-6">
                  Explora artistas y añádelos a tus favoritos para verlos aquí
                </p>
                <Link href="/explore">
                  <Button>Explorar artistas</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="events">
          {isLoadingEvents ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : favoriteEvents && favoriteEvents.length > 0 ? (
            <div className="space-y-4">
              {favoriteEvents.map(event => (
                <div key={event.id} className="relative group">
                  <EventCard
                    id={event.id}
                    name={event.name}
                    date={new Date(event.date)}
                    location={event.location}
                    price={event.price}
                    imageUrl={event.image}
                    isFree={event.isFree}
                    isVirtual={event.eventType === 'virtual'}
                    onSave={() => handleRemoveFavorite(event.id, 'event')}
                    onShare={() => handleShareEvent(event.id)}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveFavorite(event.id, 'event')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-xl mb-2">No tienes eventos favoritos</h3>
                <p className="text-muted-foreground mb-6">
                  Explora eventos y añádelos a tus favoritos para verlos aquí
                </p>
                <Link href="/">
                  <Button>Explorar eventos</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
