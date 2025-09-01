import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Facebook, Instagram, Globe, Plus, X, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { studiosApi } from '@/api/studios';
import { businessCategoriesApi } from '@/api/businessCategories';
import { useRole } from '@/contexts/RoleContext';
import { BusinessCategory } from '@/types/studio';
import { supabase } from '@/integrations/supabase/client';

const TikTokIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const formSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  facebook_url: z.string().url('Invalid Facebook URL').optional().or(z.literal('')),
  instagram_url: z.string().url('Invalid Instagram URL').optional().or(z.literal('')),
  tiktok_url: z.string().url('Invalid TikTok URL').optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

export const EnhancedBusinessDetailsForm = () => {
  const { toast } = useToast();
  const { currentStudio, refreshRoles } = useRole();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [businessCategories, setBusinessCategories] = useState<BusinessCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [primaryCategory, setPrimaryCategory] = useState<string>('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      phone: '',
      email: '',
      website: '',
      facebook_url: '',
      instagram_url: '',
      tiktok_url: '',
    },
  });

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        // Load business categories
        const categories = await businessCategoriesApi.getBusinessCategories();
        setBusinessCategories(categories);

        if (currentStudio) {
          // Load current studio data
          const formData = {
            name: currentStudio.name || '',
            description: currentStudio.description || '',
            phone: currentStudio.phone || '',
            email: currentStudio.email || '',
            website: currentStudio.website || '',
            facebook_url: currentStudio.facebook_url || '',
            instagram_url: currentStudio.instagram_url || '',
            tiktok_url: currentStudio.tiktok_url || '',
          };
          
          form.reset(formData);

          // Load studio categories
          const studioCategoriesResponse = await businessCategoriesApi.getStudioCategories(currentStudio.id);
          const studioCategories = studioCategoriesResponse.data || [];
          
          const primary = studioCategories.find(cat => cat.is_primary);
          const additional = studioCategories.filter(cat => !cat.is_primary);
          
          setPrimaryCategory(primary?.category_id || '');
          setSelectedCategories(additional.map(cat => cat.category_id));
        }
      } catch (error) {
        console.error('Error loading business data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load business data',
          variant: 'destructive',
        });
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [currentStudio, form, toast]);

  const generateDescription = async () => {
    if (!currentStudio?.name || !primaryCategory) {
      toast({
        title: 'Missing Information',
        description: 'Please enter a business name and select a primary category first',
        variant: 'destructive',
      });
      return;
    }

    const primaryCategoryData = businessCategories.find(cat => cat.id === primaryCategory);
    if (!primaryCategoryData) return;

    setGeneratingDescription(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-business-description', {
        body: {
          businessName: currentStudio.name,
          businessCategory: primaryCategoryData.name,
        },
      });

      if (error) throw error;

      if (data?.description) {
        form.setValue('description', data.description);
        toast({
          title: 'Success',
          description: 'Description generated successfully!',
        });
      }
    } catch (error) {
      console.error('Error generating description:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate description. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setGeneratingDescription(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!currentStudio) return;

    setLoading(true);
    try {
      // Update studio basic info
      await studiosApi.updateStudio(currentStudio.id, {
        name: data.name,
        description: data.description,
        phone: data.phone,
        email: data.email,
        website: data.website,
        facebook_url: data.facebook_url,
        instagram_url: data.instagram_url,
        tiktok_url: data.tiktok_url,
      });

      // Update business categories if primary category is selected
      if (primaryCategory) {
        await studiosApi.updateStudioCategories(
          currentStudio.id,
          primaryCategory,
          selectedCategories
        );
      }

      await refreshRoles();
      
      toast({
        title: 'Success',
        description: 'Business details updated successfully',
      });
    } catch (error) {
      console.error('Error updating studio:', error);
      toast({
        title: 'Error',
        description: 'Failed to update business details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId].slice(0, 3) // Max 3 additional categories
    );
  };

  if (loadingData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
          <p className="text-sm text-muted-foreground">
            Loading business details...
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
          <p className="text-sm text-muted-foreground">
            Update your business information and contact details
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter business name" {...field} />
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="business@example.com" {...field} />
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
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
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
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      Description
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateDescription}
                        disabled={generatingDescription}
                        className="ml-2"
                      >
                        {generatingDescription ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        {generatingDescription ? 'Generating...' : 'Generate with AI'}
                      </Button>
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell customers about your business..."
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Social Media</h3>
                <div className="grid gap-4 md:grid-cols-2">
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
                </div>

                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Categories</CardTitle>
          <p className="text-sm text-muted-foreground">
            Select your primary business category and up to 3 additional categories
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Primary Category</label>
            <Select value={primaryCategory} onValueChange={setPrimaryCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select primary category" />
              </SelectTrigger>
              <SelectContent>
                {businessCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Additional Categories (optional)</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedCategories.map((categoryId) => {
                const category = businessCategories.find(c => c.id === categoryId);
                return category ? (
                  <Badge key={categoryId} variant="secondary" className="flex items-center gap-1">
                    {category.name}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => toggleCategory(categoryId)}
                    />
                  </Badge>
                ) : null;
              })}
              
              {selectedCategories.length < 3 && (
                <Select value="" onValueChange={toggleCategory}>
                  <SelectTrigger className="w-auto">
                    <div className="flex items-center gap-1">
                      <Plus className="h-3 w-3" />
                      <SelectValue placeholder="Add category" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {businessCategories
                      .filter(category => 
                        category.id !== primaryCategory && 
                        !selectedCategories.includes(category.id)
                      )
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};