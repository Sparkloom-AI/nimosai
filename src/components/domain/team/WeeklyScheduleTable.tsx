
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Trash2, MoreVertical, Plus, Clock, X } from 'lucide-react';
import { format, isSameDay } from 'date-fns';

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  calendar_color?: string;
}

interface Shift {
  id: string;
  team_member_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  location_id: string;
  status: string;
}

interface WeeklyScheduleTableProps {
  teamMembers: TeamMember[];
  weekDays: Date[];
  shifts: Shift[];
  onSetRegularShifts: (teamMemberId: string) => void;
  onEditShift: (shift: {
    id?: string;
    teamMemberId: string;
    teamMemberName: string;
    date: Date;
    startTime?: string;
    endTime?: string;
    locationId?: string;
  }) => void;
  onAddShift: (shiftData: { teamMemberId: string; date: Date }) => void;
  onDeleteShift: (shiftId: string) => void;
  onDeleteAllShifts: (teamMemberId: string, startDate: string, endDate: string) => void;
}

const WeeklyScheduleTable = ({ 
  teamMembers, 
  weekDays, 
  shifts, 
  onSetRegularShifts, 
  onEditShift,
  onAddShift,
  onDeleteShift,
  onDeleteAllShifts 
}: WeeklyScheduleTableProps) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getShiftForMemberAndDay = (memberId: string, date: Date) => {
    return shifts.find(shift => 
      shift.team_member_id === memberId && 
      isSameDay(new Date(shift.shift_date), date)
    );
  };

  const formatTimeRange = (startTime: string, endTime: string) => {
    // Convert 24h format to 12h format for display
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    };

    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    const durationMinutes = endTotalMinutes - startTotalMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    if (hours === 0) return `${minutes}min`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}min`;
  };

  const getTotalWeeklyHours = (memberId: string) => {
    const memberShifts = shifts.filter(shift => shift.team_member_id === memberId);
    let totalMinutes = 0;
    
    memberShifts.forEach(shift => {
      const [startHours, startMinutes] = shift.start_time.split(':').map(Number);
      const [endHours, endMinutes] = shift.end_time.split(':').map(Number);
      
      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;
      
      totalMinutes += endTotalMinutes - startTotalMinutes;
    });
    
    const hours = Math.floor(totalMinutes / 60);
    return `${hours}h`;
  };

  const handleDeleteAllShifts = (memberId: string) => {
    const startDate = format(weekDays[0], 'yyyy-MM-dd');
    const endDate = format(weekDays[6], 'yyyy-MM-dd');
    onDeleteAllShifts(memberId, startDate, endDate);
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-64 min-w-64">
                  <div className="flex items-center justify-between">
                    <span>Team member</span>
                    <Button variant="link" className="p-0 h-auto text-primary text-sm">
                      Change
                    </Button>
                  </div>
                </TableHead>
                {weekDays.map((day, index) => (
                  <TableHead key={index} className="text-center min-w-32">
                    <div className="space-y-1">
                      <div className="font-medium text-sm">
                        {format(day, 'EEE, dd MMM')}
                      </div>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers?.map((member) => (
                <TableRow key={member.id} className="hover:bg-muted/20">
                  <TableCell className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={member.avatar_url || undefined} />
                        <AvatarFallback 
                          className="text-white text-sm font-medium"
                          style={{ backgroundColor: member.calendar_color || '#3B82F6' }}
                        >
                          {getInitials(member.first_name, member.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {member.first_name} {member.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getTotalWeeklyHours(member.id)}
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onSetRegularShifts(member.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Set regular shifts
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Unassign from location
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Edit team member
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteAllShifts(member.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete all shifts
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>

                  {weekDays.map((day, index) => {
                    const shift = getShiftForMemberAndDay(member.id, day);
                    
                    return (
                      <TableCell key={index} className="text-center p-3">
                        {shift ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" className="text-xs px-2 py-1 h-auto bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                                <div className="space-y-1">
                                  <div>{formatTimeRange(shift.start_time, shift.end_time)}</div>
                                  <div className="text-xs opacity-75">
                                    {calculateDuration(shift.start_time, shift.end_time)}
                                  </div>
                                </div>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center">
                              <DropdownMenuItem onClick={() => onEditShift({
                                id: shift.id,
                                teamMemberId: member.id,
                                teamMemberName: `${member.first_name} ${member.last_name}`,
                                date: day,
                                startTime: shift.start_time,
                                endTime: shift.end_time,
                                locationId: shift.location_id
                              })}>
                                <Clock className="h-4 w-4 mr-2" />
                                Edit this day
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onSetRegularShifts(member.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Set regular shifts
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Plus className="h-4 w-4 mr-2" />
                                Add time off
                              </DropdownMenuItem>
                               <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => onDeleteShift(shift.id)}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Delete this shift
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs text-muted-foreground hover:text-primary"
                            onClick={() => onAddShift({
                              teamMemberId: member.id,
                              date: day
                            })}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add shift
                          </Button>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyScheduleTable;
