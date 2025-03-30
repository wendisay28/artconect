import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Send, ArrowLeft, MoreVertical, Info, UserCheck, VideoIcon, Phone } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ChatPage() {
  const { id } = useParams();
  const [searchParams] = useLocation();
  const params = new URLSearchParams(searchParams);
  const artistId = params.get("artistId");
  
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get all chats for the current user
  const { data: chats, isLoading: isLoadingChats } = useQuery({
    queryKey: ['/api/chats'],
    enabled: !!user,
    throwOnError: false,
  });
  
  // Get messages for a specific chat
  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['/api/chats', id, 'messages'],
    enabled: !!id && !!user,
    throwOnError: false,
  });
  
  // Get chat details (including the other user)
  const { data: chatDetails } = useQuery({
    queryKey: ['/api/chats', id],
    enabled: !!id && !!user,
    throwOnError: false,
  });
  
  // Get artist details if coming from artist profile
  const { data: artistDetails } = useQuery({
    queryKey: ['/api/artists', artistId],
    enabled: !!artistId && !id,
    throwOnError: false,
  });

  // Create a new chat
  const createChatMutation = useMutation({
    mutationFn: async () => {
      if (!user || !artistId) return null;
      const response = await apiRequest("POST", "/api/chats", {
        userId: user.uid,
        artistId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data) {
        // Reset location parameters and navigate to the new chat
        window.history.replaceState({}, document.title, `/chat/${data.id}`);
        // Invalidate chats query
        queryClient.invalidateQueries({ queryKey: ['/api/chats'] });
      }
    },
    onError: (error) => {
      console.error("Error creating chat:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo iniciar el chat. Inténtalo de nuevo más tarde.",
      });
    },
  });

  // Send a message
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user || !id) return null;
      const response = await apiRequest("POST", `/api/chats/${id}/messages`, {
        senderId: user.uid,
        content,
      });
      return response.json();
    },
    onSuccess: () => {
      setMessage("");
      // Invalidate messages query
      queryClient.invalidateQueries({ queryKey: ['/api/chats', id, 'messages'] });
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el mensaje. Inténtalo de nuevo.",
      });
    },
  });

  // If coming from artist profile and no chat ID, create a new chat
  useEffect(() => {
    if (artistId && !id && user && artistDetails) {
      createChatMutation.mutate();
    }
  }, [artistId, id, user, artistDetails]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !id) return;
    sendMessageMutation.mutate(message);
  };

  const getOtherUser = () => {
    if (!chatDetails) return null;
    
    const otherUserId = chatDetails.user1Id === user?.uid 
      ? chatDetails.user2Id 
      : chatDetails.user1Id;
    
    return chatDetails.participants?.find(p => p.id === otherUserId);
  };

  const otherUser = getOtherUser();

  // If no chat is selected, show the chat list
  if (!id) {
    return (
      <div className="container mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="font-bold text-2xl">Chats</h1>
          <p className="text-muted-foreground">Conversaciones con artistas y clientes</p>
        </header>

        <div className="space-y-2">
          {isLoadingChats ? (
            Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))
          ) : chats && chats.length > 0 ? (
            chats.map(chat => {
              const otherParticipant = chat.participants.find(p => p.id !== user?.uid);
              const lastMessage = chat.lastMessage;
              
              return (
                <a href={`/chat/${chat.id}`} key={chat.id}>
                  <Card className="hover:bg-accent/10 transition-colors">
                    <CardContent className="p-4 flex items-center">
                      <Avatar className="h-12 w-12 mr-3">
                        <AvatarImage src={otherParticipant?.photoURL} alt={otherParticipant?.displayName} />
                        <AvatarFallback>{otherParticipant?.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium truncate">{otherParticipant?.displayName}</h3>
                          {lastMessage && (
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(lastMessage.createdAt), "HH:mm")}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {lastMessage ? lastMessage.content : "No hay mensajes"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              );
            })
          ) : (
            <Card>
              <CardContent className="py-6 text-center">
                <p className="text-muted-foreground">No tienes conversaciones activas</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Explora artistas y eventos para iniciar una conversación
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Chat header */}
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <a href="/chat">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </a>
          {otherUser ? (
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={otherUser.photoURL} alt={otherUser.displayName} />
                <AvatarFallback>{otherUser.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-medium">{otherUser.displayName}</h2>
                <p className="text-xs text-muted-foreground">{otherUser.online ? "En línea" : "Desconectado"}</p>
              </div>
            </div>
          ) : (
            <Skeleton className="h-10 w-40" />
          )}
        </div>
        
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="text-muted-foreground" disabled>
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground" disabled>
            <VideoIcon className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Info className="h-4 w-4 mr-2" />
                Ver perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserCheck className="h-4 w-4 mr-2" />
                Añadir a favoritos
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingMessages ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
              <Skeleton className={`h-12 w-2/3 rounded-lg ${i % 2 === 0 ? "rounded-tl-none" : "rounded-tr-none"}`} />
            </div>
          ))
        ) : messages && messages.length > 0 ? (
          messages.map((msg) => {
            const isSentByMe = msg.senderId === user?.uid;
            return (
              <div key={msg.id} className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] ${isSentByMe ? "bg-primary text-primary-foreground" : "bg-muted"} rounded-lg p-3 ${isSentByMe ? "rounded-tr-none" : "rounded-tl-none"}`}>
                  <p className="break-words">{msg.content}</p>
                  <p className="text-xs opacity-70 text-right mt-1">
                    {format(new Date(msg.createdAt), "HH:mm")}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">No hay mensajes</p>
              <p className="text-sm text-muted-foreground mt-1">
                Envía un mensaje para iniciar la conversación
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center">
        <Input 
          placeholder="Escribe un mensaje..." 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          className="mr-2"
        />
        <Button 
          type="submit" 
          size="icon"
          disabled={!message.trim() || sendMessageMutation.isPending}
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
