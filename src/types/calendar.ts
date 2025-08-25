// Calendar and scheduling types
export type CalendarViewType = 'day' | '3-day' | 'week' | 'month';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: any;
  color?: string;
  description?: string;
}

export interface CalendarSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  selectedTeamMembers: string[];
  onTeamMemberToggle: (memberId: string) => void;
}

export interface CalendarCategory {
  name: string;
  color: string;
  enabled: boolean;
}