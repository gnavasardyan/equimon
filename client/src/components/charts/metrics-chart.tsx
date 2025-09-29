import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState } from "react";

// Mock data for demonstration
const generateMockData = () => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    hours.push({
      time: `${i.toString().padStart(2, '0')}:00`,
      temperature: 20 + Math.random() * 15,
      humidity: 40 + Math.random() * 20,
      pressure: 1000 + Math.random() * 50,
    });
  }
  return hours;
};

export default function MetricsChart() {
  const [timeRange, setTimeRange] = useState("24h");
  const data = generateMockData();

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Мониторинг параметров</CardTitle>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Последний час</SelectItem>
              <SelectItem value="24h">Последние 24 часа</SelectItem>
              <SelectItem value="7d">Последняя неделя</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64" data-testid="metrics-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="temperature" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Температура (°C)"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="humidity" 
                stroke="hsl(var(--accent))" 
                strokeWidth={2}
                name="Влажность (%)"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
