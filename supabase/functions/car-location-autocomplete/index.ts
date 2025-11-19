import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { worldCities, searchCities } from "../_shared/cities-data.ts";

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

    if (!query || query.length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: 'Query too short' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Utiliser la recherche de villes mondiales
    const cities = searchCities(query, 10);
    
    const suggestions = cities.map(city => {
      // Prix de location de voiture (environ 30% du prix du vol)
      const carPrice = Math.round((city.averagePrice || 100) * 0.3);
      const minPrice = Math.round(carPrice * 0.6);
      const maxPrice = Math.round(carPrice * 1.8);
      
      return {
        name: city.name,
        code: city.code,
        type: city.code ? "airport" : "city",
        country: city.country,
        averagePrice: carPrice,
        priceRange: `${minPrice}-${maxPrice}€`
      };
    });

    return new Response(
      JSON.stringify({
        success: true,
        suggestions
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Car location autocomplete error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
