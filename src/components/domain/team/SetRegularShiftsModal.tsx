
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2, X } from 'lucide-react';
import { format, addDays, addWeeks, startOfWeek } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SetRegularShiftsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  teamMemberId: string | null;
  teamMemberName?: string;
  onShiftsSaved: () => void;
  locations: Array<{ id: string; name: string }>;
}

interface DayShift {
  startTime: string;
  endTime: string;
  locationId: string;
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
  { key: 'monday', label: 'Monday', dayIndex: 1 },
  { key: 'tuesday', label: 'Tuesday', dayIndex: 2 },
  { key: 'wednesday', label: 'Wednesday', dayIndex: 3 },
  { key: 'thursday', label: 'Thursday', dayIndex: 4 },
  { key: 'friday', label: 'Friday', dayIndex: 5 },
  { key: 'saturday', label: 'Saturday', dayIndex: 6 },
  { key: 'sunday', label: 'Sunday', dayIndex: 0 },
];

const SetRegularShiftsModal = ({ 
  isOpen, 
  onOpenChange, 
  teamMemberId, 
  teamMemberName = 'Team Member',
  onShiftsSaved,
  locations 
}: SetRegularShiftsModalProps) => {
  const [scheduleType, setScheduleType] = useState('every-week');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endType, setEndType] = useState('never');
  const [endDate, setEndDate] = useState<Date>();
  const [showCalendar, setShowCalendar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const defaultLocationId = locations.length > 0 ? locations[0].id : '';
  
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>(() => {
    const locationId = locations.length > 0 ? locations[0].id : '';
    return {
      monday: { enabled: true, shifts: [{ startTime: '10:00', endTime: '19:00', locationId }] },
      tuesday: { enabled: false, shifts: [] },
      wednesday: { enabled: true, shifts: [{ startTime: '10:00', endTime: '19:00', locationId }] },
      thursday: { enabled: true, shifts: [{ startTime: '10:00', endTime: '19:00', locationId }] },
      friday: { enabled: true, shifts: [{ startTime: '10:00', endTime: '19:00', locationId }] },
      saturday: { enabled: false, shifts: [] },
      sunday: { enabled: false, shifts: [] },
    };
  });

  // Update default location when locations change
  useEffect(() => {
    if (locations.length > 0 && locations[0].id) {
      const newDefaultLocationId = locations[0].id;
      setWeeklySchedule(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(dayKey => {
          updated[dayKey].shifts = updated[dayKey].shifts.map(shift => ({
            ...shift,
            locationId: shift.locationId || newDefaultLocationId
          }));
        });
        return updated;
      });
    }
  }, [locations]);

  const toggleDay = (dayKey: string) => {
    const locationId = locations.length > 0 ? locations[0].id : '';
    setWeeklySchedule(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        enabled: !prev[dayKey].enabled,
        shifts: !prev[dayKey].enabled ? [{ startTime: '10:00', endTime: '19:00', locationId }] : []
      }
    }));
  };

  const updateShift = (dayKey: string, shiftIndex: number, field: keyof DayShift, value: string) => {
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
    const locationId = locations.length > 0 ? locations[0].id : '';
    setWeeklySchedule(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        shifts: [...prev[dayKey].shifts, { startTime: '10:00', endTime: '19:00', locationId }]
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

  const generateShiftDates = () => {
    const shifts = [];
    const weekInterval = scheduleType === 'every-week' ? 1 : 
                       scheduleType === 'every-2-weeks' ? 2 :
                       scheduleType === 'every-3-weeks' ? 3 : 4;
    
    let currentWeek = startOfWeek(startDate, { weekStartsOn: 1 });
    const maxDate = endType === 'specific-date' && endDate ? endDate : addWeeks(startDate, 52); // Max 1 year
    
    while (currentWeek <= maxDate) {
      daysOfWeek.forEach(day => {
        if (weeklySchedule[day.key].enabled) {
          const dayDate = addDays(currentWeek, day.dayIndex === 0 ? 6 : day.dayIndex - 1);
          
          if (dayDate >= startDate && dayDate <= maxDate) {
            weeklySchedule[day.key].shifts.forEach(shift => {
              // Ensure location ID is valid
              if (!shift.locationId || shift.locationId === '') {
                console.warn('Skipping shift with invalid location ID:', shift);
                return;
              }
              
              shifts.push({
                team_member_id: teamMemberId!,
                location_id: shift.locationId,
                shift_date: format(dayDate, 'yyyy-MM-dd'),
                start_time: shift.startTime,
                end_time: shift.endTime,
                status: 'scheduled' as const,
                is_recurring: true,
                recurring_pattern: scheduleType
              });
            });
          }
        }
      });
      
      currentWeek = addWeeks(currentWeek, weekInterval);
    }
    
    return shifts;
  };

  const handleSave = async () => {
    if (!teamMemberId) {
      toast.error('No team member selected');
      return;
    }
    
    if (!defaultLocationId) {
      toast.error('At least one location is required to create shifts');
      return;
    }
    
    setIsLoading(true);
    try {
      const { shiftsApi } = await import('@/api/shifts');
      const shiftsToCreate = generateShiftDates();
      
      if (shiftsToCreate.length === 0) {
        toast.error('No shifts to create. Please enable at least one day.');
        return;
      }

      // Validate all shifts have valid location IDs
      const invalidShifts = shiftsToCreate.filter(shift => !shift.location_id || shift.location_id === '');
      if (invalidShifts.length > 0) {
        toast.error('All shifts must have a valid location assigned');
        return;
      }

      console.log('Creating shifts:', shiftsToCreate);
      await shiftsApi.createRegularShifts(shiftsToCreate);
      toast.success(`Created ${shiftsToCreate.length} shifts successfully`);
      onShiftsSaved();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating shifts:', error);
      toast.error('Failed to create shifts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Set {teamMemberName}'s regular shifts</DialogTitle>
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
                    {startDate ? format(startDate, "MMMM do, yyyy") : "Select start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      if (date) setStartDate(date);
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
            <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
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
                </div>

                {weeklySchedule[day.key].enabled ? (
                  <div className="flex flex-col gap-2 flex-1">
                    {weeklySchedule[day.key].shifts.map((shift, index) => (
                      <div key={index} className="flex items-center gap-2 flex-wrap">
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

                        {locations.length > 1 && (
                          <Select 
                            value={shift.locationId} 
                            onValueChange={(value) => updateShift(day.key, index, 'locationId', value)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {locations.map(location => (
                                <SelectItem key={location.id} value={location.id}>
                                  {location.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

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
                      className="text-primary self-start"
                      onClick={() => addShift(day.key)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SetRegularShiftsModal;
