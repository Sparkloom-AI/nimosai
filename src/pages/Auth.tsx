import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';
import AccountSetupWizard from '@/components/domain/auth/AccountSetupWizard';
import { useLocationDetection } from '@/hooks/useLocationDetection';
import { LocationDetectionBanner } from '@/components/domain/auth/LocationDetectionBanner';
import { LocationSettings } from '@/components/domain/auth/LocationSettings';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

const registrationSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  country: z.string().min(1, 'Country is required'),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
});

type EmailFormData = z.infer<typeof emailSchema>;
type LoginFormData = z.infer<typeof loginSchema>;
type RegistrationFormData = z.infer<typeof registrationSchema>;

const Auth: React.FC = () => {
  const [step, setStep] = useState<'email' | 'login' | 'register' | 'email-confirmation' | 'setup'>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showLocationSettings, setShowLocationSettings] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  // Location detection hook
  const { locationData, isDetecting, detectionError, updateLocationData } = useLocationDetection();

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registrationForm = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      country: '',
      acceptTerms: false,
    },
  });

  // Update registration form when location is detected
  useEffect(() => {
    if (locationData && locationData.country) {
      registrationForm.setValue('country', locationData.country);
      
      // Pre-fill phone with country prefix if available
      if (locationData.phonePrefix && !registrationForm.getValues('phone')) {
        registrationForm.setValue('phone', locationData.phonePrefix + ' ');
      }
    }
  }, [locationData, registrationForm]);

  const countries = [
    { code: 'ID', name: 'Indonesia', phone: '+62', flag: '🇮🇩' },
    { code: 'US', name: 'United States', phone: '+1', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', phone: '+44', flag: '🇬🇧' },
    { code: 'AU', name: 'Australia', phone: '+61', flag: '🇦🇺' },
    { code: 'DE', name: 'Germany', phone: '+49', flag: '🇩🇪' },
    { code: 'FR', name: 'France', phone: '+33', flag: '🇫🇷' },
    { code: 'IT', name: 'Italy', phone: '+39', flag: '🇮🇹' },
    { code: 'ES', name: 'Spain', phone: '+34', flag: '🇪🇸' },
    { code: 'NL', name: 'Netherlands', phone: '+31', flag: '🇳🇱' },
    { code: 'JP', name: 'Japan', phone: '+81', flag: '🇯🇵' },
    { code: 'KR', name: 'South Korea', phone: '+82', flag: '🇰🇷' },
    { code: 'CN', name: 'China', phone: '+86', flag: '🇨🇳' },
    { code: 'IN', name: 'India', phone: '+91', flag: '🇮🇳' },
    { code: 'SG', name: 'Singapore', phone: '+65', flag: '🇸🇬' },
    { code: 'MY', name: 'Malaysia', phone: '+60', flag: '🇲🇾' },
    { code: 'TH', name: 'Thailand', phone: '+66', flag: '🇹🇭' },
    { code: 'VN', name: 'Vietnam', phone: '+84', flag: '🇻🇳' },
    { code: 'PH', name: 'Philippines', phone: '+63', flag: '🇵🇭' },
    { code: 'BR', name: 'Brazil', phone: '+55', flag: '🇧🇷' },
    { code: 'MX', name: 'Mexico', phone: '+52', flag: '🇲🇽' },
    { code: 'CA', name: 'Canada', phone: '+1', flag: '🇨🇦' },
    { code: 'RU', name: 'Russia', phone: '+7', flag: '🇷🇺' },
    { code: 'AR', name: 'Argentina', phone: '+54', flag: '🇦🇷' },
    { code: 'CL', name: 'Chile', phone: '+56', flag: '🇨🇱' },
    { code: 'CO', name: 'Colombia', phone: '+57', flag: '🇨🇴' },
    { code: 'PE', name: 'Peru', phone: '+51', flag: '🇵🇪' },
    { code: 'ZA', name: 'South Africa', phone: '+27', flag: '🇿🇦' },
    { code: 'EG', name: 'Egypt', phone: '+20', flag: '🇪🇬' },
    { code: 'NG', name: 'Nigeria', phone: '+234', flag: '🇳🇬' },
    { code: 'KE', name: 'Kenya', phone: '+254', flag: '🇰🇪' },
    { code: 'MA', name: 'Morocco', phone: '+212', flag: '🇲🇦' },
    { code: 'TR', name: 'Turkey', phone: '+90', flag: '🇹🇷' },
    { code: 'SA', name: 'Saudi Arabia', phone: '+966', flag: '🇸🇦' },
    { code: 'AE', name: 'United Arab Emirates', phone: '+971', flag: '🇦🇪' },
    { code: 'IL', name: 'Israel', phone: '+972', flag: '🇮🇱' },
  ];

  const onEmailSubmit = async (data: EmailFormData) => {
    setIsLoading(true);
    try {
      const emailExists = await authApi.checkEmailExists(data.email);
      setEmail(data.email);
      
      if (emailExists) {
        loginForm.setValue('email', data.email);
        setStep('login');
      } else {
        registrationForm.setValue('email', data.email);
        setStep('register');
      }
    } catch (error) {
      toast.error('Failed to check email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        toast.error(error.message || 'Login failed. Please check your credentials.');
      } else {
        toast.success('Welcome back!');
        navigate('/');
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true);
    try {
      // Include location data in user metadata
      const fullName = `${data.firstName} ${data.lastName}`;
      const { error } = await signUp(data.email, data.password, fullName);
      
      if (error) {
        toast.error(error.message || 'Registration failed. Please try again.');
      } else {
        // Store additional profile data including location
        try {
          const { supabase } = await import('@/integrations/supabase/client');
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user && locationData) {
            await supabase
              .from('profiles')
              .upsert({
                id: user.id,
                full_name: fullName,
                email: data.email,
                country: locationData.country,
                country_code: locationData.countryCode,
                phone_prefix: locationData.phonePrefix,
                timezone: locationData.timezone,
                currency: locationData.currency,
                language: locationData.language,
              });
          }
        } catch (profileError) {
          console.error('Failed to save profile data:', profileError);
          // Don't block the flow if profile update fails
        }

        setStep('email-confirmation');
        toast.success('Please check your email to confirm your account.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(error.message || 'Google sign-in failed. Please try again.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'login' || step === 'register') {
      setStep('email');
    } else if (step === 'email-confirmation') {
      setStep('register');
    }
  };

  const handleLocationChange = (newLocationData: any) => {
    updateLocationData(newLocationData);
    registrationForm.setValue('country', newLocationData.country);
    
    // Update phone prefix if changed
    const currentPhone = registrationForm.getValues('phone');
    const currentPrefix = locationData?.phonePrefix || '';
    
    if (currentPhone.startsWith(currentPrefix)) {
      const numberWithoutPrefix = currentPhone.slice(currentPrefix.length).trim();
      registrationForm.setValue('phone', newLocationData.phonePrefix + ' ' + numberWithoutPrefix);
    }
    
    setShowLocationSettings(false);
  };

  if (step === 'setup') {
    return <AccountSetupWizard onComplete={() => navigate('/')} />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg">
          {step === 'email' && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-4">Welcome to Nimos</h1>
                <p className="text-muted-foreground text-lg">
                  Your all-in-one WhatsApp solution for wellness studios
                </p>
              </div>

              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6">
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Email address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your email"
                            className="h-12 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base bg-foreground text-background hover:bg-foreground/90"
                    disabled={isLoading}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </Form>

              <div className="mt-6">
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-muted-foreground/20" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-background text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 text-base"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 mr-2" />
                  Google
                </Button>
              </div>
            </>
          )}

          {step === 'login' && (
            <>
              <div className="mb-8">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="mb-6 p-0 h-auto text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                
                <h1 className="text-3xl font-bold mb-4">Welcome back</h1>
                <p className="text-muted-foreground">
                  Sign in to your account: <strong>{email}</strong>
                </p>
              </div>

              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className="h-12 text-base pr-10"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <Eye className="w-4 h-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base bg-foreground text-background hover:bg-foreground/90"
                    disabled={isLoading}
                  >
                    Sign in
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </Form>
            </>
          )}

          {step === 'register' && (
            <>
              <div className="mb-8">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="mb-6 p-0 h-auto text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                
                <h1 className="text-3xl font-bold mb-4">Create your account</h1>
                <p className="text-muted-foreground mb-6">
                  Join thousands of wellness professionals using Nimos
                </p>

                {/* Location Detection Banner */}
                <LocationDetectionBanner
                  detectedCountry={locationData?.country || ''}
                  isDetecting={isDetecting}
                  detectionError={detectionError}
                  onChangeLocation={() => setShowLocationSettings(true)}
                />
              </div>

              <Form {...registrationForm}>
                <form onSubmit={registrationForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={registrationForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">First name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="First name"
                              className="h-12 text-base"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registrationForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Last name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Last name"
                              className="h-12 text-base"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={registrationForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Phone number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={locationData?.phonePrefix ? `${locationData.phonePrefix} 123456789` : "Phone number"}
                            className="h-12 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registrationForm.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Country</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 text-base">
                              <SelectValue placeholder="Select your country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country.code} value={country.name}>
                                {country.flag} {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registrationForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a strong password"
                              className="h-12 text-base pr-10"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <Eye className="w-4 h-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registrationForm.control}
                    name="acceptTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">
                            I agree to the{' '}
                            <a href="/terms" className="text-primary underline hover:no-underline">
                              Terms and Conditions
                            </a>{' '}
                            and{' '}
                            <a href="/privacy" className="text-primary underline hover:no-underline">
                              Privacy Policy
                            </a>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base bg-foreground text-background hover:bg-foreground/90"
                    disabled={isLoading}
                  >
                    Create account
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </Form>
            </>
          )}

          {step === 'email-confirmation' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ArrowRight className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Check your email</h1>
              <p className="text-muted-foreground mb-6">
                We've sent a confirmation link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary"
                  onClick={handleBack}
                >
                  try a different email address
                </Button>
              </p>
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
          <h2 className="text-2xl font-bold mb-2">WhatsApp-First Business Management</h2>
          <p className="text-white/90 text-lg">
            Manage your wellness studio seamlessly through the platform your clients already use
          </p>
        </div>
      </div>

      {/* Location Settings Modal */}
      {showLocationSettings && locationData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Update Location Settings</h3>
            <LocationSettings
              value={locationData}
              onChange={handleLocationChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;
