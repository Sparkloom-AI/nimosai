import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { locationsApi } from '@/api/locations';
import { useRole } from '@/contexts/RoleContext';
import { LocationCard } from '@/components/domain/locations/LocationCard';
import { AddLocationModal } from '@/components/domain/locations/AddLocationModal';
import { EditLocationModal } from '@/components/domain/locations/EditLocationModal';
import { Location } from '@/types/studio';
import { MapPin, Plus, Loader2 } from 'lucide-react';
import { BusinessHoursSection } from '@/components/domain/settings/BusinessHoursSection';

export const LocationsSection = () => {
  const { toast } = useToast();
  const { currentStudioId } = useRole();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const { data: locations = [], isLoading, error } = useQuery({
    queryKey: ['locations', currentStudioId],
    queryFn: () => currentStudioId ? locationsApi.getStudioLocations(currentStudioId) : Promise.resolve([]),
    enabled: !!currentStudioId,
  });

  const handleAddLocation = () => {
    setShowAddModal(true);
  };

  const handleLocationAdded = () => {
    queryClient.invalidateQueries({ queryKey: ['locations', currentStudioId] });
    setShowAddModal(false);
    toast({
      title: "Success",
      description: "Location added successfully",
    });
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
  };

  const handleLocationUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ['locations', currentStudioId] });
    setEditingLocation(null);
    toast({
      title: "Success",
      description: "Location updated successfully",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive">Failed to load locations. Please try again.</p>
            <Button 
              variant="outline" 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['locations', currentStudioId] })}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Locations
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage your business locations and their operating hours
          </p>
        </CardHeader>
        <CardContent>
          {locations.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No locations yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first business location to get started
              </p>
              <Button onClick={handleAddLocation}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Location
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {locations.length} location{locations.length !== 1 ? 's' : ''}
                </p>
                <Button onClick={handleAddLocation} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Location
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                {locations.map((location) => (
                  <LocationCard
                    key={location.id}
                    location={location}
                    onEdit={handleEditLocation}
                    onDelete={() => {
                      queryClient.invalidateQueries({ queryKey: ['locations', currentStudioId] });
                    }}
                    onSetPrimary={() => {
                      queryClient.invalidateQueries({ queryKey: ['locations', currentStudioId] });
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Business Hours Section */}
      <BusinessHoursSection locations={locations} />

      {/* Modals */}
      <AddLocationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onLocationAdded={handleLocationAdded}
      />

      {editingLocation && (
        <EditLocationModal
          location={editingLocation}
          isOpen={!!editingLocation}
          onClose={() => setEditingLocation(null)}
          onLocationUpdated={handleLocationUpdated}
        />
      )}
    </div>
  );
};