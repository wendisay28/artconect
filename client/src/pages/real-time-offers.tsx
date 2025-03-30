import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { useLocation } from "@/context/location-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, DollarSign, User, Calendar, CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

interface ArtistResponse {
  id: number;
  userName: string;
  userPhoto: string;
  price: number;
  description: string;
  rating: number;
  distance: number;
  timestamp: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface RequestOffer {
  id: number;
  title: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  price: number;
  location: string;
  latitude: number;
  longitude: number;
  date: string;
  time: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  responses: ArtistResponse[];
}

export default function RealTimeOffersPage() {
  const { user } = useAuth();
  const { locationData } = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("my-requests");
  const [newRequestDialogOpen, setNewRequestDialogOpen] = useState(false);
  
  // Datos de categorías y subcategorías
  const categorias = {
    "Artes Musicales": ["Músicos", "Cantantes", "Compositores", "Directores"],
    "Artes Visuales": ["Pintores", "Escultores", "Fotógrafos", "Ilustradores"],
    "Artes Escénicas": ["Actores", "Bailarines", "Comediantes", "Malabaristas"],
    "Diseño y Creatividad": ["Diseñadores Gráficos", "Diseñadores Web", "Diseñadores de Moda"],
    "Producción Audiovisual": ["Productores", "Directores", "Videógrafos", "Editores"],
    "Escritura y Literatura": ["Escritores", "Poetas", "Guionistas", "Editores"],
    "Gastronomía": ["Chefs", "Reposteros", "Mixólogos", "Cocineros"],
    "Artesanía": ["Ceramistas", "Joyeros", "Carpinteros", "Tejedores"],
    "Tecnología Creativa": ["Desarrolladores de Apps", "Diseñadores UX/UI", "Animadores 3D"],
    "Servicios para Eventos": ["Organizadores", "Decoradores", "DJs", "Presentadores", "Fotógrafos de Eventos"]
  };
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    subcategoryId: "",
    tags: [] as string[],
    price: "",
    priceUnit: "total", // "total" | "hora"
    location: "",
    useCurrentLocation: true,
    date: "",
    time: ""
  });
  
  const [newTag, setNewTag] = useState("");

  // Mocked data for demonstration
  const userRequests: RequestOffer[] = [
    {
      id: 1,
      title: "Fotógrafo para cumpleaños",
      description: "Necesito un fotógrafo para un cumpleaños de 50 personas. El evento durará aproximadamente 4 horas.",
      categoryId: "audiovisuales",
      subcategoryId: "fotografia",
      price: 250000,
      location: "Bogotá, Colombia",
      latitude: 4.6097,
      longitude: -74.0817,
      date: "2025-04-15",
      time: "18:00",
      status: "active",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      responses: [
        {
          id: 101,
          userName: "Carlos Jimenez",
          userPhoto: "https://randomuser.me/api/portraits/men/32.jpg",
          price: 300000,
          description: "Tengo disponibilidad. Ofrezco servicio completo con edición y entrega de todas las fotos en alta calidad.",
          rating: 4.8,
          distance: 3.2,
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          status: "pending"
        },
        {
          id: 102,
          userName: "Maria López",
          userPhoto: "https://randomuser.me/api/portraits/women/44.jpg",
          price: 270000,
          description: "Disponible para esa fecha. Incluye 100 fotos editadas y entrega en 48h.",
          rating: 4.9,
          distance: 5.7,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: "pending"
        }
      ]
    },
    {
      id: 2,
      title: "Músico para serenata",
      description: "Busco guitarrista para dar una serenata romántica de aproximadamente 1 hora.",
      categoryId: "musica",
      subcategoryId: "cantante",
      price: 180000,
      location: "Medellín, Colombia",
      latitude: 6.2476,
      longitude: -75.5658,
      date: "2025-04-10",
      time: "20:00",
      status: "active",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      responses: []
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitRequest = () => {
    // Validar formulario
    if (!formData.title || !formData.description || !formData.categoryId || !formData.price || !formData.date) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
      });
      return;
    }

    // Aquí se enviaría la solicitud al backend
    toast({
      title: "Solicitud creada",
      description: "Tu solicitud ha sido publicada con éxito",
    });

    // Cerrar el diálogo y limpiar el formulario
    setNewRequestDialogOpen(false);
    setFormData({
      title: "",
      description: "",
      categoryId: "",
      subcategoryId: "",
      tags: [],
      price: "",
      priceUnit: "total",
      location: "",
      useCurrentLocation: true,
      date: "",
      time: ""
    });
  };

  const handleAcceptOffer = (requestId: number, responseId: number) => {
    toast({
      title: "Oferta aceptada",
      description: "Has aceptado la oferta del artista",
    });
  };

  const handleRejectOffer = (requestId: number, responseId: number) => {
    toast({
      title: "Oferta rechazada",
      description: "Has rechazado la oferta del artista",
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-20">
      <header className="mb-6">
        <h1 className="font-bold text-2xl">Ofertas en Tiempo Real</h1>
        <p className="text-muted-foreground">Publica tus necesidades y recibe propuestas de artistas cercanos</p>
      </header>

      <div className="flex justify-between items-center mb-6">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="my-requests">Mis Solicitudes</TabsTrigger>
            <TabsTrigger value="available-requests">Solicitudes Disponibles</TabsTrigger>
          </TabsList>

          <TabsContent value="my-requests">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-xl">Mis Solicitudes</h2>
              <Dialog open={newRequestDialogOpen} onOpenChange={setNewRequestDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Nueva Solicitud</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Solicitud</DialogTitle>
                    <DialogDescription>
                      Completa el formulario para publicar tu solicitud. Los artistas cercanos recibirán una notificación.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título de la solicitud</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="Ej: Fotógrafo para evento corporativo"
                        value={formData.title}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Describe los detalles de tu solicitud"
                        rows={4}
                        value={formData.description}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="categoryId">Categoría</Label>
                        <Select name="categoryId" onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="audiovisuales">Audiovisuales</SelectItem>
                            <SelectItem value="plasticas">Artes Plásticas</SelectItem>
                            <SelectItem value="musica">Música</SelectItem>
                            <SelectItem value="danza">Danza</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subcategoryId">Subcategoría</Label>
                        <Select name="subcategoryId" onValueChange={(value) => setFormData(prev => ({ ...prev, subcategoryId: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {formData.categoryId === "audiovisuales" && (
                              <>
                                <SelectItem value="fotografia">Fotografía</SelectItem>
                                <SelectItem value="video">Video</SelectItem>
                              </>
                            )}
                            {formData.categoryId === "plasticas" && (
                              <>
                                <SelectItem value="pintura">Pintura</SelectItem>
                                <SelectItem value="escultura">Escultura</SelectItem>
                              </>
                            )}
                            {formData.categoryId === "musica" && (
                              <>
                                <SelectItem value="cantante">Cantante</SelectItem>
                                <SelectItem value="banda">Banda</SelectItem>
                                <SelectItem value="dj">DJ</SelectItem>
                              </>
                            )}
                            {formData.categoryId === "danza" && (
                              <>
                                <SelectItem value="contemporanea">Contemporánea</SelectItem>
                                <SelectItem value="urbana">Urbana</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Etiquetas profesionales (máx 2)</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.tags?.map(tag => (
                          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <button onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                tags: prev.tags.filter(t => t !== tag)
                              }));
                            }}>
                              <X className="h-3 w-3 hover:text-destructive" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ej: Cantante Pop, Pianista"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (!newTag.trim()) return;
                              if (formData.tags.length >= 2) {
                                toast({
                                  variant: "destructive",
                                  description: "Solo puedes añadir hasta 2 etiquetas",
                                });
                                return;
                              }
                              if (formData.tags.includes(newTag.trim())) {
                                toast({
                                  variant: "destructive",
                                  description: "Esta etiqueta ya existe",
                                });
                                return;
                              }
                              setFormData(prev => ({
                                ...prev,
                                tags: [...prev.tags, newTag.trim()]
                              }));
                              setNewTag("");
                            }
                          }}
                        />
                        <Button 
                          type="button" 
                          size="sm"
                          onClick={() => {
                            if (!newTag.trim()) return;
                            if (formData.tags.length >= 2) {
                              toast({
                                variant: "destructive",
                                description: "Solo puedes añadir hasta 2 etiquetas",
                              });
                              return;
                            }
                            if (formData.tags.includes(newTag.trim())) {
                              toast({
                                variant: "destructive",
                                description: "Esta etiqueta ya existe",
                              });
                              return;
                            }
                            setFormData(prev => ({
                              ...prev,
                              tags: [...prev.tags, newTag.trim()]
                            }));
                            setNewTag("");
                          }}
                        >
                          Añadir
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ejemplos: Cantante Pop, Pianista, Fotógrafo de Bodas, Cocinero Vegano
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="price">Presupuesto (COP)</Label>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="col-span-3">
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            placeholder="Ej: 300000"
                            value={formData.price}
                            onChange={handleInputChange}
                          />
                        </div>
                        <Select 
                          value={formData.priceUnit} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, priceUnit: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Unidad" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="total">Total</SelectItem>
                            <SelectItem value="hora">Por hora</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Fecha</Label>
                        <Input
                          id="date"
                          name="date"
                          type="date"
                          value={formData.date}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Hora</Label>
                        <Input
                          id="time"
                          name="time"
                          type="time"
                          value={formData.time}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Ubicación</Label>
                      {locationData.coordinates ? (
                        <div className="space-y-2">
                          <div className="bg-muted p-3 rounded-md flex items-center">
                            <MapPin className="h-5 w-5 text-muted-foreground mr-2" />
                            <span>{locationData.address || "Mi ubicación actual"}</span>
                          </div>
                        </div>
                      ) : (
                        <Input
                          id="location"
                          name="location"
                          placeholder="Ej: Bogotá, Colombia"
                          value={formData.location}
                          onChange={handleInputChange}
                        />
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button onClick={handleSubmitRequest}>Publicar Solicitud</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {userRequests.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-xl mb-2">No tienes solicitudes activas</h3>
                  <p className="text-muted-foreground mb-6">
                    Crea una nueva solicitud para recibir propuestas de artistas cercanos
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>Nueva Solicitud</Button>
                    </DialogTrigger>
                    {/* Contenido del dialog reutilizado del otro Dialog */}
                  </Dialog>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {userRequests.map(request => (
                  <Card key={request.id} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{request.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {new Date(request.createdAt).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </CardDescription>
                        </div>
                        <Badge variant={request.status === 'active' ? "default" : 
                                        request.status === 'completed' ? "success" : "destructive"}>
                          {request.status === 'active' ? 'Activa' : 
                           request.status === 'completed' ? 'Completada' : 'Cancelada'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">{request.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                          <span>{request.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                          <span>{new Date(request.date).toLocaleDateString('es-ES', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                          <span>{request.time}</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
                          <span>{new Intl.NumberFormat('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(request.price)}</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Propuestas recibidas ({request.responses.length})</h4>
                        {request.responses.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            Aún no has recibido propuestas para esta solicitud
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {request.responses.map(response => (
                              <div key={response.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center">
                                    <Avatar className="h-10 w-10 mr-3">
                                      <AvatarImage src={response.userPhoto} alt={response.userName} />
                                      <AvatarFallback>{response.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h5 className="font-medium">{response.userName}</h5>
                                      <div className="flex items-center text-sm text-muted-foreground">
                                        <div className="flex items-center mr-3">
                                          <MapPin className="h-3 w-3 mr-1" />
                                          <span>{response.distance} km</span>
                                        </div>
                                        <div className="flex items-center">
                                          <span className="text-amber-500 mr-1">★</span>
                                          <span>{response.rating}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <span className="font-semibold text-primary">
                                    {new Intl.NumberFormat('es-CO', {
                                      style: 'currency',
                                      currency: 'COP',
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 0,
                                    }).format(response.price)}
                                  </span>
                                </div>
                                <p className="text-sm mb-3">{response.description}</p>
                                <div className="flex justify-between items-center text-xs text-muted-foreground">
                                  <span>
                                    {new Date(response.timestamp).toLocaleDateString('es-ES', {
                                      day: 'numeric',
                                      month: 'long',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                  {response.status === 'pending' && (
                                    <div className="flex space-x-2">
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => handleRejectOffer(request.id, response.id)}
                                        className="text-destructive border-destructive hover:bg-destructive/10"
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Rechazar
                                      </Button>
                                      <Button 
                                        size="sm"
                                        onClick={() => handleAcceptOffer(request.id, response.id)}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Aceptar
                                      </Button>
                                    </div>
                                  )}
                                  {response.status === 'accepted' && (
                                    <Badge variant="success">Aceptada</Badge>
                                  )}
                                  {response.status === 'rejected' && (
                                    <Badge variant="destructive">Rechazada</Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="available-requests">
            <div className="text-center py-16">
              <h3 className="font-semibold text-xl mb-2">Próximamente</h3>
              <p className="text-muted-foreground mb-4">
                Esta sección estará disponible para artistas registrados en la plataforma.
              </p>
              <p className="text-muted-foreground mb-6">
                Aquí podrás ver solicitudes de servicios cercanos a tu ubicación y enviar propuestas.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}