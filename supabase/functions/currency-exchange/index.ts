import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { from, to, amount } = await req.json();

    console.log('Converting currency:', { from, to, amount });

    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    
    // Try RapidAPI TripAdvisor first (tripadvisor16.p.rapidapi.com)
    if (rapidApiKey) {
      try {
        const response = await fetch(
          `https://tripadvisor16.p.rapidapi.com/api/v1/getCurrency`,
          {
            headers: {
              'X-RapidAPI-Key': rapidApiKey,
              'X-RapidAPI-Host': 'tripadvisor16.p.rapidapi.com',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('TripAdvisor Currency API response:', data);
          
          // Process the response and calculate conversion
          // Note: Adapt this based on actual API response structure
          if (data && data.rates) {
            const rate = data.rates[to] / data.rates[from];
            const converted = amount * rate;
            
            console.log('Currency conversion successful (TripAdvisor):', { rate, converted });
            
            return new Response(
              JSON.stringify({
                success: true,
                data: {
                  from,
                  to,
                  amount,
                  converted: parseFloat(converted.toFixed(2)),
                  rate: parseFloat(rate.toFixed(6)),
                }
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      } catch (error) {
        console.error('TripAdvisor API error, falling back:', error);
      }
    }

    // Fallback to ExchangeRate-API (free, no API key required)
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${from}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Currency API error:', response.status, errorText);
      throw new Error(`Currency API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.rates || !data.rates[to]) {
      throw new Error(`Currency ${to} not found in rates`);
    }

    const rate = data.rates[to];
    const converted = amount * rate;

    console.log('Currency conversion successful (ExchangeRate-API):', { rate, converted });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          from,
          to,
          amount,
          converted: parseFloat(converted.toFixed(2)),
          rate: parseFloat(rate.toFixed(6)),
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in currency-exchange function:', error);
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
