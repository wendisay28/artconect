import { useState, useEffect } from "react";
import { useLocation as useWouterLocation, Link } from "wouter";
import { Home, Compass, Plus, MessageCircle, User } from "lucide-react";

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
          <a className={`flex flex-col items-center py-2 px-4 ${
            isActive("/") ? "text-primary" : "text-muted-foreground"
          }`}>
            <Home size={20} />
            <span className="text-xs mt-1">Inicio</span>
          </a>
        </Link>
        
        <Link href="/explore">
          <a className={`flex flex-col items-center py-2 px-4 ${
            isActive("explore") ? "text-primary" : "text-muted-foreground"
          }`}>
            <Compass size={20} />
            <span className="text-xs mt-1">Explorar</span>
          </a>
        </Link>
        
        <Link href="/create">
          <a className="flex flex-col items-center py-2 px-4 text-muted-foreground">
            <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center -mt-5">
              <Plus size={20} />
            </div>
            <span className="text-xs mt-1">Crear</span>
          </a>
        </Link>
        
        <Link href="/chat">
          <a className={`flex flex-col items-center py-2 px-4 ${
            isActive("chat") ? "text-primary" : "text-muted-foreground"
          }`}>
            <MessageCircle size={20} />
            <span className="text-xs mt-1">Chat</span>
          </a>
        </Link>
        
        <Link href="/profile">
          <a className={`flex flex-col items-center py-2 px-4 ${
            isActive("profile") ? "text-primary" : "text-muted-foreground"
          }`}>
            <User size={20} />
            <span className="text-xs mt-1">Perfil</span>
          </a>
        </Link>
      </div>
    </nav>
  );
}
