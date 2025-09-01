
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home,
  Calendar,
  Users,
  Settings,
  Briefcase,
  BarChart3,
  MessageSquare,
  CreditCard,
  Clock,
  MapPin
} from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Scheduled Shifts', href: '/scheduled-shifts', icon: Clock },
  { name: 'Services', href: '/services', icon: Briefcase },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();
  const { isCollapsed } = useSidebar();

  return (
    <div className={cn(
      "flex flex-col bg-background border-r border-border transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center justify-center h-16 border-b border-border">
        <span className={cn(
          "text-xl font-bold text-primary transition-opacity duration-300",
          isCollapsed ? "opacity-0" : "opacity-100"
        )}>
          {isCollapsed ? "N" : "Nimos"}
        </span>
      </div>
      <nav className={cn(
        "flex-1 py-6 space-y-2 transition-all duration-300",
        isCollapsed ? "px-2" : "px-4"
      )}>
        {navigation.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.href;
          
          const linkContent = (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center text-sm font-medium rounded-lg transition-colors',
                isCollapsed ? 'px-2 py-3 justify-center' : 'px-3 py-2',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <IconComponent className={cn(
                "w-5 h-5",
                isCollapsed ? "" : "mr-3"
              )} />
              {!isCollapsed && (
                <span className="transition-opacity duration-300">
                  {item.name}
                </span>
              )}
            </Link>
          );

          if (isCollapsed) {
            return (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  {linkContent}
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.name}</p>
                </TooltipContent>
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </nav>
    </div>
  );
};
