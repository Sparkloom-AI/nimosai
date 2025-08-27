
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Search, Plus, LogOut, PanelLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';

export const Header = () => {
  const { user, signOut } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left side with sidebar toggle */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <PanelLeft className="w-4 h-4 text-muted-foreground" />
            <Switch
              checked={!isCollapsed}
              onCheckedChange={(checked) => toggleSidebar()}
              aria-label="Toggle sidebar"
            />
            <span className="text-sm text-muted-foreground">
              {isCollapsed ? 'Icons' : 'Icons + Text'}
            </span>
          </div>
          
          {/* Search */}
          <div className="flex-1 max-w-md ml-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search appointments, clients, services..."
                className="pl-10 bg-background/50 border-muted"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="w-5 h-5" />
          </Button>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-primary-foreground">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
