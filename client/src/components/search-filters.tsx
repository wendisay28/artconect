import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, X, SlidersHorizontal } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface FilterValues {
  category: string;
  subcategory: string;
  priceRange: [number, number];
  location: string;
  useCurrentLocation: boolean;
  distance: number;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  isFree?: boolean;
  isVirtual?: boolean;
  minRating?: number;
}

interface SearchFiltersProps {
  onApplyFilters: (filters: FilterValues) => void;
  triggerButton?: React.ReactNode;
  filterType: 'artists' | 'events';
}

const artistCategories: Category[] = [
  { id: "musicians", name: "Músicos" },
  { id: "visual_artists", name: "Artistas visuales" },
  { id: "dancers", name: "Bailarines" },
  { id: "producers", name: "Productores" },
  { id: "djs", name: "DJs" },
  { id: "actors", name: "Actores" },
];

const eventCategories: Category[] = [
  { id: "concerts", name: "Conciertos" },
  { id: "exhibitions", name: "Exposiciones" },
  { id: "workshops", name: "Talleres" },
  { id: "theater", name: "Teatro" },
  { id: "festivals", name: "Festivales" },
  { id: "nightlife", name: "Vida nocturna" },
];

const artistSubcategories: Record<string, Category[]> = {
  musicians: [
    { id: "guitarists", name: "Guitarristas" },
    { id: "drummers", name: "Bateristas" },
    { id: "singers", name: "Cantantes" },
    { id: "bassists", name: "Bajistas" },
    { id: "pianists", name: "Pianistas" },
    { id: "violinists", name: "Violinistas" },
    { id: "saxophonists", name: "Saxofonistas" },
  ],
  visual_artists: [
    { id: "painters", name: "Pintores" },
    { id: "photographers", name: "Fotógrafos" },
    { id: "sculptors", name: "Escultores" },
    { id: "illustrators", name: "Ilustradores" },
    { id: "graphic_designers", name: "Diseñadores gráficos" },
    { id: "digital_artists", name: "Artistas digitales" },
  ],
  dancers: [
    { id: "contemporary", name: "Contemporáneo" },
    { id: "urban", name: "Urbano" },
    { id: "ballet", name: "Ballet" },
    { id: "salsa", name: "Salsa" },
    { id: "tango", name: "Tango" },
    { id: "flamenco", name: "Flamenco" },
    { id: "breakdance", name: "Breakdance" },
  ],
  producers: [
    { id: "music_producers", name: "Productores musicales" },
    { id: "sound_engineers", name: "Ingenieros de sonido" },
    { id: "lighting_designers", name: "Diseñadores de iluminación" },
    { id: "event_producers", name: "Productores de eventos" },
  ],
  djs: [
    { id: "house_dj", name: "House" },
    { id: "techno_dj", name: "Techno" },
    { id: "reggaeton_dj", name: "Reggaeton" },
    { id: "hiphop_dj", name: "Hip Hop" },
    { id: "electronic_dj", name: "Electrónica" },
    { id: "tropical_dj", name: "Tropical" },
  ],
  actors: [
    { id: "theater_actors", name: "Teatro" },
    { id: "film_actors", name: "Cine" },
    { id: "voice_actors", name: "Voz" },
    { id: "improv_actors", name: "Improvisación" },
  ],
};

