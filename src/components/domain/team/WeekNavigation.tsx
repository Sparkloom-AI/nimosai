
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays } from 'date-fns';

interface WeekNavigationProps {
  weekStart: Date;
  onNavigateWeek: (direction: 'prev' | 'next') => void;
}

const WeekNavigation = ({ weekStart, onNavigateWeek }: WeekNavigationProps) => {
  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onNavigateWeek('prev')}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-2 text-center min-w-48">
        <span className="font-medium">This week</span>
        <span className="text-muted-foreground text-sm">
          {format(weekStart, 'dd')} - {format(addDays(weekStart, 6), 'dd MMM, yyyy')}
        </span>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onNavigateWeek('next')}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default WeekNavigation;
