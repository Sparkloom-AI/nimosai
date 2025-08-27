
import { useState, useEffect } from 'react';
import { detectLocationFromTimezone } from '@/components/domain/auth/LocationSettings';

interface LocationData {
  country: string;
  countryCode: string;
  phonePrefix: string;
  timezone: string;
  currency: string;
  language: string;
}

export const useLocationDetection = () => {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isDetecting, setIsDetecting] = useState(true);
  const [detectionError, setDetectionError] = useState<string | null>(null);

  useEffect(() => {
    const detectLocation = async () => {
      try {
        setIsDetecting(true);
        setDetectionError(null);
        
        // Use the existing detection function from LocationSettings
        const detected = detectLocationFromTimezone();
        
        setLocationData(detected);
      } catch (error) {
        console.error('Location detection failed:', error);
        setDetectionError('Unable to detect location');
        
        // Fallback to default values
        setLocationData({
          country: '',
          countryCode: '',
          phonePrefix: '',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          currency: '',
          language: 'English'
        });
      } finally {
        setIsDetecting(false);
      }
    };

    detectLocation();
  }, []);

  return {
    locationData,
    isDetecting,
    detectionError,
    updateLocationData: setLocationData
  };
};
