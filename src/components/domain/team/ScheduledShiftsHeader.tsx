
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ChevronRight, 
  Plus, 
  Edit,
  Settings,
  CalendarDays
} from 'lucide-react';

interface ScheduledShiftsHeaderProps {
  onAddShift?: (shiftData?: any) => void;
  onSetRegularShifts?: () => void;
}

const ScheduledShiftsHeader = ({ onAddShift, onSetRegularShifts }: ScheduledShiftsHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">Scheduled shifts</h1>
        <p className="text-muted-foreground mt-1">
          Manage your team's weekly schedule and shifts
        </p>
      </div>
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onAddShift?.()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Shift
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSetRegularShifts?.()}>
              <Edit className="h-4 w-4 mr-2" />
              Set Regular Shifts
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ScheduledShiftsHeader;
