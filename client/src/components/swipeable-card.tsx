import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, ThumbsUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface SwipeableCardProps {
  id: string;
  imageUrl: string;
  name: string;
  age?: number;
  role: string;
  location: string;
  distance?: number;
  priceRange: string;
  onLike: (id: string) => void;
  onDislike: (id: string) => void;
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
  onLike,
  onDislike,
  isLast = false
}: SwipeableCardProps) {
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const isSwiping = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    isSwiping.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping.current) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    setOffsetX(diff);
    
    // Determine swipe direction for visual feedback
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
      // Swipe right - like
      onLike(id);
    } else if (offsetX < -100) {
      // Swipe left - dislike
      onDislike(id);
    } else {
      // Reset position
      setOffsetX(0);
      setSwipeDirection(null);
    }
  };

  const handleDislike = () => {
    setSwipeDirection("left");
    setTimeout(() => {
      onDislike(id);
    }, 200);
  };

  const handleLike = () => {
    setSwipeDirection("right");
    setTimeout(() => {
      onLike(id);
    }, 200);
  };

  useEffect(() => {
    // Cleanup function
    return () => {
      isSwiping.current = false;
    };
  }, []);

  return (
    <Card 
      ref={cardRef}
      className={cn(
        "absolute inset-0 rounded-xl overflow-hidden shadow-xl transition-transform",
        swipeDirection === "left" && "animate-swipe-left",
        swipeDirection === "right" && "animate-swipe-right"
      )}
      style={{ 
        transform: `translateX(${offsetX}px) rotate(${offsetX * 0.05}deg)`,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative h-full">
        <img 
          src={imageUrl || "https://via.placeholder.com/600x800"}
          alt={name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        {/* Like/Dislike Indicators */}
        {swipeDirection === "right" && (
          <div className="absolute top-6 right-6 bg-green-500 text-white px-4 py-2 rounded-full text-lg font-bold border-2 border-white transform rotate-12">
            LIKE
          </div>
        )}
        {swipeDirection === "left" && (
          <div className="absolute top-6 left-6 bg-red-500 text-white px-4 py-2 rounded-full text-lg font-bold border-2 border-white transform -rotate-12">
            NOPE
          </div>
        )}
        
        {/* Artist Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-white text-3xl font-bold">
                {name}{age ? `, ${age}` : ""}
              </h2>
              <p className="text-white/90 flex items-center mt-1">
                <span className="mr-1">🎵</span>
                {role}
              </p>
              <p className="text-white/90 flex items-center mt-1">
                <span className="mr-1">📍</span>
                {location}{distance ? `, ${distance} km` : ""}
              </p>
              <p className="text-white/90 flex items-center mt-1">
                <span className="mr-1">💰</span>
                {priceRange}
              </p>
            </div>
            
            <Link href={`/artist/${id}`}>
              <a>
                <Button className="bg-white text-primary hover:bg-gray-100 h-10 w-10 rounded-full p-0">
                  <Info className="h-5 w-5" />
                </Button>
              </a>
            </Link>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center space-x-4 mb-4 pt-20">
          <Button
            variant="outline"
            size="icon"
            className="bg-white h-14 w-14 rounded-full"
            onClick={handleDislike}
          >
            <X className="h-6 w-6 text-red-500" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-white h-14 w-14 rounded-full"
            onClick={handleLike}
          >
            <ThumbsUp className="h-6 w-6 text-green-500" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
