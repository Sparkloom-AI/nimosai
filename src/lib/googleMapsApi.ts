// Secure Google Maps API key management
import { supabase } from '@/integrations/supabase/client';

let cachedApiKey: string | null = null;

export const getGooglePlacesApiKey = async (): Promise<string> => {
  if (cachedApiKey) {
    console.log('Using cached Google Places API key');
    return cachedApiKey;
  }

  console.log('Fetching Google Places API key from server...');

  try {
    const { data, error } = await supabase.functions.invoke('get-google-maps-key');
    
    console.log('Google Places API key response:', {
      hasData: !!data,
      hasError: !!error,
      errorDetails: error
    });
    
    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Failed to fetch Google Places API key: ${error.message || JSON.stringify(error)}`);
    }

    if (!data) {
      console.error('No data returned from get-google-maps-key function');
      throw new Error('No data returned from server');
    }

    if (!data.apiKey) {
      console.error('API key missing from response:', data);
      throw new Error('No API key returned from server');
    }

    console.log('Google Places API key retrieved successfully');
    cachedApiKey = data.apiKey;
    return cachedApiKey;
  } catch (error) {
    console.error('Error getting Google Places API key:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Clear cache on error
    cachedApiKey = null;
    throw error;
  }
};

export interface PlacesSearchRequest {
  textQuery: string;
  locationBias?: {
    rectangle?: {
      low: { latitude: number; longitude: number };
      high: { latitude: number; longitude: number };
    };
    circle?: {
      center: { latitude: number; longitude: number };
      radius: number;
    };
  };
}

export interface AddressSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export const searchPlacesText = async (request: PlacesSearchRequest): Promise<AddressSuggestion[]> => {
  console.log('Searching places with text:', request.textQuery);

  try {
    const { data, error } = await supabase.functions.invoke('search-places-text', {
      body: request
    });
    
    console.log('Places search response:', {
      hasData: !!data,
      hasError: !!error,
      errorDetails: error
    });
    
    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Failed to search places: ${error.message || JSON.stringify(error)}`);
    }

    if (!data) {
      console.error('No data returned from search-places-text function');
      throw new Error('No data returned from server');
    }

    if (!data.suggestions) {
      console.error('Suggestions missing from response:', data);
      throw new Error('No suggestions returned from server');
    }

    console.log('Places search completed successfully:', data.suggestions.length, 'suggestions');
    return data.suggestions;
  } catch (error) {
    console.error('Error searching places:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    throw error;
  }
};

export const clearApiKeyCache = () => {
  cachedApiKey = null;
};