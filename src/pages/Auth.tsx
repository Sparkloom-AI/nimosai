import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Mail, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { LocationSettings, detectLocationFromTimezone } from '@/components/auth/LocationSettings';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const passwordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const professionalAccountSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  mobileNumber: z.string().min(1, 'Mobile number is required'),
  country: z.string().min(1, 'Country is required'),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

type EmailFormData = z.infer<typeof emailSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;
type ProfessionalAccountFormData = z.infer<typeof professionalAccountSchema>;

interface LocationData {
  country: string;
  countryCode: string;
  phonePrefix: string;
  timezone: string;
  currency: string;
  language: string;
}

const Auth = () => {
  const [step, setStep] = useState<'email' | 'password' | 'professional' | 'signup'>('email');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPhonePrefix, setSelectedPhonePrefix] = useState('');
  const [locationData, setLocationData] = useState<LocationData>({
    country: '',
    countryCode: '',
    phonePrefix: '',
    timezone: '',
    currency: '',
    language: 'English'
  });
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '' },
  });

  const professionalForm = useForm<ProfessionalAccountFormData>({
    resolver: zodResolver(professionalAccountSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      password: '',
      mobileNumber: '',
      country: '',
      agreeToTerms: false,
    },
  });

  // Auto-detect location on component mount
  useEffect(() => {
    const detected = detectLocationFromTimezone();
    setLocationData(detected);
    setSelectedPhonePrefix(detected.phonePrefix);
    professionalForm.setValue('country', detected.country);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const onEmailSubmit = async (data: EmailFormData) => {
    setEmail(data.email);
    setStep('professional');
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(email, data.password);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password');
        } else {
          toast.error(error.message || 'Failed to sign in');
        }
      } else {
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const onProfessionalAccountSubmit = async (data: ProfessionalAccountFormData) => {
    setIsLoading(true);
    try {
      const fullName = `${data.firstName} ${data.lastName}`;
      const { error } = await signUp(email, data.password, fullName);
      
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('An account with this email already exists. Please sign in instead.');
          setStep('password');
        } else {
          toast.error(error.message || 'Failed to create account');
        }
      } else {
        toast.success('Account created! Please check your email to verify your account.');
        navigate('/dashboard');
      }
    } catch (error) {
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
        setIsLoading(false);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (step === 'professional') {
      setStep('email');
      emailForm.setValue('email', email);
    } else if (step === 'password') {
      setStep('email');
      emailForm.setValue('email', email);
    } else {
      navigate('/');
    }
  };

  const handleLocationDataChange = (newLocationData: LocationData) => {
    setLocationData(newLocationData);
    setSelectedPhonePrefix(newLocationData.phonePrefix);
    professionalForm.setValue('country', newLocationData.country);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="mb-6 p-0 h-auto text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            {step !== 'professional' && (
              <>
                <h1 className="text-3xl font-bold mb-2">Nimos for professionals</h1>
                <p className="text-muted-foreground">
                  Create an account or log in to manage your business.
                </p>
              </>
            )}
          </div>

          {/* Email Step */}
          {step === 'email' && (
            <div className="space-y-6">
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Enter your email address"
                            type="email"
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
                  </Button>
                </form>
              </Form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">OR</span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full h-12 text-base justify-start"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground mt-8">
                Are you a customer looking to book an appointment?{' '}
                <Button variant="link" className="p-0 h-auto text-primary">
                  Go to Nimos for customers
                </Button>
              </div>
            </div>
          )}

          {/* Professional Account Creation Step */}
          {step === 'professional' && (
            <div className="space-y-6">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold mb-2">Create a professional account</h1>
                <p className="text-muted-foreground text-sm">
                  You're almost there! Create your new account for{' '}
                  <span className="font-medium">{email}</span> by completing these details.
                </p>
              </div>

              <Form {...professionalForm}>
                <form onSubmit={professionalForm.handleSubmit(onProfessionalAccountSubmit)} className="space-y-5">
                  <FormField
                    control={professionalForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">First name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your first name"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={professionalForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Last name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your last name"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={professionalForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter a password"
                              className="h-11 pr-10"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={professionalForm.control}
                    name="mobileNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Mobile number</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <Select value={selectedPhonePrefix} onValueChange={setSelectedPhonePrefix}>
                              <SelectTrigger className="w-32 h-11 rounded-r-none border-r-0">
                                <SelectValue placeholder="Code" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="+93">🇦🇫 +93</SelectItem>
                                <SelectItem value="+355">🇦🇱 +355</SelectItem>
                                <SelectItem value="+213">🇩🇿 +213</SelectItem>
                                <SelectItem value="+54">🇦🇷 +54</SelectItem>
                                <SelectItem value="+374">🇦🇲 +374</SelectItem>
                                <SelectItem value="+61">🇦🇺 +61</SelectItem>
                                <SelectItem value="+43">🇦🇹 +43</SelectItem>
                                <SelectItem value="+994">🇦🇿 +994</SelectItem>
                                <SelectItem value="+973">🇧🇭 +973</SelectItem>
                                <SelectItem value="+880">🇧🇩 +880</SelectItem>
                                <SelectItem value="+375">🇧🇾 +375</SelectItem>
                                <SelectItem value="+32">🇧🇪 +32</SelectItem>
                                <SelectItem value="+591">🇧🇴 +591</SelectItem>
                                <SelectItem value="+55">🇧🇷 +55</SelectItem>
                                <SelectItem value="+359">🇧🇬 +359</SelectItem>
                                <SelectItem value="+1">🇨🇦 +1</SelectItem>
                                <SelectItem value="+56">🇨🇱 +56</SelectItem>
                                <SelectItem value="+86">🇨🇳 +86</SelectItem>
                                <SelectItem value="+57">🇨🇴 +57</SelectItem>
                                <SelectItem value="+385">🇭🇷 +385</SelectItem>
                                <SelectItem value="+420">🇨🇿 +420</SelectItem>
                                <SelectItem value="+45">🇩🇰 +45</SelectItem>
                                <SelectItem value="+593">🇪🇨 +593</SelectItem>
                                <SelectItem value="+20">🇪🇬 +20</SelectItem>
                                <SelectItem value="+372">🇪🇪 +372</SelectItem>
                                <SelectItem value="+251">🇪🇹 +251</SelectItem>
                                <SelectItem value="+358">🇫🇮 +358</SelectItem>
                                <SelectItem value="+33">🇫🇷 +33</SelectItem>
                                <SelectItem value="+995">🇬🇪 +995</SelectItem>
                                <SelectItem value="+49">🇩🇪 +49</SelectItem>
                                <SelectItem value="+233">🇬🇭 +233</SelectItem>
                                <SelectItem value="+30">🇬🇷 +30</SelectItem>
                                <SelectItem value="+502">🇬🇹 +502</SelectItem>
                                <SelectItem value="+852">🇭🇰 +852</SelectItem>
                                <SelectItem value="+36">🇭🇺 +36</SelectItem>
                                <SelectItem value="+354">🇮🇸 +354</SelectItem>
                                <SelectItem value="+91">🇮🇳 +91</SelectItem>
                                <SelectItem value="+62">🇮🇩 +62</SelectItem>
                                <SelectItem value="+98">🇮🇷 +98</SelectItem>
                                <SelectItem value="+964">🇮🇶 +964</SelectItem>
                                <SelectItem value="+353">🇮🇪 +353</SelectItem>
                                <SelectItem value="+972">🇮🇱 +972</SelectItem>
                                <SelectItem value="+39">🇮🇹 +39</SelectItem>
                                <SelectItem value="+81">🇯🇵 +81</SelectItem>
                                <SelectItem value="+962">🇯🇴 +962</SelectItem>
                                <SelectItem value="+7">🇰🇿 +7</SelectItem>
                                <SelectItem value="+254">🇰🇪 +254</SelectItem>
                                <SelectItem value="+965">🇰🇼 +965</SelectItem>
                                <SelectItem value="+996">🇰🇬 +996</SelectItem>
                                <SelectItem value="+371">🇱🇻 +371</SelectItem>
                                <SelectItem value="+961">🇱🇧 +961</SelectItem>
                                <SelectItem value="+218">🇱🇾 +218</SelectItem>
                                <SelectItem value="+370">🇱🇹 +370</SelectItem>
                                <SelectItem value="+352">🇱🇺 +352</SelectItem>
                                <SelectItem value="+853">🇲🇴 +853</SelectItem>
                                <SelectItem value="+60">🇲🇾 +60</SelectItem>
                                <SelectItem value="+960">🇲🇻 +960</SelectItem>
                                <SelectItem value="+356">🇲🇹 +356</SelectItem>
                                <SelectItem value="+52">🇲🇽 +52</SelectItem>
                                <SelectItem value="+373">🇲🇩 +373</SelectItem>
                                <SelectItem value="+976">🇲🇳 +976</SelectItem>
                                <SelectItem value="+212">🇲🇦 +212</SelectItem>
                                <SelectItem value="+31">🇳🇱 +31</SelectItem>
                                <SelectItem value="+64">🇳🇿 +64</SelectItem>
                                <SelectItem value="+234">🇳🇬 +234</SelectItem>
                                <SelectItem value="+47">🇳🇴 +47</SelectItem>
                                <SelectItem value="+968">🇴🇲 +968</SelectItem>
                                <SelectItem value="+92">🇵🇰 +92</SelectItem>
                                <SelectItem value="+51">🇵🇪 +51</SelectItem>
                                <SelectItem value="+63">🇵🇭 +63</SelectItem>
                                <SelectItem value="+48">🇵🇱 +48</SelectItem>
                                <SelectItem value="+351">🇵🇹 +351</SelectItem>
                                <SelectItem value="+974">🇶🇦 +974</SelectItem>
                                <SelectItem value="+40">🇷🇴 +40</SelectItem>
                                <SelectItem value="+7">🇷🇺 +7</SelectItem>
                                <SelectItem value="+966">🇸🇦 +966</SelectItem>
                                <SelectItem value="+65">🇸🇬 +65</SelectItem>
                                <SelectItem value="+421">🇸🇰 +421</SelectItem>
                                <SelectItem value="+386">🇸🇮 +386</SelectItem>
                                <SelectItem value="+27">🇿🇦 +27</SelectItem>
                                <SelectItem value="+82">🇰🇷 +82</SelectItem>
                                <SelectItem value="+34">🇪🇸 +34</SelectItem>
                                <SelectItem value="+94">🇱🇰 +94</SelectItem>
                                <SelectItem value="+46">🇸🇪 +46</SelectItem>
                                <SelectItem value="+41">🇨🇭 +41</SelectItem>
                                <SelectItem value="+963">🇸🇾 +963</SelectItem>
                                <SelectItem value="+886">🇹🇼 +886</SelectItem>
                                <SelectItem value="+66">🇹🇭 +66</SelectItem>
                                <SelectItem value="+216">🇹🇳 +216</SelectItem>
                                <SelectItem value="+90">🇹🇷 +90</SelectItem>
                                <SelectItem value="+380">🇺🇦 +380</SelectItem>
                                <SelectItem value="+971">🇦🇪 +971</SelectItem>
                                <SelectItem value="+44">🇬🇧 +44</SelectItem>
                                <SelectItem value="+1">🇺🇸 +1</SelectItem>
                                <SelectItem value="+598">🇺🇾 +598</SelectItem>
                                <SelectItem value="+998">🇺🇿 +998</SelectItem>
                                <SelectItem value="+58">🇻🇪 +58</SelectItem>
                                <SelectItem value="+84">🇻🇳 +84</SelectItem>
                                <SelectItem value="+967">🇾🇪 +967</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="Enter your mobile number"
                              className="h-11 rounded-l-none flex-1"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={professionalForm.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Country</FormLabel>
                        <FormControl>
                          <LocationSettings
                            value={locationData}
                            onChange={handleLocationDataChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={professionalForm.control}
                    name="agreeToTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-1"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            I agree to the{' '}
                            <Button variant="link" className="p-0 h-auto text-primary">
                              Privacy Policy
                            </Button>
                            ,{' '}
                            <Button variant="link" className="p-0 h-auto text-primary">
                              Terms of Service
                            </Button>
                            {' '}and{' '}
                            <Button variant="link" className="p-0 h-auto text-primary">
                              Terms of Business
                            </Button>
                            .
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
                    {isLoading ? 'Creating account...' : 'Create account'}
                  </Button>
                </form>
              </Form>

              <div className="text-center text-xs text-muted-foreground">
                This site is protected by reCAPTCHA.<br />
                Google Privacy Policy and Terms of Service apply
              </div>
            </div>
          )}

          {/* Password Step */}
          {step === 'password' && (
            <div className="space-y-6">
              <div className="text-sm text-muted-foreground mb-4">
                <Mail className="w-4 h-4 inline mr-2" />
                {email}
              </div>
              
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Enter your password"
                            type="password"
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
                    {isLoading ? 'Signing in...' : 'Continue'}
                  </Button>
                </form>
              </Form>

              <div className="text-center">
                <Button 
                  variant="link" 
                  className="text-primary"
                  onClick={() => setStep('password')}
                >
                  Already have an account? Sign in
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Image/Background */}
      <div className="hidden lg:block flex-1 bg-muted relative overflow-hidden">
        <img
          src="/lovable-uploads/7499d942-cbd7-4aec-a6ab-9c473cecfe01.png"
          alt="Professional working"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
      </div>
    </div>
  );
};

export default Auth;
