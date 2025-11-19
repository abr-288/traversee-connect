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
    const { query, type = "flight" } = await req.json();

    if (!query || query.length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: 'Query too short' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Utiliser la recherche de villes mondiales
    const cities = searchCities(query, 10);
    
    const suggestions = type === "train"
      ? cities.map(city => ({
          name: city.code ? `${city.name} (${city.code})` : city.name,
          code: city.code || city.name.substring(0, 3).toUpperCase(),
          country: city.country,
          type: "airport",
          averagePrice: city.averagePrice ? Math.round(city.averagePrice * 0.6) : undefined,
          priceRange: city.priceRange ? city.priceRange.split('-').map((p: string) => {
            const price = parseInt(p);
            return Math.round(price * 0.6) + '€';
          }).join('-') : undefined
        }))
      : cities.map(city => ({
          name: city.code ? `${city.name} (${city.code})` : city.name,
          code: city.code || city.name.substring(0, 3).toUpperCase(),
          country: city.country,
          type: "airport",
          averagePrice: city.averagePrice,
          priceRange: city.priceRange
        }));

    return new Response(
      JSON.stringify({
        success: true,
        suggestions
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Airport autocomplete error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
