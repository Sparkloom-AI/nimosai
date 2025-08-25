
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Search, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { CalendarViewType } from '@/pages/Calendar';
import { cn } from '@/lib/utils';

interface CalendarHeaderProps {
  currentDate: Date;
  viewType: CalendarViewType;
  onViewTypeChange: (view: CalendarViewType) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onToday: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const CalendarHeader = ({
  currentDate,
  viewType,
  onViewTypeChange,
  onNavigate,
  onToday,
  searchQuery,
  onSearchChange,
}: CalendarHeaderProps) => {
  const getDateDisplay = () => {
    switch (viewType) {
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      case '3-day':
      case 'week':
        return format(currentDate, 'MMMM yyyy');
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      default:
        return format(currentDate, 'MMMM yyyy');
    }
  };

  const viewOptions: { key: CalendarViewType; label: string }[] = [
    { key: 'day', label: 'Day' },
    { key: '3-day', label: '3-Day' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
  ];

  return (
    <div className="border-b border-border bg-background px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Navigation and Date */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('prev')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('next')}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onToday}
              className="h-8 px-3"
            >
              Today
            </Button>
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            {getDateDisplay()}
          </h1>
        </div>

        {/* Center - View Toggle */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
          {viewOptions.map((option) => (
            <Button
              key={option.key}
              variant={viewType === option.key ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewTypeChange(option.key)}
              className={cn(
                "h-8 px-3 text-sm font-medium",
                viewType === option.key 
                  ? "bg-background shadow-sm text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Right side - Search and Add */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-64 h-8"
            />
          </div>
          <Button size="sm" className="h-8 px-3">
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
