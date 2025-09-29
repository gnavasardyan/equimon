import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Keyboard } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function StationActivation() {
  const [mode, setMode] = useState<'qr' | 'manual' | null>(null);
  const [uuid, setUuid] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const handleQrScan = () => {
    // TODO: Implement QR code scanning functionality
    toast({
      title: "QR сканер",
      description: "Функция сканирования QR-кода будет реализована",
    });
  };

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
