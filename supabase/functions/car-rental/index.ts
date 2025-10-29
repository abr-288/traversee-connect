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
    const { pickupLocation, dropoffLocation, pickupDate, dropoffDate } = await req.json();
    const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');

    if (!RAPIDAPI_KEY) {
      throw new Error('RAPIDAPI_KEY not configured');
    }

    console.log('Searching car rentals:', { pickupLocation, dropoffLocation, pickupDate, dropoffDate });

    // Using Car Rental API from RapidAPI
    const response = await fetch(
      `https://car-rental6.p.rapidapi.com/searchLocation?location=${encodeURIComponent(pickupLocation)}`,
      {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'car-rental6.p.rapidapi.com'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Car Rental API error:', response.status, errorText);
      
      // Return empty result instead of throwing error
      // This allows the frontend to fallback to static data
      return new Response(
        JSON.stringify({
          success: false,
          data: [],
          message: 'API service unavailable, showing local results'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Car rental search successful');

    return new Response(
      JSON.stringify({
        success: true,
        data: data,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in car-rental function:', error);
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
