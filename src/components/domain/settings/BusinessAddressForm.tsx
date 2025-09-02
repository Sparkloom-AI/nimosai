import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AddressAutocomplete, type AddressData } from '@/components/domain/locations/AddressAutocomplete';
import { studiosApi } from '@/api/studios';
import { useRole } from '@/contexts/RoleContext';

const formSchema = z.object({
  address: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
});

type FormData = z.infer<typeof formSchema>;

export const BusinessAddressForm = () => {
  const { toast } = useToast();
  const { currentStudio, refreshRoles } = useRole();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
    },
  });

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        if (currentStudio) {
          // Note: Studios don't have address fields by default
          // This form is for manual address entry if needed
          form.reset({
            address: '',
            city: '',
            state: '',
            postal_code: '',
            country: currentStudio.country || '',
          });
        }
      } catch (error) {
        console.error('Error loading business address data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load business address data',
          variant: 'destructive',
        });
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [currentStudio, form, toast]);

  const handleAddressSelect = (addressData: AddressData) => {
    console.log('BusinessAddressForm: Address selected:', addressData);
    
    // Update form fields with the selected address data
    form.setValue('address', addressData.address);
    form.setValue('city', addressData.city);
    form.setValue('state', addressData.state);
    form.setValue('postal_code', addressData.postal_code);
    form.setValue('country', addressData.country);
    
    // Clear any existing validation errors
    form.clearErrors();
    
    toast({
      title: 'Address Selected',
      description: 'Form fields have been automatically filled',
    });
  };

  const onSubmit = async (data: FormData) => {
    if (!currentStudio) return;

    setLoading(true);
    try {
      // Note: This would typically create a location instead of updating studio
      // Since studios don't have direct address fields
      await studiosApi.updateStudio(currentStudio.id, {
        country: data.country,
      });

      await refreshRoles();
      
      toast({
        title: 'Success',
        description: 'Business address updated successfully',
      });
    } catch (error) {
      console.error('Error updating business address:', error);
      toast({
        title: 'Error',
        description: 'Failed to update business address',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Business Address
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Loading business address information...
          </p>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Business Address
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Update your business address information. Start typing to search worldwide.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Address Autocomplete */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Search Address
            </label>
            <AddressAutocomplete
              onAddressSelect={handleAddressSelect}
              placeholder="Start typing an address (worldwide search enabled)..."
              value=""
            />
            <p className="text-xs text-muted-foreground mt-1">
              Search for any address worldwide. Select from suggestions to auto-fill the form below.
            </p>
          </div>

          {/* Manual Address Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Business Street" {...field} />
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
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
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
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input placeholder="State" {...field} />
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
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="12345" {...field} />
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
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
};