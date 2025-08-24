
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { format } from 'date-fns';

interface EditShiftModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  shift: {
    id?: string;
    teamMemberId: string;
    teamMemberName: string;
    date: Date;
    startTime?: string;
    endTime?: string;
    locationId?: string;
  } | null;
  onSave: (shiftData: {
    id?: string;
    teamMemberId: string;
    date: string;
    startTime: string;
    endTime: string;
    locationId: string;
  }) => void;
  onDelete?: (id: string) => void;
  locations: Array<{ id: string; name: string }>;
}

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? '00' : '30';
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
});

const EditShiftModal = ({ isOpen, onOpenChange, shift, onSave, onDelete, locations }: EditShiftModalProps) => {
  const [startTime, setStartTime] = useState(shift?.startTime || '10:00');
  const [endTime, setEndTime] = useState(shift?.endTime || '19:00');
  const [locationId, setLocationId] = useState(shift?.locationId || '');

  const handleSave = () => {
    if (!shift) return;

    onSave({
      id: shift.id,
      teamMemberId: shift.teamMemberId,
      date: format(shift.date, 'yyyy-MM-dd'),
      startTime,
      endTime,
      locationId: locationId || locations[0]?.id || ''
    });
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (shift?.id && onDelete) {
      onDelete(shift.id);
      onOpenChange(false);
    }
  };

  if (!shift) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              Edit Shift - {shift.teamMemberName}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {format(shift.date, 'EEEE, MMMM do, yyyy')}
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-time">End Time</Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map(location => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-between gap-3 mt-6">
          <div>
            {shift.id && onDelete && (
              <Button variant="destructive" onClick={handleDelete}>
                Delete Shift
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditShiftModal;
