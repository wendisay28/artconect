import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { User, CreditCard, Bell, Calendar, Settings, Image, LogOut, Trash2, Edit, Plus, X, ShoppingBag, Send, Download, Package, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import AuthDialog from "@/components/auth-dialog";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  
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
  
  // User data
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['/api/users/profile'],
    enabled: !!user,
    throwOnError: false,
  });
  
  // User's events
  const { data: userEvents, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['/api/users/events'],
    enabled: !!user,
    throwOnError: false,
  });
  
  // User's artist profile if exists
  const { data: artistProfile, isLoading: isLoadingArtist } = useQuery({
    queryKey: ['/api/users/artist-profile'],
    enabled: !!user,
    throwOnError: false,
  });
  
  // Orders data
  const { data: ordersMade, isLoading: isLoadingOrdersMade } = useQuery({
    queryKey: ['/api/orders/made'],
    enabled: !!user,
    throwOnError: false,
  });
  
  const { data: ordersReceived, isLoading: isLoadingOrdersReceived } = useQuery({
    queryKey: ['/api/orders/received'],
    enabled: !!user && !!artistProfile,
    throwOnError: false,
  });
  
  const { data: ordersAccepted, isLoading: isLoadingOrdersAccepted } = useQuery({
    queryKey: ['/api/orders/accepted'],
    enabled: !!user,
    throwOnError: false,
  });

  // Form state
  const [formData, setFormData] = useState({
    displayName: "",
    username: "",
    bio: "",
    role: "",
    location: "",
    skills: [] as string[],
    photoURL: "",
    category: "",
    subcategory: "",
    tags: [] as string[],
  });
  
  const [newTag, setNewTag] = useState("");

  // Update form data when user data is loaded
  useState(() => {
    if (userData) {
      setFormData({
        displayName: userData.displayName || "",
        username: userData.username || "",
        bio: userData.bio || "",
        role: userData.role || "",
        location: userData.location || "",
        skills: userData.skills || [],
        photoURL: userData.photoURL || "",
        category: userData.category || "",
        subcategory: userData.subcategory || "",
        tags: userData.tags || [],
      });
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user) return null;
      const response = await apiRequest("PATCH", "/api/users/profile", data);
      return response.json();
    },
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['/api/users/profile'] });
      toast({
        title: "Perfil actualizado",
        description: "Tu perfil ha sido actualizado exitosamente",
      });
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el perfil. Inténtalo de nuevo.",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    if (formData.skills.includes(newSkill.trim())) {
      toast({
        variant: "destructive",
        description: "Esta habilidad ya existe",
      });
      return;
    }
    setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
    setNewSkill("");
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancelEdit = () => {
    // Reset form data to original values
    if (userData) {
      setFormData({
        displayName: userData.displayName || "",
        username: userData.username || "",
        bio: userData.bio || "",
        role: userData.role || "",
        location: userData.location || "",
        skills: userData.skills || [],
        photoURL: userData.photoURL || "",
        category: userData.category || "",
        subcategory: userData.subcategory || "",
        tags: userData.tags || [],
      });
    }
    setIsEditing(false);
  };
  
  const handleAddTag = () => {
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
    setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
    setNewTag("");
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      await apiRequest("DELETE", "/api/users", { userId: user.uid });
      await logout();
      toast({
        title: "Cuenta eliminada",
        description: "Tu cuenta ha sido eliminada exitosamente",
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la cuenta. Inténtalo de nuevo.",
      });
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="text-6xl mb-4">👤</div>
        <h1 className="text-2xl font-bold mb-2">Iniciar sesión</h1>
        <p className="text-muted-foreground mb-6">Inicia sesión para ver tu perfil</p>
        <Button onClick={() => setShowAuthDialog(true)}>Iniciar sesión</Button>
        {showAuthDialog && <AuthDialog onClose={() => setShowAuthDialog(false)} />}
      </div>
    );
  }

  if (isLoadingUser || (userData && isEditing && isLoadingArtist)) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <Skeleton className="h-24 w-24 rounded-full mx-auto" />
          <Skeleton className="h-6 w-40 mx-auto mt-4" />
          <Skeleton className="h-4 w-24 mx-auto mt-2" />
        </div>
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-10 w-full mb-4" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-16">
      <div className="flex justify-between items-start mb-6">
        <h1 className="font-bold text-2xl">Mi Perfil</h1>
        {!isEditing && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsEditing(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar perfil
          </Button>
        )}
      </div>

      {!isEditing ? (
        <div className="space-y-6">
          {/* Profile Summary */}
          <div className="text-center">
            <Avatar className="h-24 w-24 mx-auto">
              <AvatarImage src={userData?.photoURL} alt={userData?.displayName} />
              <AvatarFallback>{userData?.displayName?.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold mt-4">{userData?.displayName}</h2>
            <p className="text-muted-foreground">@{userData?.username}</p>
            {userData?.role && (
              <Badge variant="outline" className="mt-2">
                {userData.role}
              </Badge>
            )}
          </div>

          <Tabs defaultValue="profile">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="profile">
                <User className="h-4 w-4 mr-2" />
                Perfil
              </TabsTrigger>
              <TabsTrigger value="orders">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Órdenes
              </TabsTrigger>
              <TabsTrigger value="events">
                <Calendar className="h-4 w-4 mr-2" />
                Eventos
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Config
              </TabsTrigger>
            </TabsList>
            
            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userData?.bio ? (
                    <div>
                      <h3 className="font-medium mb-1">Biografía</h3>
                      <p className="text-muted-foreground">{userData.bio}</p>
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-muted/30 rounded-md">
                      <p className="text-muted-foreground">No has añadido una biografía</p>
                    </div>
                  )}
                  
                  {userData?.location && (
                    <div>
                      <h3 className="font-medium mb-1">Ubicación</h3>
                      <p className="text-muted-foreground">{userData.location}</p>
                    </div>
                  )}
                  
                  {userData?.skills && userData.skills.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Habilidades</h3>
                      <div className="flex flex-wrap gap-2">
                        {userData.skills.map(skill => (
                          <Badge key={skill} variant="outline" className="bg-primary/10 text-primary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Artist Profile Info */}
              {artistProfile ? (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Perfil de Artista</CardTitle>
                    <CardDescription>
                      Tu perfil profesional como artista en la plataforma
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">Categoría</h3>
                          <p className="text-muted-foreground">{artistProfile.category}</p>
                        </div>
                        {artistProfile.subcategory && (
                          <div className="text-right">
                            <h3 className="font-medium">Subcategoría</h3>
                            <p className="text-muted-foreground">{artistProfile.subcategory}</p>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-1">Rango de precios</h3>
                        <p className="text-muted-foreground">
                          {new Intl.NumberFormat('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(artistProfile.minPrice)} - 
                          {new Intl.NumberFormat('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(artistProfile.maxPrice)} / {artistProfile.priceUnit}
                        </p>
                      </div>
                      
                      {artistProfile.gallery && artistProfile.gallery.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-2">Galería</h3>
                          <div className="grid grid-cols-3 gap-2">
                            {artistProfile.gallery.slice(0, 3).map((image, index) => (
                              <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                                <img
                                  src={image}
                                  alt={`Galería ${index + 1}`}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            ))}
                            {artistProfile.gallery.length > 3 && (
                              <div className="flex items-center justify-center aspect-square rounded-md bg-muted">
                                <p className="text-sm">+{artistProfile.gallery.length - 3}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/artist/${artistProfile.id}`}>
                        Ver mi perfil público de artista
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Perfil de Artista</CardTitle>
                    <CardDescription>
                      Crea tu perfil como artista para mostrar tus servicios
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center py-4">
                    <p className="text-muted-foreground mb-4">
                      Aún no tienes un perfil de artista
                    </p>
                    <Button asChild>
                      <Link href="/create-artist-profile">
                        Crear perfil de artista
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* Orders Tab */}
            <TabsContent value="orders" className="mt-6">
              <Tabs defaultValue="made">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="made">
                    <Send className="h-4 w-4 mr-2" />
                    Realizadas
                  </TabsTrigger>
                  <TabsTrigger value="received">
                    <Download className="h-4 w-4 mr-2" />
                    Recibidas
                  </TabsTrigger>
                  <TabsTrigger value="accepted">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aceptadas
                  </TabsTrigger>
                </TabsList>
                
                {/* Orders Made Tab */}
                <TabsContent value="made" className="mt-4">
                  {isLoadingOrdersMade ? (
                    <div className="space-y-4">
                      {Array(2).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-28 w-full rounded-lg" />
                      ))}
                    </div>
                  ) : ordersMade && ordersMade.length > 0 ? (
                    <div className="space-y-4">
                      {ordersMade.map((order: any) => (
                        <Card key={order.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-start space-x-4">
                                <div className="bg-primary/10 p-3 rounded-md">
                                  <Package className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-medium">{order.title}</h3>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Enviada: {format(new Date(order.createdAt), "d 'de' MMMM, yyyy")}
                                  </p>
                                  <div className="flex items-center mt-2">
                                    <Badge className="mr-2">{order.categoryName}</Badge>
                                    <Badge 
                                      variant="outline" 
                                      className={
                                        order.status === 'active' 
                                          ? "bg-amber-100 text-amber-800 hover:bg-amber-100" 
                                          : order.status === 'completed' 
                                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                                            : "bg-red-100 text-red-800 hover:bg-red-100"
                                      }
                                    >
                                      {order.status === 'active' 
                                        ? "Pendiente" 
                                        : order.status === 'completed' 
                                          ? "Completada" 
                                          : "Cancelada"}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-primary">
                                  {new Intl.NumberFormat('es-CO', {
                                    style: 'currency',
                                    currency: 'COP',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  }).format(order.price)}
                                </p>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="mt-2" 
                                  asChild
                                >
                                  <Link href={`/orders/${order.id}`}>
                                    Ver detalles
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-center">
                        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-xl mb-2">No tienes órdenes realizadas</h3>
                        <p className="text-muted-foreground mb-6">
                          Realiza tu primera solicitud de servicio a artistas de la plataforma
                        </p>
                        <Button asChild>
                          <Link href="/offers/new">
                            <Plus className="h-4 w-4 mr-2" />
                            Crear solicitud
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                {/* Orders Received Tab */}
                <TabsContent value="received" className="mt-4">
                  {!artistProfile ? (
                    <Card>
                      <CardContent className="py-8 text-center">
                        <Download className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-xl mb-2">Perfil de artista no encontrado</h3>
                        <p className="text-muted-foreground mb-6">
                          Debes crear un perfil de artista para recibir solicitudes de servicio
                        </p>
                        <Button asChild>
                          <Link href="/create-artist-profile">
                            <Plus className="h-4 w-4 mr-2" />
                            Crear perfil de artista
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ) : isLoadingOrdersReceived ? (
                    <div className="space-y-4">
                      {Array(2).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-lg" />
                      ))}
                    </div>
                  ) : ordersReceived && ordersReceived.length > 0 ? (
                    <div className="space-y-4">
                      {ordersReceived.map((order: any) => (
                        <Card key={order.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-start space-x-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={order.userPhoto} alt={order.userName} />
                                  <AvatarFallback>{order.userName?.slice(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-medium">{order.userName}</h3>
                                  <p className="text-sm text-muted-foreground mt-1">Solicita: {order.title}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Recibida: {format(new Date(order.createdAt), "d 'de' MMMM, yyyy")}
                                  </p>
                                  <div className="flex items-center mt-2">
                                    <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                                      Esperando respuesta
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-primary">
                                  {new Intl.NumberFormat('es-CO', {
                                    style: 'currency',
                                    currency: 'COP',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  }).format(order.price)}
                                </p>
                                <div className="flex space-x-2 mt-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-destructive border-destructive hover:bg-destructive/10"
                                    onClick={() => {
                                      toast({
                                        title: "Solicitud rechazada",
                                        description: "Has rechazado la solicitud de servicio",
                                      });
                                    }}
                                  >
                                    Rechazar
                                  </Button>
                                  <Button 
                                    size="sm"
                                    onClick={() => {
                                      toast({
                                        title: "Solicitud aceptada",
                                        description: "Has aceptado la solicitud de servicio",
                                      });
                                    }}
                                  >
                                    Aceptar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-center">
                        <Download className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-xl mb-2">No tienes solicitudes pendientes</h3>
                        <p className="text-muted-foreground mb-6">
                          Cuando los usuarios te soliciten servicios, aparecerán aquí
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                {/* Orders Accepted Tab */}
                <TabsContent value="accepted" className="mt-4">
                  {isLoadingOrdersAccepted ? (
                    <div className="space-y-4">
                      {Array(2).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-lg" />
                      ))}
                    </div>
                  ) : ordersAccepted && ordersAccepted.length > 0 ? (
                    <div className="space-y-4">
                      {ordersAccepted.map((order: any) => (
                        <Card key={order.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-start space-x-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={order.userPhoto || order.artistPhoto} alt={order.userName || order.artistName} />
                                  <AvatarFallback>
                                    {(order.userName || order.artistName)?.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-medium">{order.userName || order.artistName}</h3>
                                  <p className="text-sm text-muted-foreground mt-1">Servicio: {order.title || order.serviceName}</p>
                                  {order.eventDate && (
                                    <p className="text-sm mt-1">
                                      Fecha del evento: {format(new Date(order.eventDate), "d 'de' MMMM, yyyy")}
                                    </p>
                                  )}
                                  <div className="flex items-center mt-2">
                                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                                      Confirmado
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-primary">
                                  {new Intl.NumberFormat('es-CO', {
                                    style: 'currency',
                                    currency: 'COP',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  }).format(order.price)}
                                </p>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="mt-2"
                                  asChild
                                >
                                  <Link href={`/orders/${order.id}/details`}>
                                    Ver contrato
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-center">
                        <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-xl mb-2">No tienes órdenes aceptadas</h3>
                        <p className="text-muted-foreground mb-6">
                          Una vez aceptes o recibas órdenes confirmadas, aparecerán aquí
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </TabsContent>
            
            {/* Events Tab */}
            <TabsContent value="events" className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">Mis Eventos</h2>
                <Button size="sm" asChild>
                  <Link href="/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear evento
                  </Link>
                </Button>
              </div>
              
              {isLoadingEvents ? (
                Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-lg mb-3" />
                ))
              ) : userEvents && userEvents.length > 0 ? (
                <div className="space-y-4">
                  {userEvents.map(event => (
                    <Card key={event.id}>
                      <CardContent className="p-4">
                        <div className="flex">
                          <div className="w-24 h-24 rounded-md overflow-hidden flex-shrink-0 mr-4">
                            <img
                              src={event.image || "https://via.placeholder.com/100"}
                              alt={event.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-lg truncate">{event.name}</h3>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{format(new Date(event.date), "d MMMM, yyyy")}</span>
                            </div>
                            <Badge 
                              variant={event.eventType === 'virtual' ? "secondary" : "default"}
                              className="mt-2"
                            >
                              {event.eventType === 'virtual' ? "Virtual" : "Presencial"}
                            </Badge>
                          </div>
                          <div className="ml-4 flex flex-col items-end justify-between">
                            <Badge 
                              variant={new Date(event.date) < new Date() ? "outline" : "default"}
                              className={new Date(event.date) < new Date() ? "opacity-60" : ""}
                            >
                              {new Date(event.date) < new Date() ? "Finalizado" : "Próximo"}
                            </Badge>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/event/${event.id}`}>
                                Ver detalles
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold text-xl mb-2">No tienes eventos creados</h3>
                    <p className="text-muted-foreground mb-6">
                      Crea tu primer evento para compartirlo con la comunidad
                    </p>
                    <Button asChild>
                      <Link href="/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Crear evento
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de cuenta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Notificaciones</h3>
                        <p className="text-sm text-muted-foreground">Gestiona tus notificaciones</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Métodos de pago</h3>
                        <p className="text-sm text-muted-foreground">Administra tus métodos de pago</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Gestionar</Button>
                  </div>
                  
                  <Separator />
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <LogOut className="h-4 w-4 mr-2" />
                        Cerrar sesión
                      </Button>
                    </DialogTrigger>
                    <DialogContent aria-describedby="logout-dialog-description">
                      <DialogHeader>
                        <DialogTitle id="logout-dialog-title">¿Cerrar sesión?</DialogTitle>
                        <DialogDescription id="logout-dialog-description">
                          ¿Estás seguro de que quieres cerrar sesión en ArtistConnect?
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => {}}>Cancelar</Button>
                        <Button variant="destructive" onClick={logout}>Cerrar sesión</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar cuenta
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent aria-describedby="alert-dialog-description">
                      <AlertDialogHeader>
                        <AlertDialogTitle id="alert-dialog-title">¿Estás absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription id="alert-dialog-description">
                          Esta acción no se puede deshacer. Eliminará permanentemente tu cuenta y eliminará tus datos de nuestros servidores.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteAccount}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        // Edit Profile Form
        <Card>
          <CardHeader>
            <CardTitle>Editar Perfil</CardTitle>
            <CardDescription>Actualiza tu información personal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center mb-6">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarImage src={formData.photoURL} alt={formData.displayName} />
                  <AvatarFallback>{formData.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" className="mt-2">
                  <Image className="h-4 w-4 mr-2" />
                  Cambiar foto
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Nombre completo</Label>
                  <Input
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Nombre de usuario</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Biografía</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="min-h-[100px] resize-none"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Rol / Profesión</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleSelectChange("role", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Músico">Músico</SelectItem>
                      <SelectItem value="Productor">Productor</SelectItem>
                      <SelectItem value="Artista visual">Artista visual</SelectItem>
                      <SelectItem value="Fotógrafo">Fotógrafo</SelectItem>
                      <SelectItem value="Bailarín">Bailarín</SelectItem>
                      <SelectItem value="DJ">DJ</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Ej. Bogotá, Colombia"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Habilidades</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <button onClick={() => handleRemoveSkill(skill)}>
                        <X className="h-3 w-3 hover:text-destructive" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Añadir habilidad"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  />
                  <Button type="button" onClick={handleAddSkill} size="sm">
                    Añadir
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4 border p-4 rounded-lg bg-muted/10">
                <div className="text-lg font-semibold">Información Profesional de Artista</div>
                <p className="text-sm text-muted-foreground mb-4">
                  Esta información será utilizada para encontrar tu perfil como artista en las búsquedas
                </p>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => {
                        handleSelectChange("category", value);
                        // Reset subcategory when category changes
                        handleSelectChange("subcategory", "");
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(categorias).map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {formData.category && (
                    <div className="space-y-2">
                      <Label htmlFor="subcategory">Subcategoría</Label>
                      <Select
                        value={formData.subcategory}
                        onValueChange={(value) => handleSelectChange("subcategory", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una subcategoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias[formData.category]?.map((subcat) => (
                            <SelectItem key={subcat} value={subcat}>{subcat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label>Etiquetas profesionales (máx 2)</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button onClick={() => handleRemoveTag(tag)}>
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
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      />
                      <Button type="button" onClick={handleAddTag} size="sm">
                        Añadir
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ejemplos: Cantante Pop, Pianista, Fotógrafo de Bodas, Cocinero Vegano
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancelar
            </Button>
            <Button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
