import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Bell, MessageSquare, Check } from "lucide-react";
import { useState, useEffect } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

interface Notification {
  id: string;
  type: 'message' | 'offer' | 'match' | 'reminder';
  title: string;
  message: string;
  actionUrl?: string;
  createdAt: Date;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'message' | 'event' | 'blog';
  read: boolean;
  timestamp: Date;
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

  const [notificationsUI, setNotificationsUI] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const markAsRead = (id: string) => {
    setNotificationsUI(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotificationsUI(prev => prev.filter(notif => notif.id !== id));
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {notificationsUI.some(n => !n.read) && (
          <span className="absolute top-0 right-0 h-2 w-2 bg-primary rounded-full" />
        )}
      </Button>

      {showNotifications && (
        <Card className="absolute right-0 mt-2 w-80 z-50">
          <CardContent className="p-0">
            <ScrollArea className="h-[300px]">
              {notificationsUI.length > 0 ? (
                notificationsUI.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b flex items-start gap-2 ${
                      notification.read ? 'bg-background' : 'bg-accent/10'
                    }`}
                  >
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No hay notificaciones
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}