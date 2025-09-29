import { useState } from "react";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  HelpCircle, 
  Search, 
  Book, 
  MessageCircle, 
  Mail, 
  Phone, 
  ExternalLink,
  FileText,
  Video,
  Download
} from "lucide-react";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const faqItems = [
    {
      question: "Как активировать новую базовую станцию?",
      answer: "Для активации базовой станции перейдите в раздел 'Базовые станции', нажмите 'Добавить станцию' и отсканируйте QR-код на устройстве или введите UUID вручную. После этого станция появится в списке со статусом 'Ожидание подключения'.",
      category: "stations"
    },
    {
      question: "Что делать, если устройство показывает статус 'Не в сети'?",
      answer: "Проверьте подключение к интернету на базовой станции, убедитесь что устройство правильно подключено к станции, и проверьте настройки сети. Если проблема сохраняется, обратитесь в техподдержку.",
      category: "devices"
    },
    {
      question: "Как настроить оповещения о превышении порогов?",
      answer: "В разделе 'Оповещения' нажмите 'Создать правило', выберите тип датчика, установите пороговые значения и способы уведомления. Система автоматически отправит уведомление при превышении заданных значений.",
      category: "alerts"
    },
    {
      question: "Можно ли экспортировать данные из системы?",
      answer: "Да, в разделе 'Аналитика' есть кнопка 'Экспорт', которая позволяет скачать данные в формате CSV или Excel. Также доступен API для автоматического получения данных.",
      category: "data"
    },
    {
      question: "Как добавить нового пользователя в систему?",
      answer: "В разделе 'Пользователи' (доступен только администраторам) нажмите 'Добавить пользователя', заполните форму с данными пользователя и выберите роль. Пользователь получит приглашение на указанный email.",
      category: "users"
    },
    {
      question: "Что означают разные роли пользователей?",
      answer: "Администратор - полный доступ ко всем функциям. Оператор - управление станциями и устройствами, просмотр аналитики. Монитор - только просмотр данных и базовые функции мониторинга.",
      category: "users"
    }
  ];

  const resources = [
    {
      title: "Руководство пользователя",
      description: "Подробное руководство по использованию системы",
      icon: Book,
      type: "PDF",
      size: "2.5 МБ"
    },
    {
      title: "Видео-туториалы",
      description: "Обучающие видео по основным функциям",
      icon: Video,
      type: "YouTube",
      size: "Плейлист"
    },
    {
      title: "API Документация",
      description: "Техническая документация для разработчиков",
      icon: FileText,
      type: "Online",
      size: "Web"
    }
  ];

  const filteredFaq = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Справка</h1>
            <p className="text-muted-foreground">
              Документация, часто задаваемые вопросы и поддержка
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" data-testid="card-quick-start">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Book className="h-5 w-5 mr-2" />
                Быстрый старт
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Пошаговое руководство для начала работы с системой
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" data-testid="card-video-tutorials">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Video className="h-5 w-5 mr-2" />
                Видео уроки
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Обучающие видео по основным функциям платформы
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" data-testid="card-contact-support">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <MessageCircle className="h-5 w-5 mr-2" />
                Техподдержка
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Свяжитесь с нашей службой поддержки
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card data-testid="card-faq">
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="h-5 w-5 mr-2" />
              Часто задаваемые вопросы
            </CardTitle>
            <CardDescription>
              Ответы на самые популярные вопросы
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Поиск в FAQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-faq-search"
              />
            </div>

            {/* FAQ Accordion */}
            <Accordion type="single" collapsible className="w-full">
              {filteredFaq.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`} data-testid={`faq-item-${index}`}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center space-x-2">
                      <span>{item.question}</span>
                      <Badge variant="outline" className="ml-auto">
                        {item.category}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {filteredFaq.length === 0 && (
              <div className="text-center py-8">
                <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Ничего не найдено</h3>
                <p className="text-muted-foreground">
                  Попробуйте изменить запрос или обратитесь в техподдержку
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resources */}
        <Card data-testid="card-resources">
          <CardHeader>
            <CardTitle>Ресурсы и документация</CardTitle>
            <CardDescription>
              Дополнительные материалы для изучения системы
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {resources.map((resource, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow" data-testid={`resource-${index}`}>
                  <div className="flex items-start space-x-3">
                    <resource.icon className="h-8 w-8 text-primary mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{resource.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{resource.type}</Badge>
                          <span className="text-xs text-muted-foreground">{resource.size}</span>
                        </div>
                        <Button size="sm" variant="ghost" data-testid={`button-download-${index}`}>
                          <Download className="h-4 w-4 mr-1" />
                          Открыть
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card data-testid="card-support-contacts">
          <CardHeader>
            <CardTitle>Связаться с поддержкой</CardTitle>
            <CardDescription>
              Если вы не нашли ответ на свой вопрос, обратитесь к нам
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <Mail className="h-12 w-12 text-blue-500 mx-auto" />
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-sm text-muted-foreground">support@equimon.ru</p>
                  <Button variant="outline" size="sm" className="mt-2" data-testid="button-email-support">
                    Написать письмо
                  </Button>
                </div>
              </div>

              <div className="text-center space-y-3">
                <Phone className="h-12 w-12 text-green-500 mx-auto" />
                <div>
                  <h3 className="font-semibold">Телефон</h3>
                  <p className="text-sm text-muted-foreground">+7 (495) 123-45-67</p>
                  <p className="text-xs text-muted-foreground">Пн-Пт, 9:00-18:00 МСК</p>
                </div>
              </div>

              <div className="text-center space-y-3">
                <MessageCircle className="h-12 w-12 text-purple-500 mx-auto" />
                <div>
                  <h3 className="font-semibold">Онлайн чат</h3>
                  <p className="text-sm text-muted-foreground">Быстрые ответы 24/7</p>
                  <Button variant="outline" size="sm" className="mt-2" data-testid="button-start-chat">
                    Начать чат
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card data-testid="card-system-status">
          <CardHeader>
            <CardTitle>Статус системы</CardTitle>
            <CardDescription>
              Текущее состояние сервисов EQUIMON Cloud
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { service: "API Сервис", status: "operational", uptime: "99.9%" },
                { service: "База данных", status: "operational", uptime: "99.8%" },
                { service: "Веб-интерфейс", status: "operational", uptime: "99.9%" },
                { service: "Уведомления", status: "operational", uptime: "99.7%" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium">{item.service}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant="default">Работает</Badge>
                    <span className="text-sm text-muted-foreground">{item.uptime}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full" data-testid="button-status-page">
                <ExternalLink className="h-4 w-4 mr-2" />
                Подробная страница статуса
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}