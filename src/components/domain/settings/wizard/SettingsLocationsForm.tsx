import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, MapPin, Plus, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { locationsApi } from '@/api/locations';
import { businessHoursApi } from '@/api/businessHours';
import { Studio, Location } from '@/types/studio';
import { BusinessHour, BusinessHourInput } from '@/api/businessHours';

interface SettingsLocationsFormProps {
  currentStudio: Studio;
  onComplete: () => void;
  onBack: () => void;
}

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const SettingsLocationsForm: React.FC<SettingsLocationsFormProps> = ({ 
  currentStudio, 
  onComplete, 
  onBack 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [businessHours, setBusinessHours] = useState<Record<string, BusinessHour[]>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load locations
        const studioLocations = await locationsApi.getStudioLocations(currentStudio.id);
        setLocations(studioLocations);

        // Load business hours for all locations
        const hoursData: Record<string, BusinessHour[]> = {};
        for (const location of studioLocations) {
          const hours = await businessHoursApi.getLocationHours(location.id);
          if (hours.length > 0) {
            hoursData[location.id] = hours;
          } else {
            // Convert default hours to BusinessHour format
            const defaultHours = businessHoursApi.getDefaultHours(location.id);
            hoursData[location.id] = defaultHours.map((hour, index) => ({
              id: `temp-${location.id}-${index}`,
              ...hour,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }));
          }
        }
        setBusinessHours(hoursData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load locations and business hours');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentStudio.id]);

  const updateBusinessHours = async (locationId: string, dayOfWeek: number, field: 'is_closed' | 'start_time' | 'end_time', value: boolean | string) => {
    setBusinessHours(prev => {
      const locationHours = [...(prev[locationId] || [])];
      const dayIndex = locationHours.findIndex(hour => hour.day_of_week === dayOfWeek);
      
      if (dayIndex >= 0) {
        locationHours[dayIndex] = {
          ...locationHours[dayIndex],
          [field]: value,
          // Clear times if setting to closed
          ...(field === 'is_closed' && value === true ? { start_time: undefined, end_time: undefined } : {})
        };
      } else {
        // Create new hour entry
        const newHour: BusinessHour = {
          id: `temp-${Date.now()}`,
          location_id: locationId,
          day_of_week: dayOfWeek,
          is_closed: field === 'is_closed' ? value as boolean : false,
          start_time: field === 'start_time' ? value as string : undefined,
          end_time: field === 'end_time' ? value as string : undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        locationHours.push(newHour);
      }

      return {
        ...prev,
        [locationId]: locationHours.sort((a, b) => a.day_of_week - b.day_of_week)
      };
    });
  };

  const saveBusinessHours = async () => {
    setIsSaving(true);
    try {
      // Save business hours for each location
      for (const locationId of Object.keys(businessHours)) {
        const hours = businessHours[locationId];
        const hoursInput: BusinessHourInput[] = hours.map(hour => ({
          location_id: locationId,
          day_of_week: hour.day_of_week,
          start_time: hour.start_time,
          end_time: hour.end_time,
          is_closed: hour.is_closed,
        }));

        await businessHoursApi.updateLocationHours(locationId, hoursInput);
      }

      toast.success('Business hours updated successfully!');
      onComplete();
    } catch (error) {
      console.error('Error saving business hours:', error);
      toast.error('Failed to save business hours');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading locations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">Settings Wizard • Step 4 of 4</p>
              <h1 className="text-3xl font-bold mb-4">
                Review your locations & hours
              </h1>
              <p className="text-muted-foreground">
                Configure operating hours for each location to help clients book at the right times.
              </p>
            </div>
          </div>

          {/* Locations and Hours */}
          <div className="space-y-6 mb-8">
            {locations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No locations found</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't added any locations yet. You can add locations after completing the wizard.
                  </p>
                </CardContent>
              </Card>
            ) : (
              locations.map((location) => (
                <Card key={location.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      {location.name}
                      {location.is_primary && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Primary</span>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {location.address}, {location.city}, {location.state} {location.postal_code}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">Business Hours</span>
                      </div>
                      
                      <div className="grid gap-3">
                        {DAYS_OF_WEEK.map((dayName, dayIndex) => {
                          const dayHours = businessHours[location.id]?.find(h => h.day_of_week === dayIndex);
                          const isClosed = dayHours?.is_closed ?? false;
                          
                          return (
                            <div key={dayIndex} className="flex items-center justify-between py-2 border-b">
                              <div className="w-24 text-sm font-medium">{dayName}</div>
                              
                              <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isClosed}
                                    onChange={(e) => updateBusinessHours(location.id, dayIndex, 'is_closed', e.target.checked)}
                                    className="rounded"
                                  />
                                  <span className="text-sm">Closed</span>
                                </label>
                                
                                {!isClosed && (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="time"
                                      value={dayHours?.start_time || '09:00'}
                                      onChange={(e) => updateBusinessHours(location.id, dayIndex, 'start_time', e.target.value)}
                                      className="px-2 py-1 border rounded text-sm"
                                    />
                                    <span className="text-muted-foreground">to</span>
                                    <input
                                      type="time"
                                      value={dayHours?.end_time || '17:00'}
                                      onChange={(e) => updateBusinessHours(location.id, dayIndex, 'end_time', e.target.value)}
                                      className="px-2 py-1 border rounded text-sm"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Continue Button */}
          <div className="flex justify-end">
            <Button 
              onClick={saveBusinessHours}
              className="h-12 px-8 bg-foreground text-background hover:bg-foreground/90"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Complete Setup'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block flex-1 bg-muted relative overflow-hidden">
        <img
          src="/lovable-uploads/5101447c-92ce-49c1-8837-5de26eeff4b6.png"
          alt="Professional using Nimos"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-accent/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Set Your Schedule</h2>
          <p className="text-white/90 text-lg">
            Configure operating hours to help clients book at the right times
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsLocationsForm;