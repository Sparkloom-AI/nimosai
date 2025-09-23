
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamApi } from '@/api/team';
import { shiftsApi } from '@/api/shifts';
import { useRole } from '@/contexts/RoleContext';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import { toast } from 'sonner';
import SetRegularShiftsModal from '@/components/domain/team/SetRegularShiftsModal';
import WeeklyScheduleTable from '@/components/domain/team/WeeklyScheduleTable';
import WeekNavigation from '@/components/domain/team/WeekNavigation';
import ScheduledShiftsHeader from '@/components/domain/team/ScheduledShiftsHeader';
import EditShiftModal from '@/components/domain/team/EditShiftModal';
import AddShiftModal from '@/components/domain/team/AddShiftModal';

const ScheduledShifts = () => {
  const { currentStudioId } = useRole();
  const queryClient = useQueryClient();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedTeamMember, setSelectedTeamMember] = useState<string | null>(null);
  const [selectedTeamMemberName, setSelectedTeamMemberName] = useState<string>('');
  const [isRegularShiftsModalOpen, setIsRegularShiftsModalOpen] = useState(false);
  const [isEditShiftModalOpen, setIsEditShiftModalOpen] = useState(false);
  const [isAddShiftModalOpen, setIsAddShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<any>(null);
  const [addShiftData, setAddShiftData] = useState<{ teamMemberId?: string; date?: Date }>({});

  // Fetch team members
  const { data: teamMembers, isLoading: isLoadingTeam } = useQuery({
    queryKey: ['team-members', currentStudioId],
    queryFn: () => currentStudioId ? teamApi.getTeamMembers(currentStudioId) : Promise.resolve([]),
    enabled: !!currentStudioId,
  });

  // Fetch locations
  const { data: locations = [] } = useQuery({
    queryKey: ['locations', currentStudioId],
    queryFn: () => currentStudioId ? teamApi.getLocations(currentStudioId) : Promise.resolve([]),
    enabled: !!currentStudioId,
  });

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Fetch shifts for the current week
  const { data: shifts = [], isLoading: isLoadingShifts } = useQuery({
    queryKey: ['shifts', currentStudioId, format(weekStart, 'yyyy-MM-dd'), format(weekEnd, 'yyyy-MM-dd')],
    queryFn: () => currentStudioId ? shiftsApi.getShiftsForWeek(
      currentStudioId,
      format(weekStart, 'yyyy-MM-dd'),
      format(weekEnd, 'yyyy-MM-dd')
    ) : Promise.resolve([]),
    enabled: !!currentStudioId,
  });

  // Mutations
  const createShiftMutation = useMutation({
    mutationFn: shiftsApi.createShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success('Shift created successfully');
    },
    onError: () => {
      toast.error('Failed to create shift');
    },
  });

  const updateShiftMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      shiftsApi.updateShift(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success('Shift updated successfully');
    },
    onError: () => {
      toast.error('Failed to update shift');
    },
  });

  const deleteShiftMutation = useMutation({
    mutationFn: shiftsApi.deleteShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success('Shift deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete shift');
    },
  });

  const deleteShiftsInRangeMutation = useMutation({
    mutationFn: ({ teamMemberId, startDate, endDate }: { 
      teamMemberId: string; 
      startDate: string; 
      endDate: string; 
    }) => shiftsApi.deleteShiftsInRange(teamMemberId, startDate, endDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success('All shifts deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete shifts');
    },
  });

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
  };

  const handleSetRegularShifts = (teamMemberId: string) => {
    const member = teamMembers?.find(m => m.id === teamMemberId);
    setSelectedTeamMember(teamMemberId);
    setSelectedTeamMemberName(member ? `${member.first_name} ${member.last_name}` : '');
    setIsRegularShiftsModalOpen(true);
  };

  const handleAddShift = (shiftData?: { teamMemberId?: string; date?: Date }) => {
    setAddShiftData(shiftData || {});
    setIsAddShiftModalOpen(true);
  };

  const handleEditShift = (shiftData: any) => {
    setEditingShift(shiftData);
    setIsEditShiftModalOpen(true);
  };

  const handleSaveShift = (shiftData: any) => {
    if (shiftData.id) {
      // Update existing shift
      updateShiftMutation.mutate({
        id: shiftData.id,
        updates: {
          start_time: shiftData.startTime,
          end_time: shiftData.endTime,
          location_id: shiftData.locationId,
        }
      });
    } else {
      // Create new shift
      createShiftMutation.mutate({
        team_member_id: shiftData.teamMemberId,
        location_id: shiftData.locationId,
        shift_date: shiftData.date,
        start_time: shiftData.startTime,
        end_time: shiftData.endTime,
        status: 'scheduled',
        is_recurring: false,
      });
    }
  };

  const handleAddNewShift = (shiftData: {
    teamMemberId: string;
    locationId: string;
    date: string;
    startTime: string;
    endTime: string;
  }) => {
    createShiftMutation.mutate({
      team_member_id: shiftData.teamMemberId,
      location_id: shiftData.locationId,
      shift_date: shiftData.date,
      start_time: shiftData.startTime,
      end_time: shiftData.endTime,
      status: 'scheduled',
      is_recurring: false,
    });
  };

  const handleDeleteShift = (shiftId: string) => {
    deleteShiftMutation.mutate(shiftId);
  };

  const handleDeleteAllShifts = (teamMemberId: string, startDate: string, endDate: string) => {
    deleteShiftsInRangeMutation.mutate({ teamMemberId, startDate, endDate });
  };

  const handleShiftsSaved = () => {
    queryClient.invalidateQueries({ queryKey: ['shifts'] });
  };

  const handleModalClose = () => {
    setIsRegularShiftsModalOpen(false);
    setSelectedTeamMember(null);
    setSelectedTeamMemberName('');
  };

  const handleEditModalClose = () => {
    setIsEditShiftModalOpen(false);
    setEditingShift(null);
  };

  const isLoading = isLoadingTeam || isLoadingShifts;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <ScheduledShiftsHeader 
          onAddShift={handleAddShift}
          onSetRegularShifts={() => setIsRegularShiftsModalOpen(true)}
        />

        {/* Week Navigation */}
        <WeekNavigation 
          weekStart={weekStart} 
          onNavigateWeek={navigateWeek} 
        />

        {/* Schedule Table */}
        {teamMembers && teamMembers.length > 0 ? (
          <WeeklyScheduleTable
            teamMembers={teamMembers}
            weekDays={weekDays}
            shifts={shifts}
            onSetRegularShifts={handleSetRegularShifts}
            onEditShift={handleEditShift}
            onAddShift={handleAddShift}
            onDeleteShift={handleDeleteShift}
            onDeleteAllShifts={handleDeleteAllShifts}
          />
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">No team members found</h3>
              <p className="text-muted-foreground mb-4">
                Add team members to start scheduling shifts
              </p>
            </CardContent>
          </Card>
        )}


        {/* Set Regular Shifts Modal */}
        <SetRegularShiftsModal 
          isOpen={isRegularShiftsModalOpen}
          onOpenChange={handleModalClose}
          teamMemberId={selectedTeamMember}
          teamMemberName={selectedTeamMemberName}
          onShiftsSaved={handleShiftsSaved}
          locations={locations}
          teamMembers={teamMembers || []}
        />

        {/* Add Shift Modal */}
        <AddShiftModal
          isOpen={isAddShiftModalOpen}
          onOpenChange={setIsAddShiftModalOpen}
          onSave={handleAddNewShift}
          teamMembers={teamMembers || []}
          locations={locations}
          preselectedTeamMember={addShiftData.teamMemberId}
          preselectedDate={addShiftData.date}
        />

        {/* Edit Shift Modal */}
        <EditShiftModal
          isOpen={isEditShiftModalOpen}
          onOpenChange={handleEditModalClose}
          shift={editingShift}
          onSave={handleSaveShift}
          onDelete={handleDeleteShift}
          locations={locations}
        />
      </div>
    </DashboardLayout>
  );
};

export default ScheduledShifts;
