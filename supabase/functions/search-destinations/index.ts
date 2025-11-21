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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    
    if (!rapidApiKey) {
      throw new Error('RAPIDAPI_KEY is not configured');
    }

    console.log('Fetching trending destinations from RapidAPI...');

    // Using Booking.com API from RapidAPI to get popular destinations
    const response = await fetch('https://booking-com15.p.rapidapi.com/api/v1/attraction/searchLocation?query=popular&languagecode=en-us', {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      console.error('API response not OK:', response.status, response.statusText);
      // Return fallback data if API fails
      return new Response(
        JSON.stringify({ destinations: getFallbackDestinations() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('API Response received:', data);

    let destinations: Destination[] = [];

    if (data && data.data && Array.isArray(data.data)) {
      destinations = data.data.slice(0, 12).map((item: any, index: number) => {
        const destName = item.name || item.city_name || 'Unknown';
        const category = getCategoryFromName(destName);
        
        return {
          id: item.dest_id || `dest-${index}`,
          name: destName,
          location: item.country || item.region || 'Unknown',
          country: item.country || 'Unknown',
          image: item.image_url || getDefaultImage(index),
          rating: parseFloat(item.rating || (4.5 + Math.random() * 0.5).toFixed(1)),
          reviews: item.nr_hotels ? item.nr_hotels * 10 : Math.floor(1500 + Math.random() * 3000),
          price: Math.floor(300000 + Math.random() * 500000).toString(),
          description: item.description || `Découvrez ${destName} et ses merveilles`,
          category,
          amenities: getAmenitiesForCategory(category),
          highlights: getHighlightsForDestination(destName, category)
        };
      });
    }

    // If no destinations from API, use fallback
    if (destinations.length === 0) {
      console.log('No destinations from API, using fallback');
      destinations = getFallbackDestinations();
    }

    console.log(`Returning ${destinations.length} destinations`);

    return new Response(
      JSON.stringify({ destinations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-destinations function:', error);
    
    // Return fallback destinations on error
    return new Response(
      JSON.stringify({ destinations: getFallbackDestinations() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getFallbackDestinations(): Destination[] {
  return [
    {
      id: "1",
      name: "Paris",
      location: "France",
      country: "France",
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
      rating: 4.9,
      reviews: 3245,
      price: "450000",
      description: "La ville lumière, capitale de la mode et de la gastronomie",
      category: "Ville",
      amenities: ["WiFi gratuit", "Restaurant", "Bar", "Spa"],
      highlights: ["Tour Eiffel", "Musée du Louvre", "Quartier Montmartre"]
    },
    {
      id: "2",
      name: "Dubaï",
      location: "Émirats Arabes Unis",
      country: "UAE",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
      rating: 4.9,
      reviews: 2890,
      price: "550000",
      description: "Luxe et modernité dans le désert, shopping et architecture futuriste",
      category: "Ville",
      amenities: ["Piscine", "WiFi gratuit", "Climatisation", "Spa de luxe"],
      highlights: ["Burj Khalifa", "Mall of Emirates", "Desert Safari"]
    },
    {
      id: "3",
      name: "Maldives",
      location: "Océan Indien",
      country: "Maldives",
      image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80",
      rating: 5.0,
      reviews: 1876,
      price: "780000",
      description: "Paradis tropical avec plages de sable blanc et eaux cristallines",
      category: "Plage",
      amenities: ["Plage privée", "Snorkeling", "Restaurant", "Spa"],
      highlights: ["Bungalows sur pilotis", "Plongée sous-marine", "Couchers de soleil"]
    },
    {
      id: "4",
      name: "Tokyo",
      location: "Japon",
      country: "Japan",
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
      rating: 4.8,
      reviews: 2567,
      price: "520000",
      description: "Mélange unique de tradition et de technologie ultra-moderne",
      category: "Ville",
      amenities: ["WiFi gratuit", "Restaurant japonais", "Onsen", "Salle de fitness"],
      highlights: ["Temples traditionnels", "Quartier Shibuya", "Cuisine authentique"]
    },
    {
      id: "5",
      name: "Bali",
      location: "Indonésie",
      country: "Indonesia",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
      rating: 4.9,
      reviews: 3102,
      price: "380000",
      description: "Îles paradisiaques, temples anciens et rizières en terrasses",
      category: "Plage",
      amenities: ["Piscine à débordement", "Yoga", "Restaurant bio", "Spa balinais"],
      highlights: ["Rizières d'Ubud", "Temples sacrés", "Plages paradisiaques"]
    },
    {
      id: "6",
      name: "New York",
      location: "États-Unis",
      country: "USA",
      image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
      rating: 4.7,
      reviews: 4123,
      price: "620000",
      description: "La ville qui ne dort jamais, capitale culturelle et économique",
      category: "Ville",
      amenities: ["WiFi gratuit", "Concierge 24/7", "Bar lounge", "Salle de gym"],
      highlights: ["Statue de la Liberté", "Times Square", "Central Park"]
    },
    {
      id: "7",
      name: "Rome",
      location: "Italie",
      country: "Italy",
      image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
      rating: 4.8,
      reviews: 2934,
      price: "420000",
      description: "La ville éternelle, berceau de la civilisation occidentale",
      category: "Ville",
      amenities: ["WiFi gratuit", "Restaurant italien", "Bar à vin", "Terrasse panoramique"],
      highlights: ["Colisée", "Vatican", "Fontaine de Trevi"]
    },
    {
      id: "8",
      name: "Barcelone",
      location: "Espagne",
      country: "Spain",
      image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80",
      rating: 4.8,
      reviews: 2645,
      price: "390000",
      description: "Architecture de Gaudí, plages méditerranéennes et vie nocturne",
      category: "Plage",
      amenities: ["Piscine sur le toit", "WiFi gratuit", "Restaurant tapas", "Café-bar"],
      highlights: ["Sagrada Familia", "Parc Güell", "Plages de Barceloneta"]
    },
    {
      id: "9",
      name: "Bangkok",
      location: "Thaïlande",
      country: "Thailand",
      image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80",
      rating: 4.7,
      reviews: 2187,
      price: "340000",
      description: "Temples dorés, street food légendaire et marchés flottants",
      category: "Ville",
      amenities: ["WiFi gratuit", "Restaurant thaï", "Massage traditionnel", "Piscine"],
      highlights: ["Grand Palais", "Marchés flottants", "Street food"]
    }
  ];
}

function getCategoryFromName(name: string): string {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('plage') || nameLower.includes('beach') || nameLower.includes('mer') || 
      nameLower.includes('maldives') || nameLower.includes('bali') || nameLower.includes('barcelone')) {
    return 'Plage';
  }
  if (nameLower.includes('montagne') || nameLower.includes('mountain') || nameLower.includes('alpes')) {
    return 'Montagne';
  }
  return 'Ville';
}

function getAmenitiesForCategory(category: string): string[] {
  const commonAmenities = ['WiFi gratuit', 'Restaurant'];
  
  if (category === 'Plage') {
    return [...commonAmenities, 'Piscine', 'Spa', 'Plage privée'];
  } else if (category === 'Montagne') {
    return [...commonAmenities, 'Cheminée', 'Vue panoramique', 'Ski'];
  } else {
    return [...commonAmenities, 'Bar', 'Concierge', 'Salle de fitness'];
  }
}

function getHighlightsForDestination(name: string, category: string): string[] {
  const highlights: string[] = [];
  
  if (category === 'Plage') {
    highlights.push('Plages paradisiaques', 'Sports nautiques', 'Couchers de soleil');
  } else if (category === 'Montagne') {
    highlights.push('Vues panoramiques', 'Randonnées', 'Air pur');
  } else {
    highlights.push('Sites historiques', 'Gastronomie locale', 'Vie culturelle');
  }
  
  return highlights;
}

function getDefaultImage(index: number): string {
  const images = [
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
    "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80",
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
    "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
    "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80",
    "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80"
  ];
  return images[index % images.length];
}
