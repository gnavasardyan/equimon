import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import type { User, Company } from "@shared/schema";
import { Building, Users, Shield } from "lucide-react";

const registrationSchema = z.object({
  companyId: z.string().min(1, "Выберите компанию"),
  role: z.enum(['admin', 'operator', 'monitor'], {
    errorMap: () => ({ message: "Выберите роль" })
  }),
  newCompanyName: z.string().optional(),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const [createNewCompany, setCreateNewCompany] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      companyId: "",
      role: "monitor",
      newCompanyName: "",
    }
  });

  // Получить список компаний
  const { data: companies, isLoading: companiesLoading } = useQuery<Company[]>({
    queryKey: ["/api/v1/companies"],
    enabled: !createNewCompany
  });

  // Мутация для завершения регистрации
  const completeMutation = useMutation({
    mutationFn: async (data: RegistrationForm & { newCompanyName?: string }) => {
      const response = await apiRequest("POST", "/api/v1/auth/complete-registration", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Регистрация завершена",
        description: "Добро пожаловать в EQUIMON Cloud!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка регистрации",
        description: error.message || "Не удалось завершить регистрацию",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegistrationForm) => {
    if (createNewCompany && !data.newCompanyName) {
      form.setError("newCompanyName", { message: "Введите название компании" });
      return;
    }
    completeMutation.mutate(data);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>Загрузка...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Завершение регистрации</h1>
            <p className="text-muted-foreground">
              Добро пожаловать, {(user as User)?.firstName || (user as User)?.email}! 
              Выберите компанию и роль для доступа к платформе.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Информация о пользователе</CardTitle>
              <CardDescription>
                Выберите компанию и укажите вашу роль в системе
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Company Selection */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Компания</Label>
                    <div className="flex space-x-4">
                      <Button
                        type="button"
                        variant={!createNewCompany ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setCreateNewCompany(false)}
                        data-testid="button-existing-company"
                      >
                        <Building className="w-4 h-4 mr-2" />
                        Существующая компания
                      </Button>
                      <Button
                        type="button"
                        variant={createNewCompany ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setCreateNewCompany(true)}
                        data-testid="button-new-company"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Новая компания
                      </Button>
                    </div>
                  </div>

                  {!createNewCompany ? (
                    <FormField
                      control={form.control}
                      name="companyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Выберите компанию</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-company">
                                <SelectValue placeholder="Выберите компанию из списка" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {companiesLoading ? (
                                <SelectItem value="" disabled>Загрузка...</SelectItem>
                              ) : companies && companies.length > 0 ? (
                                companies.map((company) => (
                                  <SelectItem key={company.id} value={company.id}>
                                    {company.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="" disabled>Компании не найдены</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <FormField
                      control={form.control}
                      name="newCompanyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Название новой компании</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Введите название вашей компании"
                              data-testid="input-company-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Role Selection */}
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Роль в системе</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-role">
                              <SelectValue placeholder="Выберите вашу роль" />
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
                                  <div className="text-sm text-muted-foreground">Управление оборудованием и настройки</div>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="admin">
                              <div className="flex items-center">
                                <Building className="w-4 h-4 mr-2" />
                                <div>
                                  <div className="font-medium">Администратор</div>
                                  <div className="text-sm text-muted-foreground">Полный доступ ко всем функциям</div>
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
                    disabled={completeMutation.isPending}
                    data-testid="button-complete-registration"
                  >
                    {completeMutation.isPending ? "Завершение регистрации..." : "Завершить регистрацию"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}