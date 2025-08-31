import React from 'react';
import { GoogleMapViewer } from './GoogleMapViewer';
import type { Location } from '@/types/studio';

interface LocationMiniMapProps {
  location: Location;
  height?: string;
  className?: string;
}

export const LocationMiniMap: React.FC<LocationMiniMapProps> = ({
  location,
  height = '120px',
  className = ''
}) => {
  if (!location.latitude || !location.longitude) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
        style={{ height }}
      >
        <span className="text-xs text-muted-foreground">No location data</span>
      </div>
    );
  }

  const mapLocation = {
    latitude: Number(location.latitude),
    longitude: Number(location.longitude),
    name: location.name,
    address: location.address
  };

  return (
    <GoogleMapViewer
      location={mapLocation}
      draggable={false}
      showControls={false}
      height={height}
      zoom={16}
      className={className}
    />
  );
};