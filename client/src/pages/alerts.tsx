import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Bell, Search, Filter, Plus, CheckCircle, X } from "lucide-react";

export default function Alerts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock alerts data - should be replaced with actual API call
  const alerts = [
    {
      id: "1",
      title: "Превышение температуры",
      description: "Температура на Станции А превысила критический порог 30°C",
      level: "critical",
      status: "active",
      station: "Станция А",
      device: "Температурный датчик #1",
      timestamp: "2025-09-29T10:15:00Z",
      value: "32.5°C"
    },
    {
      id: "2",
      title: "Потеря связи с устройством",
      description: "Датчик влажности #3 не отвечает более 10 минут",
      level: "warning",
      status: "active",
      station: "Станция Б",
      device: "Датчик влажности #3",
      timestamp: "2025-09-29T09:45:00Z",
      value: null
    },
    {
      id: "3",
      title: "Низкий уровень заряда батареи",
      description: "Заряд батареи датчика давления упал ниже 15%",
      level: "info",
      status: "acknowledged",
      station: "Станция В",
      device: "Датчик давления #2",
      timestamp: "2025-09-29T08:30:00Z",
      value: "12%"
    },
    {
      id: "4",
      title: "Плановое обслуживание",
      description: "Напоминание о плановом обслуживании Станции Г",
      level: "info",
      status: "resolved",
      station: "Станция Г",
      device: null,
      timestamp: "2025-09-28T16:00:00Z",
      value: null
    }
  ];

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.station.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || alert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case "critical": return "destructive";
      case "warning": return "default";
      case "info": return "secondary";
      default: return "secondary";
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case "critical": return "Критический";
      case "warning": return "Предупреждение";
      case "info": return "Информация";
      default: return level;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Активное";
      case "acknowledged": return "Подтверждено";
      case "resolved": return "Решено";
      default: return status;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("ru-RU");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Оповещения</h1>
            <p className="text-muted-foreground">
              Управление уведомлениями и предупреждениями системы
            </p>
          </div>
          <Button data-testid="button-create-alert">
            <Plus className="h-4 w-4 mr-2" />
            Создать правило
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Поиск оповещений..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-alert-search"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48" data-testid="select-status-filter">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="active">Активные</SelectItem>
              <SelectItem value="acknowledged">Подтвержденные</SelectItem>
              <SelectItem value="resolved">Решенные</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Alert statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card data-testid="card-critical-alerts">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-red-500">1</p>
                  <p className="text-sm text-muted-foreground">Критические</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card data-testid="card-warning-alerts">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-yellow-500">1</p>
                  <p className="text-sm text-muted-foreground">Предупреждения</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-info-alerts">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-blue-500">2</p>
                  <p className="text-sm text-muted-foreground">Информационные</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-resolved-alerts">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-green-500">1</p>
                  <p className="text-sm text-muted-foreground">Решенные</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts list */}
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <Card key={alert.id} data-testid={`card-alert-${alert.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      <Badge variant={getLevelColor(alert.level)}>
                        {getLevelText(alert.level)}
                      </Badge>
                      <Badge variant="outline">
                        {getStatusText(alert.status)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatTime(alert.timestamp)}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold">{alert.title}</h3>
                    <p className="text-muted-foreground">{alert.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <span><strong>Станция:</strong> {alert.station}</span>
                      {alert.device && <span><strong>Устройство:</strong> {alert.device}</span>}
                      {alert.value && <span><strong>Значение:</strong> {alert.value}</span>}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {alert.status === "active" && (
                      <>
                        <Button size="sm" variant="outline" data-testid={`button-acknowledge-${alert.id}`}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Подтвердить
                        </Button>
                        <Button size="sm" data-testid={`button-resolve-${alert.id}`}>
                          Решить
                        </Button>
                      </>
                    )}
                    {alert.status === "acknowledged" && (
                      <Button size="sm" data-testid={`button-resolve-${alert.id}`}>
                        Решить
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" data-testid={`button-dismiss-${alert.id}`}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAlerts.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Оповещения не найдены</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "Попробуйте изменить параметры поиска" 
                  : "Новые оповещения будут появляться здесь"
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}