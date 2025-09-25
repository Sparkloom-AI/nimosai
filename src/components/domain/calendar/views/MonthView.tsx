
import React from 'react';
import { format, isSameMonth, isSameDay, isToday, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { cn } from '@/lib/utils';

interface MonthViewProps {
  currentDate: Date;
  dateRange: { start: Date; end: Date };
  searchQuery: string;
  selectedTeamMembers: string[];
  onNewAppointment?: (date?: Date, teamMemberId?: string) => void;
  isLoading?: boolean;
  appointments?: any[];
}

const MonthView = ({ currentDate, onNewAppointment, appointments = [] }: MonthViewProps) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(apt => isSameDay(new Date(apt.appointment_date), date));
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
              onClick={() => onNewAppointment?.(day)}
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
                    style={{
                      backgroundColor: appointment.team_member?.calendar_color ? appointment.team_member.calendar_color + '20' : '#007AFF20',
                      color: appointment.team_member?.calendar_color || '#007AFF'
                    }}
                  >
                    <div className="font-medium truncate">{appointment.start_time}</div>
                    <div className="truncate opacity-90">
                      {appointment.service?.name} - {appointment.client?.first_name} {appointment.client?.last_name}
                    </div>
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
