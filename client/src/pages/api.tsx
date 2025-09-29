import { useState } from "react";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Copy, Key, Shield, Book, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ApiDocumentation() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Скопировано",
      description: "Код скопирован в буфер обмена",
    });
  };

  const endpoints = [
    {
      method: "GET",
      path: "/api/v1/stations",
      description: "Получить список всех базовых станций",
      auth: "Bearer token",
      response: `{
  "stations": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "uuid": "STATION_001",
      "name": "Станция А",
      "location": "Цех №1",
      "status": "active",
      "lastSeen": "2025-09-29T10:30:00Z",
      "companyId": "company-id"
    }
  ]
}`
    },
    {
      method: "POST",
      path: "/api/v1/stations",
      description: "Создать новую базовую станцию",
      auth: "Bearer token",
      body: `{
  "uuid": "STATION_002",
  "name": "Станция Б",
  "location": "Цех №2"
}`,
      response: `{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "uuid": "STATION_002",
  "name": "Станция Б",
  "location": "Цех №2",
  "status": "pending",
  "createdAt": "2025-09-29T10:30:00Z"
}`
    },
    {
      method: "GET",
      path: "/api/v1/devices",
      description: "Получить список устройств",
      auth: "Bearer token",
      response: `{
  "devices": [
    {
      "id": "device-id",
      "stationId": "station-id",
      "name": "Температурный датчик",
      "type": "temperature",
      "status": "active",
      "lastReading": 25.3,
      "unit": "°C"
    }
  ]
}`
    },
    {
      method: "POST",
      path: "/api/v1/sensor-data",
      description: "Отправить данные с датчиков",
      auth: "Bearer token",
      body: `{
  "deviceId": "device-id",
  "value": 25.3,
  "unit": "°C",
  "timestamp": "2025-09-29T10:30:00Z"
}`,
      response: `{
  "success": true,
  "dataId": "data-id",
  "timestamp": "2025-09-29T10:30:00Z"
}`
    },
    {
      method: "GET",
      path: "/api/v1/alerts",
      description: "Получить список оповещений",
      auth: "Bearer token",
      response: `{
  "alerts": [
    {
      "id": "alert-id",
      "title": "Превышение температуры",
      "description": "Температура превысила критический порог",
      "level": "critical",
      "status": "active",
      "timestamp": "2025-09-29T10:30:00Z"
    }
  ]
}`
    }
  ];

  const authMethods = [
    {
      name: "API Token",
      description: "Использование Bearer токена для аутентификации",
      example: `curl -H "Authorization: Bearer YOUR_API_TOKEN" \\
     https://api.equimon.ru/v1/stations`
    },
    {
      name: "Session Cookie",
      description: "Аутентификация через сессионные куки",
      example: `fetch('/api/v1/stations', {
  credentials: 'include'
})`
    }
  ];

  const codeExamples = {
    javascript: `// JavaScript/Node.js пример
const response = await fetch('/api/v1/stations', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`,

    python: `# Python пример
import requests

headers = {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
}

response = requests.get('https://api.equimon.ru/v1/stations', headers=headers)
data = response.json()
print(data)`,

    curl: `# cURL пример
curl -X GET "https://api.equimon.ru/v1/stations" \\
     -H "Authorization: Bearer YOUR_API_TOKEN" \\
     -H "Content-Type: application/json"`
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">API Документация</h1>
            <p className="text-muted-foreground">
              Руководство по использованию EQUIMON Cloud API
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" data-testid="tab-overview">Обзор</TabsTrigger>
            <TabsTrigger value="authentication" data-testid="tab-auth">Аутентификация</TabsTrigger>
            <TabsTrigger value="endpoints" data-testid="tab-endpoints">Эндпоинты</TabsTrigger>
            <TabsTrigger value="examples" data-testid="tab-examples">Примеры</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <Card data-testid="card-api-overview">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Book className="h-5 w-5 mr-2" />
                  Обзор API
                </CardTitle>
                <CardDescription>
                  EQUIMON Cloud предоставляет RESTful API для интеграции с вашими системами
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Base URL</h3>
                  <code className="bg-muted p-2 rounded text-sm block">
                    https://api.equimon.ru
                  </code>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Поддерживаемые форматы</h3>
                  <ul className="space-y-1">
                    <li>• JSON (application/json)</li>
                    <li>• Form data (multipart/form-data)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Версионирование</h3>
                  <p className="text-sm text-muted-foreground">
                    Текущая версия API: v1. Версия указывается в URL: <code>/api/v1/</code>
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Rate Limiting</h3>
                  <p className="text-sm text-muted-foreground">
                    Лимит: 1000 запросов в час для аутентифицированных пользователей
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Authentication */}
          <TabsContent value="authentication" className="space-y-6">
            <Card data-testid="card-auth-methods">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Методы аутентификации
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {authMethods.map((method, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">{method.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{method.description}</p>
                      <div className="bg-muted p-3 rounded">
                        <code className="text-sm">{method.example}</code>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="float-right"
                          onClick={() => copyToClipboard(method.example)}
                          data-testid={`button-copy-auth-${index}`}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-api-key">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  API Ключ
                </CardTitle>
                <CardDescription>
                  Управление вашими API ключами
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Input 
                      value="eq_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" 
                      readOnly 
                      className="font-mono"
                      data-testid="input-api-key"
                    />
                    <Button variant="outline" data-testid="button-regenerate-key">
                      Перегенерировать
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ⚠️ Храните ваш API ключ в безопасности. Не передавайте его третьим лицам.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Endpoints */}
          <TabsContent value="endpoints" className="space-y-4">
            {endpoints.map((endpoint, index) => (
              <Card key={index} data-testid={`card-endpoint-${index}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant={endpoint.method === "GET" ? "default" : "secondary"}>
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm font-mono">{endpoint.path}</code>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedEndpoint(selectedEndpoint === `${index}` ? null : `${index}`)}
                      data-testid={`button-toggle-endpoint-${index}`}
                    >
                      <Code className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>{endpoint.description}</CardDescription>
                </CardHeader>
                
                {selectedEndpoint === `${index}` && (
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Аутентификация</h4>
                      <Badge variant="outline">{endpoint.auth}</Badge>
                    </div>

                    {endpoint.body && (
                      <div>
                        <h4 className="font-semibold mb-2">Тело запроса</h4>
                        <div className="bg-muted p-3 rounded relative">
                          <pre className="text-sm overflow-x-auto">
                            <code>{endpoint.body}</code>
                          </pre>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(endpoint.body!)}
                            data-testid={`button-copy-body-${index}`}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold mb-2">Ответ</h4>
                      <div className="bg-muted p-3 rounded relative">
                        <pre className="text-sm overflow-x-auto">
                          <code>{endpoint.response}</code>
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(endpoint.response)}
                          data-testid={`button-copy-response-${index}`}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </TabsContent>

          {/* Examples */}
          <TabsContent value="examples" className="space-y-6">
            {Object.entries(codeExamples).map(([language, code]) => (
              <Card key={language} data-testid={`card-example-${language}`}>
                <CardHeader>
                  <CardTitle className="capitalize">{language} пример</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded relative">
                    <pre className="text-sm overflow-x-auto">
                      <code>{code}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(code)}
                      data-testid={`button-copy-example-${language}`}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}