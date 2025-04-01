
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Image, File, Send, Check, CheckCheck } from 'lucide-react';

interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: Date;
  read: boolean;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
}

interface ChatMessageProps {
  message: ChatMessage;
  isCurrentUser: boolean;
  onSendMessage: (text: string, type: 'text' | 'image' | 'file', file?: File) => void;
}

export default function ChatMessage({ message, isCurrentUser, onSendMessage }: ChatMessageProps) {
  const [isTyping, setIsTyping] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isTyping) {
      timeout = setTimeout(() => setIsTyping(false), 1500);
    }
    return () => clearTimeout(timeout);
  }, [isTyping]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const type = file.type.startsWith('image/') ? 'image' : 'file';
      onSendMessage('', type, file);
    }
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage.trim(), 'text');
      setInputMessage('');
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
      <div className="flex items-end gap-2">
        {!isCurrentUser && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={message.senderAvatar} />
            <AvatarFallback>{message.senderName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        )}
        
        <div className={`max-w-[70%] rounded-lg p-3 ${
          isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        }`}>
          {message.type === 'text' && (
            <p>{message.text}</p>
          )}
          
          {message.type === 'image' && (
            <img 
              src={message.fileUrl} 
              alt="Imagen compartida" 
              className="rounded-md max-w-full h-auto"
            />
          )}
          
          {message.type === 'file' && (
            <a 
              href={message.fileUrl}
              target="_blank"
              rel="noopener noreferrer" 
              className="flex items-center gap-2 text-sm"
            >
              <File className="h-4 w-4" />
              <span>{message.fileName}</span>
            </a>
          )}
          
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className="text-xs opacity-70">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
            {isCurrentUser && (
              message.read ? 
                <CheckCheck className="h-4 w-4" /> : 
                <Check className="h-4 w-4" />
            )}
          </div>
        </div>
      </div>

      {isTyping && !isCurrentUser && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
          Escribiendo...
        </div>
      )}

      <div className="flex items-center gap-2 w-full mt-4">
        <Input
          type="text"
          placeholder="Escribe un mensaje..."
          value={inputMessage}
          onChange={(e) => {
            setInputMessage(e.target.value);
            setIsTyping(true);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        
        <Button variant="outline" size="icon" className="flex-shrink-0" asChild>
          <label>
            <input
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Image className="h-4 w-4" />
          </label>
        </Button>
        
        <Button 
          variant="default" 
          size="icon"
          className="flex-shrink-0"
          onClick={handleSendMessage}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
