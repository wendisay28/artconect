import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import ProfileHeader from "@/components/profile-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Star, 
  StarHalf, 
  Calendar, 
  MessageCircle,
  BookmarkPlus,
  Share2
} from "lucide-react";

export default function ArtistProfilePage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  const { data: artist, isLoading } = useQuery({
    queryKey: ['/api/artists', id],
    throwOnError: false,
  });
  
  const { data: services } = useQuery({
    queryKey: ['/api/artists', id, 'services'],
    throwOnError: false,
  });
  
  const { data: reviews } = useQuery({
    queryKey: ['/api/artists', id, 'reviews'],
    throwOnError: false,
  });

  const handleBookmark = () => {
    toast({
      title: "Artista guardado",
      description: "El artista ha sido añadido a tus favoritos",
    });
  };

  const handleShare = () => {
    toast({
      title: "Compartir perfil",
      description: "Funcionalidad de compartir en desarrollo",
    });
  };

  const handleContact = () => {
    navigate(`/chat/new?artistId=${id}`);
  };

  if (isLoading) {
    return (
      <div className="pb-6">
        <div className="relative">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="absolute -bottom-16 left-4 w-32 h-32 rounded-full" />
          <Skeleton className="absolute -bottom-8 right-4 h-10 w-32 rounded-full" />
        </div>
        <div className="container mx-auto px-4 pt-20 pb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64 mb-2" />
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-10 w-full mb-6" />
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-24 w-full mb-4" />
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-full mb-2" />
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold mb-2">Artista no encontrado</h1>
        <p className="text-muted-foreground mb-6">No pudimos encontrar el artista que estás buscando</p>
        <Link href="/explore">
          <Button>Explorar artistas</Button>
        </Link>
      </div>
    );
  }

  // Generate rating stars
  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-5 w-5 text-yellow-400 fill-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-5 w-5 text-yellow-400 fill-yellow-400" />);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-5 w-5 text-yellow-400" />);
    }
    
    return stars;
  };

  const getUpcomingDates = () => {
    if (!artist.availability) return [];
    
    const today = new Date();
    const dates = [];
    
    // This is a simplified version - in a real app, you'd parse the availability data
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Randomly determine if the artist is available on this date
      // In a real app, this would be based on the actual availability data
      const isAvailable = Math.random() > 0.5;
      
      dates.push({
        date,
        isAvailable
      });
    }
    
    return dates;
  };

  const availableDates = getUpcomingDates();

  return (
    <div className="pb-6">
      <ProfileHeader 
        coverImageUrl={artist.coverImage}
        profileImageUrl={artist.photoURL}
        name={artist.displayName}
        role={artist.role}
        location={artist.location}
        rating={artist.rating}
        reviewCount={artist.reviewCount}
        onBookmark={handleBookmark}
        onShare={handleShare}
        onContact={handleContact}
      />
      
      <div className="container mx-auto px-4 pt-20 pb-6">
        <h1 className="font-bold text-2xl">{artist.displayName}</h1>
        <div className="flex items-center mt-1">
          <span className="text-muted-foreground">{artist.role}</span>
          <div className="w-1 h-1 rounded-full bg-muted-foreground mx-2"></div>
          <div className="flex items-center text-muted-foreground">
            <span className="ml-1">{artist.location}</span>
          </div>
        </div>
        
        {/* Ratings & Reviews */}
        {artist.rating && (
          <div className="flex items-center mt-2">
            <div className="flex">
              {renderRatingStars(artist.rating)}
            </div>
            <span className="ml-2 font-medium">{artist.rating.toFixed(1)}</span>
            <span className="ml-1 text-muted-foreground">({artist.reviewCount} reseñas)</span>
          </div>
        )}
        
        {/* Tabs */}
        <Tabs defaultValue="profile" className="mt-6" onValueChange={setActiveTab}>
          <TabsList className="w-full border-b rounded-none justify-start">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="services">Servicios</TabsTrigger>
            <TabsTrigger value="gallery">Galería</TabsTrigger>
            <TabsTrigger value="reviews">Reseñas</TabsTrigger>
          </TabsList>
          
          {/* Profile Content */}
          <TabsContent value="profile" className="py-4">
            <h2 className="font-semibold text-lg mb-2">Sobre mí</h2>
            <p className="text-muted-foreground">
              {artist.bio}
            </p>
            
            {/* Skills */}
            <h2 className="font-semibold text-lg mt-6 mb-2">Habilidades</h2>
            <div className="flex flex-wrap gap-2">
              {artist.skills?.map((skill, index) => (
                <Badge key={index} variant="outline" className="bg-primary/10 text-primary">
                  {skill}
                </Badge>
              ))}
            </div>
            
            {/* Availability Calendar */}
            <h2 className="font-semibold text-lg mt-6 mb-2">Disponibilidad</h2>
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  <div className="text-muted-foreground text-xs">L</div>
                  <div className="text-muted-foreground text-xs">M</div>
                  <div className="text-muted-foreground text-xs">M</div>
                  <div className="text-muted-foreground text-xs">J</div>
                  <div className="text-muted-foreground text-xs">V</div>
                  <div className="text-muted-foreground text-xs">S</div>
                  <div className="text-muted-foreground text-xs">D</div>
                </div>
                
                <div className="grid grid-cols-7 gap-1 text-center">
                  {availableDates.map((dateObj, index) => (
                    <div 
                      key={index}
                      className={`py-2 text-sm rounded ${
                        dateObj.isAvailable 
                          ? 'bg-primary text-white' 
                          : 'bg-muted'
                      }`}
                    >
                      {dateObj.date.getDate()}
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                    <span className="text-sm text-muted-foreground">Disponible</span>
                  </div>
                  <Button variant="link" size="sm">
                    Ver más fechas
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Services preview */}
            <h2 className="font-semibold text-lg mt-6 mb-2">Servicios y Tarifas</h2>
            <div className="space-y-3">
              {services?.slice(0, 2).map(service => (
                <Card key={service.id}>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{service.name}</h3>
                      <p className="text-muted-foreground text-sm">{service.description}</p>
                    </div>
                    <span className="text-primary font-medium">
                      {new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(service.price)}
                    </span>
                  </CardContent>
                </Card>
              ))}
              
              {services && services.length > 2 && (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setActiveTab("services")}
                >
                  Ver todos los servicios ({services.length})
                </Button>
              )}
            </div>
          </TabsContent>
          
          {/* Services Content */}
          <TabsContent value="services" className="py-4">
            <h2 className="font-semibold text-lg mb-4">Todos los Servicios</h2>
            <div className="space-y-3">
              {services?.map(service => (
                <Card key={service.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{service.name}</h3>
                      <span className="text-primary font-medium">
                        {new Intl.NumberFormat('es-CO', {
                          style: 'currency',
                          currency: 'COP',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(service.price)}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm mt-1">{service.description}</p>
                    <div className="mt-4 flex justify-end">
                      <Button onClick={handleContact}>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Contactar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {!services?.length && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">Este artista aún no ha agregado servicios</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          {/* Gallery Content */}
          <TabsContent value="gallery" className="py-4">
            <h2 className="font-semibold text-lg mb-4">Galería</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {artist.gallery?.map((image, index) => (
                <div key={index} className="relative pb-[100%]">
                  <img 
                    src={image}
                    alt={`Galería de ${artist.displayName} - ${index+1}`}
                    className="absolute inset-0 w-full h-full object-cover rounded-md"
                  />
                </div>
              ))}
              
              {(!artist.gallery || artist.gallery.length === 0) && (
                <Card className="col-span-full">
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">Este artista aún no ha agregado imágenes a su galería</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          {/* Reviews Content */}
          <TabsContent value="reviews" className="py-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">Reseñas</h2>
              {artist.rating && (
                <div className="flex items-center">
                  <div className="flex">
                    {renderRatingStars(artist.rating)}
                  </div>
                  <span className="ml-2 font-medium">{artist.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            
            {reviews?.map(review => (
              <Card key={review.id} className="mb-4">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={review.userPhotoURL} alt={review.userName} />
                        <AvatarFallback>{review.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{review.userName}</h3>
                        <p className="text-muted-foreground text-xs">
                          {format(new Date(review.date), "d 'de' MMMM, yyyy", { locale: es })}
                        </p>
                      </div>
                    </div>
                    <div className="flex">
                      {renderRatingStars(review.rating).slice(0, Math.floor(review.rating))}
                    </div>
                  </div>
                  <p className="mt-3 text-sm">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
            
            {(!reviews || reviews.length === 0) && (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">Este artista aún no tiene reseñas</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
