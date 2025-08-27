
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Check, Edit } from 'lucide-react';

interface LocationDetectionBannerProps {
  detectedCountry: string;
  isDetected: boolean;
  isLoading: boolean;
  onEditLocation: () => void;
}

export const LocationDetectionBanner: React.FC<LocationDetectionBannerProps> = ({
  detectedCountry,
  isDetected,
  isLoading,
  onEditLocation
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
        <div className="flex items-center">
          <div className="animate-pulse bg-muted rounded h-4 w-4 mr-2"></div>
          <span className="text-sm text-muted-foreground">Detecting your location...</span>
        </div>
      </div>
    );
  }

  if (!isDetected) {
    return (
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Location detection unavailable</span>
        </div>
        <Button variant="link" size="sm" onClick={onEditLocation} className="h-auto p-0 text-primary">
          <Edit className="h-3 w-3 mr-1" />
          Set manually
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-green-50/80 rounded-lg border border-green-100">
      <div className="flex items-center">
        <Check className="h-4 w-4 mr-2 text-green-600" />
        <span className="text-sm text-green-800">
          Country: <span className="font-medium">{detectedCountry}</span>
        </span>
      </div>
      <Button variant="link" size="sm" onClick={onEditLocation} className="h-auto p-0 text-green-700 hover:text-green-800">
        <Edit className="h-3 w-3 mr-1" />
        Edit
      </Button>
    </div>
  );
};
