import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Facebook, Instagram, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { studiosApi } from '@/api/studios';
import { useRole } from '@/contexts/RoleContext';

const TikTokIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const formSchema = z.object({
  facebook_url: z.string().url('Invalid Facebook URL').optional().or(z.literal('')),
  instagram_url: z.string().url('Invalid Instagram URL').optional().or(z.literal('')),
  tiktok_url: z.string().url('Invalid TikTok URL').optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

interface SocialMediaStepProps {
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export const SocialMediaStep = ({
  onNext,
  onPrevious,
  hasNext,
  hasPrevious
}: SocialMediaStepProps = {}) => {
  const { toast } = useToast();
  const { currentStudio, refreshRoles } = useRole();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      facebook_url: '',
      instagram_url: '',
      tiktok_url: '',
    },
  });

  useEffect(() => {
    if (currentStudio) {
      form.reset({
        facebook_url: currentStudio.facebook_url || '',
        instagram_url: currentStudio.instagram_url || '',
        tiktok_url: currentStudio.tiktok_url || '',
      });
    }
  }, [currentStudio, form]);

  const onSubmit = async (data: FormData) => {
    if (!currentStudio) return;

    setLoading(true);
    try {
      await studiosApi.updateStudio(currentStudio.id, {
        facebook_url: data.facebook_url,
        instagram_url: data.instagram_url,
        tiktok_url: data.tiktok_url,
      });

      await refreshRoles();
      
      toast({
        title: 'Success',
        description: 'Social media links updated successfully',
      });
    } catch (error) {
      console.error('Error updating social media links:', error);
      toast({
        title: 'Error',
        description: 'Failed to update social media links',
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
          name="facebook_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Facebook className="h-4 w-4 text-blue-600" />
                Facebook
              </FormLabel>
              <FormControl>
                <Input placeholder="https://facebook.com/yourbusiness" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="instagram_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-pink-600" />
                Instagram
              </FormLabel>
              <FormControl>
                <Input placeholder="https://instagram.com/yourbusiness" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tiktok_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <TikTokIcon />
                TikTok
              </FormLabel>
              <FormControl>
                <Input placeholder="https://tiktok.com/@yourbusiness" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onPrevious} disabled={!hasPrevious}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button onClick={onNext} disabled={!hasNext}>
            {hasNext ? (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            ) : (
              'Complete Section'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};