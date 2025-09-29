import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import StationCard from "@/components/station-card";
import StationActivation from "@/components/station-activation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Station } from "@shared/schema";

const editStationSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  location: z.string().optional(),
  metadata: z.object({
    type: z.string().optional(),
    floor: z.coerce.number().optional()
  }).optional()
});

type EditStationForm = z.infer<typeof editStationSchema>;

export default function Stations() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewingStation, setViewingStation] = useState<Station | null>(null);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [deletingStation, setDeletingStation] = useState<Station | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activationDialogOpen, setActivationDialogOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const form = useForm<EditStationForm>({
    resolver: zodResolver(editStationSchema),
    defaultValues: {
      name: "",
      location: "",
      metadata: { type: "", floor: undefined }
    }
  });

  // Station update mutation
  const updateStationMutation = useMutation({
    mutationFn: async ({ stationId, data }: { stationId: string; data: EditStationForm }) => {
      const response = await apiRequest('PUT', `/api/v1/stations/${stationId}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/stations"] });
      toast({
        title: "Успешно",
        description: "Станция обновлена",
      });
      setEditDialogOpen(false);
      setEditingStation(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить станцию",
        variant: "destructive",
      });
    }
  });

  // Station delete mutation
  const deleteStationMutation = useMutation({
    mutationFn: async (stationId: string) => {
      const response = await apiRequest('DELETE', `/api/v1/stations/${stationId}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/stations"] });
      toast({
        title: "Успешно",
        description: "Станция удалена",
      });
      setDeleteDialogOpen(false);
      setDeletingStation(null);
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить станцию",
        variant: "destructive",
      });
    }
  });

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
    setViewingStation(station);
    setViewDialogOpen(true);
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
    setEditingStation(station);
    form.reset({
      name: station.name,
      location: station.location || "",
      metadata: {
        type: station.metadata?.type || "",
        floor: station.metadata?.floor
      }
    });
    setEditDialogOpen(true);
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
    setDeletingStation(station);
    setDeleteDialogOpen(true);
  };

  const onEditSubmit = (data: EditStationForm) => {
    if (editingStation) {
      updateStationMutation.mutate({
        stationId: editingStation.id,
        data
      });
    }
  };

  const confirmDelete = () => {
    if (deletingStation) {
      deleteStationMutation.mutate(deletingStation.id);
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
                  <h1 className="text-2xl font-bold text-foreground">Базовые станции</h1>
                  <p className="text-muted-foreground mt-1">Управление базовыми станциями и мониторинг их состояния</p>
                </div>
                {(user as any)?.role !== 'monitor' && (
                  <div className="mt-4 sm:mt-0">
                    <Button 
                      className="flex items-center space-x-2" 
                      onClick={() => setActivationDialogOpen(true)}
                      data-testid="button-add-station"
                    >
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

      {/* View Station Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Детали станции</DialogTitle>
            <DialogDescription>
              Подробная информация о базовой станции
            </DialogDescription>
          </DialogHeader>
          {viewingStation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Название</label>
                  <p className="text-sm text-muted-foreground">{viewingStation.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">UUID</label>
                  <p className="text-sm text-muted-foreground font-mono">{viewingStation.uuid}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Статус</label>
                  <p className="text-sm text-muted-foreground">{viewingStation.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Последняя активность</label>
                  <p className="text-sm text-muted-foreground">
                    {viewingStation.lastSeen ? new Date(viewingStation.lastSeen).toLocaleString('ru-RU') : 'Никогда'}
                  </p>
                </div>
                {viewingStation.location && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Местоположение</label>
                    <p className="text-sm text-muted-foreground">{viewingStation.location}</p>
                  </div>
                )}
                {viewingStation.metadata && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Метаданные</label>
                    <pre className="text-sm text-muted-foreground bg-muted p-2 rounded">
                      {JSON.stringify(viewingStation.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Station Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setEditDialogOpen(false);
          setEditingStation(null);
          form.reset();
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Редактировать станцию</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-station-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Местоположение</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-station-location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="metadata.type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Тип</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="industrial, warehouse, laboratory, office" data-testid="input-station-type" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="metadata.floor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Этаж</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        type="number"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? undefined : value);
                        }}
                        data-testid="input-station-floor"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditDialogOpen(false);
                    setEditingStation(null);
                    form.reset();
                  }}
                  data-testid="button-cancel-edit"
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={updateStationMutation.isPending}
                  data-testid="button-save-station"
                >
                  {updateStationMutation.isPending ? "Сохранение..." : "Сохранить"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Station Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить станцию?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить станцию "{deletingStation?.name}"? 
              Это действие нельзя отменить, и все связанные данные будут потеряны.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteStationMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteStationMutation.isPending ? "Удаление..." : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Station Activation Dialog */}
      <Dialog open={activationDialogOpen} onOpenChange={setActivationDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Добавить станцию</DialogTitle>
            <DialogDescription>
              Активируйте новую базовую станцию путем сканирования QR-кода или ввода UUID вручную
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <StationActivation onActivationSuccess={() => setActivationDialogOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
