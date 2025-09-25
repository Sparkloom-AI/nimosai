
import React from 'react';
import { CalendarViewType } from '@/pages/Calendar';
import MonthView from './views/MonthView';
import WeekView from './views/WeekView';
import DayView from './views/DayView';

interface CalendarViewProps {
  viewType: CalendarViewType;
  currentDate: Date;
  dateRange: { start: Date; end: Date };
  searchQuery: string;
  selectedTeamMembers: string[];
  appointments?: any[];
  onNewAppointment?: (date?: Date, teamMemberId?: string) => void;
  isLoading?: boolean;
}

const CalendarView = ({
  viewType,
  currentDate,
  dateRange,
  searchQuery,
  selectedTeamMembers,
  appointments,
  onNewAppointment,
  isLoading,
}: CalendarViewProps) => {
  const commonProps = {
    currentDate,
    dateRange,
    searchQuery,
    selectedTeamMembers,
    appointments,
    onNewAppointment,
    isLoading,
  };

  switch (viewType) {
    case 'month':
      return <MonthView {...commonProps} />;
    case 'week':
      return <WeekView {...commonProps} viewType="week" />;
    case '3-day':
      return <WeekView {...commonProps} viewType="3-day" />;
    case 'day':
      return <DayView {...commonProps} />;
    default:
      return <MonthView {...commonProps} />;
  }
};

export default CalendarView;
