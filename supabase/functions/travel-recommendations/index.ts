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
    const { location } = await req.json();
    const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');

    if (!RAPIDAPI_KEY) {
      throw new Error('RAPIDAPI_KEY not configured');
    }

    console.log('Fetching travel recommendations for:', location);

    // Using Travel Advisor API from RapidAPI
    const searchResponse = await fetch(
      `https://travel-advisor.p.rapidapi.com/locations/search?query=${encodeURIComponent(location)}&limit=1&offset=0&units=km&location_id=1&currency=USD&sort=relevance&lang=fr_FR`,
      {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com'
        }
      }
    );

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('Search API error:', searchResponse.status, errorText);
      throw new Error(`Search API error: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.data || searchData.data.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          data: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const locationId = searchData.data[0].result_object.location_id;
    console.log('Location ID found:', locationId);

    // Get attractions for this location
    const attractionsResponse = await fetch(
      `https://travel-advisor.p.rapidapi.com/attractions/list?location_id=${locationId}&currency=USD&lang=fr_FR&lunit=km&limit=10`,
      {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com'
        }
      }
    );

    if (!attractionsResponse.ok) {
      const errorText = await attractionsResponse.text();
      console.error('Attractions API error:', attractionsResponse.status, errorText);
      throw new Error(`Attractions API error: ${attractionsResponse.status}`);
    }

    const attractionsData = await attractionsResponse.json();
    console.log('Attractions data received successfully');

    const attractions = attractionsData.data?.map((item: any) => ({
      name: item.name,
      rating: item.rating,
      description: item.description || item.snippet,
      image: item.photo?.images?.large?.url || item.photo?.images?.medium?.url,
      address: item.address,
      category: item.category?.name,
    })) || [];

    return new Response(
      JSON.stringify({
        success: true,
        data: attractions
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in travel-recommendations function:', error);
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
