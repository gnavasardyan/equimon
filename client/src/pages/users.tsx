import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, UserX, Mail, Calendar } from "lucide-react";

export default function Users() {
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

  // Mock users data for demonstration (in real app this would come from API)
  const mockUsers = [
    {
      id: "1",
      firstName: "Иван",
      lastName: "Петров",
      email: "ivan.petrov@company.com",
      role: "admin",
      isActive: true,
      lastLogin: new Date().toISOString(),
    },
    {
      id: "2",
      firstName: "Анна",
      lastName: "Сидорова",
      email: "anna.sidorova@company.com",
      role: "operator",
      isActive: true,
      lastLogin: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "3",
      firstName: "Михаил",
      lastName: "Козлов",
      email: "mikhail.kozlov@company.com",
      role: "monitor",
      isActive: false,
      lastLogin: new Date(Date.now() - 172800000).toISOString(),
    },
  ];

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

  const formatLastLogin = (lastLogin: string) => {
    const date = new Date(lastLogin);
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
                <CardTitle>Пользователи ({mockUsers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4" data-testid="users-list">
                  {mockUsers.map((userData) => (
                    <div 
                      key={userData.id} 
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      data-testid={`user-card-${userData.id}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                          <span className="text-lg font-semibold text-muted-foreground">
                            {userData.firstName[0]}{userData.lastName[0]}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-foreground">
                              {userData.firstName} {userData.lastName}
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
                              <span>Последний вход: {formatLastLogin(userData.lastLogin)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          data-testid={`button-edit-user-${userData.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {userData.id !== (user as any)?.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            data-testid={`button-deactivate-user-${userData.id}`}
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
