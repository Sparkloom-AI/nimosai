
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Check } from 'lucide-react';

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
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-dashed">
        <div className="flex items-center">
          <div className="animate-pulse bg-muted rounded h-4 w-4 mr-2"></div>
          <span className="text-sm text-muted-foreground">Detecting your location...</span>
        </div>
      </div>
    );
  }

  if (!isDetected) {
    return (
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Location detection unavailable</span>
        </div>
        <Button variant="link" size="sm" onClick={onEditLocation} className="h-auto p-0">
          Select manually
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
      <div className="flex items-center">
        <Check className="h-4 w-4 mr-2 text-primary" />
        <span className="text-sm">
          We detected you're in <strong>{detectedCountry}</strong>
        </span>
      </div>
      <Button variant="link" size="sm" onClick={onEditLocation} className="h-auto p-0 text-primary">
        Change
      </Button>
    </div>
  );
};
