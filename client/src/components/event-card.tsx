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
    <Link href={`/event/${id}`}>
      <a className="block">
        <Card className="overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            <div className="sm:w-1/3 relative">
              <img 
                src={imageUrl || "https://via.placeholder.com/500x300"} 
                alt={name} 
                className="w-full h-full sm:h-32 object-cover"
              />
              <Badge className="absolute top-2 left-2" variant={isVirtual ? "secondary" : "default"}>
                {isVirtual ? "Virtual" : "Presencial"}
              </Badge>
            </div>
            <CardContent className="p-3 flex-1">
              <div className="flex justify-between">
                <h3 className="font-medium">{name}</h3>
                <span className="text-primary font-medium">{formatPrice(price)}</span>
              </div>
              <p className="text-muted-foreground text-sm mt-1 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {format(date, "EEEE, d 'de' MMMM • HH:mm", { locale: es })}
              </p>
              <p className="text-muted-foreground text-sm mt-1 flex items-center">
                {isVirtual ? (
                  <>
                    <Video className="h-4 w-4 mr-1" />
                    Evento virtual
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-1" />
                    {location}
                  </>
                )}
              </p>
              <div className="flex mt-2 border-t border-border pt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1 text-primary"
                  onClick={handleSave}
                >
                  <Bookmark className="h-4 w-4 mr-1" />
                  Guardar
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1 text-primary"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Compartir
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      </a>
    </Link>
  );
}
