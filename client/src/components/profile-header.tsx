import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronLeft, Star, BookmarkPlus, Share2, MessageCircle } from "lucide-react";

interface ProfileHeaderProps {
  coverImageUrl: string;
  profileImageUrl: string;
  name: string;
  role: string;
  location: string;
  rating?: number;
  reviewCount?: number;
  onBookmark?: () => void;
  onShare?: () => void;
  onContact?: () => void;
}

export default function ProfileHeader({
  coverImageUrl,
  profileImageUrl,
  name,
  role,
  location,
  rating,
  reviewCount,
  onBookmark,
  onShare,
  onContact
}: ProfileHeaderProps) {
  return (
    <div className="relative">
      {/* Profile Header/Cover */}
      <div className="h-48 bg-gray-300 dark:bg-gray-800 relative">
        <img 
          src={coverImageUrl || "https://via.placeholder.com/1200x400"}
          alt="Cover" 
          className="w-full h-full object-cover"
        />
        
        {/* Back button */}
        <Link href="/explore">
          <a className="absolute top-4 left-4 bg-black/30 p-2 rounded-full text-white">
            <ChevronLeft className="h-5 w-5" />
          </a>
        </Link>
        
        {/* Action buttons */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-black/30 border-0 text-white hover:bg-black/50"
            onClick={onBookmark}
          >
            <BookmarkPlus className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-black/30 border-0 text-white hover:bg-black/50"
            onClick={onShare}
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Profile Picture */}
      <div className="absolute -bottom-16 left-4 w-32 h-32 rounded-full border-4 border-background overflow-hidden shadow-md">
        <Avatar className="h-full w-full">
          <AvatarImage src={profileImageUrl} alt={name} />
          <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
      
      {/* Contact button */}
      <Button 
        className="absolute -bottom-8 right-4 shadow-md"
        onClick={onContact}
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        Contactar
      </Button>
    </div>
  );
}
