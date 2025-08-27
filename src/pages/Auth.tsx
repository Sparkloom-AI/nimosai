import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import AccountSetupWizard from '@/components/domain/auth/AccountSetupWizard';
import { authApi } from '@/api/auth';
import { useIPLocationDetection } from '@/hooks/useIPLocationDetection';
import { LocationDetectionBanner } from '@/components/domain/auth/LocationDetectionBanner';
import { MobilePrefixSelector } from '@/components/domain/auth/MobilePrefixSelector';
import { ExpandableLocationSettings } from '@/components/domain/auth/ExpandableLocationSettings';
import { supabase } from '@/integrations/supabase/client';

type AuthStep = 'email' | 'login' | 'register' | 'email-confirmation' | 'setup';

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, signInWithGoogle, loading: authLoading } = useAuth();
  const { userRoles, loading: rolesLoading } = useRole();
  
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showLocationSettings, setShowLocationSettings] = useState(false);

  // Location detection
  const detectedLocation = useIPLocationDetection();
  const [locationData, setLocationData] = useState({
    country: '',
    countryCode: '',
    phonePrefix: '',
    timezone: '',
    currency: '',
    language: 'English'
  });

  // Update location data when detection completes
  useEffect(() => {
    if (detectedLocation.isDetected && !detectedLocation.isLoading) {
      setLocationData({
        country: detectedLocation.country,
        countryCode: detectedLocation.countryCode,
        phonePrefix: detectedLocation.phonePrefix,
        timezone: detectedLocation.timezone,
        currency: detectedLocation.currency,
        language: detectedLocation.language
      });
    }
  }, [detectedLocation]);

  // Check if user needs setup after authentication
  useEffect(() => {
    if (user && !authLoading && !rolesLoading) {
      if (userRoles.length === 0) {
        setStep('setup');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, userRoles, authLoading, rolesLoading, navigate]);

  // Redirect authenticated users who already have roles
  useEffect(() => {
    if (user && userRoles.length > 0) {
      navigate('/dashboard');
    }
  }, [user, userRoles, navigate]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setEmailCheckLoading(true);
    try {
      const emailExists = await authApi.checkEmailExists(email);
      
      if (emailExists) {
        setStep('login');
        toast.success('Welcome back! Please enter your password to continue.');
      } else {
        setStep('register');
        toast.success('Let\'s get you started! Please complete your account setup.');
      }
    } catch (error: any) {
      console.error('Error checking email:', error);
      toast.error('Unable to verify email. Please try again.');
    } finally {
      setEmailCheckLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please try again.');
        } else {
          toast.error(error.message || 'Failed to sign in');
        }
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !firstName || !lastName || !agreedToTerms) {
      toast.error('Please fill in all required fields and agree to the terms.');
      return;
    }

    setIsLoading(true);
    try {
      const fullName = `${firstName} ${lastName}`;
      const { error } = await signUp(email, password, fullName);
      if (error) {
        if (error.message.includes('User already registered')) {
          toast.error('An account with this email already exists. Please sign in instead.');
          setStep('login');
        } else {
          toast.error(error.message || 'Failed to create account');
        }
      } else {
        // Store location data in profile after successful signup
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: user?.id,
              email: email,
              full_name: fullName,
              country: locationData.country,
              country_code: locationData.countryCode,
              phone_prefix: locationData.phonePrefix,
              timezone: locationData.timezone,
              currency: locationData.currency,
              language: locationData.language
            });
          
          if (profileError) {
            console.error('Error saving location data:', profileError);
          }
        } catch (locationError) {
          console.error('Failed to save location data:', locationError);
        }
        
        setStep('email-confirmation');
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(error.message || 'Failed to sign in with Google');
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred');
      console.error('Google sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupComplete = () => {
    navigate('/dashboard');
  };

  const handleBackToEmail = () => {
    setStep('email');
    setPassword('');
    setFirstName('');
    setLastName('');
    setPhoneNumber('');
    setShowPassword(false);
    setAgreedToTerms(false);
    setShowLocationSettings(false);
  };

  const handleEditLocation = () => {
    setShowLocationSettings(!showLocationSettings);
  };

  // Show loading spinner while checking auth state
  if (authLoading || rolesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Show setup wizard for new users
  if (step === 'setup') {
    return <AccountSetupWizard onComplete={handleSetupComplete} />;
  }

  if (step === 'email-confirmation') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Mail className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h1 className="text-2xl font-bold mb-4">Check your email</h1>
            <p className="text-muted-foreground mb-6">
              We've sent you a confirmation link at <strong>{email}</strong>. 
              Click the link to verify your account and complete setup.
            </p>
            <Button 
              variant="outline" 
              onClick={handleBackToEmail}
              className="w-full"
            >
              Back to sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {step === 'register' ? 'Create a professional account' : 'Welcome to Nimos'}
            </h1>
            <p className="text-muted-foreground">
              {step === 'email' && 'Enter your email to get started'}
              {step === 'login' && 'Welcome back! Sign in to your account'}
              {step === 'register' && (
                <>
                  You're almost there! Create your new account for{' '}
                  <span className="font-medium text-foreground">{email}</span>{' '}
                  by completing these details.
                </>
              )}
            </p>
          </div>

          {/* Back button for non-email steps */}
          {step !== 'email' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToEmail}
              className="mb-6 p-0 h-auto text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}

          {/* Email Step */}
          {step === 'email' && (
            <div className="space-y-6">
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                    required
                    disabled={emailCheckLoading}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12" 
                  disabled={emailCheckLoading}
                >
                  {emailCheckLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    'Continue'
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={isLoading || emailCheckLoading}
                className="w-full h-12"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continue with Google
              </Button>
            </div>
          )}

          {/* Login Step */}
          {step === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-12 px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full h-12">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          )}

          {/* Register Step - REORDERED FIELDS */}
          {step === 'register' && (
            <div className="space-y-6">
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

              <form onSubmit={handleRegister} className="space-y-4">
                {/* 1. First name / Last name (at the top) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                      First name
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
                    <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                      Last name
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

                {/* 2. Password (after names) */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10 h-12"
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* 3. Mobile number field (after password) */}
                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium mb-2">
                    Mobile number
                  </label>
                  <div className="flex gap-2">
                    <MobilePrefixSelector
                      value={locationData.phonePrefix}
                      onValueChange={(prefix) => 
                        setLocationData(prev => ({ ...prev, phonePrefix: prefix }))
                      }
                    />
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="Enter your mobile number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1 h-12"
                    />
                  </div>
                  {phoneNumber && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Mobile number is required
                    </p>
                  )}
                </div>

                {/* 4. Country field (appears when Edit is clicked) */}
                <div>
                  <label htmlFor="country" className="block text-sm font-medium mb-2">
                    Country
                  </label>
                  <div className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                    <span className="text-sm">
                      {locationData.country || 'Select country'}
                    </span>
                    <Button 
                      type="button"
                      variant="link" 
                      size="sm"
                      onClick={handleEditLocation}
                      className="text-primary p-0 h-auto"
                    >
                      Edit
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 py-4">
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

                <Button 
                  type="submit" 
                  disabled={isLoading || !agreedToTerms} 
                  className="w-full h-12 bg-foreground text-background hover:bg-foreground/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create account'
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  This site is protected by reCAPTCHA<br />
                  Google Privacy Policy and Terms of Service apply
                </p>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block flex-1 bg-muted relative overflow-hidden">
        <img
          src="/lovable-uploads/5101447c-92ce-49c1-8837-5de26eeff4b6.png"
          alt="Professional using Nimos"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-accent/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <h2 className="text-2xl font-bold mb-2">WhatsApp-First Studio Management</h2>
          <p className="text-white/90 text-lg">
            Manage your salon or wellness studio with the power of WhatsApp. Book appointments, manage staff, and grow your business.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
