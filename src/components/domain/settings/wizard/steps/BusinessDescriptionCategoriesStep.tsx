import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageSquare, Sparkles, Plus, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { studiosApi } from '@/api/studios';
import { businessCategoriesApi } from '@/api/businessCategories';
import { useRole } from '@/contexts/RoleContext';
import { BusinessCategory } from '@/types/studio';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export const BusinessDescriptionCategoriesStep = () => {
  const { toast } = useToast();
  const { currentStudio, refreshRoles } = useRole();
  const [loading, setLoading] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [businessCategories, setBusinessCategories] = useState<BusinessCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [primaryCategory, setPrimaryCategory] = useState<string>('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load business categories
        const categories = await businessCategoriesApi.getBusinessCategories();
        setBusinessCategories(categories);

        if (currentStudio) {
          form.reset({
            description: currentStudio.description || '',
          });

          // Load studio categories
          const studioCategoriesResponse = await businessCategoriesApi.getStudioCategories(currentStudio.id);
          const studioCategories = studioCategoriesResponse.data || [];
          
          const primary = studioCategories.find(cat => cat.is_primary);
          const additional = studioCategories.filter(cat => !cat.is_primary);
          
          setPrimaryCategory(primary?.category_id || '');
          setSelectedCategories(additional.map(cat => cat.category_id));
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load business data',
          variant: 'destructive',
        });
      }
    };

    loadData();
  }, [currentStudio, form, toast]);

  const generateDescription = async () => {
    if (!currentStudio?.name || !primaryCategory) {
      toast({
        title: 'Missing Information',
        description: 'Please select a primary category first',
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

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId].slice(0, 3) // Max 3 additional categories
    );
  };

  const onSubmit = async (data: FormData) => {
    if (!currentStudio) return;

    setLoading(true);
    try {
      // Update studio description
      await studiosApi.updateStudio(currentStudio.id, {
        description: data.description,
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
        description: 'Description and categories updated successfully',
      });
    } catch (error) {
      console.error('Error updating data:', error);
      toast({
        title: 'Error',
        description: 'Failed to update description and categories',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Description & Categories
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Describe your business and select relevant categories
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      Business Description
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
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Primary Category</label>
                  <Select value={primaryCategory} onValueChange={setPrimaryCategory}>
                    <SelectTrigger className="mt-2">
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
              </div>

              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};