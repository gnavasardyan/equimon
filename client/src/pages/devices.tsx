import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cpu, Wifi, WifiOff, Search } from "lucide-react";
import type { Device, Station } from "@shared/schema";

export default function Devices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch devices
  const { data: devices, isLoading: devicesLoading } = useQuery<Device[]>({
    queryKey: ["/api/v1/devices"],
  });

  // Fetch stations to get station names
  const { data: stations } = useQuery<Station[]>({
    queryKey: ["/api/v1/stations"],
  });

  // Create station map for quick lookup
  const stationMap = stations?.reduce((acc, station) => {
    acc[station.id] = station;
    return acc;
  }, {} as Record<string, Station>) || {};

  const filteredDevices = (devices || []).filter(device => {
    const station = stationMap[device.stationId];
    const stationName = station?.name || "Неизвестная станция";
    
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stationName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || device.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48" data-testid="select-status-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="active">Активные</SelectItem>
              <SelectItem value="inactive">Неактивные</SelectItem>
              <SelectItem value="error">Ошибка</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Device grid */}
        {devicesLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDevices.map((device) => {
              const station = stationMap[device.stationId];
              const stationName = station?.name || "Неизвестная станция";
              
              return (
                <Card key={device.id} data-testid={`card-device-${device.id}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">
                      {device.name}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Cpu className="h-4 w-4 text-muted-foreground" />
                      {device.status === "active" ? (
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
                          variant={device.status === "active" ? "default" : "destructive"}
                          data-testid={`badge-status-${device.id}`}
                        >
                          {device.status === "active" ? "Активно" : device.status === "inactive" ? "Неактивно" : "Ошибка"}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Станция:</span>
                        <span className="text-sm font-medium">{stationName}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Тип:</span>
                        <span className="text-sm font-medium capitalize">{device.type}</span>
                      </div>

                      <div className="pt-2">
                        <Button size="sm" className="w-full" data-testid={`button-view-device-${device.id}`}>
                          Подробнее
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!devicesLoading && filteredDevices.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Cpu className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Устройства не найдены</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "Попробуйте изменить параметры поиска или фильтры" 
                  : "Подключенные устройства появятся здесь"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}