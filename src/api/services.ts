import { supabase } from '@/integrations/supabase/client';
import { Service } from '@/types/services';

export const servicesApi = {
  // Get all services for a studio
  async getServices(studioId: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('studio_id', studioId)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  // Get a specific service
  async getService(serviceId: string): Promise<Service | null> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching service:', error);
      throw error;
    }
    return data;
  },

  // Create a new service
  async createService(service: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .insert(service)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a service
  async updateService(
    serviceId: string, 
    updates: Partial<Omit<Service, 'id' | 'studio_id' | 'created_at' | 'updated_at'>>
  ): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', serviceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Soft delete a service (mark as inactive)
  async deleteService(serviceId: string): Promise<void> {
    const { error } = await supabase
      .from('services')
      .update({ is_active: false })
      .eq('id', serviceId);

    if (error) throw error;
  },

  // Get services by category for a studio
  async getServicesByCategory(studioId: string, category: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('studio_id', studioId)
      .eq('category', category)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  // Get unique categories for a studio
  async getStudioServiceCategories(studioId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('services')
      .select('category')
      .eq('studio_id', studioId)
      .eq('is_active', true)
      .not('category', 'is', null);

    if (error) throw error;
    
    // Get unique categories from single category field
    const allCategories = new Set<string>();
    data?.forEach(item => {
      if (item.category && typeof item.category === 'string') {
        allCategories.add(item.category);
      }
    });
    
    return Array.from(allCategories).sort();
  }
};