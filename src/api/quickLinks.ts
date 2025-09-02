import { supabase } from '@/integrations/supabase/client';

export interface QuickLinkSettings {
  id: string;
  studio_id: string;
  auto_generate_maps_links: boolean;
  maps_link_refresh_days: number;
  whatsapp_link_template: string;
  created_at: string;
  updated_at: string;
}

// Get quick link settings for a studio
export const getQuickLinkSettings = async (studioId: string): Promise<QuickLinkSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('quick_link_settings')
      .select('*')
      .eq('studio_id', studioId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching quick link settings:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getQuickLinkSettings:', error);
    throw error;
  }
};

// Create or update quick link settings
export const updateQuickLinkSettings = async (
  studioId: string, 
  settings: Partial<Omit<QuickLinkSettings, 'id' | 'studio_id' | 'created_at' | 'updated_at'>>
): Promise<QuickLinkSettings> => {
  try {
    const { data, error } = await supabase
      .from('quick_link_settings')
      .upsert({
        studio_id: studioId,
        ...settings
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating quick link settings:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateQuickLinkSettings:', error);
    throw error;
  }
};

// Generate Google Maps shortlink for a location
export const generateMapsShortlink = async (locationId: string, address: string, name?: string): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-google-maps-shortlink', {
      body: { locationId, address, name }
    });

    if (error) {
      console.error('Error generating maps shortlink:', error);
      throw error;
    }

    return data.shortlink;
  } catch (error) {
    console.error('Error in generateMapsShortlink:', error);
    throw error;
  }
};

// Generate WhatsApp link
export const generateWhatsAppLink = (phoneNumber: string, message?: string): string => {
  // Clean phone number (remove spaces, dashes, etc.)
  const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
  
  // Ensure number starts with country code
  const formattedNumber = cleanNumber.startsWith('+') ? cleanNumber.substring(1) : cleanNumber;
  
  const encodedMessage = message ? encodeURIComponent(message) : '';
  return `https://wa.me/${formattedNumber}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
};

// Get all locations with their shortlinks
export const getLocationsWithShortlinks = async (studioId: string) => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('studio_id', studioId)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching locations with shortlinks:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getLocationsWithShortlinks:', error);
    throw error;
  }
};

// Refresh expired shortlinks
export const refreshExpiredShortlinks = async (studioId: string): Promise<void> => {
  try {
    const settings = await getQuickLinkSettings(studioId);
    if (!settings?.auto_generate_maps_links) return;

    const refreshDays = settings.maps_link_refresh_days;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - refreshDays);

    const { data: locations, error } = await supabase
      .from('locations')
      .select('id, name, address, shortlink_generated_at')
      .eq('studio_id', studioId)
      .eq('is_active', true)
      .or(`shortlink_generated_at.is.null,shortlink_generated_at.lt.${cutoffDate.toISOString()}`);

    if (error) {
      console.error('Error fetching locations for refresh:', error);
      return;
    }

    // Generate shortlinks for locations that need refresh
    for (const location of locations || []) {
      try {
        await generateMapsShortlink(location.id, location.address, location.name);
      } catch (error) {
        console.error(`Failed to refresh shortlink for location ${location.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in refreshExpiredShortlinks:', error);
    throw error;
  }
};