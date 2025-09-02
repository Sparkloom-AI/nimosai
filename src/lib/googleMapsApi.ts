// Secure Google Maps API key management
import { supabase } from '@/integrations/supabase/client';

let cachedApiKey: string | null = null;

export const getGoogleMapsApiKey = async (): Promise<string> => {
  if (cachedApiKey) {
    console.log('Using cached Google Maps API key');
    return cachedApiKey;
  }

  console.log('Fetching Google Maps API key from server...');

  try {
    const { data, error } = await supabase.functions.invoke('get-google-maps-key');
    
    console.log('Google Maps API key response:', {
      hasData: !!data,
      hasError: !!error,
      errorDetails: error
    });
    
    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Failed to fetch Google Maps API key: ${error.message || JSON.stringify(error)}`);
    }

    if (!data) {
      console.error('No data returned from get-google-maps-key function');
      throw new Error('No data returned from server');
    }

    if (!data.apiKey) {
      console.error('API key missing from response:', data);
      throw new Error('No API key returned from server');
    }

    console.log('Google Maps API key retrieved successfully');
    cachedApiKey = data.apiKey;
    return cachedApiKey;
  } catch (error) {
    console.error('Error getting Google Maps API key:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Clear cache on error
    cachedApiKey = null;
    throw error;
  }
};

export const clearApiKeyCache = () => {
  cachedApiKey = null;
};