import { useState } from "react";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Settings, Bell, Shield, Database, Mail, Globe } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState(false);

  const saveSettings = () => {
    toast({
      title: "Настройки сохранены",
      description: "Ваши изменения были успешно применены",
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Настройки</h1>
            <p className="text-muted-foreground">
              Управление параметрами системы и личными настройками
            </p>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" data-testid="tab-general">Общие</TabsTrigger>
            <TabsTrigger value="notifications" data-testid="tab-notifications">Уведомления</TabsTrigger>
            <TabsTrigger value="security" data-testid="tab-security">Безопасность</TabsTrigger>
            <TabsTrigger value="company" data-testid="tab-company">Компания</TabsTrigger>
            <TabsTrigger value="integrations" data-testid="tab-integrations">Интеграции</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card data-testid="card-profile-settings">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Профиль пользователя
                </CardTitle>
                <CardDescription>
                  Основная информация о вашем аккаунте
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Имя</Label>
                    <Input id="firstName" defaultValue="Иван" data-testid="input-first-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Фамилия</Label>
                    <Input id="lastName" defaultValue="Петров" data-testid="input-last-name" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="ivan.petrov@company.ru" data-testid="input-email" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Роль</Label>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Администратор</Badge>
                    <span className="text-sm text-muted-foreground">
                      Для изменения роли обратитесь к администратору системы
                    </span>
                  </div>
                </div>

                <Button onClick={saveSettings} data-testid="button-save-profile">
                  Сохранить изменения
                </Button>
              </CardContent>
            </Card>

            <Card data-testid="card-interface-settings">
              <CardHeader>
                <CardTitle>Интерфейс</CardTitle>
                <CardDescription>
                  Настройки отображения и языка
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Язык интерфейса</Label>
                  <Select defaultValue="ru">
                    <SelectTrigger id="language" data-testid="select-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ru">Русский</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Часовой пояс</Label>
                  <Select defaultValue="europe/moscow">
                    <SelectTrigger id="timezone" data-testid="select-timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="europe/moscow">Москва (UTC+3)</SelectItem>
                      <SelectItem value="europe/london">Лондон (UTC+0)</SelectItem>
                      <SelectItem value="america/new_york">Нью-Йорк (UTC-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Формат даты</Label>
                  <Select defaultValue="dd.mm.yyyy">
                    <SelectTrigger id="dateFormat" data-testid="select-date-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd.mm.yyyy">ДД.ММ.ГГГГ</SelectItem>
                      <SelectItem value="mm/dd/yyyy">ММ/ДД/ГГГГ</SelectItem>
                      <SelectItem value="yyyy-mm-dd">ГГГГ-ММ-ДД</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card data-testid="card-notification-settings">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Настройки уведомлений
                </CardTitle>
                <CardDescription>
                  Управление способами получения уведомлений
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Email уведомления</Label>
                      <p className="text-sm text-muted-foreground">
                        Получать уведомления на email
                      </p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                      data-testid="switch-email-notifications"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Push уведомления</Label>
                      <p className="text-sm text-muted-foreground">
                        Уведомления в браузере
                      </p>
                    </div>
                    <Switch
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                      data-testid="switch-push-notifications"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Критические оповещения</Label>
                      <p className="text-sm text-muted-foreground">
                        Немедленные уведомления о критических событиях
                      </p>
                    </div>
                    <Switch
                      checked={criticalAlerts}
                      onCheckedChange={setCriticalAlerts}
                      data-testid="switch-critical-alerts"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Плановое обслуживание</Label>
                      <p className="text-sm text-muted-foreground">
                        Напоминания о плановом обслуживании
                      </p>
                    </div>
                    <Switch
                      checked={maintenanceAlerts}
                      onCheckedChange={setMaintenanceAlerts}
                      data-testid="switch-maintenance-alerts"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailAddress">Email для уведомлений</Label>
                  <Input 
                    id="emailAddress"
                    type="email"
                    defaultValue="ivan.petrov@company.ru"
                    data-testid="input-notification-email"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="space-y-6">
            <Card data-testid="card-password-settings">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Безопасность
                </CardTitle>
                <CardDescription>
                  Управление паролем и настройками безопасности
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Текущий пароль</Label>
                  <Input id="currentPassword" type="password" data-testid="input-current-password" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Новый пароль</Label>
                  <Input id="newPassword" type="password" data-testid="input-new-password" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Подтвердите новый пароль</Label>
                  <Input id="confirmPassword" type="password" data-testid="input-confirm-password" />
                </div>

                <Button data-testid="button-change-password">
                  Изменить пароль
                </Button>
              </CardContent>
            </Card>

            <Card data-testid="card-session-settings">
              <CardHeader>
                <CardTitle>Активные сессии</CardTitle>
                <CardDescription>
                  Управление активными сессиями в системе
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Текущий браузер</p>
                      <p className="text-sm text-muted-foreground">Chrome на Windows • Москва</p>
                      <p className="text-sm text-muted-foreground">Последняя активность: сейчас</p>
                    </div>
                    <Badge variant="default">Активная</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Firefox на Linux</p>
                      <p className="text-sm text-muted-foreground">IP: 192.168.1.100 • Москва</p>
                      <p className="text-sm text-muted-foreground">Последняя активность: 2 часа назад</p>
                    </div>
                    <Button variant="outline" size="sm" data-testid="button-revoke-session-1">
                      Завершить
                    </Button>
                  </div>

                  <Button variant="destructive" data-testid="button-revoke-all-sessions">
                    Завершить все остальные сессии
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company */}
          <TabsContent value="company" className="space-y-6">
            <Card data-testid="card-company-settings">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Настройки компании
                </CardTitle>
                <CardDescription>
                  Информация о компании и лицензии
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Название компании</Label>
                  <Input id="companyName" defaultValue="ООО 'Промышленные решения'" data-testid="input-company-name" />
                </div>

                <div className="space-y-2">
                  <Label>Тип лицензии</Label>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">Корпоративная</Badge>
                    <span className="text-sm text-muted-foreground">
                      До 50 базовых станций
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Активных станций</Label>
                    <p className="text-2xl font-bold">2/50</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Истекает</Label>
                    <p className="text-2xl font-bold">31.12.2025</p>
                  </div>
                </div>

                <Button data-testid="button-upgrade-license">
                  Обновить лицензию
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations" className="space-y-6">
            <Card data-testid="card-integration-settings">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Интеграции
                </CardTitle>
                <CardDescription>
                  Подключение внешних сервисов и систем
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="font-medium">Email (SMTP)</p>
                        <p className="text-sm text-muted-foreground">smtp.company.ru</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="default">Активна</Badge>
                      <Button variant="outline" size="sm" data-testid="button-configure-smtp">
                        Настроить
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <Database className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="font-medium">Telegram Bot</p>
                        <p className="text-sm text-muted-foreground">Уведомления в Telegram</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">Не настроена</Badge>
                      <Button variant="outline" size="sm" data-testid="button-setup-telegram">
                        Подключить
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <Settings className="h-8 w-8 text-purple-500" />
                      <div>
                        <p className="font-medium">Webhook</p>
                        <p className="text-sm text-muted-foreground">HTTP callbacks для событий</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">Не настроен</Badge>
                      <Button variant="outline" size="sm" data-testid="button-setup-webhook">
                        Настроить
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}