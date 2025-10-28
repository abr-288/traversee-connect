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
    const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');

    if (!RAPIDAPI_KEY) {
      throw new Error('RAPIDAPI_KEY not configured');
    }

    console.log('Converting currency:', { from, to, amount });

    // Using Currency Converter API from RapidAPI
    const response = await fetch(
      `https://currency-converter5.p.rapidapi.com/currency/convert?format=json&from=${from}&to=${to}&amount=${amount}`,
      {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'currency-converter5.p.rapidapi.com'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Currency API error:', response.status, errorText);
      throw new Error(`Currency API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Currency conversion successful');

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          from,
          to,
          amount,
          converted: data.rates[to].rate_for_amount,
          rate: data.rates[to].rate,
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
