import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Link } from "wouter";

interface BannerItem {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
}

interface BannerCarouselProps {
  items: BannerItem[];
  autoPlay?: boolean;
  interval?: number;
}

export default function BannerCarousel({ 
  items, 
  autoPlay = true, 
  interval = 5000 
}: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === items.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, items.length]);

  if (items.length === 0) {
    return (
      <Card className="h-44 flex items-center justify-center">
        <p className="text-muted-foreground">No hay eventos destacados</p>
      </Card>
    );
  }

  return (
    <div className="relative h-44 rounded-xl overflow-hidden shadow-sm">
      {items.map((item, index) => (
        <div 
          key={item.id}
          className="absolute inset-0 transition-opacity duration-500"
          style={{ opacity: index === currentIndex ? 1 : 0 }}
        >
          <img 
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
            <h3 className="font-bold text-white text-xl">{item.title}</h3>
            <p className="text-white opacity-90">{item.subtitle}</p>
            <Link href={`/event/${item.id}`}>
              <a>
                <Button 
                  variant="default" 
                  size="sm"
                  className="mt-2 w-max"
                >
                  <Calendar className="mr-1 h-4 w-4" />
                  Ver detalles
                </Button>
              </a>
            </Link>
          </div>
        </div>
      ))}
      
      {/* Carousel indicators */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
        {items.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentIndex ? "bg-white" : "bg-white/50"
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
