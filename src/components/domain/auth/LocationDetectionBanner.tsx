
import React from 'react';
import { MapPin, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationDetectionBannerProps {
  detectedCountry: string;
  isDetecting: boolean;
  detectionError: string | null;
  onChangeLocation: () => void;
  confidence?: 'high' | 'medium' | 'low';
}

export const LocationDetectionBanner: React.FC<LocationDetectionBannerProps> = ({
  detectedCountry,
  isDetecting,
  detectionError,
  onChangeLocation,
  confidence = 'medium'
}) => {
  if (isDetecting) {
    return (
      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
        <MapPin className="w-4 h-4 text-muted-foreground animate-pulse" />
        <span className="text-sm text-muted-foreground">Detecting your location...</span>
      </div>
    );
  }

  if (detectionError) {
    return (
      <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
        <AlertCircle className="w-4 h-4 text-destructive" />
        <span className="text-sm text-destructive">Unable to detect location automatically</span>
      </div>
    );
  }

  if (detectedCountry) {
    return (
      <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span className="text-sm text-emerald-800">
            We detected you're in <strong>{detectedCountry}</strong>
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onChangeLocation}
          className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100 h-auto p-1"
        >
          Change
        </Button>
      </div>
    );
  }

  return null;
};
