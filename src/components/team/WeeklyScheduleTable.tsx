
import React from 'react';
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
import { Edit, Trash2, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  calendar_color?: string;
}

interface WeeklyScheduleTableProps {
  teamMembers: TeamMember[];
  weekDays: Date[];
  onSetRegularShifts: (teamMemberId: string) => void;
}

const WeeklyScheduleTable = ({ teamMembers, weekDays, onSetRegularShifts }: WeeklyScheduleTableProps) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
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
                      <div className="text-xs text-muted-foreground">
                        {format(day, 'h')}h
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
                          45h
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
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete all shifts
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>

                  {weekDays.map((day, index) => (
                    <TableCell key={index} className="text-center p-3">
                      {/* Mock shift data - replace with actual shift data */}
                      {index < 5 ? (
                        <Badge variant="outline" className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200">
                          10:00 - 19:00
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">0min</span>
                      )}
                    </TableCell>
                  ))}
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
