import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import StationCard from "@/components/station-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import type { Station } from "@shared/schema";

export default function Stations() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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

  // Fetch stations
  const { data: stations, isLoading: stationsLoading, error } = useQuery({
    queryKey: ["/api/v1/stations"],
    enabled: isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error)) {
      toast({
        title: "Ошибка авторизации",
        description: "Вы вышли из системы. Выполняется вход...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

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

  // Filter stations based on search and status
  const filteredStations = (stations as any)?.filter((station: Station) => {
    const matchesSearch = station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         station.uuid.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (station.location && station.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || station.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const handleViewStation = (station: Station) => {
    toast({
      title: "Просмотр станции",
      description: `Открытие деталей станции ${station.name}`,
    });
  };

  const handleEditStation = (station: Station) => {
    if ((user as any)?.role === 'monitor') {
      toast({
        title: "Недостаточно прав",
        description: "У вас нет прав для редактирования станций",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Редактирование станции",
      description: `Редактирование станции ${station.name}`,
    });
  };

  const handleDeleteStation = (station: Station) => {
    if ((user as any)?.role !== 'admin') {
      toast({
        title: "Недостаточно прав",
        description: "Только администраторы могут удалять станции",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Удаление станции",
      description: `Удаление станции ${station.name}`,
    });
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
                  <h1 className="text-2xl font-bold text-foreground">Базовые станции</h1>
                  <p className="text-muted-foreground mt-1">Управление базовыми станциями и мониторинг их состояния</p>
                </div>
                {(user as any)?.role !== 'monitor' && (
                  <div className="mt-4 sm:mt-0">
                    <Button className="flex items-center space-x-2" data-testid="button-add-station">
                      <Plus className="w-4 h-4" />
                      <span>Добавить станцию</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Фильтры и поиск</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Поиск станций..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-stations"
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
                      <SelectItem value="pending">Ожидают активации</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Stations Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Станции ({filteredStations.length})
                </h2>
              </div>

              {stationsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredStations.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="text-muted-foreground">
                      {(stations as any)?.length === 0 ? (
                        <>
                          <h3 className="text-lg font-medium mb-2">Нет станций</h3>
                          <p>Начните с активации первой базовой станции</p>
                        </>
                      ) : (
                        <>
                          <h3 className="text-lg font-medium mb-2">Станции не найдены</h3>
                          <p>Попробуйте изменить фильтры поиска</p>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="stations-grid">
                  {filteredStations.map((station: Station) => (
                    <StationCard
                      key={station.id}
                      station={station}
                      onView={handleViewStation}
                      onEdit={handleEditStation}
                      onDelete={handleDeleteStation}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
