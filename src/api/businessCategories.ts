
import { supabase } from '@/integrations/supabase/client';
import { BusinessCategory } from '@/types/studio';

export const businessCategoriesApi = {
  // Get all business categories
  async getBusinessCategories(): Promise<BusinessCategory[]> {
    const { data, error } = await supabase
      .from('business_categories' as any)
      .select('*')
      .order('name');

    if (error) throw error;
    return (data || []) as BusinessCategory[];
  },

  // Get a specific business category
  async getBusinessCategory(categoryId: string): Promise<BusinessCategory | null> {
    const { data, error } = await supabase
      .from('business_categories' as any)
      .select('*')
      .eq('id', categoryId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching business category:', error);
      throw error;
    }
    return data as BusinessCategory | null;
  },

  // Create a new business category (super admin only)
  async createBusinessCategory(name: string, description?: string): Promise<BusinessCategory> {
    const { data, error } = await supabase
      .from('business_categories' as any)
      .insert({ name, description } as any)
      .select()
      .single();

    if (error) throw error;
    return data as BusinessCategory;
  },

  // Update a business category (super admin only)
  async updateBusinessCategory(
    categoryId: string, 
    updates: { name?: string; description?: string }
  ): Promise<BusinessCategory> {
    const { data, error } = await supabase
      .from('business_categories' as any)
      .update(updates as any)
      .eq('id', categoryId)
      .select()
      .single();

    if (error) throw error;
    return data as BusinessCategory;
  },

  // Delete a business category (super admin only)
  async deleteBusinessCategory(categoryId: string): Promise<void> {
    const { error } = await supabase
      .from('business_categories' as any)
      .delete()
      .eq('id', categoryId);

    if (error) throw error;
  },
};
