import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "@/context/location-context";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, Navigation, Edit2 } from "lucide-react";

interface LocationModalProps {
  onComplete: () => void;
}

export default function LocationModal({ onComplete }: LocationModalProps) {
  const [manualAddress, setManualAddress] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const { getLocationPermission, setManualLocation, isLoadingLocation } = useLocation();
  const { toast } = useToast();

  const handleAllowLocation = async () => {
    try {
      await getLocationPermission();
      toast({
        title: "Ubicación obtenida",
        description: "Tu ubicación ha sido detectada correctamente"
      });
      onComplete();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al obtener ubicación",
        description: "No pudimos obtener tu ubicación. Por favor intenta ingresar tu ubicación manualmente."
      });
      setShowManualInput(true);
    }
  };

  const handleManualLocation = () => {
    if (!manualAddress.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor ingresa una ubicación válida"
      });
      return;
    }

    setManualLocation(manualAddress);
    toast({
      title: "Ubicación guardada",
      description: "Tu ubicación ha sido guardada correctamente"
    });
    onComplete();
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center">
            <MapPin className="h-12 w-12 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold mt-4">Permitir acceso a ubicación</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2">
            Necesitamos tu ubicación para mostrarte artistas y eventos cerca de ti
          </DialogDescription>
        </div>
        
        <div className="space-y-4">
          {!showManualInput ? (
            <>
              <Button 
                onClick={handleAllowLocation} 
                className="w-full py-6" 
                disabled={isLoadingLocation}
              >
                <Navigation className="mr-2 h-4 w-4" />
                {isLoadingLocation ? "Obteniendo ubicación..." : "Permitir acceso a ubicación"}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-muted-foreground">
                    o
                  </span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setShowManualInput(true)} 
                className="w-full py-6"
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Ingresar ubicación manualmente
              </Button>
            </>
          ) : (
            <Card className="p-4">
              <h3 className="font-medium mb-2">Ingresa tu ubicación</h3>
              <Input
                placeholder="Ej. Bogotá, Colombia"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                className="mb-4"
              />
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowManualInput(false)}
                  className="flex-1"
                >
                  Volver
                </Button>
                <Button 
                  onClick={handleManualLocation}
                  className="flex-1"
                >
                  Guardar ubicación
                </Button>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
