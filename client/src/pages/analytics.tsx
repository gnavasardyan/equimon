import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Activity, BarChart3, Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function Analytics() {
  // Mock data for charts
  const temperatureData = [
    { time: "00:00", value: 22.1 },
    { time: "04:00", value: 21.8 },
    { time: "08:00", value: 24.2 },
    { time: "12:00", value: 27.5 },
    { time: "16:00", value: 26.8 },
    { time: "20:00", value: 24.3 },
  ];

  const deviceActivityData = [
    { station: "Станция А", devices: 8, active: 7 },
    { station: "Станция Б", devices: 5, active: 4 },
    { station: "Станция В", devices: 12, active: 11 },
    { station: "Станция Г", devices: 3, active: 3 },
  ];

  const stats = [
    {
      title: "Средняя температура",
      value: "24.2°C",
      change: "+1.2°C",
      trend: "up",
      description: "За последние 24 часа"
    },
    {
      title: "Активных устройств",
      value: "25/28",
      change: "-1",
      trend: "down",
      description: "Из общего количества"
    },
    {
      title: "Время работы",
      value: "99.2%",
      change: "+0.1%",
      trend: "up",
      description: "За текущий месяц"
    },
    {
      title: "Обработано данных",
      value: "1.2 ТБ",
      change: "+156 ГБ",
      trend: "up",
      description: "За последнюю неделю"
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Аналитика</h1>
            <p className="text-muted-foreground">
              Анализ данных и производительности системы
            </p>
          </div>
          <div className="flex gap-2">
            <Select defaultValue="7d">
              <SelectTrigger className="w-32" data-testid="select-time-period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">1 день</SelectItem>
                <SelectItem value="7d">7 дней</SelectItem>
                <SelectItem value="30d">30 дней</SelectItem>
                <SelectItem value="90d">90 дней</SelectItem>
              </SelectContent>
            </Select>
            <Button data-testid="button-export-data">
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </Button>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} data-testid={`card-metric-${index}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                {stat.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Badge variant={stat.trend === "up" ? "default" : "destructive"} className="mr-2">
                    {stat.change}
                  </Badge>
                  {stat.description}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temperature Chart */}
          <Card data-testid="card-temperature-chart">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Температура за сутки
              </CardTitle>
              <CardDescription>
                Динамика изменения температуры
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={temperatureData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Device Activity Chart */}
          <Card data-testid="card-device-activity-chart">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Активность устройств
              </CardTitle>
              <CardDescription>
                Активные устройства по станциям
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deviceActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="station" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="devices" fill="hsl(var(--muted))" name="Всего устройств" />
                  <Bar dataKey="active" fill="hsl(var(--primary))" name="Активных" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card data-testid="card-recent-activity">
          <CardHeader>
            <CardTitle>Последняя активность</CardTitle>
            <CardDescription>
              События системы за последние 24 часа
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { time: "14:30", event: "Новый датчик подключен к Станции А", type: "info" },
                { time: "13:15", event: "Превышен порог температуры на Станции Б", type: "warning" },
                { time: "12:00", event: "Плановое обслуживание Станции В завершено", type: "success" },
                { time: "10:45", event: "Потеря связи с датчиком влажности #3", type: "error" },
                { time: "09:20", event: "Система мониторинга запущена", type: "info" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-4" data-testid={`activity-${index}`}>
                  <div className="text-sm text-muted-foreground w-16">{activity.time}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        activity.type === "error" ? "destructive" :
                        activity.type === "warning" ? "default" :
                        activity.type === "success" ? "default" : "secondary"
                      }>
                        {activity.type === "error" ? "Ошибка" :
                         activity.type === "warning" ? "Предупреждение" :
                         activity.type === "success" ? "Успех" : "Инфо"}
                      </Badge>
                      <span className="text-sm">{activity.event}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}