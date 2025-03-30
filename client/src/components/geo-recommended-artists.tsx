import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "@/context/location-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import ArtistCard from "@/components/artist-card";
import { calculateDistance, Coordinates } from "@/lib/location";
import { MapPin, Star, RefreshCw } from "lucide-react";

interface ArtistWithDistance extends Record<string, any> {
  id: string | number;
  displayName: string;
  role: string;
  minPrice: number;
  priceUnit?: string;
  photoURL?: string;
  rating?: number;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  distance?: number;
}

export default function GeoRecommendedArtists() {
  const { locationData } = useLocation();
  const { toast } = useToast();
  const [artists, setArtists] = useState<ArtistWithDistance[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch artists from API
  const { data: apiArtists, isLoading, refetch } = useQuery({
    queryKey: [
      '/api/artists/recommended',
      locationData?.coordinates?.latitude,
      locationData?.coordinates?.longitude
    ],
    throwOnError: false,
  });

  // Calculate distances and sort when location or artists change
  useEffect(() => {
    if (!apiArtists || !locationData.coordinates) return;

    const processedArtists = apiArtists.map((artist: ArtistWithDistance) => {
      let distance = undefined;
      
      // If both user and artist have location data, calculate distance
      if (locationData.coordinates && artist.location?.latitude && artist.location?.longitude) {
        distance = calculateDistance(
          locationData.coordinates,
          {
            latitude: artist.location.latitude,
            longitude: artist.location.longitude
          }
        );
      }
      
      return {
        ...artist,
        distance
      };
    });

    // Sort by distance (undefined distances at the end)
    const sortedArtists = [...processedArtists].sort((a, b) => {
      if (a.distance === undefined && b.distance === undefined) return 0;
      if (a.distance === undefined) return 1;
      if (b.distance === undefined) return -1;
      return a.distance - b.distance;
    });

    setArtists(sortedArtists);
  }, [apiArtists, locationData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    toast({
      title: "Recomendaciones actualizadas",
      description: "Hemos encontrado artistas cercanos a tu ubicación",
    });
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl">Artistas Cerca de Ti</h2>
          <Button variant="ghost" size="sm" disabled>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i}>
              <div className="relative">
                <Skeleton className="h-40 w-full rounded-t-lg" />
                <div className="absolute bottom-2 right-2">
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
              </div>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!locationData.coordinates) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="p-6 text-center">
          <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <h3 className="font-medium text-lg mb-1">Activa tu ubicación</h3>
          <p className="text-muted-foreground mb-4">
            Necesitamos acceder a tu ubicación para mostrarte artistas cercanos
          </p>
          <Button onClick={() => window.location.reload()}>
            Activar ubicación
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (artists.length === 0) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="p-6 text-center">
          <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <h3 className="font-medium text-lg mb-1">Sin artistas cercanos</h3>
          <p className="text-muted-foreground mb-4">
            No encontramos artistas cerca de tu ubicación actual
          </p>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Buscar de nuevo
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-xl">Artistas Cerca de Ti</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Actualizar
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {artists.slice(0, 6).map((artist) => (
          <Card key={artist.id} className="overflow-hidden">
            <div className="relative">
              <img 
                src={artist.photoURL || "https://via.placeholder.com/300"} 
                alt={artist.displayName} 
                className="h-40 w-full object-cover"
              />
              {artist.distance !== undefined && (
                <div className="absolute bottom-2 right-2 bg-background rounded-full px-2 py-1 text-xs font-medium flex items-center shadow-md">
                  <MapPin className="h-3 w-3 mr-1 text-primary" />
                  {artist.distance < 1 
                    ? `${Math.round(artist.distance * 1000)} m` 
                    : `${artist.distance.toFixed(1)} km`}
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{artist.displayName}</h3>
                  <p className="text-sm text-muted-foreground">{artist.role}</p>
                </div>
                {artist.rating && (
                  <div className="flex items-center">
                    <Star className="h-3 w-3 fill-primary text-primary mr-1" />
                    <span className="text-xs font-medium">{artist.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium text-primary">
                  {new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(artist.minPrice)}
                  <span className="text-xs font-normal text-muted-foreground ml-1">
                    / {artist.priceUnit || "hora"}
                  </span>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <a href={`/artist/${artist.id}`}>Ver perfil</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}