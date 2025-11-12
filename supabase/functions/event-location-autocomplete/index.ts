import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EventLocation {
  name: string;
  country: string;
  averagePrice: number;
  priceRange: string;
  popularEvents: number;
}

const popularEventLocations: EventLocation[] = [
  // Europe
  { name: "Paris", country: "France", averagePrice: 75, priceRange: "30-150€", popularEvents: 850 },
  { name: "Londres", country: "Royaume-Uni", averagePrice: 85, priceRange: "35-180€", popularEvents: 920 },
  { name: "Berlin", country: "Allemagne", averagePrice: 55, priceRange: "25-120€", popularEvents: 680 },
  { name: "Amsterdam", country: "Pays-Bas", averagePrice: 65, priceRange: "30-140€", popularEvents: 580 },
  { name: "Barcelone", country: "Espagne", averagePrice: 60, priceRange: "25-130€", popularEvents: 720 },
  { name: "Milan", country: "Italie", averagePrice: 70, priceRange: "30-150€", popularEvents: 540 },
  { name: "Lisbonne", country: "Portugal", averagePrice: 50, priceRange: "20-110€", popularEvents: 420 },
  
  // Afrique
  { name: "Abidjan", country: "Côte d'Ivoire", averagePrice: 35, priceRange: "15-80€", popularEvents: 280 },
  { name: "Dakar", country: "Sénégal", averagePrice: 30, priceRange: "12-70€", popularEvents: 240 },
  { name: "Lagos", country: "Nigeria", averagePrice: 40, priceRange: "15-90€", popularEvents: 320 },
  { name: "Le Caire", country: "Égypte", averagePrice: 25, priceRange: "10-60€", popularEvents: 380 },
  { name: "Johannesburg", country: "Afrique du Sud", averagePrice: 45, priceRange: "20-100€", popularEvents: 450 },
  { name: "Marrakech", country: "Maroc", averagePrice: 35, priceRange: "15-75€", popularEvents: 310 },
  { name: "Nairobi", country: "Kenya", averagePrice: 30, priceRange: "12-70€", popularEvents: 260 },
  
  // Amériques
  { name: "New York", country: "États-Unis", averagePrice: 120, priceRange: "50-250€", popularEvents: 1200 },
  { name: "Los Angeles", country: "États-Unis", averagePrice: 110, priceRange: "45-230€", popularEvents: 980 },
  { name: "Miami", country: "États-Unis", averagePrice: 95, priceRange: "40-200€", popularEvents: 650 },
  { name: "Toronto", country: "Canada", averagePrice: 90, priceRange: "35-180€", popularEvents: 580 },
  
  // Asie et Moyen-Orient
  { name: "Dubaï", country: "Émirats Arabes Unis", averagePrice: 80, priceRange: "35-170€", popularEvents: 520 },
  { name: "Istanbul", country: "Turquie", averagePrice: 45, priceRange: "20-100€", popularEvents: 480 },
];

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

    const searchTerm = query.toLowerCase();
    const filtered = popularEventLocations.filter(
      location =>
        location.name.toLowerCase().includes(searchTerm) ||
        location.country.toLowerCase().includes(searchTerm)
    ).slice(0, 8);

    return new Response(
      JSON.stringify({
        success: true,
        suggestions: filtered
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
