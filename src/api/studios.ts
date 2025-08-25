
import { supabase } from '@/integrations/supabase/client';
import { Studio } from '@/types/studio';

interface CreateStudioData {
  name: string;
  website?: string;
  business_category: string;
  description?: string;
  phone?: string;
  email?: string;
  timezone?: string;
}

export const studiosApi = {
  // Create a new studio
  async createStudio(studioData: CreateStudioData): Promise<Studio> {
    const { data, error } = await supabase
      .from('studios')
      .insert({
        name: studioData.name,
        website: studioData.website,
        business_category: studioData.business_category,
        description: studioData.description,
        phone: studioData.phone,
        email: studioData.email,
        timezone: studioData.timezone || 'UTC',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get user's studios
  async getUserStudios(): Promise<Studio[]> {
    const { data, error } = await supabase
      .from('studios')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get a specific studio
  async getStudio(studioId: string): Promise<Studio | null> {
    const { data, error } = await supabase
      .from('studios')
      .select('*')
      .eq('id', studioId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Update studio
  async updateStudio(studioId: string, updates: Partial<CreateStudioData>): Promise<Studio> {
    const { data, error } = await supabase
      .from('studios')
      .update(updates)
      .eq('id', studioId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
