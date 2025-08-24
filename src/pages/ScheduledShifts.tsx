
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { teamApi } from '@/api/team';
import { useAuth } from '@/contexts/AuthContext';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import SetRegularShiftsModal from '@/components/team/SetRegularShiftsModal';
import WeeklyScheduleTable from '@/components/team/WeeklyScheduleTable';
import WeekNavigation from '@/components/team/WeekNavigation';
import ScheduledShiftsHeader from '@/components/team/ScheduledShiftsHeader';

const ScheduledShifts = () => {
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedTeamMember, setSelectedTeamMember] = useState<string | null>(null);
  const [isRegularShiftsModalOpen, setIsRegularShiftsModalOpen] = useState(false);

  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ['team-members', user?.id],
    queryFn: () => user?.id ? teamApi.getTeamMembers(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
  });

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Start week on Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
  };

  const handleSetRegularShifts = (teamMemberId: string) => {
    console.log('Setting regular shifts for team member:', teamMemberId);
    setSelectedTeamMember(teamMemberId);
    setIsRegularShiftsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsRegularShiftsModalOpen(false);
    setSelectedTeamMember(null);
  };

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
        <ScheduledShiftsHeader />

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
            onSetRegularShifts={handleSetRegularShifts}
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

        {/* Info Banner */}
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center mt-0.5 flex-shrink-0">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                The team roster shows your availability for bookings and is not linked to your business opening hours. To set your opening hours,{' '}
                <span className="text-blue-600 dark:text-blue-400 underline cursor-pointer hover:text-blue-700 dark:hover:text-blue-300">
                  click here
                </span>
                .
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Set Regular Shifts Modal */}
        {selectedTeamMember && (
          <SetRegularShiftsModal 
            isOpen={isRegularShiftsModalOpen}
            onOpenChange={handleModalClose}
            teamMemberId={selectedTeamMember}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ScheduledShifts;
