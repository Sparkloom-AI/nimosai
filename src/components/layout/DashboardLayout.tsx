
import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="flex h-screen">
        <Sidebar />
        <div className={cn(
          "flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out",
          isCollapsed ? "ml-0" : "ml-0" // No additional margin needed as sidebar handles its own width
        )}>
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto animate-fade-in">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
