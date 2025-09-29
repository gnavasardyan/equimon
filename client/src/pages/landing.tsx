import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Box, BarChart3, Shield, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mr-4">
              <Box className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">EQUIMON Cloud</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Облачная платформа для мониторинга производственного оборудования и анализа технологических данных
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader className="text-center">
              <BarChart3 className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg">Мониторинг в реальном времени</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Отслеживайте состояние оборудования и параметры производства в режиме реального времени
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg">Ролевая модель доступа</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Гибкая система разграничения прав для администраторов, операторов и специалистов мониторинга
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg">Быстрая активация</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Активируйте базовые станции через QR-код или ввод UUID для мгновенного подключения к системе
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <BarChart3 className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg">Аналитика и отчеты</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Глубокий анализ данных с визуализацией трендов и экспортом отчетов в различных форматах
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle>Начните работу с EQUIMON Cloud</CardTitle>
              <CardDescription>
                Войдите в систему для доступа к панели управления
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-login"
              >
                Войти в систему
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-muted-foreground">
          <p>&copy; 2024 EQUIMON Cloud. Платформа мониторинга производственного оборудования.</p>
        </div>
      </div>
    </div>
  );
}
