import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Keyboard, Camera, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { BrowserQRCodeReader } from "@zxing/browser";
import { NotFoundException } from "@zxing/library";

interface StationActivationProps {
  onActivationSuccess?: () => void;
}

export default function StationActivation({ onActivationSuccess }: StationActivationProps = {}) {
  const [mode, setMode] = useState<'qr' | 'manual' | null>(null);
  const [uuid, setUuid] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null);

  const activationMutation = useMutation({
    mutationFn: async (uuid: string) => {
      const response = await apiRequest("POST", "/api/v1/stations/activate", { uuid });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Базовая станция успешно активирована",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/stations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/dashboard/stats"] });
      setUuid("");
      setMode(null);
      onActivationSuccess?.();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Ошибка авторизации",
          description: "Вы вышли из системы. Выполняется вход...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Ошибка активации",
        description: error.message || "Не удалось активировать станцию",
        variant: "destructive",
      });
    },
  });

  const handleActivation = () => {
    if (!uuid.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите UUID станции",
        variant: "destructive",
      });
      return;
    }
    activationMutation.mutate(uuid.trim());
  };

  // Cleanup function for stopping camera
  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setIsScanning(false);
    setCameraReady(false);
    setMode(null);
  };

  // Initialize QR code scanner
  const startScanning = async () => {
    try {
      setMode('qr');
      setIsScanning(true);
      
      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserQRCodeReader();
      }
      
      const devices = await codeReaderRef.current.listVideoInputDevices();
      if (devices.length === 0) {
        throw new Error("Камера не найдена");
      }

      // Use the first available camera (usually back camera on mobile)
      const selectedDeviceId = devices[0].deviceId;
      
      if (videoRef.current) {
        setCameraReady(true);
        
        codeReaderRef.current.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (result, error) => {
            if (result) {
              const scannedText = result.getText();
              // Extract UUID from QR code (assuming QR contains just UUID or URL with UUID)
              const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
              const match = scannedText.match(uuidPattern);
              
              if (match) {
                const extractedUuid = match[0];
                setUuid(extractedUuid);
                stopScanning();
                activationMutation.mutate(extractedUuid);
              } else {
                toast({
                  title: "Неверный QR-код",
                  description: "QR-код не содержит валидный UUID станции",
                  variant: "destructive",
                });
              }
            }
            
            if (error && !(error instanceof NotFoundException)) {
              console.error("QR scan error:", error);
            }
          }
        );
      }
    } catch (error: any) {
      console.error("Camera error:", error);
      toast({
        title: "Ошибка камеры",
        description: error.message || "Не удалось получить доступ к камере",
        variant: "destructive",
      });
      setIsScanning(false);
      setMode(null);
    }
  };

  const handleQrScan = () => {
    startScanning();
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Активация базовой станции</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!mode && (
          <div className="flex space-x-4">
            <Button 
              className="flex-1 flex items-center space-x-2"
              onClick={handleQrScan}
              data-testid="button-qr-scan"
            >
              <QrCode className="w-4 h-4" />
              <span>Сканировать QR-код</span>
            </Button>
            <Button 
              variant="secondary"
              className="flex-1 flex items-center space-x-2"
              onClick={() => setMode('manual')}
              data-testid="button-manual-input"
            >
              <Keyboard className="w-4 h-4" />
              <span>Ввести UUID</span>
            </Button>
          </div>
        )}
        
        {mode === 'qr' && (
          <div className="space-y-3">
            <div className="relative">
              <div className="text-center mb-3">
                <p className="text-sm text-muted-foreground mb-2">
                  Наведите камеру на QR-код станции
                </p>
                {isScanning && !cameraReady && (
                  <div className="flex items-center justify-center space-x-2">
                    <Camera className="w-4 h-4 animate-pulse" />
                    <span className="text-sm">Инициализация камеры...</span>
                  </div>
                )}
              </div>
              
              {isScanning && (
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-64 object-cover"
                    autoPlay
                    playsInline
                    muted
                    data-testid="qr-scanner-video"
                  />
                  <div className="absolute inset-0 border-2 border-primary/50 rounded-lg">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-primary rounded-lg">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                className="flex-1"
                onClick={stopScanning}
                data-testid="button-stop-scanning"
              >
                <X className="w-4 h-4 mr-2" />
                Отмена
              </Button>
            </div>
          </div>
        )}

        {mode === 'manual' && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="uuid">UUID базовой станции</Label>
              <Input
                id="uuid"
                type="text"
                placeholder="Введите UUID станции"
                value={uuid}
                onChange={(e) => setUuid(e.target.value)}
                data-testid="input-uuid"
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                className="flex-1"
                onClick={handleActivation}
                disabled={activationMutation.isPending}
                data-testid="button-activate"
              >
                {activationMutation.isPending ? "Активация..." : "Активировать станцию"}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setMode(null);
                  setUuid("");
                }}
                data-testid="button-cancel"
              >
                Отмена
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
