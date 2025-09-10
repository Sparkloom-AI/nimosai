import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Phone, Mail, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { StepActions } from '@/components/domain/settings/StepActions';
import { useToast } from '@/components/ui/use-toast';
import { studiosApi } from '@/api/studios';
import { useRole } from '@/contexts/RoleContext';

const formSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

interface ContactInformationStepProps {
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  isLastStep?: boolean;
}

export const ContactInformationStep = ({ 
  onNext, 
  onPrevious, 
  hasNext = true, 
  hasPrevious = false,
  isLastStep = false 
}: ContactInformationStepProps) => {
  const { toast } = useToast();
  const { currentStudio, refreshRoles } = useRole();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: '',
      email: '',
      website: '',
    },
  });

  useEffect(() => {
    if (currentStudio) {
      form.reset({
        phone: currentStudio.phone || '',
        email: currentStudio.email || '',
        website: currentStudio.website || '',
      });
    }
  }, [currentStudio, form]);

  const onSubmit = async (data: FormData) => {
    if (!currentStudio) return;

    setLoading(true);
    try {
      await studiosApi.updateStudio(currentStudio.id, {
        phone: data.phone,
        email: data.email,
        website: data.website,
      });

      await refreshRoles();
      
      toast({
        title: 'Success',
        description: 'Contact information updated successfully',
      });
      // Stay on the page after save; navigation is handled by explicit buttons
    } catch (error) {
      console.error('Error updating contact information:', error);
      toast({
        title: 'Error',
        description: 'Failed to update contact information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </FormLabel>
              <FormControl>
                <Input placeholder="+1 (555) 123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </FormLabel>
              <FormControl>
                <Input placeholder="business@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Website
              </FormLabel>
              <FormControl>
                <Input placeholder="https://www.example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
          
          {/* Navigation Buttons */}
          <StepActions
            onPrevious={onPrevious}
            onNext={onNext}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            isLastStep={isLastStep}
          />
        </div>
      </form>
    </Form>
  );
};