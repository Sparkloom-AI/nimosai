import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { profilesApi } from '@/api/profiles';
import { LocationDetectionBanner } from '@/components/domain/auth/LocationDetectionBanner';
import { ExpandableLocationSettings } from '@/components/domain/auth/ExpandableLocationSettings';
import { MobilePrefixSelector } from '@/components/domain/auth/MobilePrefixSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useIPLocationDetection } from '@/hooks/useIPLocationDetection';
import { 
  getBrowserLocationDefaults, 
  mergeLocationData 
} from '@/lib/authUtils';
import { Loader2 } from 'lucide-react';

interface LocationData {
  country: string;
  countryCode: string;
  phonePrefix: string;
  timezone: string;
  currency: string;
  language: string;
}

const OnboardingProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showLocationSettings, setShowLocationSettings] = useState(false);
  const [smartDefaultsApplied, setSmartDefaultsApplied] = useState(false);
  
  // Location detection
  const detectedLocation = useIPLocationDetection();
  const [locationData, setLocationData] = useState<LocationData>({
    country: '',
    countryCode: '',
    phonePrefix: '',
    timezone: '',
    currency: '',
    language: 'English'
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  // Load existing profile data and apply smart defaults
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;

      try {
        // Load existing profile data
        const profile = await profilesApi.getCurrentProfile();
        if (profile) {
          setLocationData({
            country: profile.country || '',
            countryCode: profile.country_code || '',
            phonePrefix: profile.phone_prefix || '',
            timezone: profile.timezone || '',
            currency: profile.currency || '',
            language: profile.language || 'English'
          });
        } else {
          // No existing profile, apply smart defaults
          applySmartDefaults();
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        // Apply smart defaults as fallback
        applySmartDefaults();
      } finally {
        setIsLoadingProfile(false);
      }
    };

    const applySmartDefaults = () => {
      if (smartDefaultsApplied) return;

      // Get browser-based defaults first
      const browserDefaults = getBrowserLocationDefaults();
      
      // Merge IP detection with browser defaults when available
      if (detectedLocation.isDetected && !detectedLocation.isLoading) {
        const mergedLocation = mergeLocationData(detectedLocation, browserDefaults);
        setLocationData(mergedLocation);
      } else {
        // Use browser defaults immediately
        setLocationData(browserDefaults);
      }
      
      setSmartDefaultsApplied(true);
    };

    loadProfileData();
  }, [user, detectedLocation.isDetected, detectedLocation.isLoading, smartDefaultsApplied]);

  // Update location data when IP detection completes
  useEffect(() => {
    if (detectedLocation.isDetected && !detectedLocation.isLoading && smartDefaultsApplied && !locationData.country) {
      const browserDefaults = getBrowserLocationDefaults();
      const mergedLocation = mergeLocationData(detectedLocation, browserDefaults);
      setLocationData(mergedLocation);
    }
  }, [detectedLocation.isDetected, detectedLocation.isLoading, smartDefaultsApplied, locationData.country]);

  const handleEditLocation = () => {
    setShowLocationSettings(!showLocationSettings);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await profilesApi.updateProfile({
        country: locationData.country,
        country_code: locationData.countryCode,
        currency: locationData.currency,
        language: locationData.language,
        phone_prefix: locationData.phonePrefix,
        timezone: locationData.timezone,
      });
      
      toast.success('Profile updated successfully!');
      navigate('/onboarding/studio');
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/onboarding/studio');
  };

  if (!user) {
    return null;
  }

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
              <p className="text-muted-foreground">
                Help us personalize your experience by setting your location preferences.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mobile number */}
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium mb-2 text-foreground">
                  Mobile number
                </label>
                <div className="flex">
                  <MobilePrefixSelector
                    value={locationData.phonePrefix}
                    onValueChange={(prefix) => 
                      setLocationData(prev => ({ ...prev, phonePrefix: prefix }))
                    }
                    className="rounded-r-none border-r-0 h-12"
                  />
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 rounded-l-none h-12"
                  />
                </div>
              </div>

              {/* Location Detection Banner */}
              <LocationDetectionBanner
                detectedCountry={locationData.country}
                isDetected={detectedLocation.isDetected}
                isLoading={detectedLocation.isLoading}
                onEditLocation={handleEditLocation}
              />

              {/* Expandable Location Settings */}
              {showLocationSettings && (
                <ExpandableLocationSettings
                  locationData={locationData}
                  onLocationDataChange={setLocationData}
                />
              )}
              
              <div className="flex gap-4">
                <Button 
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Saving...' : 'Save & Continue'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleSkip}
                  disabled={isLoading}
                >
                  Skip for Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OnboardingProfile;