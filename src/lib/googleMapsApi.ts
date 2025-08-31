// Secure Google Maps API key management
import { supabase } from '@/integrations/supabase/client';

let cachedApiKey: string | null = null;

export const getGoogleMapsApiKey = async (): Promise<string> => {
  if (cachedApiKey) {
    return cachedApiKey;
  }

  try {
    const { data, error } = await supabase.functions.invoke('get-google-maps-key');
    
    if (error) {
      console.error('Error fetching Google Maps API key:', error);
      throw new Error('Failed to fetch Google Maps API key');
    }

    if (!data?.apiKey) {
      throw new Error('No API key returned from server');
    }

    cachedApiKey = data.apiKey;
    return cachedApiKey;
  } catch (error) {
    console.error('Error getting Google Maps API key:', error);
    throw error;
  }
};

export const clearApiKeyCache = () => {
  cachedApiKey = null;
};