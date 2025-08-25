
import React from 'react';
import { format, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

interface DayViewProps {
  currentDate: Date;
  dateRange: { start: Date; end: Date };
  searchQuery: string;
  selectedTeamMembers: string[];
}

const DayView = ({ currentDate }: DayViewProps) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Mock appointments data for the current day
  const appointments = [
    {
      id: '1',
      title: 'Haircut - Sarah Johnson',
      startHour: 9,
      duration: 1,
      color: '#007AFF',
      teamMember: 'Alice Smith',
      client: 'Sarah Johnson',
      service: 'Haircut & Style'
    },
    {
      id: '2',
      title: 'Color Treatment - Mike Davis',
      startHour: 14.5,
      duration: 2,
      color: '#FF3B30',
      teamMember: 'Bob Wilson',
      client: 'Mike Davis',
      service: 'Full Color Treatment'
    },
    {
      id: '3',
      title: 'Manicure - Lisa Wong',
      startHour: 11,
      duration: 1,
      color: '#34C759',
      teamMember: 'Carol Brown',
      client: 'Lisa Wong',
      service: 'Classic Manicure'
    },
    {
      id: '4',
      title: 'Consultation - Emma Taylor',
      startHour: 16,
      duration: 0.5,
      color: '#FF9500',
      teamMember: 'Alice Smith',
      client: 'Emma Taylor',
      service: 'Consultation'
    },
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Day header */}
      <div className="border-b border-border p-4">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">
            {format(currentDate, 'EEEE')}
          </div>
          <div
            className={cn(
              "text-2xl font-semibold mt-1",
              isToday(currentDate) && "text-primary"
            )}
          >
            {format(currentDate, 'MMMM d, yyyy')}
          </div>
        </div>
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-auto">
        <div className="relative">
          {hours.map((hour) => (
            <div key={hour} className="flex border-b border-border h-16">
              {/* Time label */}
              <div className="w-20 p-3 text-sm text-muted-foreground text-right border-r border-border">
                {hour === 0 ? '12:00 AM' : hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`}
              </div>
              
              {/* Main column */}
              <div className="flex-1 relative hover:bg-muted/50 cursor-pointer transition-colors">
                {appointments
                  .filter(apt => apt.startHour <= hour && apt.startHour + apt.duration > hour)
                  .map((appointment) => {
                    const topOffset = (appointment.startHour - hour) * 64;
                    const height = appointment.duration * 64;
                    
                    return (
                      <div
                        key={appointment.id}
                        className="absolute left-2 right-2 rounded-lg p-3 cursor-pointer hover:opacity-90 shadow-sm transition-opacity"
                        style={{
                          backgroundColor: appointment.color + '20',
                          borderLeft: `4px solid ${appointment.color}`,
                          top: `${Math.max(0, topOffset)}px`,
                          height: `${height}px`,
                          color: appointment.color
                        }}
                      >
                        <div className="font-semibold text-sm truncate">{appointment.service}</div>
                        <div className="text-xs opacity-90 truncate">{appointment.client}</div>
                        <div className="text-xs opacity-75 truncate mt-1">with {appointment.teamMember}</div>
                        <div className="text-xs opacity-75">
                          {format(new Date().setHours(appointment.startHour, (appointment.startHour % 1) * 60), 'h:mm a')} - 
                          {format(new Date().setHours(appointment.startHour + appointment.duration, ((appointment.startHour + appointment.duration) % 1) * 60), 'h:mm a')}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DayView;
