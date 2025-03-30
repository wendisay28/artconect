import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/auth-context";
import { useLocation as useLocationContext } from "@/context/location-context";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ChevronLeft, CalendarIcon, Clock, MapPin, Link as LinkIcon } from "lucide-react";

// Extend the event schema from shared schema
const eventSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  eventType: z.enum(["virtual", "physical"], {
    required_error: "Debes seleccionar un tipo de evento",
  }),
  date: z.date({
    required_error: "Debes seleccionar una fecha",
  }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  location: z.string().optional(),
  virtualLink: z.string().url("Ingresa una URL válida").optional(),
  price: z.number().nonnegative("El precio debe ser positivo").optional(),
  isFree: z.boolean().default(false),
  image: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

export default function EventCreatePage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { locationData } = useLocationContext();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: "",
      description: "",
      eventType: "physical",
      date: new Date(),
      time: format(new Date(), "HH:mm"),
      isFree: false,
      price: 0,
    },
  });

  const eventType = form.watch("eventType");
  const isFree = form.watch("isFree");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real app, you would upload this to Firebase Storage
    // For now, we'll just create a data URL for preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: EventFormValues) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para crear un evento",
      });
      return;
    }

    setIsSubmitting(true);

    // Combine date and time
    const dateTime = new Date(data.date);
    const [hours, minutes] = data.time.split(":").map(Number);
    dateTime.setHours(hours, minutes);

    try {
      // Create the event object
      const eventData = {
        creatorId: user.uid,
        name: data.name,
        description: data.description,
        eventType: data.eventType,
        date: dateTime.toISOString(),
        location: data.eventType === "physical" ? data.location : undefined,
        latitude: locationData.coordinates?.latitude,
        longitude: locationData.coordinates?.longitude,
        virtualLink: data.eventType === "virtual" ? data.virtualLink : undefined,
        price: isFree ? 0 : data.price,
        isFree: isFree,
        image: imagePreview || undefined,
      };

      // Send the event data to the server
      await apiRequest("POST", "/api/events", eventData);

      // Invalidate events queries
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/featured'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/nearby'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/explore'] });

      toast({
        title: "Evento creado",
        description: "Tu evento ha sido creado exitosamente",
      });

      // Navigate to home
      navigate("/");
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Hubo un problema al crear el evento. Inténtalo de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold mb-2">Inicio de sesión requerido</h1>
        <p className="text-muted-foreground mb-6">Debes iniciar sesión para crear un evento</p>
        <Button onClick={() => navigate("/")}>Ir al inicio</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-16">
      <header className="flex items-center mb-6">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => navigate("/")}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-bold text-2xl">Crear Evento</h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Información del evento</CardTitle>
          <CardDescription>
            Completa los detalles de tu evento para publicarlo en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de evento</FormLabel>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="physical" id="physical" />
                        <FormLabel htmlFor="physical" className="font-normal cursor-pointer">
                          Presencial
                        </FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="virtual" id="virtual" />
                        <FormLabel htmlFor="virtual" className="font-normal cursor-pointer">
                          Virtual
                        </FormLabel>
                      </div>
                    </RadioGroup>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del evento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Concierto de Jazz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe tu evento en detalle..."
                        className="resize-none min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: es })
                              ) : (
                                <span>Selecciona una fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="HH:MM"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Formato de 24 horas (ej. 18:30)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {eventType === "physical" && (
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicación</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Ej. Teatro Municipal, Bogotá"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Dirección completa donde se realizará el evento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {eventType === "virtual" && (
                <FormField
                  control={form.control}
                  name="virtualLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enlace del evento</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="https://zoom.us/j/example"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Enlace para acceder al evento virtual (Zoom, Google Meet, etc.)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="isFree"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Evento gratuito</FormLabel>
                      <FormDescription>
                        Marca esta opción si tu evento no tiene costo de entrada
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {!isFree && (
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input
                            type="number"
                            placeholder="80000"
                            className="pl-7"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Precio en pesos colombianos (COP)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="space-y-2">
                <FormLabel>Imagen destacada</FormLabel>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mx-auto max-h-[200px] rounded-lg object-cover"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => setImagePreview(null)}
                      >
                        Eliminar imagen
                      </Button>
                    </div>
                  ) : (
                    <div className="py-4">
                      <p className="text-muted-foreground mb-2">
                        Arrastra una imagen o haz clic para seleccionar
                      </p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="event-image"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("event-image")?.click()}
                      >
                        Seleccionar imagen
                      </Button>
                    </div>
                  )}
                </div>
                <FormDescription>
                  Imagen que se mostrará como portada de tu evento. Recomendamos un tamaño de 1200x600px.
                </FormDescription>
              </div>

              <CardFooter className="px-0">
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate("/")}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? "Creando evento..." : "Crear evento"}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
