import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { studiosApi } from '@/api/studios';
import { businessCategoriesApi } from '@/api/businessCategories';
import { supabase } from '@/integrations/supabase/client';
import { Studio } from '@/types/studio';

const businessSetupSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
});

type BusinessSetupFormData = z.infer<typeof businessSetupSchema>;

interface SettingsBusinessSetupFormProps {
  currentStudio: Studio;
  onComplete: (data: BusinessSetupFormData) => void;
  onBack: () => void;
}

const SettingsBusinessSetupForm: React.FC<SettingsBusinessSetupFormProps> = ({ 
  currentStudio, 
  onComplete, 
  onBack 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);

  const form = useForm<BusinessSetupFormData>({
    resolver: zodResolver(businessSetupSchema),
    defaultValues: {
      name: currentStudio.name || '',
      website: currentStudio.website || '',
      description: currentStudio.description || '',
      phone: currentStudio.phone || '',
      email: currentStudio.email || '',
    },
  });

  const generateDescription = async () => {
    const businessName = form.getValues('name');
    if (!businessName.trim()) {
      toast.error('Please enter a business name first');
      return;
    }

    setGeneratingDescription(true);
    try {
      // Get primary category for better description generation
      const studioCategories = await businessCategoriesApi.getStudioCategories(currentStudio.id);
      const primaryCategory = studioCategories.data?.find(cat => cat.is_primary);
      
      const { data, error } = await supabase.functions.invoke('generate-business-description', {
        body: {
          businessName,
          businessCategory: primaryCategory?.category_name || 'Business',
        },
      });

      if (error) throw error;

      if (data?.description) {
        form.setValue('description', data.description);
        toast.success('Description generated successfully!');
      }
    } catch (error) {
      console.error('Error generating description:', error);
      toast.error('Failed to generate description. Please try again.');
    } finally {
      setGeneratingDescription(false);
    }
  };

  const onSubmit = async (data: BusinessSetupFormData) => {
    setIsLoading(true);
    try {
      // Update studio in database
      await studiosApi.updateStudio(currentStudio.id, {
        name: data.name,
        website: data.website,
        description: data.description,
        phone: data.phone,
        email: data.email,
      });

      toast.success('Business information updated successfully!');
      onComplete(data);
    } catch (error) {
      console.error('Error updating business info:', error);
      toast.error('Failed to update business information');
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
              <p className="text-sm text-muted-foreground mb-2">Settings Wizard • Step 1 of 4</p>
              <h1 className="text-3xl font-bold mb-4">
                Update your business information
              </h1>
              <p className="text-muted-foreground">
                Keep your business details current for the best experience with your clients.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Business name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your business name"
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
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Website <span className="text-muted-foreground">(Optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://www.yoursite.com"
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center justify-between text-sm font-medium">
                        Description <span className="text-muted-foreground">(Optional)</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={generateDescription}
                          disabled={generatingDescription}
                          className="ml-2 h-8"
                        >
                          {generatingDescription ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <Sparkles className="h-3 w-3 mr-1" />
                          )}
                          {generatingDescription ? 'Generating...' : 'Generate with AI'}
                        </Button>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your business..."
                          className="min-h-[100px] text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Phone <span className="text-muted-foreground">(Optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+1 (555) 123-4567"
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Email <span className="text-muted-foreground">(Optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="business@example.com"
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
          <h2 className="text-2xl font-bold mb-2">Update Your Business</h2>
          <p className="text-white/90 text-lg">
            Keep your business information current and easily discoverable by clients
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsBusinessSetupForm;