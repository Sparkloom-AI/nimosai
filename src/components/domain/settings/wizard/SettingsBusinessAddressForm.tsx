import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowRight, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { AddressAutocomplete, type AddressData } from '@/components/domain/locations/AddressAutocomplete';
import { locationsApi } from '@/api/locations';
import { Studio } from '@/types/studio';

const businessAddressSchema = z.object({
  address: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
});

type BusinessAddressFormData = z.infer<typeof businessAddressSchema>;

interface SettingsBusinessAddressFormProps {
  currentStudio: Studio;
  onComplete: () => void;
  onBack: () => void;
}

const SettingsBusinessAddressForm: React.FC<SettingsBusinessAddressFormProps> = ({ 
  currentStudio, 
  onComplete, 
  onBack 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<BusinessAddressFormData>({
    resolver: zodResolver(businessAddressSchema),
    defaultValues: {
      address: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
    },
  });

  const handleAddressSelect = (addressData: AddressData) => {
    console.log('SettingsBusinessAddressForm: Address selected:', addressData);
    
    // Update form fields with the selected address data
    form.setValue('address', addressData.address);
    form.setValue('city', addressData.city);
    form.setValue('state', addressData.state);
    form.setValue('postal_code', addressData.postal_code);
    form.setValue('country', addressData.country);
    
    // Clear any existing validation errors
    form.clearErrors();
    
    toast.success('Address selected and form fields filled automatically!');
  };

  const onSubmit = async (data: BusinessAddressFormData) => {
    setIsLoading(true);
    try {
      // Create a primary location for the studio
      await locationsApi.createLocation({
        studio_id: currentStudio.id,
        name: `${currentStudio.name} - Main Location`,
        address: data.address,
        city: data.city,
        state: data.state,
        postal_code: data.postal_code,
        country: data.country,
        is_primary: true,
      });

      toast.success('Business address added successfully!');
      onComplete();
    } catch (error) {
      console.error('Error adding business address:', error);
      toast.error('Failed to add business address');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">Settings Wizard • Step 2 of 4</p>
              <h1 className="text-3xl font-bold mb-4">
                Add your business address
              </h1>
              <p className="text-muted-foreground">
                Enter your main business location. Our worldwide search will help you find the exact address.
              </p>
            </div>
          </div>

          {/* Address Search */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">
              Search for your address worldwide
            </label>
            <AddressAutocomplete
              onAddressSelect={handleAddressSelect}
              placeholder="Type any address worldwide (e.g., 123 Main St, New York)"
              value=""
            />
            <p className="text-xs text-muted-foreground mt-2">
              🌍 Global search enabled - find addresses from any country. Select from suggestions to auto-fill the form below.
            </p>
          </div>

          {/* Manual Form */}
          <div className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Street Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123 Business Street"
                          className="h-12 text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">City</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="City"
                            className="h-12 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">State/Province</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="State"
                            className="h-12 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="postal_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Postal Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="12345"
                            className="h-12 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Country</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Country"
                            className="h-12 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="h-12 px-8"
                  >
                    Back
                  </Button>
                  
                  <Button 
                    type="submit" 
                    className="h-12 px-8 bg-foreground text-background hover:bg-foreground/90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Continue'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>
            </Form>
          </div>
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
          <h2 className="text-2xl font-bold mb-2">Set Your Location</h2>
          <p className="text-white/90 text-lg">
            Help clients find you with accurate address information from anywhere in the world
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsBusinessAddressForm;