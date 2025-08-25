
import React from 'react';
import { format, isSameMonth, isSameDay, isToday, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { cn } from '@/lib/utils';

interface MonthViewProps {
  currentDate: Date;
  dateRange: { start: Date; end: Date };
  searchQuery: string;
  selectedTeamMembers: string[];
}

const MonthView = ({ currentDate }: MonthViewProps) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Mock appointments data
  const appointments = [
    {
      id: '1',
      title: 'Haircut - Sarah Johnson',
      date: new Date(2025, 7, 25),
      startTime: '09:00',
      endTime: '10:00',
      color: '#007AFF',
      teamMember: 'Alice Smith'
    },
    {
      id: '2',
      title: 'Color Treatment',
      date: new Date(2025, 7, 25),
      startTime: '14:30',
      endTime: '16:30',
      color: '#FF3B30',
      teamMember: 'Bob Wilson'
    },
    {
      id: '3',
      title: 'Manicure',
      date: new Date(2025, 7, 26),
      startTime: '11:00',
      endTime: '12:00',
      color: '#34C759',
      teamMember: 'Carol Brown'
    },
  ];

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(apt => isSameDay(apt.date, date));
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {weekdays.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-medium text-muted-foreground border-r border-border last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6">
        {days.map((day, index) => {
          const dayAppointments = getAppointmentsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);

          return (
            <div
              key={day.toString()}
              className={cn(
                "border-r border-b border-border last:border-r-0 p-2 min-h-[120px] relative",
                "hover:bg-muted/50 cursor-pointer transition-colors",
                !isCurrentMonth && "bg-muted/30"
              )}
            >
              {/* Date number */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={cn(
                    "text-sm font-medium",
                    isDayToday && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center",
                    !isCurrentMonth && "text-muted-foreground"
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>

              {/* Appointments */}
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                    style={{ backgroundColor: appointment.color + '20', color: appointment.color }}
                  >
                    <div className="font-medium truncate">{appointment.startTime}</div>
                    <div className="truncate opacity-90">{appointment.title}</div>
                  </div>
                ))}
                {dayAppointments.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayAppointments.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;
