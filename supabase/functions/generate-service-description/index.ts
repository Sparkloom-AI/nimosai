import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { serviceName, category } = await req.json();

    if (!serviceName) {
      throw new Error('Service name is required');
    }

    const prompt = `Generate a professional, concise description for a wellness/beauty service. 

Service Name: ${serviceName}
Category: ${category || 'General'}

Requirements:
- 2-3 sentences maximum
- Professional and welcoming tone
- Focus on benefits and experience
- Avoid overly promotional language
- Make it suitable for a wellness studio

Description:`;

    // Model configuration with fallback
    const models = ['gpt-4.1-2025-04-14', 'gpt-4o-mini'];
    let response;
    let lastError;

    // Try each model in order until one succeeds
    for (const model of models) {
      try {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { 
                role: 'system', 
                content: 'You are a professional wellness service description writer. Create concise, professional descriptions that highlight the benefits and experience of wellness services.' 
              },
              { role: 'user', content: prompt }
            ],
            max_tokens: 150,
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          break; // Success, exit the loop
        } else {
          const errorData = await response.json();
          lastError = errorData;
          console.warn(`Model ${model} failed:`, errorData);
        }
      } catch (error) {
        lastError = error;
        console.warn(`Model ${model} error:`, error);
      }
    }

    if (!response || !response.ok) {
      console.error('All models failed. Last error:', lastError);
      throw new Error(`OpenAI API error: All models failed`);
    }

    const data = await response.json();
    const generatedDescription = data.choices[0].message.content.trim();

    return new Response(JSON.stringify({ description: generatedDescription }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-service-description function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});