
import React from 'react';
import { format, addDays, isSameDay, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

interface WeekViewProps {
  currentDate: Date;
  dateRange: { start: Date; end: Date };
  searchQuery: string;
  selectedTeamMembers: string[];
  viewType: 'week' | '3-day';
  onNewAppointment?: (date?: Date, teamMemberId?: string) => void;
  isLoading?: boolean;
  appointments?: any[];
}

const WeekView = ({ currentDate, dateRange, viewType, onNewAppointment, appointments = [] }: WeekViewProps) => {
  const days = viewType === 'week' 
    ? Array.from({ length: 7 }, (_, i) => addDays(dateRange.start, i))
    : Array.from({ length: 3 }, (_, i) => addDays(currentDate, i));

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(apt => isSameDay(new Date(apt.appointment_date), date));
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
                    onClick={() => onNewAppointment?.(day)}
                  >
                    {hourAppointments.map((appointment) => {
                      const startTime = new Date(`2000-01-01T${appointment.start_time}`);
                      const startHour = startTime.getHours() + startTime.getMinutes() / 60;
                      const duration = appointment.service?.duration ? appointment.service.duration / 60 : 1;
                      const topOffset = (startHour - hour) * 64;
                      const height = duration * 64;

                      return (
                        <div
                          key={appointment.id}
                          className="absolute left-1 right-1 rounded p-2 text-xs cursor-pointer hover:opacity-80 shadow-sm"
                          style={{
                            backgroundColor: appointment.team_member?.calendar_color ? appointment.team_member.calendar_color + '20' : '#007AFF20',
                            borderLeft: `3px solid ${appointment.team_member?.calendar_color || '#007AFF'}`,
                            top: `${Math.max(0, topOffset)}px`,
                            height: `${height}px`,
                            color: appointment.team_member?.calendar_color || '#007AFF'
                          }}
                        >
                          <div className="font-medium truncate">
                            {appointment.service?.name} - {appointment.client?.first_name} {appointment.client?.last_name}
                          </div>
                          <div className="text-xs opacity-75 truncate">with {appointment.team_member?.first_name} {appointment.team_member?.last_name}</div>
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
