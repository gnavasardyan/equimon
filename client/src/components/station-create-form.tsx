import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Shuffle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";

const createStationSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  uuid: z.string().optional(),
  location: z.string().optional(),
  metadata: z.object({
    type: z.string().optional(),
    floor: z.coerce.number().optional()
  }).optional()
});

type CreateStationForm = z.infer<typeof createStationSchema>;

interface StationCreateFormProps {
  onCreateSuccess?: () => void;
}

export default function StationCreateForm({ onCreateSuccess }: StationCreateFormProps = {}) {
  const [autoGenerateUuid, setAutoGenerateUuid] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateStationForm>({
    resolver: zodResolver(createStationSchema),
    defaultValues: {
      name: "",
      uuid: "",
      location: "",
      metadata: { type: "", floor: undefined }
    }
  });

  const createStationMutation = useMutation({
    mutationFn: async (data: CreateStationForm) => {
      const hasMetadata = data.metadata?.type || data.metadata?.floor !== undefined;
      const payload = {
        ...data,
        uuid: autoGenerateUuid ? undefined : (data.uuid?.trim() || undefined),
        metadata: hasMetadata ? JSON.stringify(data.metadata) : undefined
      };
      const response = await apiRequest("POST", "/api/v1/stations", payload);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Станция успешно создана",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/stations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/dashboard/stats"] });
      form.reset();
      onCreateSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка создания",
        description: error.message || "Не удалось создать станцию",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateStationForm) => {
    createStationMutation.mutate(data);
  };

  const generateUuid = () => {
    const uuid = crypto.randomUUID();
    form.setValue('uuid', uuid);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Создать новую станцию</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название станции *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Станция №1" data-testid="input-create-station-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-uuid"
                  checked={autoGenerateUuid}
                  onCheckedChange={setAutoGenerateUuid}
                  data-testid="switch-auto-uuid"
                />
                <Label htmlFor="auto-uuid" className="cursor-pointer">
                  Автоматически генерировать UUID
                </Label>
              </div>
            </div>

            {!autoGenerateUuid && (
              <FormField
                control={form.control}
                name="uuid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UUID станции</FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input {...field} placeholder="00000000-0000-0000-0000-000000000000" data-testid="input-create-station-uuid" />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={generateUuid}
                        data-testid="button-generate-uuid"
                      >
                        <Shuffle className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormDescription>
                      Оставьте пустым для автоматической генерации
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Местоположение</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Цех №1" data-testid="input-create-station-location" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metadata.type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип станции</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="industrial, warehouse, laboratory" data-testid="input-create-station-type" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metadata.floor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Этаж</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? undefined : value);
                      }}
                      placeholder="1"
                      data-testid="input-create-station-floor"
                    />
                  </FormControl>
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
                data-testid="button-cancel-create"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={createStationMutation.isPending}
                data-testid="button-submit-create"
              >
                {createStationMutation.isPending ? "Создание..." : "Создать станцию"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
