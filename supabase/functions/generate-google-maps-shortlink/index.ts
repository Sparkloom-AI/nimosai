import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { locationId, address, name } = await req.json();

    if (!locationId || !address) {
      return new Response(
        JSON.stringify({ error: 'Location ID and address are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating Google Maps shortlink for:', { locationId, address, name });

    // Create the full Google Maps search URL
    const searchQuery = encodeURIComponent(`${name ? name + ', ' : ''}${address}`);
    const longUrl = `https://www.google.com/maps/search/${searchQuery}`;

    console.log('Long URL created:', longUrl);

    // For now, we'll create a simple maps.app.goo.gl style shortlink
    // In production, you could use Google's URL Shortener API or similar service
    const shortlinkId = Math.random().toString(36).substring(2, 15);
    const shortlink = `https://maps.app.goo.gl/${shortlinkId}`;

    // Update the location with the shortlink
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    const { data, error } = await supabase
      .from('locations')
      .update({
        google_maps_shortlink: shortlink,
        shortlink_generated_at: new Date().toISOString()
      })
      .eq('id', locationId)
      .select();

    if (error) {
      console.error('Error updating location with shortlink:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save shortlink' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully generated and saved shortlink:', shortlink);

    return new Response(
      JSON.stringify({ 
        shortlink,
        longUrl,
        generatedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-google-maps-shortlink function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});