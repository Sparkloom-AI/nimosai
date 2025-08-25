
import React from 'react';
import { format, addDays, isSameDay, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

interface WeekViewProps {
  currentDate: Date;
  dateRange: { start: Date; end: Date };
  searchQuery: string;
  selectedTeamMembers: string[];
  viewType: 'week' | '3-day';
}

const WeekView = ({ currentDate, dateRange, viewType }: WeekViewProps) => {
  const days = viewType === 'week' 
    ? Array.from({ length: 7 }, (_, i) => addDays(dateRange.start, i))
    : Array.from({ length: 3 }, (_, i) => addDays(currentDate, i));

  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Mock appointments data
  const appointments = [
    {
      id: '1',
      title: 'Haircut - Sarah Johnson',
      date: new Date(2025, 7, 25),
      startHour: 9,
      duration: 1,
      color: '#007AFF',
      teamMember: 'Alice Smith'
    },
    {
      id: '2',
      title: 'Color Treatment - Mike Davis',
      date: new Date(2025, 7, 25),
      startHour: 14.5,
      duration: 2,
      color: '#FF3B30',
      teamMember: 'Bob Wilson'
    },
    {
      id: '3',
      title: 'Manicure - Lisa Wong',
      date: new Date(2025, 7, 26),
      startHour: 11,
      duration: 1,
      color: '#34C759',
      teamMember: 'Carol Brown'
    },
  ];

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(apt => isSameDay(apt.date, date));
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Day headers */}
      <div className="flex border-b border-border">
        <div className="w-16 p-3 border-r border-border"></div>
        {days.map((day) => (
          <div
            key={day.toString()}
            className="flex-1 p-3 text-center border-r border-border last:border-r-0"
          >
            <div className="text-sm text-muted-foreground">
              {format(day, 'EEE')}
            </div>
            <div
              className={cn(
                "text-lg font-semibold mt-1",
                isToday(day) && "bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto"
              )}
            >
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-auto">
        <div className="relative">
          {hours.map((hour) => (
            <div key={hour} className="flex border-b border-border h-16">
              {/* Time label */}
              <div className="w-16 p-2 text-xs text-muted-foreground text-right border-r border-border">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
              
              {/* Day columns */}
              {days.map((day) => {
                const dayAppointments = getAppointmentsForDay(day);
                const hourAppointments = dayAppointments.filter(
                  apt => apt.startHour <= hour && apt.startHour + apt.duration > hour
                );

                return (
                  <div
                    key={`${day.toString()}-${hour}`}
                    className="flex-1 border-r border-border last:border-r-0 relative hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    {hourAppointments.map((appointment) => {
                      const topOffset = (appointment.startHour - hour) * 64;
                      const height = appointment.duration * 64;
                      
                      return (
                        <div
                          key={appointment.id}
                          className="absolute left-1 right-1 rounded p-2 text-xs cursor-pointer hover:opacity-80 shadow-sm"
                          style={{
                            backgroundColor: appointment.color + '20',
                            borderLeft: `3px solid ${appointment.color}`,
                            top: `${Math.max(0, topOffset)}px`,
                            height: `${height}px`,
                            color: appointment.color
                          }}
                        >
                          <div className="font-medium truncate">{appointment.title}</div>
                          <div className="text-xs opacity-75 truncate">{appointment.teamMember}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeekView;
