import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RECAPTCHA_SECRET_KEY = Deno.env.get("RECAPTCHA_SECRET_KEY");

interface RecaptchaRequest {
  token: string;
}

interface RecaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    if (!RECAPTCHA_SECRET_KEY) {
      console.error('RECAPTCHA_SECRET_KEY environment variable is not set');
      return new Response(
        JSON.stringify({ error: 'reCAPTCHA configuration error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { token }: RecaptchaRequest = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'reCAPTCHA token is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify the reCAPTCHA token with Google Enterprise API
    const verifyUrl = 'https://recaptchaenterprise.googleapis.com/v1/projects/nimos-470509/assessments';
    const verifyParams = new URLSearchParams({
      key: RECAPTCHA_SECRET_KEY,
    });

    const requestBody = {
      event: {
        token: token,
        expectedAction: 'USER_ACTION',
        siteKey: '6LfBa70rAAAAAFWRGQ8W-AzkLrDxfQRvaE0Kf7JS',
      },
    };

    const verifyResponse = await fetch(`${verifyUrl}?${verifyParams}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const verifyResult: RecaptchaResponse = await verifyResponse.json();

    if (!verifyResult.success) {
      console.error('reCAPTCHA verification failed:', verifyResult);
      return new Response(
        JSON.stringify({ 
          error: 'reCAPTCHA verification failed',
          details: verifyResult["error-codes"] || []
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // reCAPTCHA verification successful
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'reCAPTCHA verified successfully'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});