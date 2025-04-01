
import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Bell, MessageSquare, Check } from "lucide-react";

interface Notification {
  id: string;
  type: 'message' | 'offer' | 'match' | 'reminder';
  title: string;
  message: string;
  actionUrl?: string;
  createdAt: Date;
}

export default function NotificationHandler() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState({
    messages: true,
    offers: true,
    matches: true,
    reminders: true
  });

  const handleNotification = (notification: Notification) => {
    if (!preferences[notification.type]) return;

    const actions = {
      message: () => (
        <Button size="sm" variant="outline" asChild>
          <a href={notification.actionUrl}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Responder
          </a>
        </Button>
      ),
      offer: () => (
        <div className="flex gap-2">
          <Button size="sm" variant="default">
            <Check className="h-4 w-4 mr-2" />
            Aceptar
          </Button>
          <Button size="sm" variant="outline">
            Rechazar
          </Button>
        </div>
      ),
      match: () => (
        <Button size="sm" variant="default" asChild>
          <a href={notification.actionUrl}>
            Ver perfil
          </a>
        </Button>
      ),
      reminder: () => (
        <Button size="sm" variant="ghost">
          <Bell className="h-4 w-4 mr-2" />
          Recordar más tarde
        </Button>
      )
    };

    toast({
      title: notification.title,
      description: notification.message,
      action: actions[notification.type]?.()
    });
  };

  useEffect(() => {
    // Aquí se conectaría con el backend para recibir notificaciones en tiempo real
    const ws = new WebSocket('ws://your-backend-url');
    
    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      handleNotification(notification);
    };

    return () => ws.close();
  }, [preferences]);

  return null; // Este componente solo maneja la lógica de notificaciones
}
