import { useState, useEffect } from "react";
import { useLocation } from "@/context/location-context";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MapPin, Calendar } from "lucide-react";
import GeoRecommendedArtists from "@/components/geo-recommended-artists";
import { Link } from "wouter";

export default function GeoRecommendationsPage() {
  const { locationData } = useLocation();
  const [activeTab, setActiveTab] = useState("artists");
  const [locationTitle, setLocationTitle] = useState("Cerca de ti");

  // Set location title based on location data
  useEffect(() => {
    if (locationData.address) {
      // Extract city/locality from the address
      const addressParts = locationData.address.split(',');
      if (addressParts.length > 1) {
        // Usually city is the 2nd or 3rd part from the end
        const cityPart = addressParts[addressParts.length > 2 ? addressParts.length - 3 : addressParts.length - 2].trim();
        setLocationTitle(`Cerca de ${cityPart}`);
      } else {
        setLocationTitle(`Cerca de ${locationData.address}`);
      }
    } else if (locationData.coordinates) {
      setLocationTitle("Cerca de tu ubicación");
    } else {
      setLocationTitle("Recomendaciones");
    }
  }, [locationData]);

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="ml-2">
          <h1 className="font-bold text-2xl">{locationTitle}</h1>
          {locationData.coordinates && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-3 w-3 mr-1" />
              {locationData.address || "Ubicación actual"}
            </div>
          )}
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="artists" className="flex-1">
            Artistas
          </TabsTrigger>
          <TabsTrigger value="events" className="flex-1">
            <Calendar className="h-4 w-4 mr-2" />
            Eventos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="artists">
          <GeoRecommendedArtists />
        </TabsContent>

        <TabsContent value="events">
          <div className="py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">Próximamente: Eventos Geolocalizados</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Estamos trabajando para mostrarte eventos cercanos basados en tu ubicación actual.
            </p>
            <Button variant="outline" asChild>
              <Link href="/search?type=events">
                Ver todos los eventos
              </Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}