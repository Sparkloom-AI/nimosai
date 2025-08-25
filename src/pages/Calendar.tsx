
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import CalendarHeader from '@/components/domain/calendar/CalendarHeader';
import CalendarSidebar from '@/components/domain/calendar/CalendarSidebar';
import CalendarView from '@/components/domain/calendar/CalendarView';
import { addDays, startOfWeek, startOfMonth, endOfMonth, endOfWeek } from 'date-fns';

export type CalendarViewType = 'day' | '3-day' | 'week' | 'month';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<CalendarViewType>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navigateDate = (direction: 'prev' | 'next') => {
    const amount = viewType === 'month' ? 'month' : viewType === 'week' ? 'week' : 'day';
    const multiplier = viewType === '3-day' ? 3 : 1;
    
    setCurrentDate(prev => {
      if (direction === 'next') {
        if (amount === 'month') return new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
        if (amount === 'week') return addDays(prev, 7 * multiplier);
        return addDays(prev, multiplier);
      } else {
        if (amount === 'month') return new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
        if (amount === 'week') return addDays(prev, -7 * multiplier);
        return addDays(prev, -multiplier);
      }
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDateRange = () => {
    switch (viewType) {
      case 'day':
        return { start: currentDate, end: currentDate };
      case '3-day':
        return { start: currentDate, end: addDays(currentDate, 2) };
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
        return { start: weekStart, end: endOfWeek(currentDate, { weekStartsOn: 0 }) };
      case 'month':
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        return { 
          start: startOfWeek(monthStart, { weekStartsOn: 0 }), 
          end: endOfWeek(monthEnd, { weekStartsOn: 0 }) 
        };
      default:
        return { start: currentDate, end: currentDate };
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-full bg-background">
        {/* Sidebar */}
        <CalendarSidebar 
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          selectedTeamMembers={selectedTeamMembers}
          onTeamMemberToggle={(memberId) => {
            setSelectedTeamMembers(prev => 
              prev.includes(memberId) 
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
            );
          }}
        />

        {/* Main Calendar Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <CalendarHeader
            currentDate={currentDate}
            viewType={viewType}
            onViewTypeChange={setViewType}
            onNavigate={navigateDate}
            onToday={goToToday}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Calendar View */}
          <div className="flex-1 overflow-hidden">
            <CalendarView
              viewType={viewType}
              currentDate={currentDate}
              dateRange={getDateRange()}
              searchQuery={searchQuery}
              selectedTeamMembers={selectedTeamMembers}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;
