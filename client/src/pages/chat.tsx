
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Send, ArrowLeft, MoreVertical, Info, UserCheck, VideoIcon, Phone } from "lucide-react";
import { format } from "date-fns";
import ChatMessage from "@/components/chat-message";
import { useWebSocket } from '@/lib/websocket';
import { useAuth } from '@/hooks/use-firebase-auth';

export default function ChatPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const { status: wsStatus, send } = useWebSocket();

  const chatId = window.location.pathname.split('/').pop();
  const [otherUser, setOtherUser] = useState(null);

  useEffect(() => {
    if (!chatId) return;

    fetch(`/api/chats/${chatId}/messages`)
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        setIsLoadingMessages(false);
      })
      .catch(err => {
        console.error('Error cargando mensajes:', err);
        setIsLoadingMessages(false);
      });

    fetch(`/api/chats/${chatId}`)
      .then(res => res.json())
      .then(chatData => {
        if (!user) return;
        const otherUserId = chatData.user1Id === user.uid ? chatData.user2Id : chatData.user1Id;
        return fetch(`/api/users/${otherUserId}`);
      })
      .then(res => res.json())
      .then(userData => {
        setOtherUser(userData);
      })
      .catch(err => {
        console.error('Error cargando detalles del usuario:', err);
      });
  }, [chatId, user]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || wsStatus !== "open") return;

    const messageData = {
      type: 'chat_message',
      payload: {
        chatId: parseInt(chatId),
        senderId: user.uid,
        content: inputMessage,
        timestamp: Date.now()
      }
    };

    send(messageData);
    setInputMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setLocation('/chats')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage src={otherUser?.photoURL} />
            <AvatarFallback>{otherUser?.displayName?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{otherUser?.displayName || 'Usuario'}</h2>
            <p className="text-xs text-muted-foreground">
              {wsStatus === "open" ? 'En línea' : 'Desconectado'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
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
                Bloquear usuario
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoadingMessages ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                <Skeleton className={`h-12 w-2/3 rounded-lg ${i % 2 === 0 ? "rounded-tl-none" : "rounded-tr-none"}`} />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                id={msg.id}
                senderId={msg.senderId}
                senderName={msg.senderId === user?.uid ? user?.displayName : otherUser?.displayName}
                senderAvatar={msg.senderId === user?.uid ? user?.photoURL : otherUser?.photoURL}
                content={msg.content}
                timestamp={new Date(msg.timestamp)}
                isCurrentUser={msg.senderId === user?.uid}
                status={msg.status}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={wsStatus !== "open"}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
