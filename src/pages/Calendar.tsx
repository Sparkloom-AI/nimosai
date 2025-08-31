
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import CalendarHeader from '@/components/domain/calendar/CalendarHeader';
import CalendarSidebar from '@/components/domain/calendar/CalendarSidebar';
import CalendarView from '@/components/domain/calendar/CalendarView';
import AppointmentModal from '@/components/domain/scheduling/AppointmentModal';
import { addDays, startOfWeek, startOfMonth, endOfMonth, endOfWeek } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAppointments, createAppointment } from '@/api/scheduling';
import { getClients } from '@/api/scheduling';
import { getTeamMembers, getServices, getLocations } from '@/api/team';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { BookingRequest } from '@/types/scheduling';

export type CalendarViewType = 'day' | '3-day' | 'week' | 'month';

const Calendar = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<CalendarViewType>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTeamMember, setSelectedTeamMember] = useState<string | null>(null);

  // Get studio ID from user context (you'll need to implement this)
  const studioId = user?.user_metadata?.studio_id || '';

  // Fetch appointments
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ['appointments', studioId, getDateRange()],
    queryFn: () => {
      const { start, end } = getDateRange();
      return getAppointments(studioId, start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
    },
    enabled: !!studioId,
  });

  // Fetch supporting data
  const { data: clients = [] } = useQuery({
    queryKey: ['clients', studioId],
    queryFn: () => getClients(studioId),
    enabled: !!studioId,
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['teamMembers', studioId],
    queryFn: () => getTeamMembers(studioId),
    enabled: !!studioId,
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services', studioId],
    queryFn: () => getServices(studioId),
    enabled: !!studioId,
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations', studioId],
    queryFn: () => getLocations(studioId),
    enabled: !!studioId,
  });

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: (data: BookingRequest) => createAppointment({ ...data, studio_id: studioId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment created successfully');
    },
    onError: (error) => {
      console.error('Error creating appointment:', error);
      toast.error('Failed to create appointment');
    },
  });

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

  const handleNewAppointment = (date?: Date, teamMemberId?: string) => {
    setSelectedDate(date || null);
    setSelectedTeamMember(teamMemberId || null);
    setAppointmentModalOpen(true);
  };

  const handleSaveAppointment = async (appointmentData: BookingRequest) => {
    await createAppointmentMutation.mutateAsync(appointmentData);
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
              appointments={appointments}
              onNewAppointment={handleNewAppointment}
              isLoading={appointmentsLoading}
            />
          </div>
        </div>
      </div>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={appointmentModalOpen}
        onClose={() => {
          setAppointmentModalOpen(false);
          setSelectedDate(null);
          setSelectedTeamMember(null);
        }}
        onSave={handleSaveAppointment}
        clients={clients}
        teamMembers={teamMembers}
        services={services}
        locations={locations}
        isLoading={createAppointmentMutation.isPending}
        defaultDate={selectedDate}
        defaultTeamMember={selectedTeamMember}
      />
    </DashboardLayout>
  );
};

export default Calendar;
