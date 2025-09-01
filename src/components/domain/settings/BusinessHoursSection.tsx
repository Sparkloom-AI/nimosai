import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { businessHoursApi, BusinessHour, BusinessHourInput } from '@/api/businessHours';
import { Location } from '@/types/studio';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface BusinessHoursSectionProps {
  locations: Location[];
}

const DAYS = [
  { key: 0, name: 'Sunday', short: 'Sun' },
  { key: 1, name: 'Monday', short: 'Mon' },
  { key: 2, name: 'Tuesday', short: 'Tue' },
  { key: 3, name: 'Wednesday', short: 'Wed' },
  { key: 4, name: 'Thursday', short: 'Thu' },
  { key: 5, name: 'Friday', short: 'Fri' },
  { key: 6, name: 'Saturday', short: 'Sat' },
];

export const BusinessHoursSection: React.FC<BusinessHoursSectionProps> = ({ locations }) => {
  const { toast } = useToast();
  const [hours, setHours] = useState<Record<string, BusinessHour[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [openLocations, setOpenLocations] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadHours();
  }, [locations]);

  const loadHours = async () => {
    try {
      setLoading(true);
      const locationHours: Record<string, BusinessHour[]> = {};
      
      for (const location of locations) {
        const locationHoursData = await businessHoursApi.getLocationHours(location.id);
        if (locationHoursData.length === 0) {
          // Set default hours if none exist
          locationHours[location.id] = businessHoursApi.getDefaultHours(location.id).map((hour, index) => ({
            id: `temp-${index}`,
            ...hour,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));
        } else {
          locationHours[location.id] = locationHoursData;
        }
      }
      
      setHours(locationHours);
    } catch (error) {
      console.error('Error loading business hours:', error);
      toast({
        title: "Error",
        description: "Failed to load business hours",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleLocation = (locationId: string) => {
    setOpenLocations(prev => ({
      ...prev,
      [locationId]: !prev[locationId]
    }));
  };

  const updateDayHours = (locationId: string, dayOfWeek: number, field: string, value: any) => {
    setHours(prev => ({
      ...prev,
      [locationId]: prev[locationId].map(hour => 
        hour.day_of_week === dayOfWeek 
          ? { ...hour, [field]: value }
          : hour
      )
    }));
  };

  const saveLocationHours = async (locationId: string) => {
    try {
      setSaving(prev => ({ ...prev, [locationId]: true }));
      
      const locationHours = hours[locationId];
      const hoursInput: BusinessHourInput[] = locationHours.map(hour => ({
        location_id: locationId,
        day_of_week: hour.day_of_week,
        start_time: hour.is_closed ? undefined : hour.start_time,
        end_time: hour.is_closed ? undefined : hour.end_time,
        is_closed: hour.is_closed,
      }));

      await businessHoursApi.updateLocationHours(locationId, hoursInput);
      
      toast({
        title: "Success",
        description: "Business hours updated successfully",
      });
    } catch (error) {
      console.error('Error saving business hours:', error);
      toast({
        title: "Error",
        description: "Failed to save business hours",
        variant: "destructive",
      });
    } finally {
      setSaving(prev => ({ ...prev, [locationId]: false }));
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Business Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading business hours...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Business Hours
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Set operating hours for each location
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {locations.map(location => (
          <div key={location.id} className="border rounded-lg">
            <Collapsible
              open={openLocations[location.id]}
              onOpenChange={() => toggleLocation(location.id)}
            >
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer">
                  <div>
                    <h3 className="font-medium">{location.name}</h3>
                    <p className="text-sm text-muted-foreground">{location.address}</p>
                  </div>
                  {openLocations[location.id] ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="border-t">
                <div className="p-4 space-y-4">
                  {DAYS.map(day => {
                    const dayHours = hours[location.id]?.find(h => h.day_of_week === day.key);
                    return (
                      <div key={day.key} className="flex items-center gap-4">
                        <div className="w-20 text-sm font-medium">
                          {day.name}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={!dayHours?.is_closed}
                            onCheckedChange={(checked) => 
                              updateDayHours(location.id, day.key, 'is_closed', !checked)
                            }
                          />
                          <Label className="text-sm">Open</Label>
                        </div>

                        {!dayHours?.is_closed && (
                          <div className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={dayHours?.start_time || '09:00'}
                              onChange={(e) => 
                                updateDayHours(location.id, day.key, 'start_time', e.target.value)
                              }
                              className="w-32"
                            />
                            <span className="text-muted-foreground">to</span>
                            <Input
                              type="time"
                              value={dayHours?.end_time || '17:00'}
                              onChange={(e) => 
                                updateDayHours(location.id, day.key, 'end_time', e.target.value)
                              }
                              className="w-32"
                            />
                          </div>
                        )}

                        {dayHours?.is_closed && (
                          <span className="text-sm text-muted-foreground">Closed</span>
                        )}
                      </div>
                    );
                  })}
                  
                  <div className="pt-4 border-t">
                    <Button
                      onClick={() => saveLocationHours(location.id)}
                      disabled={saving[location.id]}
                      className="w-full"
                    >
                      {saving[location.id] ? 'Saving...' : 'Save Hours'}
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        ))}
        
        {locations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No locations found. Add a location first to set business hours.
          </div>
        )}
      </CardContent>
    </Card>
  );
};