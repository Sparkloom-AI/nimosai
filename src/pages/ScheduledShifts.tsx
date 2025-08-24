
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  MoreVertical,
  Edit,
  Settings,
  Trash2,
  CalendarDays
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { teamApi } from '@/api/team';
import { useAuth } from '@/contexts/AuthContext';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import SetRegularShiftsModal from '@/components/team/SetRegularShiftsModal';

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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const handleSetRegularShifts = (teamMemberId: string) => {
    setSelectedTeamMember(teamMemberId);
    setIsRegularShiftsModalOpen(true);
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Scheduled shifts</h1>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Options
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Shift Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Business Hours
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Shift
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Set Regular Shifts
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-2 text-center">
            <span className="font-medium">This week</span>
            <span className="text-muted-foreground">
              {format(weekStart, 'dd')} - {format(addDays(weekStart, 6), 'dd MMM, yyyy')}
            </span>
          </div>
          
          <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Schedule Grid */}
        <Card>
          <CardContent className="p-0">
            {/* Header Row */}
            <div className="grid grid-cols-8 border-b bg-muted/50">
              <div className="p-4 font-medium">
                Team member{' '}
                <Button variant="link" className="p-0 h-auto text-primary">
                  Change
                </Button>
              </div>
              {weekDays.map((day, index) => (
                <div key={index} className="p-4 text-center border-l">
                  <div className="font-medium">
                    {format(day, 'EEE, dd MMM')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(day, 'h')}h
                  </div>
                </div>
              ))}
            </div>

            {/* Team Member Rows */}
            {teamMembers?.map((member) => (
              <div key={member.id} className="grid grid-cols-8 border-b hover:bg-muted/20">
                {/* Team Member Column */}
                <div className="p-4 flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={member.avatar_url || undefined} />
                    <AvatarFallback 
                      className="text-white text-xs"
                      style={{ backgroundColor: member.calendar_color }}
                    >
                      {getInitials(member.first_name, member.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">
                      {member.first_name} {member.last_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      45h
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="ml-auto">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleSetRegularShifts(member.id)}>
                        Set regular shifts
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Unassign from location
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Edit team member
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete all shifts
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Day Columns */}
                {weekDays.map((day, index) => (
                  <div key={index} className="p-4 border-l text-center text-sm">
                    {/* Mock shift data - replace with actual shift data */}
                    {index < 5 ? (
                      <Badge variant="secondary" className="text-xs">
                        10:00 - 19:00
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">0min</span>
                    )}
                  </div>
                ))}
              </div>
            ))}

            {/* Empty State */}
            {!teamMembers?.length && (
              <div className="p-12 text-center">
                <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">No team members found</h3>
                <p className="text-muted-foreground mb-4">
                  Add team members to start scheduling shifts
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Banner */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <p className="text-sm text-blue-800">
                The team roster shows your availability for bookings and is not linked to your business opening hours. To set your opening hours,{' '}
                <Button variant="link" className="p-0 h-auto text-blue-600 underline">
                  click here
                </Button>
                .
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Set Regular Shifts Modal */}
        <SetRegularShiftsModal 
          isOpen={isRegularShiftsModalOpen}
          onOpenChange={setIsRegularShiftsModalOpen}
          teamMemberId={selectedTeamMember}
        />
      </div>
    </DashboardLayout>
  );
};

export default ScheduledShifts;
