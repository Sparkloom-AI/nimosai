import React from 'react';
import { GoogleMapViewer } from './GoogleMapViewer';
import type { Location } from '@/types/studio';

interface LocationsMapOverviewProps {
  locations: Location[];
  onLocationSelect?: (location: Location) => void;
  height?: string;
  className?: string;
}

export const LocationsMapOverview: React.FC<LocationsMapOverviewProps> = ({
  locations,
  onLocationSelect,
  height = '400px',
  className = ''
}) => {
  const mapLocations = locations
    .filter(location => location.latitude && location.longitude)
    .map(location => ({
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
      name: location.name,
      address: location.address
    }));

  if (mapLocations.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
        style={{ height }}
      >
        <span className="text-sm text-muted-foreground">No locations with coordinates available</span>
      </div>
    );
  }

  return (
    <GoogleMapViewer
      locations={mapLocations}
      showControls={true}
      height={height}
      className={className}
    />
  );
};