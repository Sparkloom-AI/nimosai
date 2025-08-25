
import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { teamApi } from '@/api/team';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface CalendarSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  selectedTeamMembers: string[];
  onTeamMemberToggle: (memberId: string) => void;
}

const CalendarSidebar = ({
  collapsed,
  onToggleCollapse,
  selectedTeamMembers,
  onTeamMemberToggle,
}: CalendarSidebarProps) => {
  const { user } = useAuth();

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members', user?.id],
    queryFn: () => user?.id ? teamApi.getTeamMembers(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
  });

  const calendarCategories = [
    { name: 'My Calendar', color: '#007AFF', enabled: true },
    { name: 'Appointments', color: '#FF3B30', enabled: true },
    { name: 'Blocked Time', color: '#FF9500', enabled: true },
  ];

  if (collapsed) {
    return (
      <div className="w-12 border-r border-border bg-muted/30 flex flex-col">
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 border-r border-border bg-muted/30 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Calendars
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-6 w-6 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <Button size="sm" className="w-full h-8">
          <Plus className="h-4 w-4 mr-2" />
          Add Calendar
        </Button>
      </div>

      {/* Default Calendars */}
      <div className="p-4 space-y-3">
        <h3 className="font-medium text-sm text-foreground">My Calendars</h3>
        {calendarCategories.map((category) => (
          <div key={category.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-sm text-foreground">{category.name}</span>
            </div>
            <Switch 
              checked={category.enabled}
              className="scale-75"
            />
          </div>
        ))}
      </div>

      {/* Team Members */}
      <div className="p-4 space-y-3 border-t border-border">
        <h3 className="font-medium text-sm text-foreground">Team Members</h3>
        {teamMembers.map((member) => {
          const isSelected = selectedTeamMembers.includes(member.id);
          return (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: member.calendar_color || '#007AFF' }}
                />
                <span className="text-sm text-foreground">
                  {member.first_name} {member.last_name}
                </span>
              </div>
              <Switch 
                checked={isSelected}
                onCheckedChange={() => onTeamMemberToggle(member.id)}
                className="scale-75"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarSidebar;
