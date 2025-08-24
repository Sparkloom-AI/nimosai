
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
  Clock
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
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

  return (
    <div className="flex flex-col w-64 bg-background border-r border-border">
      <div className="flex items-center justify-center h-16 border-b border-border">
        <span className="text-xl font-bold text-primary">Nimos</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <IconComponent className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
