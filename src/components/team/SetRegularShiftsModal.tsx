
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SetRegularShiftsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  teamMemberId: string | null;
}

interface DayShift {
  startTime: string;
  endTime: string;
}

interface WeeklySchedule {
  [key: string]: {
    enabled: boolean;
    shifts: DayShift[];
  };
}

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? '00' : '30';
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
});

const daysOfWeek = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

const SetRegularShiftsModal = ({ isOpen, onOpenChange, teamMemberId }: SetRegularShiftsModalProps) => {
  const [scheduleType, setScheduleType] = useState('every-week');
  const [startDate, setStartDate] = useState<Date>();
  const [endType, setEndType] = useState('never');
  const [endDate, setEndDate] = useState<Date>();
  const [showCalendar, setShowCalendar] = useState(false);
  
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({
    monday: { enabled: true, shifts: [{ startTime: '10:00', endTime: '19:00' }] },
    tuesday: { enabled: false, shifts: [] },
    wednesday: { enabled: true, shifts: [{ startTime: '10:00', endTime: '19:00' }] },
    thursday: { enabled: true, shifts: [{ startTime: '10:00', endTime: '19:00' }] },
    friday: { enabled: true, shifts: [{ startTime: '10:00', endTime: '19:00' }] },
    saturday: { enabled: false, shifts: [] },
    sunday: { enabled: false, shifts: [] },
  });

  const toggleDay = (dayKey: string) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        enabled: !prev[dayKey].enabled,
        shifts: !prev[dayKey].enabled ? [{ startTime: '10:00', endTime: '19:00' }] : []
      }
    }));
  };

  const updateShift = (dayKey: string, shiftIndex: number, field: 'startTime' | 'endTime', value: string) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        shifts: prev[dayKey].shifts.map((shift, index) => 
          index === shiftIndex ? { ...shift, [field]: value } : shift
        )
      }
    }));
  };

  const addShift = (dayKey: string) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        shifts: [...prev[dayKey].shifts, { startTime: '10:00', endTime: '19:00' }]
      }
    }));
  };

  const removeShift = (dayKey: string, shiftIndex: number) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        shifts: prev[dayKey].shifts.filter((_, index) => index !== shiftIndex)
      }
    }));
  };

  const handleSave = () => {
    console.log('Saving regular shifts:', { scheduleType, startDate, endType, endDate, weeklySchedule });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Set Nil's regular shifts</DialogTitle>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Set weekly, biweekly or custom shifts. Changes saved will apply to all upcoming shifts for the selected period.
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Left Panel - Schedule Configuration */}
          <div className="space-y-6">
            {/* Schedule Type */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Schedule type</label>
              <Select value={scheduleType} onValueChange={setScheduleType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="every-week">Every week</SelectItem>
                  <SelectItem value="every-2-weeks">Every 2 weeks</SelectItem>
                  <SelectItem value="every-3-weeks">Every 3 weeks</SelectItem>
                  <SelectItem value="every-4-weeks">Every 4 weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Start date</label>
              <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "MMMM do, yyyy") : "August 25th, 2025"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      setShowCalendar(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Type */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Ends</label>
              <Select value={endType} onValueChange={setEndType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="specific-date">Specific date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Info Box */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                  <p className="text-sm text-blue-800">
                    Team members will not be scheduled on business closed periods.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Weekly Schedule */}
          <div className="space-y-4">
            {daysOfWeek.map((day) => (
              <div key={day.key} className="flex items-center gap-4 p-3 border rounded-lg">
                <Checkbox 
                  checked={weeklySchedule[day.key].enabled}
                  onCheckedChange={() => toggleDay(day.key)}
                />
                
                <div className="flex-1">
                  <div className="font-medium">{day.label}</div>
                  <div className="text-sm text-muted-foreground">9h</div>
                </div>

                {weeklySchedule[day.key].enabled ? (
                  <div className="flex items-center gap-2">
                    {weeklySchedule[day.key].shifts.map((shift, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Select 
                          value={shift.startTime} 
                          onValueChange={(value) => updateShift(day.key, index, 'startTime', value)}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map(time => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <span>-</span>
                        
                        <Select 
                          value={shift.endTime} 
                          onValueChange={(value) => updateShift(day.key, index, 'endTime', value)}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map(time => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {weeklySchedule[day.key].shifts.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeShift(day.key, index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    
                    <Button
                      variant="link"
                      size="sm"
                      className="text-primary"
                      onClick={() => addShift(day.key)}
                    >
                      Add a shift
                    </Button>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">No shifts</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SetRegularShiftsModal;