const eventSubcategories: Record<string, Category[]> = {
  concerts: [
    { id: "rock_concerts", name: "Rock" },
    { id: "pop_concerts", name: "Pop" },
    { id: "jazz_concerts", name: "Jazz" },
    { id: "classical_concerts", name: "Clásica" },
    { id: "electronic_concerts", name: "Electrónica" },
    { id: "reggaeton_concerts", name: "Reggaeton" },
    { id: "salsa_concerts", name: "Salsa" },
  ],
  exhibitions: [
    { id: "painting_exhibitions", name: "Pintura" },
    { id: "photography_exhibitions", name: "Fotografía" },
    { id: "sculpture_exhibitions", name: "Escultura" },
    { id: "digital_art_exhibitions", name: "Arte digital" },
    { id: "mixed_media_exhibitions", name: "Técnicas mixtas" },
  ],
  workshops: [
    { id: "music_workshops", name: "Música" },
    { id: "art_workshops", name: "Arte" },
    { id: "dance_workshops", name: "Danza" },
    { id: "theater_workshops", name: "Teatro" },
    { id: "creative_writing_workshops", name: "Escritura creativa" },
  ],
  theater: [
    { id: "comedy_theater", name: "Comedia" },
    { id: "drama_theater", name: "Drama" },
    { id: "musical_theater", name: "Musical" },
    { id: "improv_theater", name: "Improvisación" },
    { id: "experimental_theater", name: "Experimental" },
  ],
  festivals: [
    { id: "music_festivals", name: "Música" },
    { id: "art_festivals", name: "Arte" },
    { id: "film_festivals", name: "Cine" },
    { id: "food_festivals", name: "Gastronomía" },
    { id: "cultural_festivals", name: "Cultural" },
  ],
  nightlife: [
    { id: "clubs", name: "Discotecas" },
    { id: "bars", name: "Bares" },
    { id: "live_music_venues", name: "Música en vivo" },
    { id: "rooftops", name: "Terrazas" },
    { id: "themed_parties", name: "Fiestas temáticas" },
  ],
};

