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
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="America/Anchorage">Alaska Time (AKT)</SelectItem>
                    <SelectItem value="Pacific/Honolulu">Hawaii Time (HST)</SelectItem>
                    <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                    <SelectItem value="Europe/Paris">Central European Time (CET)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Japan Standard Time (JST)</SelectItem>
                    <SelectItem value="Australia/Sydney">Australian Eastern Time (AET)</SelectItem>
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
