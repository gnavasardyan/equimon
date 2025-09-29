import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Cpu, Wifi, WifiOff, Search, Filter } from "lucide-react";

export default function Devices() {
  const [searchTerm, setSearchTerm] = useState("");

  // Placeholder data - should be replaced with actual API call
  const devices = [
    {
      id: "1",
      name: "Температурный датчик #1",
      type: "temperature",
      stationName: "Станция А",
      status: "online",
      lastReading: "25.3°C",
      lastSeen: "2 минуты назад"
    },
    {
      id: "2", 
      name: "Датчик влажности #1",
      type: "humidity",
      stationName: "Станция А",
      status: "online",
      lastReading: "65.2%",
      lastSeen: "1 минута назад"
    },
    {
      id: "3",
      name: "Датчик давления #1",
      type: "pressure",
      stationName: "Станция Б",
      status: "offline",
      lastReading: "1013.2 hPa",
      lastSeen: "15 минут назад"
    }
  ];

  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.stationName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Устройства</h1>
            <p className="text-muted-foreground">
              Управление подключенными устройствами и датчиками
            </p>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Поиск устройств..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-device-search"
            />
          </div>
          <Button variant="outline" data-testid="button-filter-devices">
            <Filter className="h-4 w-4 mr-2" />
            Фильтры
          </Button>
        </div>

        {/* Device grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.map((device) => (
            <Card key={device.id} data-testid={`card-device-${device.id}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  {device.name}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  {device.status === "online" ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Статус:</span>
                    <Badge 
                      variant={device.status === "online" ? "default" : "destructive"}
                      data-testid={`badge-status-${device.id}`}
                    >
                      {device.status === "online" ? "В сети" : "Не в сети"}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Станция:</span>
                    <span className="text-sm font-medium">{device.stationName}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Последнее показание:</span>
                    <span className="text-sm font-medium">{device.lastReading}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Последняя активность:</span>
                    <span className="text-sm text-muted-foreground">{device.lastSeen}</span>
                  </div>

                  <div className="pt-2">
                    <Button size="sm" className="w-full" data-testid={`button-view-device-${device.id}`}>
                      Подробнее
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDevices.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Cpu className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Устройства не найдены</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Попробуйте изменить параметры поиска" : "Подключенные устройства появятся здесь"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}