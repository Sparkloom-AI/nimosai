import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { profilesApi } from '@/api/profiles';
import { ExpandableLocationSettings } from '@/components/domain/auth/ExpandableLocationSettings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const OnboardingProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [locationData, setLocationData] = useState({
    country: '',
    countryCode: '',
    phonePrefix: '',
    timezone: '',
    currency: '',
    language: 'English'
  });

  // Load existing profile data if available
  useEffect(() => {
    const loadExistingProfile = async () => {
      if (user) {
        try {
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
          }
        } catch (error) {
          console.error('Failed to load existing profile:', error);
        }
      }
    };
    
    loadExistingProfile();
  }, [user]);

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
    navigate('/auth');
    return null;
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
              <ExpandableLocationSettings
                locationData={locationData}
                onLocationDataChange={setLocationData}
              />
              
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
