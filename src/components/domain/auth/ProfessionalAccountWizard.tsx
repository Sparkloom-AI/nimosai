import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useIPLocationDetection } from '@/hooks/useIPLocationDetection';
import { MobilePrefixSelector } from './MobilePrefixSelector';
import { LocationDetectionBanner } from './LocationDetectionBanner';
import { ExpandableLocationSettings } from './ExpandableLocationSettings';
import { 
  extractGoogleUserMetadata, 
  isGoogleSignup, 
  getBrowserLocationDefaults, 
  mergeLocationData 
} from '@/lib/authUtils';

interface ProfessionalAccountWizardProps {
  onComplete: () => void;
}

const ProfessionalAccountWizard: React.FC<ProfessionalAccountWizardProps> = ({ onComplete }) => {
  const { user, completeAccountSetup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [smartDefaultsApplied, setSmartDefaultsApplied] = useState(false);
  
  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Location detection
  const detectedLocation = useIPLocationDetection();
  const [locationData, setLocationData] = useState({
    country: 'US',
    countryCode: 'US', 
    phonePrefix: '+1',
    timezone: 'America/New_York',
    currency: 'USD',
    language: 'en',
  });
  const [showLocationSettings, setShowLocationSettings] = useState(false);

  // Smart defaults for Google sign-ups
  useEffect(() => {
    if (!user || smartDefaultsApplied) return;

    // Get browser-based defaults first
    const browserDefaults = getBrowserLocationDefaults();
    
    // If user signed up with Google, extract their metadata
    if (isGoogleSignup(user)) {
      const googleData = extractGoogleUserMetadata(user);
      
      if (googleData) {
        setFirstName(googleData.firstName);
        setLastName(googleData.lastName);
        
        console.log('Google sign-up detected, applying smart defaults:', {
          name: `${googleData.firstName} ${googleData.lastName}`,
          email: googleData.email,
          avatar: googleData.avatarUrl
        });
      }
    }
    
    // Merge IP detection with browser defaults when available
    if (detectedLocation.isDetected && !detectedLocation.isLoading) {
      const mergedLocation = mergeLocationData(detectedLocation, browserDefaults);
      setLocationData(mergedLocation);
    } else {
      // Use browser defaults immediately
      setLocationData(browserDefaults);
    }
    
    setSmartDefaultsApplied(true);
  }, [user, detectedLocation.isDetected, detectedLocation.isLoading, smartDefaultsApplied]);

  // Update location data when IP detection completes
  useEffect(() => {
    if (detectedLocation.isDetected && !detectedLocation.isLoading && smartDefaultsApplied) {
      const browserDefaults = getBrowserLocationDefaults();
      const mergedLocation = mergeLocationData(detectedLocation, browserDefaults);
      setLocationData(mergedLocation);
    }
  }, [detectedLocation.isDetected, detectedLocation.isLoading, smartDefaultsApplied]);

  const handleEditLocation = () => {
    setShowLocationSettings(!showLocationSettings);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: `${firstName} ${lastName}`.trim(),
          country: locationData.country,
          country_code: locationData.countryCode,
          phone_prefix: locationData.phonePrefix,
          timezone: locationData.timezone,
          currency: locationData.currency,
          language: locationData.language,
          account_setup_complete: true,
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      await completeAccountSetup();
      toast.success('Professional account created successfully!');
      onComplete();
    } catch (error) {
      console.error('Error creating professional account:', error);
      toast.error('Failed to create professional account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Create a professional account</CardTitle>
        <CardDescription>
          Let's set up your professional profile to get started with Nimos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Smart defaults indicator */}
          {user && isGoogleSignup(user) && smartDefaultsApplied && (firstName || lastName) && (
            <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary">
                We've pre-filled your information from your Google account. You can edit any details below.
              </span>
            </div>
          )}

          {/* 1. First name / Last name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium mb-2 text-foreground">
                First name
                {user && isGoogleSignup(user) && smartDefaultsApplied && firstName && (
                  <span className="ml-1 text-xs text-primary">(from Google)</span>
                )}
              </label>
              <Input
                id="firstName"
                type="text"
                placeholder="Enter your first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-12"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-2 text-foreground">
                Last name
                {user && isGoogleSignup(user) && smartDefaultsApplied && lastName && (
                  <span className="ml-1 text-xs text-primary">(from Google)</span>
                )}
              </label>
              <Input
                id="lastName"
                type="text"
                placeholder="Enter your last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-12"
                required
              />
            </div>
          </div>

          {/* 2. Mobile number */}
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

          {/* 3. Location Detection Banner */}
          <LocationDetectionBanner
            detectedCountry={locationData.country}
            isDetected={detectedLocation.isDetected}
            isLoading={detectedLocation.isLoading}
            onEditLocation={handleEditLocation}
          />

          {/* 4. Expandable Location Settings */}
          {showLocationSettings && (
            <ExpandableLocationSettings
              locationData={locationData}
              onLocationDataChange={setLocationData}
            />
          )}

          {/* 5. Terms and conditions */}
          <div className="flex items-center space-x-2 py-2">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground">
              I agree to the{' '}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>,{' '}
              <a href="#" className="text-primary hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="text-primary hover:underline">Terms of Business</a>.
            </label>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit}
          disabled={isLoading || !agreedToTerms} 
          className="w-full h-12 font-medium"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            'Continue to Studio Setup'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfessionalAccountWizard;