import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ResponsiveImage } from '@/components/ui/responsive-image';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import AccountSetupWizard from '@/components/domain/auth/AccountSetupWizard';
import { authApi } from '@/api/auth';
import { useIPLocationDetection } from '@/hooks/useIPLocationDetection';
import { LocationDetectionBanner } from '@/components/domain/auth/LocationDetectionBanner';
import { MobilePrefixSelector } from '@/components/domain/auth/MobilePrefixSelector';
import { ExpandableLocationSettings } from '@/components/domain/auth/ExpandableLocationSettings';
import { supabase } from '@/integrations/supabase/client';
import { useLoginRateLimiter, usePasswordResetRateLimiter, useRegistrationRateLimiter } from '@/hooks/useEnhancedRateLimiter';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { 
  extractGoogleUserMetadata, 
  isGoogleSignup, 
  getBrowserLocationDefaults, 
  mergeLocationData 
} from '@/lib/authUtils';

type AuthStep = 'email' | 'login' | 'register' | 'email-confirmation' | 'setup' | 'reset-password';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, signUp, signInWithGoogle, loading: authLoading, accountSetupComplete, studioSetupComplete, completeAccountSetup } = useAuth();
  const { userRoles, loading: rolesLoading } = useRole();
  
  const [step, setStep] = useState<AuthStep>('email');
  const [newPassword, setNewPassword] = useState('');
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
  const [smartDefaultsApplied, setSmartDefaultsApplied] = useState(false);

  // Security rate limiters
  const { checkRateLimit: checkLoginLimit } = useLoginRateLimiter();
  const { checkRateLimit: checkPasswordResetLimit } = usePasswordResetRateLimiter();
  const { checkRateLimit: checkRegistrationLimit } = useRegistrationRateLimiter();

  // Enable session timeout for authenticated users
  useSessionTimeout({
    timeoutMinutes: 60,
    warningMinutes: 5,
    enabled: !!user
  });

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

  // Smart defaults for Google sign-ups and location detection
  useEffect(() => {
    if (step !== 'register' || smartDefaultsApplied) return;

    // Get browser-based defaults first
    const browserDefaults = getBrowserLocationDefaults();
    
    // If user signed up with Google, extract their metadata
    if (user && isGoogleSignup(user)) {
      const googleData = extractGoogleUserMetadata(user);
      
      if (googleData) {
        setFirstName(googleData.firstName);
        setLastName(googleData.lastName);
        // Ensure email is set from Google metadata and persisted
        if (googleData.email && !email) {
          setEmail(googleData.email);
          try { localStorage.setItem('pendingSignupEmail', googleData.email); } catch {}
        }
        
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
  }, [step, user, detectedLocation.isDetected, detectedLocation.isLoading, smartDefaultsApplied]);

  // Update location data when IP detection completes
  useEffect(() => {
    if (detectedLocation.isDetected && !detectedLocation.isLoading && smartDefaultsApplied && step === 'register') {
      const browserDefaults = getBrowserLocationDefaults();
      const mergedLocation = mergeLocationData(detectedLocation, browserDefaults);
      setLocationData(mergedLocation);
    }
  }, [detectedLocation.isDetected, detectedLocation.isLoading, smartDefaultsApplied, step]);

  // Check for password reset mode
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'reset') {
      setStep('reset-password');
    }
  }, [searchParams]);

  // Ensure email is present on register step; restore from localStorage or redirect
  useEffect(() => {
    // If authenticated, never block on email guard
    if (user) return;

    if (step === 'register' && !email) {
      try {
        const stored = localStorage.getItem('pendingSignupEmail');
        if (stored) {
          setEmail(stored);
        } else {
          toast.error('Please enter your email to continue.');
          setStep('email');
        }
      } catch {
        if (!email) {
          toast.error('Please enter your email to continue.');
          setStep('email');
        }
      }
    }
  }, [step, email, user]);

  // Check user setup status and redirect accordingly
  useEffect(() => {
    if (user && !authLoading && accountSetupComplete !== null && studioSetupComplete !== null) {
      if (accountSetupComplete === false) {
        // Show the professional account wizard (register step)
        setStep('register');
      } else if (studioSetupComplete === false) {
        // Redirect to studio onboarding
        navigate('/onboarding/studio');
      } else {
        // Both setups complete, go to dashboard
        // Clear any stored email data before navigating
        try {
          localStorage.removeItem('pendingSignupEmail');
        } catch {}
        navigate('/dashboard');
      }
    }
  }, [user, authLoading, accountSetupComplete, studioSetupComplete, navigate]);

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
        try { localStorage.setItem('pendingSignupEmail', email); } catch {}
      }
    } catch (error: any) {
      toast.error('Unable to verify email. Please try again.');
    } finally {
      setEmailCheckLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    // TODO: Re-enable rate limiting when RPC function is properly implemented
    // if (!loginLimiter.checkRateLimit('login')) {
    //   return;
    // }

    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message || 'Failed to sign in');
      } else {
        // TODO: Reset rate limiter on successful login when re-enabled
        // loginLimiter.reset();
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred');
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
      
      // For Google users who already have an account, just complete the account setup
      if (user && isGoogleSignup(user)) {
        await completeAccountSetup();
        toast.success('Account setup completed successfully!');
        // Will redirect to studio onboarding via useEffect
        return;
      }
      
      // For new email sign-ups
      const { error } = await signUp(email, password, fullName);
      
      if (error) {
        if (error.message.includes('User already registered')) {
          toast.error('An account with this email already exists. Please sign in instead.');
          setStep('login');
        } else {
          toast.error(error.message || 'Failed to create account');
        }
      } else {
        setStep('email-confirmation');
        try { localStorage.removeItem('pendingSignupEmail'); } catch {}
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred');
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
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast.error(error.message || 'Failed to update password');
      } else {
        toast.success('Password updated successfully');
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred');
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
    return <AccountSetupWizard onComplete={handleSetupComplete} locationData={locationData} />;
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
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
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
              className="mb-6 -ml-3 h-10 px-3 text-muted-foreground hover:text-foreground hover:bg-transparent rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
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
                className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border-gray-300"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
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
              
              <div className="text-center">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            </form>
          )}

          {/* Password Reset Step */}
          {step === 'reset-password' && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold mb-2">Reset your password</h2>
                <p className="text-muted-foreground text-sm">
                  Enter your new password below
                </p>
              </div>
              
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 pr-10 h-12"
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
              
              <Button type="submit" disabled={isLoading} className="w-full h-12">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating password...
                  </>
                ) : (
                  'Update password'
                )}
              </Button>
            </form>
          )}

          {/* Register Step */}
          {step === 'register' && (
            <div className="space-y-6">
              <form onSubmit={handleRegister} className="space-y-6">
                {/* 1. First name / Last name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium mb-2 text-foreground">
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
                    <label htmlFor="lastName" className="block text-sm font-medium mb-2 text-foreground">
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

                {/* 2. Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-2 text-foreground">
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

                {/* 3. Mobile number */}
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

                {/* 4. Location Detection Banner */}
                <LocationDetectionBanner
                  detectedCountry={locationData.country}
                  isDetected={detectedLocation.isDetected}
                  isLoading={detectedLocation.isLoading}
                  onEditLocation={handleEditLocation}
                />

                {/* 5. Expandable Location Settings */}
                {showLocationSettings && (
                  <ExpandableLocationSettings
                    locationData={locationData}
                    onLocationDataChange={setLocationData}
                  />
                )}

                {/* 6. Terms and conditions */}
                <div className="flex items-center space-x-2 py-2">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground">
                    I agree to the{' '}
                    <Link to="/terms/privacy-policy" target="_blank" className="text-primary hover:underline">Privacy Policy</Link>,{' '}
                    <Link to="/terms/terms-of-service" target="_blank" className="text-primary hover:underline">Terms of Service</Link> and{' '}
                    <Link to="/terms/terms-of-business" target="_blank" className="text-primary hover:underline">Terms of Business</Link>.
                  </label>
                </div>

                {/* 7. Create account button */}
                <Button 
                  type="submit" 
                  disabled={isLoading || !agreedToTerms} 
                  className="w-full h-12 bg-navy text-white hover:bg-navy/90 font-medium"
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
      <div className="hidden lg:block flex-1 bg-muted">
        <ResponsiveImage
          src="/lovable-uploads/5101447c-92ce-49c1-8837-5de26eeff4b6.png"
          alt="Professional using Nimos"
          variant="hero"
          overlay={true}
          overlayContent={
            <>
              <h2 className="text-2xl font-bold mb-2">WhatsApp-First Studio Management</h2>
              <p className="text-white/90 text-lg">
                Manage your salon or wellness studio with the power of WhatsApp. Book appointments, manage staff, and grow your business.
              </p>
            </>
          }
        />
      </div>
    </div>
  );
};

export default Auth;
