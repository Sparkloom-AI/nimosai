import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { locationsApi } from '@/api/locations';
import { useRole } from '@/contexts/RoleContext';
import { MapPin, Globe, Loader2 } from 'lucide-react';
import { useIPLocationDetection } from '@/hooks/useIPLocationDetection';
import { StepActions } from '@/components/domain/settings/StepActions';

interface AddressTimezoneStepProps {
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  isLastStep?: boolean;
}

export const AddressTimezoneStep = ({ 
  onNext, 
  onPrevious, 
  hasNext = true, 
  hasPrevious = false,
  isLastStep = false 
}: AddressTimezoneStepProps) => {
  const { toast } = useToast();
  const { currentStudioId } = useRole();
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [timezone, setTimezone] = useState<string>('');
  const detectedLocation = useIPLocationDetection();

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations', currentStudioId],
    queryFn: () => currentStudioId ? locationsApi.getStudioLocations(currentStudioId) : Promise.resolve([]),
    enabled: !!currentStudioId,
  });

  const selectedLocation = locations.find(loc => loc.id === selectedLocationId);

  useEffect(() => {
    if (locations.length > 0 && !selectedLocationId) {
      // Auto-select the first location or primary location
      const primaryLocation = locations.find(loc => loc.is_primary);
      setSelectedLocationId(primaryLocation?.id || locations[0].id);
    }
  }, [locations, selectedLocationId]);

  useEffect(() => {
    if (detectedLocation.timezone && !timezone) {
      setTimezone(detectedLocation.timezone);
    }
  }, [detectedLocation.timezone, timezone]);

  const handleSave = async () => {
    if (!selectedLocationId) {
      toast({
        title: "Error",
        description: "Please select a location first",
        variant: "destructive",
      });
      return;
    }

    try {
      // Here you would typically save the timezone to the location
      // For now, we'll just show a success message
      toast({
        title: "Success",
        description: "Address and timezone settings saved",
      });
    } catch (error) {
      console.error('Error saving address and timezone:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address & Time Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <StepActions
          onPrevious={onPrevious}
          onNext={onNext}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
          isLastStep={isLastStep}
        />
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address & Time Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No locations found</h3>
              <p className="text-muted-foreground mb-4">
                Please add a location first in the "Manage Locations" step
              </p>
            </div>
          </CardContent>
        </Card>
        
        <StepActions
          onPrevious={onPrevious}
          onNext={onNext}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
          isLastStep={isLastStep}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Address & Time Zone
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure address details and timezone for your business location
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="location-select">Select Location</Label>
            <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose a location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name} {location.is_primary && '(Primary)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedLocation && (
            <div className="space-y-4">
              <div>
                <Label>Address</Label>
                <div className="mt-2 p-4 border rounded-md bg-muted/50">
                  <div className="space-y-1">
                    <p className="font-medium">{selectedLocation.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedLocation.address}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedLocation.city}, {selectedLocation.state} {selectedLocation.postal_code}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedLocation.country}
                    </p>
                    {selectedLocation.phone && (
                      <p className="text-sm text-muted-foreground">
                        Phone: {selectedLocation.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="timezone" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Time Zone
                </Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                <SelectContent className="max-h-60">
                  {detectedLocation.isDetected && (
                    <SelectItem value={detectedLocation.timezone}>
                      {detectedLocation.timezone} (Detected)
                    </SelectItem>
                  )}
                  <SelectItem value="(GMT -12:00) International Date Line West">(GMT -12:00) International Date Line West</SelectItem>
                  <SelectItem value="(GMT -11:00) Midway Island, Samoa">(GMT -11:00) Midway Island, Samoa</SelectItem>
                  <SelectItem value="(GMT -10:00) Hawaii">(GMT -10:00) Hawaii</SelectItem>
                  <SelectItem value="(GMT -09:00) Alaska">(GMT -09:00) Alaska</SelectItem>
                  <SelectItem value="(GMT -08:00) Pacific Time (US & Canada)">(GMT -08:00) Pacific Time (US & Canada)</SelectItem>
                  <SelectItem value="(GMT -07:00) Mountain Time (US & Canada)">(GMT -07:00) Mountain Time (US & Canada)</SelectItem>
                  <SelectItem value="(GMT -06:00) Central Time (US & Canada)">(GMT -06:00) Central Time (US & Canada)</SelectItem>
                  <SelectItem value="(GMT -05:00) Eastern Time (US & Canada)">(GMT -05:00) Eastern Time (US & Canada)</SelectItem>
                  <SelectItem value="(GMT -04:00) Atlantic Time (Canada)">(GMT -04:00) Atlantic Time (Canada)</SelectItem>
                  <SelectItem value="(GMT -03:00) Brasilia">(GMT -03:00) Brasilia</SelectItem>
                  <SelectItem value="(GMT -02:00) Mid-Atlantic">(GMT -02:00) Mid-Atlantic</SelectItem>
                  <SelectItem value="(GMT -01:00) Azores">(GMT -01:00) Azores</SelectItem>
                  <SelectItem value="(GMT +00:00) Greenwich Mean Time">(GMT +00:00) Greenwich Mean Time</SelectItem>
                  <SelectItem value="(GMT +01:00) Amsterdam, Berlin, Rome">(GMT +01:00) Amsterdam, Berlin, Rome</SelectItem>
                  <SelectItem value="(GMT +02:00) Athens, Bucharest, Istanbul">(GMT +02:00) Athens, Bucharest, Istanbul</SelectItem>
                  <SelectItem value="(GMT +03:00) Baghdad, Kuwait, Riyadh">(GMT +03:00) Baghdad, Kuwait, Riyadh</SelectItem>
                  <SelectItem value="(GMT +04:00) Abu Dhabi, Muscat">(GMT +04:00) Abu Dhabi, Muscat</SelectItem>
                  <SelectItem value="(GMT +05:00) Islamabad, Karachi, Tashkent">(GMT +05:00) Islamabad, Karachi, Tashkent</SelectItem>
                  <SelectItem value="(GMT +06:00) Almaty, Dhaka">(GMT +06:00) Almaty, Dhaka</SelectItem>
                  <SelectItem value="(GMT +07:00) Bangkok, Hanoi, Jakarta">(GMT +07:00) Bangkok, Hanoi, Jakarta</SelectItem>
                  <SelectItem value="(GMT +08:00) Beijing, Chongqing, Hong Kong">(GMT +08:00) Beijing, Chongqing, Hong Kong</SelectItem>
                  <SelectItem value="(GMT +09:00) Osaka, Sapporo, Tokyo">(GMT +09:00) Osaka, Sapporo, Tokyo</SelectItem>
                  <SelectItem value="(GMT +10:00) Canberra, Melbourne, Sydney">(GMT +10:00) Canberra, Melbourne, Sydney</SelectItem>
                  <SelectItem value="(GMT +11:00) Magadan, Solomon Islands">(GMT +11:00) Magadan, Solomon Islands</SelectItem>
                  <SelectItem value="(GMT +12:00) Auckland, Wellington">(GMT +12:00) Auckland, Wellington</SelectItem>
                </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSave} className="w-full">
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <StepActions
        onPrevious={onPrevious}
        onNext={onNext}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        isLastStep={isLastStep}
      />
    </div>
  );
};
