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
import { Loader2, Facebook, Instagram, Twitter, Linkedin, Globe, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { studiosApi } from '@/api/studios';
import { businessCategoriesApi } from '@/api/businessCategories';
import { useRole } from '@/contexts/RoleContext';
import { BusinessCategory } from '@/types/studio';

const formSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  facebook_url: z.string().url('Invalid Facebook URL').optional().or(z.literal('')),
  instagram_url: z.string().url('Invalid Instagram URL').optional().or(z.literal('')),
  twitter_url: z.string().url('Invalid Twitter URL').optional().or(z.literal('')),
  linkedin_url: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

export const BusinessDetailsForm = () => {
  const { toast } = useToast();
  const { currentStudio, refreshRoles } = useRole();
  const [loading, setLoading] = useState(false);
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
      twitter_url: '',
      linkedin_url: '',
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('BusinessDetailsForm: Loading data, currentStudio:', currentStudio);
        
        // Load business categories
        const categories = await businessCategoriesApi.getBusinessCategories();
        setBusinessCategories(categories);
        console.log('BusinessDetailsForm: Loaded categories:', categories);

        if (currentStudio) {
          console.log('BusinessDetailsForm: Current studio data:', currentStudio);
          
          // Load current studio data
          const formData = {
            name: currentStudio.name || '',
            description: currentStudio.description || '',
            phone: currentStudio.phone || '',
            email: currentStudio.email || '',
            website: currentStudio.website || '',
            facebook_url: currentStudio.facebook_url || '',
            instagram_url: currentStudio.instagram_url || '',
            twitter_url: currentStudio.twitter_url || '',
            linkedin_url: currentStudio.linkedin_url || '',
          };
          
          console.log('BusinessDetailsForm: Setting form data:', formData);
          form.reset(formData);

          // Load studio categories
          const studioCategories = await studiosApi.getStudioCategories(currentStudio.id);
          console.log('BusinessDetailsForm: Studio categories:', studioCategories);
          
          const primary = studioCategories.find(cat => cat.is_primary);
          const additional = studioCategories.filter(cat => !cat.is_primary);
          
          setPrimaryCategory(primary?.category_id || '');
          setSelectedCategories(additional.map(cat => cat.category_id));
          
          console.log('BusinessDetailsForm: Primary category:', primary?.category_id);
          console.log('BusinessDetailsForm: Additional categories:', additional.map(cat => cat.category_id));
        } else {
          console.log('BusinessDetailsForm: No current studio found');
        }
      } catch (error) {
        console.error('BusinessDetailsForm: Error loading data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load business data',
          variant: 'destructive',
        });
      }
    };

    loadData();
  }, [currentStudio, form, toast]);

  const onSubmit = async (data: FormData) => {
    if (!currentStudio) return;

    setLoading(true);
    try {
      await studiosApi.updateStudio(currentStudio.id, {
        name: data.name,
        description: data.description,
        phone: data.phone,
        email: data.email,
        website: data.website,
        facebook_url: data.facebook_url,
        instagram_url: data.instagram_url,
        twitter_url: data.twitter_url,
        linkedin_url: data.linkedin_url,
      });

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
                    <FormLabel>Description</FormLabel>
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

              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            External Links
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Add links to your social media profiles and website
          </p>
        </CardHeader>
        <CardContent>
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
              name="twitter_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Twitter className="h-4 w-4 text-blue-400" />
                    Twitter/X
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="https://twitter.com/yourbusiness" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="linkedin_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-blue-700" />
                    LinkedIn
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="https://linkedin.com/company/yourbusiness" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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