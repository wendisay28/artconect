import { useState, useEffect } from "react";
import { useLocation as useWouterLocation, Link } from "wouter";
import { Home, Compass, MessageSquare, Bookmark, User, Clock } from "lucide-react";

export default function BottomNavigation() {
  const [location] = useWouterLocation();
  const [activeTab, setActiveTab] = useState("/");

  useEffect(() => {
    // Update active tab when location changes
    setActiveTab(location.split("/")[1] || "/");
  }, [location]);

  const isActive = (path: string) => {
    if (path === "/" && activeTab === "/") return true;
    if (path !== "/" && activeTab === path) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-30 shadow-sm">
      <div className="flex justify-around">
        <Link href="/">
          <div className={`flex flex-col items-center py-2 px-4 ${
            isActive("/") ? "text-primary" : "text-muted-foreground"
          }`}>
            <Home size={20} />
            <span className="text-xs mt-1">Inicio</span>
          </div>
        </Link>
        
        <Link href="/explore">
          <div className={`flex flex-col items-center py-2 px-4 ${
            isActive("explore") ? "text-primary" : "text-muted-foreground"
          }`}>
            <Compass size={20} />
            <span className="text-xs mt-1">Explorar</span>
          </div>
        </Link>
        
        <Link href="/real-time-offers">
          <div className="flex flex-col items-center py-2 px-4 text-muted-foreground">
            <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center -mt-5">
              <Clock size={20} />
            </div>
            <span className="text-xs mt-1">En vivo</span>
          </div>
        </Link>
        
        <Link href="/favorites">
          <div className={`flex flex-col items-center py-2 px-4 ${
            isActive("favorites") ? "text-primary" : "text-muted-foreground"
          }`}>
            <Bookmark size={20} />
            <span className="text-xs mt-1">Favoritos</span>
          </div>
        </Link>
        
        <Link href="/profile">
          <div className={`flex flex-col items-center py-2 px-4 ${
            isActive("profile") ? "text-primary" : "text-muted-foreground"
          }`}>
            <User size={20} />
            <span className="text-xs mt-1">Perfil</span>
          </div>
        </Link>
      </div>
    </nav>
  );
}
