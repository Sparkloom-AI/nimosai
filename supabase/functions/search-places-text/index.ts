import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

// CORS headers for web app requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('Google Places Text Search function initialized');

// Handle CORS preflight requests
Deno.serve(async (req) => {
  console.log('Google Places Text Search request received:', {
    method: req.method,
    url: req.url,
    hasAuth: !!req.headers.get('Authorization')
  });

  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Environment check
    const hasSupabaseUrl = !!Deno.env.get('SUPABASE_URL');
    const hasServiceKey = !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const hasGooglePlacesKey = !!Deno.env.get('GOOGLE_PLACE_API_KEY');

    console.log('Environment check:', {
      hasSupabaseUrl,
      hasServiceKey,
      hasGooglePlacesKey
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Authorization required' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Verifying user token...');
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('User authentication failed:', authError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid or expired token',
          details: authError?.message 
        }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('User authenticated successfully:', user.id);

    // Get the API key from environment variables
    const apiKey = Deno.env.get('GOOGLE_PLACE_API_KEY');
    
    if (!apiKey) {
      console.error('Google Places API key not found in environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'Google Places API key not configured',
          details: 'The server is missing the required Google Places API key configuration'
        }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    const { textQuery, locationBias } = await req.json();

    if (!textQuery) {
      console.error('Missing textQuery parameter');
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameter: textQuery' 
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Searching places for query:', textQuery);

    // Prepare Google Places Text Search API request
    const searchUrl = 'https://places.googleapis.com/v1/places:searchText';
    const requestBody = {
      textQuery,
      ...(locationBias && { locationBias }),
      maxResultCount: 5
    };

    console.log('Making request to Google Places API:', {
      url: searchUrl,
      requestBody
    });

    // Call Google Places Text Search API
    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.addressComponents'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Places API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Google Places API request failed',
          details: `Status: ${response.status}, ${errorText}`
        }), 
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    console.log('Google Places API response received:', {
      placesCount: data.places?.length || 0
    });

    // Transform Google Places response to match our AddressSuggestion interface
    const suggestions = (data.places || []).map((place: any) => ({
      place_id: place.id,
      description: place.formattedAddress || place.displayName?.text || '',
      structured_formatting: {
        main_text: place.displayName?.text || '',
        secondary_text: place.formattedAddress || ''
      }
    }));

    console.log('Returning transformed suggestions:', suggestions.length);

    return new Response(
      JSON.stringify({ 
        suggestions,
        timestamp: new Date().toISOString()
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in search-places-text function:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});