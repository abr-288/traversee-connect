import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Destination {
  id: string;
  name: string;
  location: string;
  country: string;
  image: string;
  rating: number;
  reviews: number;
  price: string;
  description: string;
  category?: string;
  amenities?: string[];
  highlights?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    
    if (!rapidApiKey) {
      console.error('RAPIDAPI_KEY is not configured');
      return new Response(
        JSON.stringify({ destinations: getFallbackDestinations() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching popular destinations from Travel Advisor API...');

    const popularQueries = ['Paris', 'Dubai', 'Bali', 'Tokyo', 'New York', 'Rome'];
    const destinations: Destination[] = [];

    for (const query of popularQueries) {
      try {
        const searchResponse = await fetch(
          `https://travel-advisor.p.rapidapi.com/locations/search?query=${encodeURIComponent(query)}&limit=1&offset=0&units=km&currency=EUR&sort=relevance&lang=fr_FR`,
          {
            headers: {
              'X-RapidAPI-Key': rapidApiKey,
              'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com'
            }
          }
        );

        if (!searchResponse.ok) {
          console.error(`Search API error for ${query}:`, searchResponse.status);
          continue;
        }

        const searchData = await searchResponse.json();
        
        if (searchData.data && searchData.data.length > 0) {
          const locationData = searchData.data[0].result_object;
          
          if (locationData) {
            const destination: Destination = {
              id: locationData.location_id || `dest-${destinations.length}`,
              name: locationData.name || query,
              location: locationData.location_string || 'Unknown',
              country: getCountryFromLocation(locationData),
              image: locationData.photo?.images?.large?.url || getDefaultImage(destinations.length),
              rating: parseFloat(locationData.rating || '4.5'),
              reviews: parseInt(locationData.num_reviews || '0') || Math.floor(1500 + Math.random() * 3000),
              price: getEstimatedPrice(query),
              description: locationData.description || `Découvrez ${locationData.name || query}`,
              category: getCategoryFromType(locationData.location_type),
              amenities: getAmenitiesForCategory(getCategoryFromType(locationData.location_type)),
              highlights: getHighlightsForDestination(query)
            };
            
            destinations.push(destination);
            console.log(`Added destination: ${destination.name}`);
          }
        }
      } catch (err) {
        console.error(`Error fetching ${query}:`, err);
      }
    }

    if (destinations.length > 0) {
      console.log(`Returning ${destinations.length} real destinations from Travel Advisor API`);
      return new Response(
        JSON.stringify({ destinations, source: 'travel-advisor' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('No destinations from API, using fallback');
    return new Response(
      JSON.stringify({ destinations: getFallbackDestinations() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-destinations function:', error);
    return new Response(
      JSON.stringify({ destinations: getFallbackDestinations() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getCountryFromLocation(locationData: any): string {
  if (locationData.ancestors && locationData.ancestors.length > 0) {
    const country = locationData.ancestors.find((a: any) => a.level === 'Country');
    if (country) return country.name;
  }
  return locationData.address_obj?.country || 'Unknown';
}

function getCategoryFromType(locationType: string): string {
  const type = (locationType || '').toLowerCase();
  if (type.includes('beach') || type.includes('island')) return 'Plage';
  if (type.includes('mountain') || type.includes('ski')) return 'Montagne';
  return 'Ville';
}

function getEstimatedPrice(destinationName: string): string {
  const priceMap: Record<string, number> = {
    'Paris': 450000, 'Dubai': 650000, 'Maldives': 850000,
    'Tokyo': 520000, 'Bali': 380000, 'New York': 620000,
    'Rome': 420000, 'Barcelona': 390000, 'Bangkok': 340000
  };
  return (priceMap[destinationName] || Math.floor(400000 + Math.random() * 300000)).toString();
}

function getHighlightsForDestination(name: string): string[] {
  const highlightsMap: Record<string, string[]> = {
    'Paris': ['Tour Eiffel', 'Musée du Louvre', 'Champs-Élysées'],
    'Dubai': ['Burj Khalifa', 'Desert Safari', 'Dubai Mall'],
    'Bali': ['Rizières en terrasses', 'Temples hindous', 'Plages de rêve'],
    'Tokyo': ['Temples traditionnels', 'Shibuya Crossing', 'Cuisine japonaise'],
    'New York': ['Statue de la Liberté', 'Times Square', 'Central Park'],
    'Rome': ['Colisée', 'Vatican', 'Fontaine de Trevi']
  };
  return highlightsMap[name] || ['Attractions locales', 'Culture unique', 'Gastronomie'];
}

function getAmenitiesForCategory(category: string): string[] {
  if (category === 'Plage') return ['WiFi gratuit', 'Restaurant', 'Piscine', 'Spa', 'Plage privée'];
  if (category === 'Montagne') return ['WiFi gratuit', 'Restaurant', 'Cheminée', 'Vue panoramique'];
  return ['WiFi gratuit', 'Restaurant', 'Bar', 'Concierge', 'Salle de fitness'];
}

function getDefaultImage(index: number): string {
  const images = [
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
    "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80",
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80"
  ];
  return images[index % images.length];
}

function getFallbackDestinations(): Destination[] {
  return [
    { id: "1", name: "Paris", location: "France", country: "France", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80", rating: 4.9, reviews: 3245, price: "450000", description: "La ville lumière", category: "Ville", amenities: ["WiFi gratuit", "Restaurant", "Bar", "Spa"], highlights: ["Tour Eiffel", "Louvre", "Montmartre"] },
    { id: "2", name: "Dubaï", location: "Émirats Arabes Unis", country: "UAE", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80", rating: 4.9, reviews: 2890, price: "550000", description: "Luxe et modernité", category: "Ville", amenities: ["Piscine", "WiFi", "Climatisation"], highlights: ["Burj Khalifa", "Dubai Mall"] },
    { id: "3", name: "Maldives", location: "Océan Indien", country: "Maldives", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80", rating: 5.0, reviews: 1876, price: "780000", description: "Paradis tropical", category: "Plage", amenities: ["Plage privée", "Snorkeling", "Spa"], highlights: ["Bungalows pilotis", "Plongée"] },
    { id: "4", name: "Tokyo", location: "Japon", country: "Japan", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80", rating: 4.8, reviews: 2567, price: "520000", description: "Tradition et technologie", category: "Ville", amenities: ["WiFi", "Restaurant", "Onsen"], highlights: ["Temples", "Shibuya", "Cuisine"] },
    { id: "5", name: "Bali", location: "Indonésie", country: "Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80", rating: 4.9, reviews: 3102, price: "380000", description: "Îles paradisiaques", category: "Plage", amenities: ["Piscine", "Yoga", "Spa"], highlights: ["Rizières", "Temples", "Plages"] },
    { id: "6", name: "New York", location: "États-Unis", country: "USA", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80", rating: 4.7, reviews: 4123, price: "620000", description: "La ville qui ne dort jamais", category: "Ville", amenities: ["WiFi", "Concierge", "Bar"], highlights: ["Statue Liberté", "Times Square", "Central Park"] }
  ];
}
