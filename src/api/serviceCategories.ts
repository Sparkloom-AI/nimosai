import { supabase } from '@/integrations/supabase/client';

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const serviceCategoriesApi = {
  // Get all service categories
  async getServiceCategories(): Promise<ServiceCategory[]> {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  // Get a specific service category
  async getServiceCategory(categoryId: string): Promise<ServiceCategory | null> {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .eq('id', categoryId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching service category:', error);
      throw error;
    }
    return data;
  },

  // Create a new service category (super admin only)
  async createServiceCategory(name: string, description?: string): Promise<ServiceCategory> {
    const { data, error } = await supabase
      .from('service_categories')
      .insert({ name, description })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a service category (super admin only)
  async updateServiceCategory(
    categoryId: string, 
    updates: { name?: string; description?: string }
  ): Promise<ServiceCategory> {
    const { data, error } = await supabase
      .from('service_categories')
      .update(updates)
      .eq('id', categoryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a service category (super admin only)
  async deleteServiceCategory(categoryId: string): Promise<void> {
    const { error } = await supabase
      .from('service_categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;
  },
};