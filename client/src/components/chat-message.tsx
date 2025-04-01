import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { Check, CheckCheck, FileIcon, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
  id: string;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  isCurrentUser: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  file?: {name: string; size: string; url: string};
}

export function ChatMessage({
  id,
  senderId,
  senderName,
  senderAvatar,
  content,
  timestamp,
  isCurrentUser,
  status = 'sent',
  file
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
          {file && <FileAttachment name={file.name} size={file.size} url={file.url}/>}
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
    <div className="flex items-center space-x-2 text-muted-foreground text-sm">
      <span>{name} está escribiendo</span>
      <div className="flex space-x-1">
        <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" />
        <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce delay-100" />
        <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce delay-200" />
      </div>
    </div>
  );
}

export function MessageStatus({ status }: { status: 'sent' | 'delivered' | 'read' }) {
  return (
    <div className="flex items-center space-x-1 text-xs">
      {status === 'sent' && <Check className="h-3 w-3 text-muted-foreground" />}
      {status === 'delivered' && <CheckCheck className="h-3 w-3 text-muted-foreground" />}
      {status === 'read' && <CheckCheck className="h-3 w-3 text-primary" />}
    </div>
  );
}

export function FileAttachment({ name, size, url }: { name: string; size: string; url: string }) {
  return (
    <div className="flex items-center space-x-2 p-2 rounded-md bg-accent/50">
      <FileIcon className="h-4 w-4" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{name}</p>
        <p className="text-xs text-muted-foreground">{size}</p>
      </div>
      <Button variant="ghost" size="icon" asChild>
        <a href={url} download>
          <Download className="h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}