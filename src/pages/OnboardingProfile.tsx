import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { profilesApi } from '@/api/profiles';
import { LocationDetectionBanner } from '@/components/domain/auth/LocationDetectionBanner';
import { ExpandableLocationSettings } from '@/components/domain/auth/ExpandableLocationSettings';
import { MobilePrefixSelector } from '@/components/domain/auth/MobilePrefixSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useIPLocationDetection } from '@/hooks/useIPLocationDetection';
import { 
  getBrowserLocationDefaults, 
  mergeLocationData 
} from '@/lib/authUtils';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { ResponsiveImage } from '@/components/ui/responsive-image';

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
  const { user, completeProfileSetup } = useAuth();
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

  // Apply smart defaults on component mount (like /auth did)
  useEffect(() => {
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
  }, [detectedLocation.isDetected, detectedLocation.isLoading, smartDefaultsApplied]);

  // Update location data when IP detection completes (if not already set)
  useEffect(() => {
    if (detectedLocation.isDetected && !detectedLocation.isLoading && smartDefaultsApplied && !locationData.country) {
      const browserDefaults = getBrowserLocationDefaults();
      const mergedLocation = mergeLocationData(detectedLocation, browserDefaults);
      setLocationData(mergedLocation);
    }
  }, [detectedLocation.isDetected, detectedLocation.isLoading, smartDefaultsApplied, locationData.country]);

  // Load existing profile data (but don't override smart defaults if profile is empty)
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;

      try {
        // Load existing profile data
        const profile = await profilesApi.getCurrentProfile();
        if (profile && (profile.country || profile.timezone || profile.currency || profile.language)) {
          // Only use profile data if it has actual values (not just defaults)
          setLocationData({
            country: profile.country || locationData.country,
            countryCode: profile.country_code || locationData.countryCode,
            phonePrefix: profile.phone_prefix || locationData.phonePrefix,
            timezone: profile.timezone || locationData.timezone,
            currency: profile.currency || locationData.currency,
            language: profile.language || locationData.language
          });
          
          // Extract phone number from phone_prefix if it exists
          if (profile.phone_prefix) {
            // If phone_prefix contains a full number, extract just the number part
            const phonePrefix = locationData.phonePrefix || profile.phone_prefix;
            if (phonePrefix && phonePrefix.length > 4) {
              // Assume the prefix is the first 1-4 characters (like +62, +1, etc.)
              const prefixMatch = phonePrefix.match(/^(\+\d{1,4})/);
              if (prefixMatch) {
                const prefix = prefixMatch[1];
                const number = phonePrefix.substring(prefix.length);
                setLocationData(prev => ({ ...prev, phonePrefix: prefix }));
                setPhoneNumber(number);
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        // Keep smart defaults if profile loading fails
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfileData();
  }, [user]);

  const handleEditLocation = () => {
    setShowLocationSettings(!showLocationSettings);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Combine phone prefix and number
      const fullPhoneNumber = phoneNumber ? `${locationData.phonePrefix}${phoneNumber}` : locationData.phonePrefix;
      
      await profilesApi.updateProfile({
        country: locationData.country,
        country_code: locationData.countryCode,
        currency: locationData.currency,
        language: locationData.language,
        phone_prefix: fullPhoneNumber,
        timezone: locationData.timezone,
      });
      
      await completeProfileSetup();
      
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
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/auth')} 
              className="mb-6 p-0 h-auto text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">Account setup</p>
              <h1 className="text-3xl font-bold mb-4">
                Complete Your Profile
              </h1>
              <p className="text-muted-foreground">
                Help us personalize your experience by setting your location preferences.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
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
            
            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="h-12 px-8 bg-foreground text-background hover:bg-foreground/90"
              >
                {isLoading ? 'Saving...' : 'Continue'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block flex-1 bg-muted">
        <ResponsiveImage 
          src="/lovable-uploads/5101447c-92ce-49c1-8837-5de26eeff4b6.png" 
          alt="Professional setting up profile" 
          variant="hero" 
          overlay={true} 
          overlayContent={
            <>
              <h2 className="text-2xl font-bold mb-2">Set Up Your Profile</h2>
              <p className="text-lg opacity-90">Configure your location preferences for a personalized experience.</p>
            </>
          } 
        />
      </div>
    </div>
  );
};

export default OnboardingProfile;