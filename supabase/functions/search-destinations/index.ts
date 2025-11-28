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
  source: string;
}

// Search using Travel Advisor API (TripAdvisor)
async function searchTravelAdvisor(
  query: string,
  rapidApiKey: string
): Promise<Destination[]> {
  try {
    console.log('Searching Travel Advisor API:', query);
    
    const searchResponse = await fetch(
      `https://travel-advisor.p.rapidapi.com/locations/search?query=${encodeURIComponent(query)}&limit=3&offset=0&units=km&currency=EUR&sort=relevance&lang=fr_FR`,
      {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com'
        }
      }
    );

    if (!searchResponse.ok) {
      console.error('Travel Advisor API error:', searchResponse.status);
      return [];
    }

    const searchData = await searchResponse.json();
    const results: Destination[] = [];
    
    if (searchData.data && Array.isArray(searchData.data)) {
      for (const item of searchData.data.slice(0, 3)) {
        const locationData = item.result_object;
        if (locationData) {
          results.push({
            id: `ta-${locationData.location_id || results.length}`,
            name: locationData.name || query,
            location: locationData.location_string || 'Unknown',
            country: getCountryFromLocation(locationData),
            image: locationData.photo?.images?.large?.url || getDefaultImage(results.length),
            rating: parseFloat(locationData.rating || '4.5'),
            reviews: parseInt(locationData.num_reviews || '0') || Math.floor(1500 + Math.random() * 3000),
            price: getEstimatedPrice(query),
            description: locationData.description || `Découvrez ${locationData.name || query}`,
            category: getCategoryFromType(locationData.location_type),
            amenities: getAmenitiesForCategory(getCategoryFromType(locationData.location_type)),
            highlights: getHighlightsForDestination(query),
            source: 'travel-advisor',
          });
        }
      }
    }
    
    console.log('Travel Advisor results:', results.length);
    return results;
  } catch (error) {
    console.error('Travel Advisor API exception:', error);
    return [];
  }
}

// Search using Booking.com Destinations API
async function searchBookingDestinations(
  query: string,
  rapidApiKey: string
): Promise<Destination[]> {
  try {
    console.log('Searching Booking.com Destinations API:', query);
    
    const response = await fetch(
      `https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination?query=${encodeURIComponent(query)}`,
      {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com'
        }
      }
    );

    if (!response.ok) {
      console.error('Booking.com Destinations API error:', response.status);
      return [];
    }

    const data = await response.json();
    const results: Destination[] = [];
    
    if (data.data && Array.isArray(data.data)) {
      for (const item of data.data.slice(0, 3)) {
        results.push({
          id: `booking-${item.dest_id || results.length}`,
          name: item.city_name || item.name || query,
          location: item.region || item.country || 'Unknown',
          country: item.country || 'Unknown',
          image: item.image_url || getDefaultImage(results.length),
          rating: 4.5,
          reviews: Math.floor(2000 + Math.random() * 3000),
          price: getEstimatedPrice(item.city_name || query),
          description: `Explorez ${item.city_name || query}, une destination populaire.`,
          category: 'Ville',
          amenities: ['WiFi gratuit', 'Restaurant', 'Bar', 'Spa'],
          highlights: ['Attractions locales', 'Culture unique', 'Gastronomie'],
          source: 'booking',
        });
      }
    }
    
    console.log('Booking.com Destinations results:', results.length);
    return results;
  } catch (error) {
    console.error('Booking.com Destinations API exception:', error);
    return [];
  }
}

