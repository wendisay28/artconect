import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  ChevronLeft, 
  BookmarkPlus, 
  Share2,
  Users,
  DollarSign,
  Info,
  ExternalLink
} from "lucide-react";

export default function EventDetailsPage() {
  const { id } = useParams();
  const { toast } = useToast();
  
  const { data: event, isLoading } = useQuery({
    queryKey: ['/api/events', id],
    throwOnError: false,
  });
  
  const { data: creator } = useQuery({
    queryKey: ['/api/users', event?.creatorId],
    enabled: !!event?.creatorId,
    throwOnError: false,
  });
  
  const { data: attendees } = useQuery({
    queryKey: ['/api/events', id, 'attendees'],
    enabled: !!id,
    throwOnError: false,
  });

  const handleBookmark = () => {
    toast({
      title: "Evento guardado",
      description: "El evento ha sido añadido a tus favoritos"
    });
  };

  const handleShare = () => {
    // Implementation for sharing functionality
    toast({
      title: "Compartir evento",
      description: "La funcionalidad de compartir está en desarrollo"
    });
  };

  if (isLoading) {
    return (
      <div>
        <div className="h-64 relative">
          <Skeleton className="h-full w-full" />
          <div className="absolute top-4 left-4">
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
        <div className="container mx-auto px-4 -mt-6 relative z-10">
          <Skeleton className="h-24 w-full rounded-xl mb-6" />
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-6 w-1/2 mb-6" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-6" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="text-6xl mb-4">🎭</div>
        <h1 className="text-2xl font-bold mb-2">Evento no encontrado</h1>
        <p className="text-muted-foreground mb-6">No pudimos encontrar el evento que estás buscando</p>
        <Link href="/">
          <Button>Explorar eventos</Button>
        </Link>
      </div>
    );
  }

  const formatPrice = (value: number) => {
    if (event.isFree) return "Gratis";
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const isEventPast = new Date(event.date) < new Date();

  return (
    <div>
      {/* Event Cover */}
      <div className="h-64 bg-gray-300 dark:bg-gray-800 relative">
        <img 
          src={event.image || "https://via.placeholder.com/1200x400"}
          alt={event.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Back button */}
        <Link href="/">
          <a className="absolute top-4 left-4 bg-black/30 p-2 rounded-full text-white">
            <ChevronLeft className="h-5 w-5" />
          </a>
        </Link>
        
        {/* Action buttons */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-black/30 border-0 text-white hover:bg-black/50"
            onClick={handleBookmark}
          >
            <BookmarkPlus className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-black/30 border-0 text-white hover:bg-black/50"
            onClick={handleShare}
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Event Type Badge */}
        <Badge 
          className="absolute bottom-4 left-4" 
          variant={event.eventType === 'virtual' ? "secondary" : "default"}
        >
          {event.eventType === 'virtual' ? "Virtual" : "Presencial"}
        </Badge>
      </div>
      
      {/* Event Details Card */}
      <div className="container mx-auto px-4 -mt-6 relative z-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{event.name}</CardTitle>
            <CardDescription>
              <div className="flex items-center mt-1">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  {format(new Date(event.date), "EEEE, d 'de' MMMM, yyyy", { locale: es })}
                </span>
              </div>
              <div className="flex items-center mt-1">
                <Clock className="h-4 w-4 mr-1" />
                <span>{format(new Date(event.date), "HH:mm", { locale: es })} hrs</span>
              </div>
              <div className="flex items-center mt-1">
                {event.eventType === 'virtual' ? (
                  <>
                    <Video className="h-4 w-4 mr-1" />
                    <span>Evento virtual</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{event.location}</span>
                  </>
                )}
              </div>
              <div className="flex items-center mt-1">
                <DollarSign className="h-4 w-4 mr-1" />
                <span>{formatPrice(event.price)}</span>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="details">
              <TabsList className="w-full">
                <TabsTrigger value="details">Detalles</TabsTrigger>
                <TabsTrigger value="attendees">Asistentes</TabsTrigger>
                <TabsTrigger value="organizer">Organizador</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-4">
                <h3 className="font-semibold mb-2">Descripción</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {event.description}
                </p>
                
                {event.eventType === 'virtual' && event.virtualLink && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Enlace del evento</h3>
                    <Button variant="outline" className="w-full" asChild>
                      <a href={event.virtualLink} target="_blank" rel="noopener noreferrer">
                        Acceder al evento
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                )}
                
                {event.eventType === 'physical' && event.latitude && event.longitude && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Ubicación</h3>
                    <div className="bg-gray-200 dark:bg-gray-800 h-40 rounded-md flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">Mapa no disponible</p>
                    </div>
                    <Button variant="outline" className="w-full mt-2" asChild>
                      <a 
                        href={`https://maps.google.com/?q=${event.latitude},${event.longitude}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        Ver en Google Maps
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="attendees" className="mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Asistentes</h3>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-sm">{attendees?.length || 0}</span>
                  </div>
                </div>
                
                {attendees && attendees.length > 0 ? (
                  <div className="space-y-3">
                    {attendees.map(user => (
                      <div key={user.id} className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={user.photoURL} alt={user.displayName} />
                          <AvatarFallback>{user.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.displayName}</p>
                          <p className="text-xs text-muted-foreground">{user.role || 'Asistente'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">Aún no hay asistentes registrados</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="organizer" className="mt-4">
                {creator ? (
                  <div>
                    <div className="flex items-center">
                      <Avatar className="h-12 w-12 mr-3">
                        <AvatarImage src={creator.photoURL} alt={creator.displayName} />
                        <AvatarFallback>{creator.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{creator.displayName}</p>
                        <p className="text-sm text-muted-foreground">{creator.role || 'Organizador'}</p>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      {creator.bio || 'Sin información del organizador'}
                    </p>
                    <Link href={`/artist/${creator.id}`}>
                      <Button variant="outline" className="w-full">
                        <Info className="mr-2 h-4 w-4" />
                        Ver perfil completo
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">Información del organizador no disponible</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            {isEventPast ? (
              <Button variant="secondary" className="w-full" disabled>
                Evento finalizado
              </Button>
            ) : (
              <Button className="w-full">
                {event.isFree ? 'Registrarse' : 'Comprar entrada'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
