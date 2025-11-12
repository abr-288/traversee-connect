import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CarLocation {
  name: string;
  type: "city" | "airport";
  country: string;
  averagePrice: number;
  priceRange: string;
}

const popularCarLocations: CarLocation[] = [
  // Europe - Aéroports
  { name: "Paris CDG", type: "airport", country: "France", averagePrice: 45, priceRange: "25-80€" },
  { name: "Londres Heathrow", type: "airport", country: "Royaume-Uni", averagePrice: 55, priceRange: "30-95€" },
  { name: "Amsterdam Schiphol", type: "airport", country: "Pays-Bas", averagePrice: 50, priceRange: "28-90€" },
  { name: "Madrid Barajas", type: "airport", country: "Espagne", averagePrice: 35, priceRange: "20-65€" },
  
  // Europe - Villes
  { name: "Paris", type: "city", country: "France", averagePrice: 40, priceRange: "22-75€" },
  { name: "Londres", type: "city", country: "Royaume-Uni", averagePrice: 50, priceRange: "28-90€" },
  { name: "Berlin", type: "city", country: "Allemagne", averagePrice: 38, priceRange: "20-70€" },
  { name: "Barcelone", type: "city", country: "Espagne", averagePrice: 35, priceRange: "18-65€" },
  { name: "Rome", type: "city", country: "Italie", averagePrice: 42, priceRange: "23-78€" },
  
  // Afrique - Aéroports
  { name: "Abidjan Félix Houphouët-Boigny", type: "airport", country: "Côte d'Ivoire", averagePrice: 35, priceRange: "20-60€" },
  { name: "Dakar Blaise Diagne", type: "airport", country: "Sénégal", averagePrice: 32, priceRange: "18-55€" },
  { name: "Lagos Murtala Muhammed", type: "airport", country: "Nigeria", averagePrice: 38, priceRange: "22-65€" },
  { name: "Le Caire", type: "airport", country: "Égypte", averagePrice: 28, priceRange: "15-50€" },
  { name: "Johannesburg OR Tambo", type: "airport", country: "Afrique du Sud", averagePrice: 30, priceRange: "18-55€" },
  { name: "Casablanca Mohammed V", type: "airport", country: "Maroc", averagePrice: 25, priceRange: "15-45€" },
  
  // Afrique - Villes
  { name: "Abidjan", type: "city", country: "Côte d'Ivoire", averagePrice: 32, priceRange: "18-58€" },
  { name: "Dakar", type: "city", country: "Sénégal", averagePrice: 30, priceRange: "16-52€" },
  { name: "Lagos", type: "city", country: "Nigeria", averagePrice: 35, priceRange: "20-62€" },
  { name: "Casablanca", type: "city", country: "Maroc", averagePrice: 22, priceRange: "12-42€" },
  { name: "Johannesburg", type: "city", country: "Afrique du Sud", averagePrice: 28, priceRange: "16-52€" },
  { name: "Nairobi", type: "city", country: "Kenya", averagePrice: 30, priceRange: "18-55€" },
  { name: "Accra", type: "city", country: "Ghana", averagePrice: 33, priceRange: "19-58€" },
  
  // Amériques
  { name: "New York JFK", type: "airport", country: "États-Unis", averagePrice: 65, priceRange: "40-120€" },
  { name: "Los Angeles LAX", type: "airport", country: "États-Unis", averagePrice: 60, priceRange: "35-110€" },
  { name: "Miami", type: "airport", country: "États-Unis", averagePrice: 55, priceRange: "32-100€" },
  
  // Moyen-Orient
  { name: "Dubaï", type: "airport", country: "Émirats Arabes Unis", averagePrice: 45, priceRange: "28-85€" },
  { name: "Istanbul", type: "airport", country: "Turquie", averagePrice: 35, priceRange: "20-65€" },
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
    const filtered = popularCarLocations.filter(
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
    console.error('Car location autocomplete error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
