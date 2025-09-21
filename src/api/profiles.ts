import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  country: string | null;
  country_code: string | null;
  currency: string | null;
  language: string | null;
  phone_prefix: string | null;
  timezone: string | null;
  account_setup_complete: boolean;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export const profilesApi = {
  // Get current user's profile
  async getCurrentProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data as Profile;
  },

  // Update profile with location data
  async updateProfile(updates: {
    country?: string;
    country_code?: string;
    currency?: string;
    language?: string;
    phone_prefix?: string;
    timezone?: string;
    full_name?: string;
  }): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    return data as Profile;
  },

  // Create or update profile with location data during signup
  async createOrUpdateProfile(profileData: {
    id: string;
    email: string;
    full_name?: string;
    country?: string;
    country_code?: string;
    currency?: string;
    language?: string;
    phone_prefix?: string;
    timezone?: string;
  }): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: profileData.id,
        email: profileData.email,
        full_name: profileData.full_name || null,
        country: profileData.country || null,
        country_code: profileData.country_code || null,
        currency: profileData.currency || null,
        language: profileData.language || null,
        phone_prefix: profileData.phone_prefix || null,
        timezone: profileData.timezone || null,
        account_setup_complete: false,
        onboarding_complete: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating/updating profile:', error);
      throw error;
    }

    return data as Profile;
  },
};