// Search using Geoapify Places API
async function searchGeoapify(
  query: string,
  rapidApiKey: string
): Promise<Destination[]> {
  try {
    console.log('Searching Geoapify Places API:', query);
    
    const response = await fetch(
      `https://geoapify-places.p.rapidapi.com/v2/places?categories=tourism&filter=place:${encodeURIComponent(query)}&limit=3`,
      {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'geoapify-places.p.rapidapi.com'
        }
      }
    );

    if (!response.ok) {
      console.error('Geoapify API error:', response.status);
      return [];
    }

    const data = await response.json();
    const results: Destination[] = [];
    
    if (data.features && Array.isArray(data.features)) {
      for (const feature of data.features.slice(0, 3)) {
        const props = feature.properties || {};
        results.push({
          id: `geo-${props.place_id || results.length}`,
          name: props.name || props.city || query,
          location: props.state || props.region || 'Unknown',
          country: props.country || 'Unknown',
          image: getDefaultImage(results.length),
          rating: 4.3,
          reviews: Math.floor(1000 + Math.random() * 2000),
          price: getEstimatedPrice(props.name || query),
          description: `Découvrez ${props.name || query}, une destination à explorer.`,
          category: getCategoryFromType(props.category || 'tourism'),
          amenities: ['Attractions', 'Culture', 'Gastronomie'],
          highlights: ['Sites touristiques', 'Expériences locales'],
          source: 'geoapify',
        });
      }
    }
    
    console.log('Geoapify results:', results.length);
    return results;
  } catch (error) {
    console.error('Geoapify API exception:', error);
    return [];
  }
}

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
    { id: "1", name: "Paris", location: "France", country: "France", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80", rating: 4.9, reviews: 3245, price: "450000", description: "La ville lumière", category: "Ville", amenities: ["WiFi gratuit", "Restaurant", "Bar", "Spa"], highlights: ["Tour Eiffel", "Louvre", "Montmartre"], source: "fallback" },
    { id: "2", name: "Dubaï", location: "Émirats Arabes Unis", country: "UAE", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80", rating: 4.9, reviews: 2890, price: "550000", description: "Luxe et modernité", category: "Ville", amenities: ["Piscine", "WiFi", "Climatisation"], highlights: ["Burj Khalifa", "Dubai Mall"], source: "fallback" },
    { id: "3", name: "Maldives", location: "Océan Indien", country: "Maldives", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80", rating: 5.0, reviews: 1876, price: "780000", description: "Paradis tropical", category: "Plage", amenities: ["Plage privée", "Snorkeling", "Spa"], highlights: ["Bungalows pilotis", "Plongée"], source: "fallback" },
    { id: "4", name: "Tokyo", location: "Japon", country: "Japan", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80", rating: 4.8, reviews: 2567, price: "520000", description: "Tradition et technologie", category: "Ville", amenities: ["WiFi", "Restaurant", "Onsen"], highlights: ["Temples", "Shibuya", "Cuisine"], source: "fallback" },
    { id: "5", name: "Bali", location: "Indonésie", country: "Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80", rating: 4.9, reviews: 3102, price: "380000", description: "Îles paradisiaques", category: "Plage", amenities: ["Piscine", "Yoga", "Spa"], highlights: ["Rizières", "Temples", "Plages"], source: "fallback" },
    { id: "6", name: "New York", location: "États-Unis", country: "USA", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80", rating: 4.7, reviews: 4123, price: "620000", description: "La ville qui ne dort jamais", category: "Ville", amenities: ["WiFi", "Concierge", "Bar"], highlights: ["Statue Liberté", "Times Square", "Central Park"], source: "fallback" }
  ];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    
    if (!rapidApiKey) {
      console.log('RAPIDAPI_KEY not configured, returning fallback destinations');
      return new Response(
        JSON.stringify({ destinations: getFallbackDestinations() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching popular destinations from multiple APIs...');

    const popularQueries = ['Paris', 'Dubai', 'Bali', 'Tokyo', 'New York', 'Rome'];
    
    // Search all APIs in parallel for each destination
    const allResults = await Promise.all(
      popularQueries.map(async (query) => {
        const [travelAdvisor, booking, geoapify] = await Promise.all([
          searchTravelAdvisor(query, rapidApiKey),
          searchBookingDestinations(query, rapidApiKey),
          searchGeoapify(query, rapidApiKey),
        ]);
        return [...travelAdvisor, ...booking, ...geoapify];
      })
    );

    // Flatten and deduplicate by name
    const allDestinations = allResults.flat();
    const uniqueDestinations = allDestinations.reduce((acc: Destination[], dest) => {
      if (!acc.find(d => d.name.toLowerCase() === dest.name.toLowerCase())) {
        acc.push(dest);
      }
      return acc;
    }, []);

    console.log(`Total unique destinations: ${uniqueDestinations.length}`);

    if (uniqueDestinations.length > 0) {
      return new Response(
        JSON.stringify({ destinations: uniqueDestinations }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('No destinations from APIs, using fallback');
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
