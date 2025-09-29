import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, queryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Edit, UserX, Mail, Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const editUserSchema = z.object({
  firstName: z.string().min(1, "Имя обязательно"),
  lastName: z.string().min(1, "Фамилия обязательна"),
  email: z.string().email("Некорректный email"),
  role: z.enum(["admin", "operator", "monitor"], {
    required_error: "Выберите роль"
  }),
  isActive: z.boolean()
});

type EditUserForm = z.infer<typeof editUserSchema>;

export default function Users() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
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

  // Check admin permissions
  useEffect(() => {
    if (user && (user as any).role !== 'admin') {
      toast({
        title: "Доступ запрещен",
        description: "У вас нет прав для доступа к управлению пользователями",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || (user as any)?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 sidebar-transition lg:ml-0 min-h-screen bg-background">
            <div className="p-6">
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-destructive">
                    <h3 className="text-lg font-medium mb-2">Доступ запрещен</h3>
                    <p>У вас нет прав для доступа к этой странице</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Fetch users data from API
  const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['/api/v1/users'],
    enabled: isAuthenticated && (user as any)?.role === 'admin'
  });

  // User update mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
      return await apiRequest(`/api/v1/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/users'] });
      toast({
        title: "Успешно",
        description: "Данные пользователя обновлены",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить данные пользователя",
        variant: "destructive",
      });
    }
  });

  // User deactivation mutation
  const deactivateUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest(`/api/v1/users/${userId}/deactivate`, {
        method: 'PATCH'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/users'] });
      toast({
        title: "Успешно",
        description: "Пользователь деактивирован",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось деактивировать пользователя",
        variant: "destructive",
      });
    }
  });

  const form = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "monitor",
      isActive: true
    }
  });

  const handleEditUser = (userData: any) => {
    setEditingUser(userData);
    form.reset({
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      email: userData.email || "",
      role: userData.role || "monitor",
      isActive: userData.isActive ?? true
    });
    setEditDialogOpen(true);
  };

  const onEditSubmit = (data: EditUserForm) => {
    if (editingUser) {
      updateUserMutation.mutate(
        { userId: editingUser.id, data },
        {
          onSuccess: () => {
            setEditDialogOpen(false);
            setEditingUser(null);
            form.reset();
          }
        }
      );
    }
  };

  const handleDeactivateUser = (userData: any) => {
    if (userData.id === (user as any)?.id) {
      toast({
        title: "Ошибка",
        description: "Нельзя деактивировать самого себя",
        variant: "destructive",
      });
      return;
    }
    deactivateUserMutation.mutate(userData.id);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'operator':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'monitor':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'operator':
        return 'Оператор';
      case 'monitor':
        return 'Мониторинг';
      default:
        return role;
    }
  };

  const formatLastActivity = (updatedAt: string) => {
    const date = new Date(updatedAt);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Только что';
    if (hours < 24) return `${hours} ч назад`;
    
    const days = Math.floor(hours / 24);
    return `${days} дн назад`;
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
                  <h1 className="text-2xl font-bold text-foreground">Управление пользователями</h1>
                  <p className="text-muted-foreground mt-1">Добавление, редактирование и управление ролями пользователей</p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <Button className="flex items-center space-x-2" data-testid="button-add-user">
                    <Plus className="w-4 h-4" />
                    <span>Добавить пользователя</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Users List */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Пользователи {usersLoading ? "..." : `(${users.length})`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Загрузка пользователей...</p>
                  </div>
                ) : usersError ? (
                  <div className="text-center py-8 text-destructive">
                    <p>Ошибка загрузки пользователей</p>
                  </div>
                ) : (
                  <div className="space-y-4" data-testid="users-list">
                    {users.map((userData: any) => (
                    <div 
                      key={userData.id} 
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      data-testid={`user-card-${userData.id}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                          <span className="text-lg font-semibold text-muted-foreground">
                            {(userData.firstName || "?")[0]}{(userData.lastName || "?")[0]}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-foreground">
                              {userData.firstName || "Не указано"} {userData.lastName || ""}
                            </h3>
                            <Badge className={`${getRoleBadgeColor(userData.role)} border`}>
                              {getRoleText(userData.role)}
                            </Badge>
                            <Badge variant={userData.isActive ? "default" : "secondary"}>
                              {userData.isActive ? "Активен" : "Неактивен"}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Mail className="w-4 h-4" />
                              <span>{userData.email}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Последняя активность: {formatLastActivity(userData.updatedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Dialog open={editDialogOpen && editingUser?.id === userData.id} onOpenChange={(open) => {
                          if (!open) {
                            setEditDialogOpen(false);
                            setEditingUser(null);
                            form.reset();
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditUser(userData)}
                              data-testid={`button-edit-user-${userData.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Редактировать пользователя</DialogTitle>
                            </DialogHeader>
                            <Form {...form}>
                              <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
                                <FormField
                                  control={form.control}
                                  name="firstName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Имя</FormLabel>
                                      <FormControl>
                                        <Input {...field} data-testid="input-first-name" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="lastName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Фамилия</FormLabel>
                                      <FormControl>
                                        <Input {...field} data-testid="input-last-name" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="email"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Email</FormLabel>
                                      <FormControl>
                                        <Input type="email" {...field} data-testid="input-email" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="role"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Роль</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger data-testid="select-role">
                                            <SelectValue placeholder="Выберите роль" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="admin">Администратор</SelectItem>
                                          <SelectItem value="operator">Оператор</SelectItem>
                                          <SelectItem value="monitor">Мониторинг</SelectItem>
                                        </SelectContent>
                                      </Select>
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
                                      setEditingUser(null);
                                      form.reset();
                                    }}
                                    data-testid="button-cancel-edit"
                                  >
                                    Отмена
                                  </Button>
                                  <Button
                                    type="submit"
                                    disabled={updateUserMutation.isPending}
                                    data-testid="button-save-user"
                                  >
                                    {updateUserMutation.isPending ? "Сохранение..." : "Сохранить"}
                                  </Button>
                                </div>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>
                        {userData.id !== (user as any)?.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeactivateUser(userData)}
                            disabled={deactivateUserMutation.isPending}
                            data-testid={`button-deactivate-user-${userData.id}`}
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Role Permissions Info */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Права доступа по ролям</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 border">
                        Администратор
                      </Badge>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Управление пользователями</li>
                      <li>• Управление лицензиями</li>
                      <li>• Активация базовых станций</li>
                      <li>• Выбор тарифного плана</li>
                      <li>• Доступ ко всем данным</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-800 border-green-200 border">
                        Оператор
                      </Badge>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Настройка оборудования</li>
                      <li>• Анализ данных</li>
                      <li>• Построение графиков</li>
                      <li>• Настройка оповещений</li>
                      <li>• Экспорт данных</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200 border">
                        Мониторинг
                      </Badge>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Просмотр данных</li>
                      <li>• Просмотр графиков</li>
                      <li>• Получение оповещений</li>
                      <li>• Просмотр отчетов</li>
                      <li>• Только чтение</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
