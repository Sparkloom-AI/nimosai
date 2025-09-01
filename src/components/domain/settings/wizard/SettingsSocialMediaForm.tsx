import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowRight, Facebook, Instagram } from 'lucide-react';
import { toast } from 'sonner';
import { studiosApi } from '@/api/studios';
import { Studio } from '@/types/studio';

const TikTokIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const socialMediaSchema = z.object({
  facebook_url: z.string().url('Invalid Facebook URL').optional().or(z.literal('')),
  instagram_url: z.string().url('Invalid Instagram URL').optional().or(z.literal('')),
  tiktok_url: z.string().url('Invalid TikTok URL').optional().or(z.literal('')),
});

type SocialMediaFormData = z.infer<typeof socialMediaSchema>;

interface SettingsSocialMediaFormProps {
  currentStudio: Studio;
  onComplete: (data: SocialMediaFormData) => void;
  onBack: () => void;
}

const SettingsSocialMediaForm: React.FC<SettingsSocialMediaFormProps> = ({ 
  currentStudio, 
  onComplete, 
  onBack 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SocialMediaFormData>({
    resolver: zodResolver(socialMediaSchema),
    defaultValues: {
      facebook_url: currentStudio.facebook_url || '',
      instagram_url: currentStudio.instagram_url || '',
      tiktok_url: currentStudio.tiktok_url || '',
    },
  });

  const onSubmit = async (data: SocialMediaFormData) => {
    setIsLoading(true);
    try {
      // Update studio in database
      await studiosApi.updateStudio(currentStudio.id, {
        facebook_url: data.facebook_url,
        instagram_url: data.instagram_url,
        tiktok_url: data.tiktok_url,
      });

      toast.success('Social media links updated successfully!');
      onComplete(data);
    } catch (error) {
      console.error('Error updating social media:', error);
      toast.error('Failed to update social media links');
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
              <p className="text-sm text-muted-foreground mb-2">Settings Wizard • Step 3 of 4</p>
              <h1 className="text-3xl font-bold mb-4">
                Connect your social media
              </h1>
              <p className="text-muted-foreground">
                Add your social media links to help clients discover and connect with your business online.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="facebook_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium">
                        <Facebook className="h-4 w-4 text-blue-600" />
                        Facebook <span className="text-muted-foreground">(Optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://facebook.com/yourbusiness"
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
                  name="instagram_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium">
                        <Instagram className="h-4 w-4 text-pink-600" />
                        Instagram <span className="text-muted-foreground">(Optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://instagram.com/yourbusiness"
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
                  name="tiktok_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium">
                        <TikTokIcon />
                        TikTok <span className="text-muted-foreground">(Optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://tiktok.com/@yourbusiness"
                          className="h-12 text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4">
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
          <h2 className="text-2xl font-bold mb-2">Connect & Engage</h2>
          <p className="text-white/90 text-lg">
            Expand your reach with social media connections
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsSocialMediaForm;