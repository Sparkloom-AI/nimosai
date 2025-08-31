import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { locationsApi } from '@/api/locations';
import { useRole } from '@/contexts/RoleContext';
import { LocationCard } from './LocationCard';
import { EditLocationModal } from './EditLocationModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, MapPin, Loader2 } from 'lucide-react';
import { Location } from '@/types/studio';
import { toast } from '@/hooks/use-toast';

interface LocationsListProps {
  onAddLocation: () => void;
}

export const LocationsList: React.FC<LocationsListProps> = ({ onAddLocation }) => {
  const { currentStudioId } = useRole();
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const {
    data: locations = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['locations', currentStudioId],
    queryFn: () => currentStudioId ? locationsApi.getStudioLocations(currentStudioId) : [],
    enabled: !!currentStudioId,
  });

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
  };

  const handleDeleteLocation = async (locationId: string) => {
    try {
      await locationsApi.deleteLocation(locationId);
      toast({
        title: "Location deleted",
        description: "Location has been successfully removed.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete location. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSetPrimary = async (locationId: string) => {
    if (!currentStudioId) return;
    
    try {
      await locationsApi.setPrimaryLocation(locationId, currentStudioId);
      toast({
        title: "Primary location updated",
        description: "Location has been set as primary.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update primary location. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="py-6">
          <p className="text-destructive text-center">
            Failed to load locations. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (locations.length === 0) {
    return (
      <>
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg font-heading mb-2">No locations yet</CardTitle>
            <CardDescription className="mb-4 max-w-sm">
              Add your first business location to help clients find you and enable location-based features.
            </CardDescription>
            <Button onClick={onAddLocation} className="gap-2">
              <Plus className="h-4 w-4" />
              Add First Location
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <LocationCard
            key={location.id}
            location={location}
            onEdit={handleEditLocation}
            onDelete={handleDeleteLocation}
            onSetPrimary={handleSetPrimary}
          />
        ))}
      </div>

      {editingLocation && (
        <EditLocationModal
          location={editingLocation}
          isOpen={!!editingLocation}
          onClose={() => setEditingLocation(null)}
          onSuccess={() => {
            setEditingLocation(null);
            refetch();
          }}
        />
      )}
    </>
  );
};