import { useState } from "react";
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
}

interface SearchFiltersProps {
  onApplyFilters: (filters: FilterValues) => void;
  triggerButton?: React.ReactNode;
}

const categories: Category[] = [
  { id: "musicians", name: "Músicos" },
  { id: "visual_artists", name: "Artistas visuales" },
  { id: "dancers", name: "Bailarines" },
  { id: "producers", name: "Productores" },
];

const subcategories: Record<string, Category[]> = {
  musicians: [
    { id: "guitarists", name: "Guitarristas" },
    { id: "drummers", name: "Bateristas" },
    { id: "singers", name: "Cantantes" },
    { id: "bassists", name: "Bajistas" },
  ],
  visual_artists: [
    { id: "painters", name: "Pintores" },
    { id: "photographers", name: "Fotógrafos" },
    { id: "sculptors", name: "Escultores" },
  ],
  dancers: [
    { id: "contemporary", name: "Contemporáneo" },
    { id: "urban", name: "Urbano" },
    { id: "ballet", name: "Ballet" },
  ],
  producers: [
    { id: "music_producers", name: "Productores musicales" },
    { id: "sound_engineers", name: "Ingenieros de sonido" },
  ],
};

export default function SearchFilters({ onApplyFilters, triggerButton }: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({
    category: "musicians",
    subcategory: "guitarists",
    priceRange: [50000, 500000],
    location: "",
    useCurrentLocation: true,
    distance: 25,
    dateFrom: undefined,
    dateTo: undefined,
  });

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
      category: "musicians",
      subcategory: "guitarists",
      priceRange: [50000, 500000],
      location: "",
      useCurrentLocation: true,
      distance: 25,
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {triggerButton || (
          <Button variant="outline" size="sm">
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
              <Input
                placeholder="Ingresa una ubicación"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                disabled={filters.useCurrentLocation}
                className="mb-2"
              />
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
              <Label className="text-sm">Mostrar artistas en un radio de {filters.distance} km</Label>
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
