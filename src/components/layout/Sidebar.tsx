
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Users, 
  Scissors, 
  MessageSquare, 
  BarChart3, 
  Settings,
  Home,
  CreditCard
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '#', icon: Home, current: true },
  { name: 'Appointments', href: '#', icon: Calendar },
  { name: 'Staff', href: '#', icon: Users },
  { name: 'Services', href: '#', icon: Scissors },
  { name: 'WhatsApp', href: '#', icon: MessageSquare },
  { name: 'Analytics', href: '#', icon: BarChart3 },
  { name: 'Billing', href: '#', icon: CreditCard },
  { name: 'Settings', href: '#', icon: Settings },
];

export const Sidebar = () => {
  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-sidebar-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Nimos</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => (
            <Button
              key={item.name}
              variant={item.current ? "default" : "ghost"}
              className={cn(
                "w-full justify-start h-11 px-4",
                item.current
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-sidebar-accent text-sidebar-foreground"
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Button>
          ))}
        </nav>

        {/* Studio Selector */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-sidebar-accent">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-foreground">BS</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                Bella's Salon
              </p>
              <p className="text-xs text-sidebar-foreground/60">Owner</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
