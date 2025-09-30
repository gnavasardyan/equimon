import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { userRegistrationSchema, userLoginSchema, type UserRegistration, type UserLogin, type Company } from "@shared/schema";
import { Box, BarChart3, Shield, Zap, Building, Users, Eye, EyeOff } from "lucide-react";

export default function Landing() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [createNewCompany, setCreateNewCompany] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Login form
  const loginForm = useForm<UserLogin>({
    resolver: zodResolver(userLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    }
  });

  // Registration form
  const registrationForm = useForm<UserRegistration>({
    resolver: zodResolver(userRegistrationSchema),
    mode: "onSubmit", // Only validate on submit to avoid blocking input
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      role: "monitor",
      companyId: "",
      newCompanyName: "",
    }
  });

  // Get companies for registration
  const { data: companies, isLoading: companiesLoading } = useQuery<Company[]>({
    queryKey: ["/api/v1/companies"],
    enabled: !isLogin && !createNewCompany
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: UserLogin) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Успешный вход",
        description: "Добро пожаловать в EQUIMON Cloud!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      window.location.reload(); // Trigger app re-render
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка входа",
        description: error.message || "Не удалось войти в систему",
        variant: "destructive",
      });
    },
  });

  // Registration mutation
  const registrationMutation = useMutation({
    mutationFn: async (data: UserRegistration) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Регистрация завершена",
        description: "Добро пожаловать в EQUIMON Cloud!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      window.location.reload(); // Trigger app re-render
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка регистрации",
        description: error.message || "Не удалось зарегистрироваться",
        variant: "destructive",
      });
    },
  });

  const onLogin = (data: UserLogin) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: UserRegistration) => {
    if (createNewCompany && !data.newCompanyName) {
      registrationForm.setError("newCompanyName", { message: "Введите название компании" });
      return;
    }
    registrationMutation.mutate(data);
  };

  // Switch to login mode and reset forms
  const switchToLogin = () => {
    setIsLogin(true);
    setShowPassword(false);
    loginForm.reset();
    registrationForm.clearErrors();
  };

  // Switch to registration mode and reset forms
  const switchToRegister = () => {
    setIsLogin(false);
    setShowPassword(false);
    setCreateNewCompany(false);
    registrationForm.reset();
    loginForm.clearErrors();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
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

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Features - Left side */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Возможности платформы</h2>
            
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <BarChart3 className="w-8 h-8 text-primary mr-4" />
                <div>
                  <CardTitle className="text-lg">Мониторинг в реальном времени</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Отслеживайте состояние оборудования и параметры производства в режиме реального времени
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <Shield className="w-8 h-8 text-primary mr-4" />
                <div>
                  <CardTitle className="text-lg">Ролевая модель доступа</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Гибкая система разграничения прав для администраторов, операторов и специалистов мониторинга
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <Zap className="w-8 h-8 text-primary mr-4" />
                <div>
                  <CardTitle className="text-lg">Быстрая активация</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Активируйте базовые станции через QR-код или ввод UUID для мгновенного подключения к системе
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Auth Forms - Right side */}
          <div className="w-full">
            <Card>
              <CardHeader>
                <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                  <Button
                    variant={isLogin ? "default" : "ghost"}
                    className="flex-1"
                    onClick={switchToLogin}
                    data-testid="button-switch-login"
                  >
                    Вход
                  </Button>
                  <Button
                    variant={!isLogin ? "default" : "ghost"}
                    className="flex-1"
                    onClick={switchToRegister}
                    data-testid="button-switch-register"
                  >
                    Регистрация
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLogin ? (
                  /* Login Form */
                  <Form {...loginForm} key="login-form">
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="Введите ваш email"
                                data-testid="input-login-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Пароль</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Введите пароль"
                                  data-testid="input-login-password"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3"
                                  onClick={() => setShowPassword(!showPassword)}
                                  data-testid="button-toggle-password"
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                        data-testid="button-login-submit"
                      >
                        {loginMutation.isPending ? "Вход..." : "Войти"}
                      </Button>
                    </form>
                  </Form>
                ) : (
                  /* Registration Form */
                  <Form {...registrationForm} key="registration-form">
                    <form onSubmit={registrationForm.handleSubmit(onRegister)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registrationForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Имя</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Имя"
                                  data-testid="input-register-firstname"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registrationForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Фамилия</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Фамилия"
                                  data-testid="input-register-lastname"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={registrationForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="Введите email"
                                data-testid="input-register-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registrationForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Пароль</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Минимум 6 символов"
                                  data-testid="input-register-password"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3"
                                  onClick={() => setShowPassword(!showPassword)}
                                  data-testid="button-toggle-password-register"
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Company Selection */}
                      <div className="space-y-3">
                        <Label className="text-base font-medium">Компания</Label>
                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            variant={!createNewCompany ? "default" : "outline"}
                            className="flex-1"
                            onClick={() => {
                              console.log("Switching to existing company mode");
                              setCreateNewCompany(false);
                              registrationForm.setValue("newCompanyName", "");
                              registrationForm.clearErrors();
                            }}
                            data-testid="button-existing-company"
                          >
                            <Building className="w-4 h-4 mr-2" />
                            Существующая
                          </Button>
                          <Button
                            type="button"
                            variant={createNewCompany ? "default" : "outline"}
                            className="flex-1"
                            onClick={() => {
                              console.log("Switching to new company mode");
                              setCreateNewCompany(true);
                              registrationForm.setValue("companyId", "");
                              registrationForm.clearErrors();
                            }}
                            data-testid="button-new-company"
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Новая
                          </Button>
                        </div>
                      </div>

                      {!createNewCompany ? (
                        <FormField
                          key="existing-company"
                          control={registrationForm.control}
                          name="companyId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Выберите компанию</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-company">
                                    <SelectValue placeholder="Выберите компанию" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {companiesLoading ? (
                                    <SelectItem value="loading" disabled>Загрузка...</SelectItem>
                                  ) : companies && companies.length > 0 ? (
                                    companies.map((company) => (
                                      <SelectItem key={company.id} value={company.id}>
                                        {company.name}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="no-companies" disabled>Компании не найдены</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <FormField
                          key="new-company"
                          control={registrationForm.control}
                          name="newCompanyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Название новой компании</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Введите название компании"
                                  data-testid="input-company-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={registrationForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Роль в системе</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-role">
                                  <SelectValue placeholder="Выберите роль" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="monitor">
                                  <div className="flex items-center">
                                    <Shield className="w-4 h-4 mr-2" />
                                    <div>
                                      <div className="font-medium">Специалист мониторинга</div>
                                      <div className="text-sm text-muted-foreground">Просмотр данных и отчетов</div>
                                    </div>
                                  </div>
                                </SelectItem>
                                <SelectItem value="operator">
                                  <div className="flex items-center">
                                    <Users className="w-4 h-4 mr-2" />
                                    <div>
                                      <div className="font-medium">Оператор</div>
                                      <div className="text-sm text-muted-foreground">Управление оборудованием</div>
                                    </div>
                                  </div>
                                </SelectItem>
                                <SelectItem value="admin">
                                  <div className="flex items-center">
                                    <Building className="w-4 h-4 mr-2" />
                                    <div>
                                      <div className="font-medium">Администратор</div>
                                      <div className="text-sm text-muted-foreground">Полный доступ</div>
                                    </div>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registrationMutation.isPending}
                        data-testid="button-register-submit"
                      >
                        {registrationMutation.isPending ? "Регистрация..." : "Зарегистрироваться"}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-muted-foreground">
          <p>&copy; 2024 EQUIMON Cloud. Платформа мониторинга производственного оборудования.</p>
        </div>
      </div>
    </div>
  );
}