import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, MapPin, Activity } from "lucide-react";
import type { Station } from "@shared/schema";

interface StationCardProps {
  station: Station;
  onView?: (station: Station) => void;
  onEdit?: (station: Station) => void;
  onDelete?: (station: Station) => void;
}

export default function StationCard({ station, onView, onEdit, onDelete }: StationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активна';
      case 'inactive':
        return 'Неактивна';
      case 'error':
        return 'Ошибка';
      case 'pending':
        return 'Ожидает';
      default:
        return status;
    }
  };

  const formatLastSeen = (lastSeen: Date | null) => {
    if (!lastSeen) return 'Никогда';
    
    const now = new Date();
    const diff = now.getTime() - new Date(lastSeen).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Только что';
    if (minutes < 60) return `${minutes} мин назад`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ч назад`;
    
    const days = Math.floor(hours / 24);
    return `${days} дн назад`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow" data-testid={`station-card-${station.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground" data-testid={`station-name-${station.id}`}>
              {station.name}
            </h3>
            <p className="text-sm text-muted-foreground">UUID: {station.uuid}</p>
          </div>
          <Badge className={`${getStatusColor(station.status || 'pending')} border`}>
            <span className={`status-indicator status-${station.status || 'pending'} mr-1`}></span>
            {getStatusText(station.status || 'pending')}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          {station.location && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mr-2" />
              {station.location}
            </div>
          )}
          <div className="flex items-center text-sm text-muted-foreground">
            <Activity className="w-4 h-4 mr-2" />
            Последняя активность: {formatLastSeen(station.lastSeen)}
          </div>
        </div>

        <div className="flex space-x-2">
          {onView && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(station)}
              data-testid={`button-view-${station.id}`}
            >
              <Eye className="w-4 h-4" />
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(station)}
              data-testid={`button-edit-${station.id}`}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(station)}
              className="text-destructive hover:text-destructive"
              data-testid={`button-delete-${station.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
