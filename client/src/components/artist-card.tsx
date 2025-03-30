import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Link } from "wouter";

interface ArtistCardProps {
  id: string;
  name: string;
  role: string;
  price: number;
  priceUnit: string;
  imageUrl: string;
  variant?: "grid" | "horizontal";
}

export default function ArtistCard({
  id,
  name,
  role,
  price,
  priceUnit,
  imageUrl,
  variant = "grid"
}: ArtistCardProps) {
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (variant === "horizontal") {
    return (
      <Link href={`/artist/${id}`} className="block">
        <Card className="overflow-hidden">
          <div className="flex">
            <div className="w-1/3 relative">
              <AspectRatio ratio={1/1}>
                <img
                  src={imageUrl || "https://via.placeholder.com/300"}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </AspectRatio>
            </div>
            <CardContent className="p-3 flex-1">
              <h3 className="font-medium">{name}</h3>
              <p className="text-muted-foreground text-sm">{role}</p>
              <div className="flex items-center mt-1">
                <span className="text-primary font-medium">{formatPrice(price)}</span>
                <span className="text-muted-foreground text-xs ml-1">/ {priceUnit}</span>
              </div>
            </CardContent>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/artist/${id}`} className="block">
      <Card className="overflow-hidden">
        <AspectRatio ratio={1/1}>
          <img
            src={imageUrl || "https://via.placeholder.com/300"}
            alt={name}
            className="w-full h-full object-cover"
          />
        </AspectRatio>
        <CardContent className="p-2">
          <h3 className="font-medium text-sm truncate">{name}</h3>
          <p className="text-muted-foreground text-xs">{role}</p>
          <div className="flex items-center mt-1">
            <span className="text-primary text-xs font-medium">{formatPrice(price)}</span>
            <span className="text-muted-foreground text-xs ml-1">/ {priceUnit}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
