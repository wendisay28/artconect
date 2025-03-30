import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Video, Bookmark, Share2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface EventCardProps {
  id: string;
  name: string;
  date: Date;
  location: string;
  price: number;
  imageUrl: string;
  isFree?: boolean;
  isVirtual?: boolean;
  onSave?: (id: string) => void;
  onShare?: (id: string) => void;
}

export default function EventCard({
  id,
  name,
  date,
  location,
  price,
  imageUrl,
  isFree = false,
  isVirtual = false,
  onSave,
  onShare
}: EventCardProps) {
  const formatPrice = (value: number) => {
    if (isFree) return "Gratis";
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSave) onSave(id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onShare) onShare(id);
  };

  return (
    <Link href={`/event/${id}`} className="block h-full">
      <Card className="overflow-hidden h-full">
        <div className="flex flex-col h-full">
          <div className="relative h-40">
            <img 
              src={imageUrl || "https://via.placeholder.com/500x300"} 
              alt={name} 
              className="w-full h-full object-cover"
            />
            <Badge className="absolute top-2 left-2" variant={isVirtual ? "secondary" : "default"}>
              {isVirtual ? "Virtual" : "Presencial"}
            </Badge>
            <div className="absolute top-2 right-2">
              <Badge variant="outline" className="bg-white/80">
                {formatPrice(price)}
              </Badge>
            </div>
          </div>
          <CardContent className="p-3 flex-1 flex flex-col">
            <div>
              <h3 className="font-medium truncate">{name}</h3>
              <p className="text-muted-foreground text-sm mt-1 flex items-center">
                <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="truncate">{format(date, "EEEE, d 'de' MMMM • HH:mm", { locale: es })}</span>
              </p>
              <p className="text-muted-foreground text-sm mt-1 flex items-center">
                {isVirtual ? (
                  <>
                    <Video className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">Evento virtual</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{location}</span>
                  </>
                )}
              </p>
            </div>
            <div className="flex mt-auto border-t border-border pt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-1 text-primary"
                onClick={handleSave}
              >
                <Bookmark className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline-block">Guardar</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-1 text-primary"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline-block">Compartir</span>
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}
