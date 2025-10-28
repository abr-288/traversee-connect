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
    const { query } = await req.json();
    const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');

    if (!RAPIDAPI_KEY) {
      throw new Error('RAPIDAPI_KEY not configured');
    }

    console.log('Searching airports for:', query);

    // Using Airport Finder API from RapidAPI
    const response = await fetch(
      `https://airport-info.p.rapidapi.com/airport?iata=${query.toUpperCase()}`,
      {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'airport-info.p.rapidapi.com'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Airport API error:', response.status, errorText);
      
      // If not found by IATA, try searching by name
      const searchResponse = await fetch(
        `https://airport-info.p.rapidapi.com/airports?name=${encodeURIComponent(query)}`,
        {
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'airport-info.p.rapidapi.com'
          }
        }
      );

      if (!searchResponse.ok) {
        throw new Error(`Airport search error: ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();
      console.log('Airport search results received');

      return new Response(
        JSON.stringify({
          success: true,
          data: searchData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Airport info received successfully');

    return new Response(
      JSON.stringify({
        success: true,
        data
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in airport-info function:', error);
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