export default function SearchFilters({ onApplyFilters, triggerButton, filterType }: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({
    category: filterType === 'artists' ? "musicians" : "concerts",
    subcategory: filterType === 'artists' ? "guitarists" : "rock_concerts",
    priceRange: [50000, 500000],
    location: "",
    useCurrentLocation: true,
    distance: 25,
    dateFrom: undefined,
    dateTo: undefined,
    isFree: false,
    isVirtual: false,
    minRating: 0,
  });

  // Determine which categories and subcategories to use based on filterType
  const categories = filterType === 'artists' ? artistCategories : eventCategories;
  const subcategories = filterType === 'artists' ? artistSubcategories : eventSubcategories;

  // Reset filters when filterType changes
  useEffect(() => {
    setFilters({
      category: filterType === 'artists' ? "musicians" : "concerts",
      subcategory: filterType === 'artists' ? "guitarists" : "rock_concerts",
      priceRange: [50000, 500000],
      location: "",
      useCurrentLocation: true,
      distance: 25,
      dateFrom: undefined,
      dateTo: undefined,
      isFree: false,
      isVirtual: false,
      minRating: 0,
    });
  }, [filterType]);

  const handleCategoryClick = (categoryId: string) => {
    setFilters({
      ...filters,
      category: categoryId,
      subcategory: subcategories[categoryId][0]?.id || "",
    });
  };

  const handleSubcategoryClick = (subcategoryId: string) => {
    setFilters({
      ...filters,
      subcategory: subcategoryId,
    });
  };

  const handlePriceRangeChange = (value: number[]) => {
    setFilters({
      ...filters,
      priceRange: [value[0], value[0]],
    });
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    setFilters({
      category: filterType === 'artists' ? "musicians" : "concerts",
      subcategory: filterType === 'artists' ? "guitarists" : "rock_concerts",
      priceRange: [50000, 500000],
      location: "",
      useCurrentLocation: true,
      distance: 25,
      dateFrom: undefined,
      dateTo: undefined,
      isFree: false,
      isVirtual: false,
      minRating: 0,
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {triggerButton || (
          <Button variant="outline" size="sm" id="open-filters-btn">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-xl overflow-y-auto">
        <SheetHeader className="flex justify-between items-center mb-6">
          <SheetTitle className="text-xl font-bold">Filtros de búsqueda</SheetTitle>
          <SheetClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
        </SheetHeader>
        
        <div className="space-y-6">
          {/* Categories */}
          <div>
            <h3 className="font-medium mb-2">Categoría</h3>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={filters.category === category.id ? "default" : "outline"}
                  className="py-2"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Subcategories */}
          <div>
            <h3 className="font-medium mb-2">Subcategoría</h3>
            <div className="grid grid-cols-2 gap-2">
              {subcategories[filters.category]?.map((subcategory) => (
                <Button
                  key={subcategory.id}
                  variant={filters.subcategory === subcategory.id ? "default" : "outline"}
                  className="py-2"
                  onClick={() => handleSubcategoryClick(subcategory.id)}
                >
                  {subcategory.name}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Price Range */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Rango de precio</h3>
              <span className="text-sm text-muted-foreground">
                {formatPrice(filters.priceRange[0])}
              </span>
            </div>
            <Slider
              value={[filters.priceRange[0]]}
              min={50000}
              max={5000000}
              step={50000}
              onValueChange={handlePriceRangeChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>$50,000</span>
              <span>$5,000,000</span>
            </div>
          </div>
          
          {/* Location */}
          <div>
            <h3 className="font-medium mb-2">Ubicación</h3>
            <div className="relative">
              {filters.useCurrentLocation ? (
                <Input
                  placeholder="Ubicación actual (GPS)"
                  value="Mi ubicación actual"
                  disabled={true}
                  className="mb-2"
                />
              ) : (
                <div className="mb-2">
                  <select
                    className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  >
                    <option value="">Selecciona una ciudad</option>
                    <option value="Bogotá">Bogotá</option>
                    <option value="Medellín">Medellín</option>
                    <option value="Cali">Cali</option>
                    <option value="Barranquilla">Barranquilla</option>
                    <option value="Cartagena">Cartagena</option>
                    <option value="Santa Marta">Santa Marta</option>
                    <option value="Bucaramanga">Bucaramanga</option>
                    <option value="Pereira">Pereira</option>
                    <option value="Manizales">Manizales</option>
                    <option value="Armenia">Armenia</option>
                    <option value="Villavicencio">Villavicencio</option>
                  </select>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox 
                id="useCurrentLocation" 
                checked={filters.useCurrentLocation}
                onCheckedChange={(checked) => 
                  setFilters({ ...filters, useCurrentLocation: checked === true })
                }
              />
              <Label htmlFor="useCurrentLocation">Usar mi ubicación actual</Label>
            </div>
            <div>
              <Label className="text-sm">Mostrar {filterType === 'artists' ? 'artistas' : 'eventos'} en un radio de {filters.distance} km</Label>
              <Slider
                value={[filters.distance]}
                min={5}
                max={100}
                step={5}
                onValueChange={(value) => setFilters({ ...filters, distance: value[0] })}
                className="w-full mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>5 km</span>
                <span>100 km</span>
              </div>
            </div>
          </div>
          
          {/* Availability */}
          <div>
            <h3 className="font-medium mb-2">Disponibilidad</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-sm mb-1 block">Fecha desde</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateFrom ? (
                        format(filters.dateFrom, "PPP", { locale: es })
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={(date) => setFilters({ ...filters, dateFrom: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label className="text-sm mb-1 block">Fecha hasta</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateTo ? (
                        format(filters.dateTo, "PPP", { locale: es })
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={(date) => setFilters({ ...filters, dateTo: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          
          {/* Event specific filters */}
          {filterType === 'events' && (
            <div>
              <h3 className="font-medium mb-2">Opciones de eventos</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isFree" 
                    checked={filters.isFree}
                    onCheckedChange={(checked) => 
                      setFilters({ ...filters, isFree: checked === true })
                    }
                  />
                  <Label htmlFor="isFree">Solo eventos gratuitos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isVirtual" 
                    checked={filters.isVirtual}
                    onCheckedChange={(checked) => 
                      setFilters({ ...filters, isVirtual: checked === true })
                    }
                  />
                  <Label htmlFor="isVirtual">Incluir eventos virtuales</Label>
                </div>
              </div>
            </div>
          )}
          
          {/* Artist specific filters */}
          {filterType === 'artists' && (
            <div>
              <h3 className="font-medium mb-2">Calificación mínima</h3>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[filters.minRating || 0]}
                  min={0}
                  max={5}
                  step={0.5}
                  onValueChange={(value) => setFilters({ ...filters, minRating: value[0] })}
                  className="w-full"
                />
                <span className="text-sm font-medium text-primary min-w-[30px] text-center">
                  {filters.minRating || 0}/5
                </span>
              </div>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex space-x-4 pt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleClearFilters}
            >
              Limpiar filtros
            </Button>
            <Button 
              className="flex-1"
              onClick={handleApplyFilters}
            >
              Aplicar filtros
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
