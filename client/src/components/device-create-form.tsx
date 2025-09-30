import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Station } from "@shared/schema";

const createDeviceSchema = z.object({
  stationId: z.string().min(1, "Выберите станцию"),
  name: z.string().min(1, "Название обязательно"),
  type: z.string().min(1, "Выберите тип устройства"),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  metadata: z.string().optional().refine(
    (val) => {
      if (!val || !val.trim()) return true;
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Метаданные должны быть валидным JSON" }
  ),
});

type CreateDeviceForm = z.infer<typeof createDeviceSchema>;

interface DeviceCreateFormProps {
  onCreateSuccess?: () => void;
}

export default function DeviceCreateForm({ onCreateSuccess }: DeviceCreateFormProps = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch stations
  const { data: stations, isLoading: stationsLoading } = useQuery<Station[]>({
    queryKey: ["/api/v1/stations"],
  });

  const form = useForm<CreateDeviceForm>({
    resolver: zodResolver(createDeviceSchema),
    defaultValues: {
      stationId: "",
      name: "",
      type: "",
      model: "",
      serialNumber: "",
      metadata: "",
    }
  });

  const createDeviceMutation = useMutation({
    mutationFn: async (data: CreateDeviceForm) => {
      const payload = {
        stationId: data.stationId,
        name: data.name.trim(),
        type: data.type,
        model: data.model?.trim() || undefined,
        serialNumber: data.serialNumber?.trim() || undefined,
        metadata: data.metadata?.trim() || undefined,
        status: 'active',
      };
      const response = await apiRequest("POST", "/api/v1/devices", payload);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Устройство успешно создано",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/devices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/dashboard/stats"] });
      form.reset();
      onCreateSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка создания",
        description: error.message || "Не удалось создать устройство",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateDeviceForm) => {
    createDeviceMutation.mutate(data);
  };

  // Filter active stations only
  const activeStations = (stations || []).filter(s => s.status === 'active');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Добавить устройство</CardTitle>
      </CardHeader>
      <CardContent>
        {!stationsLoading && activeStations.length === 0 && (
          <div 
            className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4"
            data-testid="warning-no-active-stations"
          >
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Внимание:</strong> Нет активных станций. Сначала создайте и активируйте базовую станцию.
            </p>
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="stationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Станция *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-device-station">
                        <SelectValue placeholder="Выберите станцию" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {stationsLoading && (
                        <SelectItem value="" disabled data-testid="option-stations-loading">Загрузка станций...</SelectItem>
                      )}
                      {!stationsLoading && activeStations.length === 0 && (
                        <SelectItem value="" disabled data-testid="option-no-active-stations">Нет активных станций</SelectItem>
                      )}
                      {activeStations.map((station) => (
                        <SelectItem key={station.id} value={station.id} data-testid={`option-station-${station.id}`}>
                          {station.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Можно добавлять устройства только к активным станциям
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название устройства *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Термодатчик T-101" data-testid="input-device-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип устройства *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-device-type">
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="temperature" data-testid="option-type-temperature">Температура (temperature)</SelectItem>
                      <SelectItem value="pressure" data-testid="option-type-pressure">Давление (pressure)</SelectItem>
                      <SelectItem value="vibration" data-testid="option-type-vibration">Вибрация (vibration)</SelectItem>
                      <SelectItem value="humidity" data-testid="option-type-humidity">Влажность (humidity)</SelectItem>
                      <SelectItem value="power" data-testid="option-type-power">Энергопотребление (power)</SelectItem>
                      <SelectItem value="flow" data-testid="option-type-flow">Расход (flow)</SelectItem>
                      <SelectItem value="level" data-testid="option-type-level">Уровень (level)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Модель</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="TH-2000" data-testid="input-device-model" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serialNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Серийный номер</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="SN123456789" data-testid="input-device-serial" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metadata"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Метаданные (JSON)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='{"threshold": 100, "unit": "°C"}' data-testid="input-device-metadata" />
                  </FormControl>
                  <FormDescription>
                    Опциональные параметры в формате JSON
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  onCreateSuccess?.();
                }}
                data-testid="button-cancel-device"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={createDeviceMutation.isPending || activeStations.length === 0}
                data-testid="button-submit-device"
              >
                {createDeviceMutation.isPending ? "Создание..." : "Добавить устройство"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
