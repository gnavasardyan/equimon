import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import StationActivation from "@/components/station-activation";
import MetricsChart from "@/components/charts/metrics-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Server, Cpu, AlertTriangle, Clock, Download, TrendingUp } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/v1/dashboard/stats"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Fetch recent alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/v1/alerts"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Fetch stations for status overview
  const { data: stations, isLoading: stationsLoading } = useQuery({
    queryKey: ["/api/v1/stations"],
    enabled: isAuthenticated,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return '🔴';
      case 'warning':
        return '🟡';
      default:
        return '🔵';
    }
  };

  const getAlertBg = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 sidebar-transition lg:ml-0 min-h-screen bg-background">
          <div className="p-6">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Панель управления</h1>
                  <p className="text-muted-foreground mt-1">Мониторинг производственного оборудования</p>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-3">
                  {(user as any)?.role === 'admin' && (
                    <Button className="flex items-center space-x-2" data-testid="button-activate-station">
                      <Server className="w-4 h-4" />
                      <span>Активировать станцию</span>
                    </Button>
                  )}
                  <Button variant="secondary" className="flex items-center space-x-2" data-testid="button-export-data">
                    <Download className="w-4 h-4" />
                    <span>Экспорт данных</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">Активные станции</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="stat-active-stations">
                        {statsLoading ? "..." : (stats as any)?.activeStations || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Server className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-green-600 text-sm font-medium">+12%</span>
                    <span className="text-muted-foreground text-sm ml-2">с прошлого месяца</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">Подключенные устройства</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="stat-connected-devices">
                        {statsLoading ? "..." : (stats as any)?.connectedDevices || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Cpu className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-green-600 text-sm font-medium">+8%</span>
                    <span className="text-muted-foreground text-sm ml-2">с прошлого месяца</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">Активные оповещения</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="stat-active-alerts">
                        {statsLoading ? "..." : (stats as any)?.activeAlerts || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span className="text-red-600 text-sm font-medium">+3</span>
                    <span className="text-muted-foreground text-sm ml-2">за последний час</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">Время работы системы</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="stat-uptime">
                        {statsLoading ? "..." : `${(stats as any)?.systemUptime || 0}%`}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span className="text-green-600 text-sm font-medium">Отлично</span>
                    <span className="text-muted-foreground text-sm ml-2">за последние 30 дней</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Station Activation Widget */}
              {(user as any)?.role === 'admin' && <StationActivation />}

              {/* Recent Alerts Widget */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Последние оповещения</CardTitle>
                    <Button variant="link" size="sm" data-testid="link-all-alerts">
                      Показать все
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3" data-testid="recent-alerts">
                    {alertsLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : (alerts as any) && (alerts as any).length > 0 ? (
                      (alerts as any).slice(0, 3).map((alert: any) => (
                        <div 
                          key={alert.id} 
                          className={`flex items-start space-x-3 p-3 rounded-md border ${getAlertBg(alert.level)}`}
                          data-testid={`alert-${alert.id}`}
                        >
                          <span className="text-lg">{getAlertIcon(alert.level)}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{alert.title}</p>
                            <p className="text-xs text-muted-foreground">{alert.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(alert.createdAt).toLocaleString('ru')}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-4">Нет активных оповещений</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Data Visualization Chart */}
              <MetricsChart />

              {/* Station Status List */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Статус станций</CardTitle>
                    <div className="flex space-x-2">
                      <Badge variant="secondary" className="text-xs">Все</Badge>
                      <Badge variant="outline" className="text-xs bg-green-100 text-green-700">Активные</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto" data-testid="station-status-list">
                    {stationsLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : (stations as any) && (stations as any).length > 0 ? (
                      (stations as any).slice(0, 5).map((station: any) => (
                        <div 
                          key={station.id} 
                          className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
                          data-testid={`station-status-${station.id}`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className={`status-indicator status-${station.status}`}></span>
                            <div>
                              <p className="text-sm font-medium text-foreground">{station.name}</p>
                              <p className="text-xs text-muted-foreground">{station.location || 'Не указано'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-xs ${
                              station.status === 'active' ? 'text-green-600' : 
                              station.status === 'error' ? 'text-red-600' : 
                              'text-orange-600'
                            }`}>
                              {station.status === 'active' ? 'Онлайн' : 
                               station.status === 'error' ? 'Ошибка' : 'Офлайн'}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-4">Нет станций</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
