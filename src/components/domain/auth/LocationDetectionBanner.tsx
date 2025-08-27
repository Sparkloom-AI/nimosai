
import React from 'react';
import { MapPin, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationDetectionBannerProps {
  detectedCountry: string;
  confidence: 'high' | 'low';
  onAccept: () => void;
  onEdit: () => void;
}

export const LocationDetectionBanner: React.FC<LocationDetectionBannerProps> = ({
  detectedCountry,
  confidence,
  onAccept,
  onEdit
}) => {
  return (
    <div className="bg-muted/50 border border-border rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <MapPin className="w-5 h-5 text-primary mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-foreground">
            We detected you're in <span className="font-medium">{detectedCountry}</span>
            {confidence === 'low' && (
              <span className="text-muted-foreground"> (best guess)</span>
            )}
          </p>
          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              size="sm"
              onClick={onAccept}
              className="h-7 px-3 text-xs"
            >
              <Check className="w-3 h-3 mr-1" />
              That's right
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="h-7 px-3 text-xs"
            >
              Edit location
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
