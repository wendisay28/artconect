
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Info, Send, Star, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface SwipeableCardProps {
  id: string;
  imageUrl: string;
  name: string;
  age?: number;
  role: string;
  location: string;
  distance?: number;
  priceRange: string;
  rating?: number;
  onLike: (id: string) => void;
  onDislike: (id: string) => void;
  onOffer?: (id: string) => void;
  isLast?: boolean;
}

export default function SwipeableCard({
  id,
  imageUrl,
  name,
  age,
  role,
  location,
  distance,
  priceRange,
  rating,
  onLike,
  onDislike,
  onOffer,
  isLast = false
}: SwipeableCardProps) {
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isSwiping = useRef(false);
  const { toast } = useToast();

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    isSwiping.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping.current) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    setOffsetX(diff);
    
    if (diff > 50) {
      setSwipeDirection("right");
    } else if (diff < -50) {
      setSwipeDirection("left");
    } else {
      setSwipeDirection(null);
    }
  };

  const handleTouchEnd = () => {
    isSwiping.current = false;
    
    if (offsetX > 100) {
      handleLike();
    } else if (offsetX < -100) {
      handleDislike();
    }
    setOffsetX(0);
    setSwipeDirection(null);
  };

  const handleDislike = async () => {
    setSwipeDirection("left");
    setIsLoading(true);
    try {
      await onDislike(id);
      toast({
        description: "Artista descartado",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Error al descartar artista",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    setSwipeDirection("right");
    setIsLoading(true);
    try {
      await onLike(id);
      setIsLiked(true);
      toast({
        description: "¡Artista guardado en favoritos!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Error al guardar en favoritos",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOffer = async () => {
    if (onOffer) {
      setIsLoading(true);
      try {
        await onOffer(id);
        toast({
          description: "Oferta enviada exitosamente",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          description: "Error al enviar oferta",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      isSwiping.current = false;
    };
  }, []);

  return (
    <Card 
      ref={cardRef}
      className={cn(
        "absolute inset-0 rounded-xl overflow-hidden shadow-xl transition-all duration-300",
        swipeDirection === "left" && "animate-swipe-left",
        swipeDirection === "right" && "animate-swipe-right",
        isLoading && "opacity-80"
      )}
      style={{ 
        transform: `translateX(${offsetX}px) rotate(${offsetX * 0.05}deg)`,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative h-full bg-gradient-to-b from-transparent to-black/60">
        <img 
          src={imageUrl || "https://via.placeholder.com/600x800"}
          alt={name} 
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Indicators */}
        {swipeDirection === "right" && (
          <div className="absolute top-6 right-6 bg-green-500 text-white px-4 py-2 rounded-full text-lg font-bold border-2 border-white transform rotate-12 animate-bounce">
            LIKE
          </div>
        )}
        {swipeDirection === "left" && (
          <div className="absolute top-6 left-6 bg-red-500 text-white px-4 py-2 rounded-full text-lg font-bold border-2 border-white transform -rotate-12 animate-bounce">
            NOPE
          </div>
        )}
        
        {/* Artist Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="space-y-4">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-2">
                {name}
                {age && <span className="text-xl">{age}</span>}
                {rating && (
                  <div className="flex items-center text-yellow-400 text-sm ml-2">
                    <Star className="fill-current h-4 w-4 mr-1" />
                    {rating.toFixed(1)}
                  </div>
                )}
              </h2>
              <p className="text-lg opacity-90 flex items-center gap-2 mt-1">
                <span className="bg-primary/20 px-2 py-1 rounded-full text-sm">{role}</span>
              </p>
              <p className="flex items-center gap-2 mt-2 text-sm opacity-80">
                <MapPin className="h-4 w-4" />
                {location}
                {distance && <span className="opacity-60">• {distance} km</span>}
              </p>
              <p className="mt-2 text-lg font-semibold">{priceRange}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300",
                  isLiked && "bg-red-500/50 hover:bg-red-500/60"
                )}
                onClick={handleLike}
                disabled={isLoading}
              >
                <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
              </Button>

              <Button
                className="bg-primary hover:bg-primary/90 text-white px-6"
                onClick={handleOffer}
                disabled={isLoading}
              >
                <Send className="h-4 w-4 mr-2" />
                Ofertar
              </Button>

              <Link href={`/artist/${id}`}>
                <Button
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20"
                >
                  <Info className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
