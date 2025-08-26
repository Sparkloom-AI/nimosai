
import { supabase } from '@/integrations/supabase/client';
import { BusinessCategory } from '@/types/studio';

export const businessCategoriesApi = {
  // Get all business categories
  async getBusinessCategories(): Promise<BusinessCategory[]> {
    const { data, error } = await supabase
      .from('business_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  // Get a specific business category
  async getBusinessCategory(categoryId: string): Promise<BusinessCategory | null> {
    const { data, error } = await supabase
      .from('business_categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }
    return data;
  },

  // Create a new business category (super admin only)
  async createBusinessCategory(name: string, description?: string): Promise<BusinessCategory> {
    const { data, error } = await supabase
      .from('business_categories')
      .insert({ name, description })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a business category (super admin only)
  async updateBusinessCategory(
    categoryId: string, 
    updates: { name?: string; description?: string }
  ): Promise<BusinessCategory> {
    const { data, error } = await supabase
      .from('business_categories')
      .update(updates)
      .eq('id', categoryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a business category (super admin only)
  async deleteBusinessCategory(categoryId: string): Promise<void> {
    const { error } = await supabase
      .from('business_categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;
  },
};
