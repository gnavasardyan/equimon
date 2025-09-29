import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Server, 
  Cpu, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Settings, 
  Code, 
  HelpCircle 
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const menuItems = [
    {
      section: "Мониторинг",
      items: [
        { icon: BarChart3, label: "Панель управления", href: "/", roles: ["admin", "operator", "monitor"] },
        { icon: Server, label: "Базовые станции", href: "/stations", roles: ["admin", "operator", "monitor"] },
        { icon: Cpu, label: "Устройства", href: "/devices", roles: ["admin", "operator", "monitor"] },
        { icon: TrendingUp, label: "Аналитика", href: "/analytics", roles: ["admin", "operator", "monitor"] },
      ]
    },
    {
      section: "Управление",
      items: [
        { icon: AlertTriangle, label: "Оповещения", href: "/alerts", roles: ["admin", "operator", "monitor"] },
        { icon: Users, label: "Пользователи", href: "/users", roles: ["admin"] },
        { icon: Settings, label: "Настройки", href: "/settings", roles: ["admin", "operator"] },
      ]
    },
    {
      section: "Документация",
      items: [
        { icon: Code, label: "API", href: "/api", roles: ["admin", "operator", "monitor"] },
        { icon: HelpCircle, label: "Справка", href: "/help", roles: ["admin", "operator", "monitor"] },
      ]
    }
  ];

  const filteredMenuItems = menuItems.map(section => ({
    ...section,
    items: section.items.filter(item => 
      item.roles.includes((user as any)?.role || 'monitor')
    )
  })).filter(section => section.items.length > 0);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
          data-testid="sidebar-overlay"
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "w-64 bg-card border-r border-border h-screen-minus-header fixed lg:relative z-30 transform transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        data-testid="sidebar"
      >
        <nav className="p-4 space-y-2">
          {filteredMenuItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {section.section}
              </h2>
              <ul className="space-y-1">
                {section.items.map((item, itemIndex) => {
                  const isActive = location === item.href;
                  const Icon = item.icon;
                  
                  return (
                    <li key={itemIndex}>
                      <Link href={item.href}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start text-sm font-medium",
                            isActive 
                              ? "text-primary bg-accent/10" 
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                          )}
                          onClick={() => {
                            if (window.innerWidth < 1024) {
                              onClose();
                            }
                          }}
                          data-testid={`nav-${item.href.slice(1) || 'dashboard'}`}
                        >
                          <Icon className="w-4 h-4 mr-3" />
                          {item.label}
                        </Button>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
