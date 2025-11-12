import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Airport {
  name: string;
  code: string;
  country: string;
  type: string;
  averagePrice?: number;
  priceRange?: string;
}

const popularAirports: Airport[] = [
  // Afrique de l'Ouest
  { name: "Abidjan", code: "ABJ", country: "Côte d'Ivoire", type: "airport", averagePrice: 450, priceRange: "250-800€" },
  { name: "Lomé", code: "LFW", country: "Togo", type: "airport", averagePrice: 480, priceRange: "280-850€" },
  { name: "Dakar", code: "DSS", country: "Sénégal", type: "airport", averagePrice: 420, priceRange: "250-750€" },
  { name: "Accra", code: "ACC", country: "Ghana", type: "airport", averagePrice: 470, priceRange: "270-820€" },
  { name: "Lagos", code: "LOS", country: "Nigeria", type: "airport", averagePrice: 490, priceRange: "300-900€" },
  { name: "Bamako", code: "BKO", country: "Mali", type: "airport", averagePrice: 520, priceRange: "320-950€" },
  { name: "Ouagadougou", code: "OUA", country: "Burkina Faso", type: "airport", averagePrice: 510, priceRange: "310-920€" },
  
  // Afrique du Nord
  { name: "Casablanca", code: "CMN", country: "Maroc", type: "airport", averagePrice: 180, priceRange: "120-350€" },
  { name: "Tunis", code: "TUN", country: "Tunisie", type: "airport", averagePrice: 210, priceRange: "140-380€" },
  { name: "Alger", code: "ALG", country: "Algérie", type: "airport", averagePrice: 220, priceRange: "150-400€" },
  { name: "Le Caire", code: "CAI", country: "Égypte", type: "airport", averagePrice: 320, priceRange: "200-550€" },
  
  // Afrique de l'Est
  { name: "Nairobi", code: "NBO", country: "Kenya", type: "airport", averagePrice: 550, priceRange: "350-950€" },
  { name: "Addis-Abeba", code: "ADD", country: "Éthiopie", type: "airport", averagePrice: 480, priceRange: "300-850€" },
  { name: "Dar es Salaam", code: "DAR", country: "Tanzanie", type: "airport", averagePrice: 580, priceRange: "380-1000€" },
  
  // Afrique Australe
  { name: "Johannesburg", code: "JNB", country: "Afrique du Sud", type: "airport", averagePrice: 620, priceRange: "400-1100€" },
  { name: "Le Cap", code: "CPT", country: "Afrique du Sud", type: "airport", averagePrice: 650, priceRange: "420-1150€" },
  
  // Europe
  { name: "Paris", code: "CDG", country: "France", type: "airport", averagePrice: 150, priceRange: "80-300€" },
  { name: "Londres", code: "LHR", country: "Royaume-Uni", type: "airport", averagePrice: 180, priceRange: "100-350€" },
  { name: "Bruxelles", code: "BRU", country: "Belgique", type: "airport", averagePrice: 140, priceRange: "75-280€" },
  { name: "Amsterdam", code: "AMS", country: "Pays-Bas", type: "airport", averagePrice: 160, priceRange: "85-320€" },
  { name: "Madrid", code: "MAD", country: "Espagne", type: "airport", averagePrice: 130, priceRange: "70-260€" },
  
  // Moyen-Orient
  { name: "Dubaï", code: "DXB", country: "Émirats Arabes Unis", type: "airport", averagePrice: 380, priceRange: "250-650€" },
  { name: "Istanbul", code: "IST", country: "Turquie", type: "airport", averagePrice: 240, priceRange: "150-450€" },
  
  // Amériques
  { name: "New York", code: "JFK", country: "États-Unis", type: "airport", averagePrice: 450, priceRange: "300-800€" },
  { name: "Los Angeles", code: "LAX", country: "États-Unis", type: "airport", averagePrice: 480, priceRange: "320-850€" },
];

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

    const searchTerm = query.toLowerCase();
    const filtered = popularAirports.filter(
      airport =>
        airport.name.toLowerCase().includes(searchTerm) ||
        airport.code.toLowerCase().includes(searchTerm) ||
        airport.country.toLowerCase().includes(searchTerm)
    ).slice(0, 8);

    // Adjust prices for train if needed
    const suggestions = type === "train" 
      ? filtered.map(airport => ({
          ...airport,
          averagePrice: airport.averagePrice ? Math.round(airport.averagePrice * 0.6) : undefined,
          priceRange: airport.priceRange ? airport.priceRange.split('-').map(p => {
            const price = parseInt(p);
            return Math.round(price * 0.6) + '€';
          }).join('-') : undefined
        }))
      : filtered;

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
