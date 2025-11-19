import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
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
      // Prix des événements (environ 15% du prix du vol)
      const eventPrice = Math.round((city.averagePrice || 100) * 0.15);
      const minPrice = Math.round(eventPrice * 0.4);
      const maxPrice = Math.round(eventPrice * 2.5);
      
      // Estimation du nombre d'événements populaires selon la taille de la ville
      const popularEvents = city.averagePrice && city.averagePrice > 400 
        ? Math.floor(Math.random() * 500) + 500 
        : Math.floor(Math.random() * 300) + 200;
      
      return {
        name: city.name,
        country: city.country,
        averagePrice: eventPrice,
        priceRange: `${minPrice}-${maxPrice}€`,
        popularEvents
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
    console.error('Event location autocomplete error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
