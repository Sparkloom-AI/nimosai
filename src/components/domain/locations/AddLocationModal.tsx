import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { locationsApi } from '@/api/locations';
import { useRole } from '@/contexts/RoleContext';
import { useSecurityValidation } from '@/hooks/useSecurityValidation';
import { toast } from '@/hooks/use-toast';
import { AddressAutocomplete } from './AddressAutocomplete';
import { GoogleMapViewer } from './GoogleMapViewer';
import { MapPin, Building, Phone, Star, Loader2 } from 'lucide-react';
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

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddLocationModal: React.FC<AddLocationModalProps> = ({
  isOpen,
  onClose
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
    if (!currentStudioId) {
      toast({
        title: "Error",
        description: "No studio selected",
        variant: "destructive",
      });
      return;
    }

    // Security validation
    const validationResult = await validateForm({
      name: data.name,
      address: data.address,
      city: data.city,
      state: data.state,
      phone: data.phone || ''
    });

    if (!validationResult.isValid || !validationResult.sanitizedData) {
      return;
    }

    setIsSubmitting(true);

    try {
      const locationData = {
        studio_id: currentStudioId,
        name: validationResult.sanitizedData.name,
        address: data.has_no_address ? 'Mobile/Online Service' : validationResult.sanitizedData.address,
        city: data.has_no_address ? 'N/A' : validationResult.sanitizedData.city,
        state: data.has_no_address ? 'N/A' : validationResult.sanitizedData.state,
        postal_code: data.has_no_address ? '00000' : data.postal_code,
        country: data.country,
        phone: validationResult.sanitizedData.phone,
        is_primary: data.is_primary,
        place_id: data.place_id,
        latitude: data.latitude,
        longitude: data.longitude,
      };

      await locationsApi.createLocation(locationData);
      
      toast({
        title: "Location added",
        description: "New location has been successfully created.",
      });

      queryClient.invalidateQueries({ queryKey: ['locations', currentStudioId] });
      reset();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create location. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Add Business Location
          </DialogTitle>
          <DialogDescription>
            Add a new location for your business. This can be a physical address or mark as mobile/online service.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-4 w-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* Address Information */}
          {!hasNoAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Business Address
                </CardTitle>
                <CardDescription>
                  Start typing your address and select from suggestions for accurate location data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AddressAutocomplete
                  onAddressSelect={handleAddressSelect}
                  placeholder="Start typing your business address..."
                />

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

                  {/* Map Preview */}
                  {(watch('latitude') && watch('longitude')) && (
                    <div className="mt-4">
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
              </CardContent>
            </Card>
          )}

          {/* Contact & Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contact & Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  {...register('phone')}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_primary"
                  {...register('is_primary')}
                />
                <Label htmlFor="is_primary" className="text-sm flex items-center gap-2">
                  <Star className="h-3 w-3" />
                  Set as primary location
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Add Location
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};