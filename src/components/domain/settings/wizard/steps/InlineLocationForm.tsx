import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { locationsApi } from '@/api/locations';
import { useRole } from '@/contexts/RoleContext';
import { useSecurityValidation } from '@/hooks/useSecurityValidation';
import { toast } from '@/hooks/use-toast';
import { AddressAutocomplete } from '@/components/domain/locations/AddressAutocomplete';
import { GoogleMapViewer } from '@/components/domain/locations/GoogleMapViewer';
import { MapPin, Building, Phone, Loader2, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const locationSchema = z.object({
  name: z.string().min(1, 'Location name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().optional(),
  is_primary: z.boolean().default(false),
  has_no_address: z.boolean().default(false),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  place_id: z.string().optional(),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface InlineLocationFormProps {
  onClose: () => void;
  onLocationAdded: () => void;
}

export const InlineLocationForm: React.FC<InlineLocationFormProps> = ({
  onClose,
  onLocationAdded
}) => {
  const { currentStudioId } = useRole();
  const queryClient = useQueryClient();
  const { validateForm, isValidating } = useSecurityValidation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      country: 'US',
      is_primary: false,
      has_no_address: false,
    }
  });

  const hasNoAddress = watch('has_no_address');

  const handleAddressSelect = (addressData: {
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    place_id?: string;
    latitude?: number;
    longitude?: number;
  }) => {
    setValue('address', addressData.address);
    setValue('city', addressData.city);
    setValue('state', addressData.state);
    setValue('postal_code', addressData.postal_code);
    setValue('country', addressData.country);
    if (addressData.place_id) setValue('place_id', addressData.place_id);
    if (addressData.latitude) setValue('latitude', addressData.latitude);
    if (addressData.longitude) setValue('longitude', addressData.longitude);
  };

  const onSubmit = async (data: LocationFormData) => {
    if (!currentStudioId) return;

    const validationResult = await validateForm(data);
    if (!validationResult.isValid) {
      toast({
        title: "Security Validation Failed",
        description: validationResult.message,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await locationsApi.createLocation({
        studio_id: currentStudioId,
        ...data,
      });

      queryClient.invalidateQueries({ queryKey: ['locations', currentStudioId] });
      reset();
      onLocationAdded();
      
      toast({
        title: "Success",
        description: "Location added successfully",
      });
    } catch (error) {
      console.error('Error creating location:', error);
      toast({
        title: "Error",
        description: "Failed to add location. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Add New Location
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Location Name</Label>
              <Input
                id="name"
                placeholder="e.g., Main Studio, Downtown Location"
                {...register('name')}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_no_address"
                checked={hasNoAddress}
                onCheckedChange={(checked) => setValue('has_no_address', !!checked)}
              />
              <Label htmlFor="has_no_address" className="text-sm">
                I don't have a business address (mobile/online service)
              </Label>
            </div>
          </div>

          {/* Address Information */}
          {!hasNoAddress && (
            <div className="space-y-4">
              <div>
                <Label>Business Address</Label>
                <AddressAutocomplete
                  onAddressSelect={handleAddressSelect}
                  placeholder="Start typing your business address..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Business St"
                    {...register('address')}
                    className={errors.address ? 'border-destructive' : ''}
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    {...register('city')}
                    className={errors.city ? 'border-destructive' : ''}
                  />
                  {errors.city && (
                    <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    placeholder="State"
                    {...register('state')}
                    className={errors.state ? 'border-destructive' : ''}
                  />
                  {errors.state && (
                    <p className="text-sm text-destructive mt-1">{errors.state.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    placeholder="12345"
                    {...register('postal_code')}
                    className={errors.postal_code ? 'border-destructive' : ''}
                  />
                  {errors.postal_code && (
                    <p className="text-sm text-destructive mt-1">{errors.postal_code.message}</p>
                  )}
                </div>
              </div>

              {/* Map Preview */}
              {(watch('latitude') && watch('longitude')) && (
                <div>
                  <Label>Location Preview</Label>
                  <div className="mt-2">
                    <GoogleMapViewer
                      location={{
                        latitude: Number(watch('latitude')),
                        longitude: Number(watch('longitude')),
                        name: watch('name') || 'New Location',
                        address: watch('address') || ''
                      }}
                      height="200px"
                      draggable={false}
                      showControls={false}
                      className="border rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contact Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number (Optional)
              </Label>
              <Input
                id="phone"
                placeholder="+1 (555) 123-4567"
                {...register('phone')}
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_primary"
                {...register('is_primary')}
              />
              <Label htmlFor="is_primary" className="text-sm">
                Set as primary location
              </Label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting || isValidating}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Location...
                </>
              ) : (
                'Add Location'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
