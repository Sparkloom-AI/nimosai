
import React from 'react';
import { format, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

interface DayViewProps {
  currentDate: Date;
  dateRange: { start: Date; end: Date };
  searchQuery: string;
  selectedTeamMembers: string[];
  onNewAppointment?: (date?: Date, teamMemberId?: string) => void;
  isLoading?: boolean;
  appointments?: any[];
}

const DayView = ({ currentDate, onNewAppointment, appointments = [] }: DayViewProps) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

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
              <div className="flex-1 relative hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => onNewAppointment?.(currentDate)}>
                {appointments
                  .filter(apt => {
                    const startTime = new Date(`2000-01-01T${apt.start_time}`);
                    const startHour = startTime.getHours() + startTime.getMinutes() / 60;
                    const duration = apt.service?.duration ? apt.service.duration / 60 : 1;
                    return startHour <= hour && startHour + duration > hour;
                  })
                  .map((appointment) => {
                    const startTime = new Date(`2000-01-01T${appointment.start_time}`);
                    const startHour = startTime.getHours() + startTime.getMinutes() / 60;
                    const duration = appointment.service?.duration ? appointment.service.duration / 60 : 1;
                    const topOffset = (startHour - hour) * 64;
                    const height = duration * 64;

                    return (
                      <div
                        key={appointment.id}
                        className="absolute left-2 right-2 rounded-lg p-3 cursor-pointer hover:opacity-90 shadow-sm transition-opacity"
                        style={{
                          backgroundColor: appointment.team_member?.calendar_color ? appointment.team_member.calendar_color + '20' : '#007AFF20',
                          borderLeft: `4px solid ${appointment.team_member?.calendar_color || '#007AFF'}`,
                          top: `${Math.max(0, topOffset)}px`,
                          height: `${height}px`,
                          color: appointment.team_member?.calendar_color || '#007AFF'
                        }}
                      >
                        <div className="font-semibold text-sm truncate">{appointment.service?.name}</div>
                        <div className="text-xs opacity-90 truncate">{appointment.client?.first_name} {appointment.client?.last_name}</div>
                        <div className="text-xs opacity-75 truncate mt-1">with {appointment.team_member?.first_name} {appointment.team_member?.last_name}</div>
                        <div className="text-xs opacity-75">
                          {format(startTime, 'h:mm a')} - {format(new Date(startTime.getTime() + (duration * 60 * 60 * 1000)), 'h:mm a')}
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
