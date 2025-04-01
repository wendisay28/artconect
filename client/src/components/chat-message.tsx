
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Check, CheckCheck } from 'lucide-react';

interface ChatMessageProps {
  id: string;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  content: string | File;
  timestamp: Date;
  isCurrentUser: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

export function ChatTypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
      {name} está escribiendo...
    </div>
  );
}

export default function ChatMessage({ 
  id,
  senderId,
  senderName,
  senderAvatar,
  content,
  timestamp,
  isCurrentUser,
  status = 'sent'
}: ChatMessageProps) {
  const statusIcon = {
    sending: null,
    sent: <Check className="h-4 w-4" />,
    delivered: <CheckCheck className="h-4 w-4" />,
    read: <CheckCheck className="h-4 w-4 text-blue-500" />
  };

  return (
    <div className={cn(
      "flex items-start gap-2 mb-4",
      isCurrentUser && "flex-row-reverse"
    )}>
      <Avatar className="w-8 h-8">
        <AvatarImage src={senderAvatar} />
        <AvatarFallback>{senderName[0]}</AvatarFallback>
      </Avatar>

      <div className={cn(
        "flex flex-col max-w-[70%]",
        isCurrentUser && "items-end"
      )}>
        <div className={cn(
          "rounded-lg px-3 py-2",
          isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          {content instanceof File ? content.name : content}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          {format(timestamp, 'HH:mm')}
          {isCurrentUser && statusIcon[status]}
        </div>
      </div>
    </div>
  );
}
