
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
  const [detectedLocation, setDetectedLocation] = useState<LocationData | null>(null);
  const [isDetecting, setIsDetecting] = useState(true);
  const [detectionConfidence, setDetectionConfidence] = useState<'high' | 'low'>('low');

  useEffect(() => {
    const detectLocation = async () => {
      try {
        const detected = detectLocationFromTimezone();
        
        if (detected.country) {
          setDetectedLocation(detected);
          setDetectionConfidence('high');
        } else {
          // Fallback to Indonesia as default
          setDetectedLocation({
            country: 'Indonesia',
            countryCode: 'ID',
            phonePrefix: '+62',
            timezone: '(GMT +07:00) Jakarta',
            currency: 'Indonesian Rupiah - IDR',
            language: 'Indonesia'
          });
          setDetectionConfidence('low');
        }
      } catch (error) {
        console.error('Location detection failed:', error);
        // Fallback to Indonesia
        setDetectedLocation({
          country: 'Indonesia',
          countryCode: 'ID',
          phonePrefix: '+62',
          timezone: '(GMT +07:00) Jakarta',
          currency: 'Indonesian Rupiah - IDR',
          language: 'Indonesia'
        });
        setDetectionConfidence('low');
      } finally {
        setIsDetecting(false);
      }
    };

    detectLocation();
  }, []);

  return {
    detectedLocation,
    isDetecting,
    detectionConfidence
  };
};
