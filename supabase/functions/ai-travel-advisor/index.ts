import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getClientIP, checkRateLimit, createRateLimitResponse, RATE_LIMITS } from "../_shared/rate-limiter.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting - more restrictive for AI endpoints
  const clientIP = getClientIP(req);
  const rateLimitResult = checkRateLimit(clientIP, { ...RATE_LIMITS.AI, keyPrefix: 'ai-advisor' });
  
  if (!rateLimitResult.allowed) {
    console.log(`Rate limit exceeded for IP: ${clientIP.substring(0, 8)}...`);
    return createRateLimitResponse(rateLimitResult, RATE_LIMITS.AI, corsHeaders);
  }

  try {
    const { destination, interests, budget, duration } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Security: Only log non-sensitive request metadata
    console.log('Generating AI travel recommendations for destination:', destination);

    const prompt = `En tant qu'expert en voyage, fournissez des recommandations détaillées pour un voyage à ${destination}.
    
Intérêts du voyageur: ${interests || 'général'}
Budget: ${budget || 'moyen'}
Durée: ${duration || 'flexible'}

Veuillez fournir:
1. Les meilleures attractions touristiques (5-7)
2. Suggestions d'activités selon les intérêts
3. Conseils pour le budget
4. Meilleure période pour visiter
5. Conseils pratiques (transport, hébergement, sécurité)
6. Spécialités culinaires locales à essayer

Soyez spécifique et pratique dans vos recommandations.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'Vous êtes un expert en voyage qui fournit des recommandations détaillées, pratiques et personnalisées. Répondez en français de manière structurée et claire.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      // Security: Don't log full API error response which may contain sensitive data
      console.error('Lovable AI API error - Status:', response.status);
      
      if (response.status === 429) {
        throw new Error('Limite de requêtes atteinte. Veuillez réessayer plus tard.');
      }
      if (response.status === 402) {
        throw new Error('Crédits insuffisants. Veuillez recharger votre compte.');
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const recommendations = data.choices[0]?.message?.content;

    console.log('AI travel recommendations generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        recommendations: recommendations,
        destination: destination,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    // Security: Only log error type, not full error details
    console.error('Error in ai-travel-advisor function:', error instanceof Error ? error.constructor.name : 'Unknown');
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});