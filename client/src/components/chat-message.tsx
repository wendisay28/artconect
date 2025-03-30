import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  id: string;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  isCurrentUser: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
}

export function ChatMessage({
  id,
  senderId,
  senderName,
  senderAvatar,
  content,
  timestamp,
  isCurrentUser,
  status = 'sent'
}: ChatMessageProps) {
  const [timeAgo, setTimeAgo] = useState<string>(
    formatDistanceToNow(timestamp, { addSuffix: true, locale: es })
  );

  // Update the time ago every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(formatDistanceToNow(timestamp, { addSuffix: true, locale: es }));
    }, 60000);

    return () => clearInterval(interval);
  }, [timestamp]);

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Status icon or text
  const renderStatus = () => {
    if (!isCurrentUser) return null;
    
    switch (status) {
      case 'sending':
        return <span className="text-xs text-muted-foreground">Enviando...</span>;
      case 'sent':
        return <span className="text-xs text-muted-foreground">Enviado</span>;
      case 'delivered':
        return <span className="text-xs text-muted-foreground">Entregado</span>;
      case 'read':
        return <span className="text-xs text-primary">Leído</span>;
      case 'error':
        return <span className="text-xs text-destructive">Error al enviar</span>;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "flex gap-2 mb-4",
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {!isCurrentUser && (
        <Avatar className="h-8 w-8">
          {senderAvatar ? (
            <AvatarImage src={senderAvatar} alt={senderName} />
          ) : (
            <AvatarFallback>{getInitials(senderName)}</AvatarFallback>
          )}
        </Avatar>
      )}

      <div className={cn("max-w-[70%]")}>
        {!isCurrentUser && (
          <div className="text-xs text-muted-foreground mb-1">{senderName}</div>
        )}
        
        <div
          className={cn(
            "rounded-lg p-3",
            isCurrentUser 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted"
          )}
        >
          {content}
        </div>
        
        <div className="flex mt-1 text-xs text-muted-foreground justify-between">
          <span>{timeAgo}</span>
          {renderStatus()}
        </div>
      </div>
    </div>
  );
}

export function ChatTypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Avatar className="h-8 w-8">
        <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      
      <div className="bg-muted p-3 rounded-lg">
        <div className="flex space-x-1">
          <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground">
        {name} está escribiendo...
      </div>
    </div>
  );
}