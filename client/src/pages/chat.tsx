import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import ChatMessage from "@/components/chat-message";
import { Send, ArrowLeft, MoreVertical, Info, UserCheck, VideoIcon, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useLocation, Link } from "wouter";
import { useWebSocket } from "@/lib/websocket";

export default function ChatPage() {
  const [location] = useLocation();
  const chatId = parseInt(location.split("/")[2]);
  const [message, setMessage] = useState("");
  const { sendMessage, messages } = useWebSocket(chatId);
  const [chatDetails, setChatDetails] = useState<any>(null);

  useEffect(() => {
    // Cargar detalles del chat
    fetch(`/api/chats/${chatId}`)
      .then(res => res.json())
      .then(data => setChatDetails(data))
      .catch(console.error);
  }, [chatId]);

  if (!chatDetails) {
    return <div>Cargando...</div>;
  }

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage(message);
    setMessage("");
  };

  const getOtherUser = () => {
    return {
      name: chatDetails.otherUser?.displayName || "Usuario",
      photoURL: chatDetails.otherUser?.photoURL
    };
  };

  const otherUser = getOtherUser();

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Link href="/chats">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <Avatar>
            <AvatarImage src={otherUser.photoURL} />
            <AvatarFallback>{otherUser.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{otherUser.name}</h2>
            <p className="text-sm text-muted-foreground">En línea</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <VideoIcon className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Info className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <UserCheck className="h-4 w-4 mr-2" />
                Ver perfil
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Bloquear usuario
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <ChatMessage
            key={i}
            id={msg.id}
            senderId={msg.senderId}
            senderName={msg.senderName}
            content={msg.content}
            timestamp={new Date(msg.timestamp)}
            isCurrentUser={msg.isCurrentUser}
            status={msg.status}
          />
        ))}
      </div>

      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}