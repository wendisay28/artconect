import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Image, File, Send, Check, CheckCheck } from 'lucide-react';


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
  message,
  isOwnMessage,
  sender,
  timestamp
}: {
  message: string;
  isOwnMessage: boolean;
  sender: { name: string; photoURL?: string };
  timestamp: Date;
}) {
  return (
    <div className={cn(
      "flex items-start gap-2 mb-4",
      isOwnMessage && "flex-row-reverse"
    )}>
      <Avatar className="w-8 h-8">
        <AvatarImage src={sender.photoURL} />
        <AvatarFallback>{sender.name[0]}</AvatarFallback>
      </Avatar>

      <div className={cn(
        "flex flex-col max-w-[70%]",
        isOwnMessage && "items-end"
      )}>
        <div className={cn(
          "rounded-lg px-3 py-2",
          isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          {message}
        </div>
        <span className="text-xs text-muted-foreground mt-1">
          {format(timestamp, 'HH:mm')}
        </span>
      </div>
    </div>
  );
}