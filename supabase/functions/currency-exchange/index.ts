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

    // Normalize currency codes - FCFA is not ISO standard, use XOF
    const normalizedFrom = from === 'FCFA' ? 'XOF' : from;
    const normalizedTo = to === 'FCFA' ? 'XOF' : to;

    // If same currency, return amount as-is
    if (normalizedFrom === normalizedTo) {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            from: normalizedFrom,
            to: normalizedTo,
            amount,
            converted: amount,
            rate: 1.0,
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use ExchangeRate-API (free, reliable)
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${normalizedFrom}`
    );

    if (!response.ok) {
      console.error('Currency API error:', response.status);
      throw new Error(`Currency API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.rates || !data.rates[normalizedTo]) {
      throw new Error(`Currency ${normalizedTo} not found in rates`);
    }

    const rate = data.rates[normalizedTo];
    const converted = amount * rate;

    console.log('Currency conversion successful:', { rate, converted });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          from: normalizedFrom,
          to: normalizedTo,
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
