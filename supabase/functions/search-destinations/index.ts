import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CACHE_TTL_HOURS = 1; // Cache duration in hours

// Initialize Supabase client for cache operations
function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Generate cache key from search parameters
function getCacheKey(query?: string | null, category?: string | null): string {
  const q = query?.toLowerCase().trim() || 'default';
  const c = category?.toLowerCase().trim() || 'all';
  return `destinations_${q}_${c}`;
}

// Get cached destinations from database
async function getCachedDestinations(cacheKey: string): Promise<{ destinations: any[]; source: string } | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('destinations_cache')
      .select('destinations, source')
      .eq('cache_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (error || !data) {
      console.log(`Cache miss for key: ${cacheKey}`);
      return null;
    }
    
    console.log(`Cache hit for key: ${cacheKey}`);
    return { destinations: data.destinations, source: `${data.source}-cached` };
  } catch (e) {
    console.error('Cache read error:', e);
    return null;
  }
}

// Store destinations in cache
async function setCachedDestinations(cacheKey: string, destinations: any[], source: string): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + CACHE_TTL_HOURS);
    
    const { error } = await supabase
      .from('destinations_cache')
      .upsert({
        cache_key: cacheKey,
        destinations,
        source,
        expires_at: expiresAt.toISOString(),
      }, { onConflict: 'cache_key' });
    
    if (error) {
      console.error('Cache write error:', error);
    } else {
      console.log(`Cached ${destinations.length} destinations with key: ${cacheKey}`);
    }
    
    // Clean expired cache entries (async, don't wait)
    cleanExpiredCache().catch(console.log);
  } catch (e) {
    console.error('Cache store error:', e);
  }
}

// Clean expired cache entries
async function cleanExpiredCache(): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    await supabase.rpc('clean_expired_destinations_cache');
    console.log('Expired cache entries cleaned');
  } catch (e) {
    console.log('Cache cleanup skipped:', e);
  }
}

interface Destination {
  id: string;
  name: string;
  location: string;
  country: string;
  image: string;
  images: string[];
  rating: number;
  reviews: number;
  price: number;
  currency: string;
  description: string;
  category: string;
  amenities: string[];
  highlights: string[];
  temperature?: number;
  bestTime?: string;
  trending?: boolean;
  source: string;
}

// Enhanced TripAdvisor API search with location details
async function searchTripAdvisorLocation(
  query: string,
  rapidApiKey: string
): Promise<Destination[]> {
  try {
    console.log('Searching TripAdvisor for:', query);
    
    // Step 1: Search for location
    const searchResponse = await fetch(
      `https://travel-advisor.p.rapidapi.com/locations/search?query=${encodeURIComponent(query)}&limit=5&offset=0&units=km&currency=EUR&sort=relevance&lang=fr_FR`,
      {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com'
        }
      }
    );

    if (!searchResponse.ok) {
      console.error('TripAdvisor search error:', searchResponse.status);
      return [];
    }

    const searchData = await searchResponse.json();
    const results: Destination[] = [];
    
    if (searchData.data && Array.isArray(searchData.data)) {
      for (const item of searchData.data.slice(0, 3)) {
        const loc = item.result_object;
        if (!loc) continue;

        const locationId = loc.location_id;
        let photos: string[] = [];
        let details: any = null;

        // Step 2: Get location photos
        try {
          const photosResponse = await fetch(
            `https://travel-advisor.p.rapidapi.com/photos/list?location_id=${locationId}&currency=EUR&lang=fr_FR&limit=5`,
            {
              headers: {
                'X-RapidAPI-Key': rapidApiKey,
                'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com'
              }
            }
          );
          
          if (photosResponse.ok) {
            const photosData = await photosResponse.json();
            if (photosData.data && Array.isArray(photosData.data)) {
              photos = photosData.data
                .slice(0, 5)
                .map((p: any) => p.images?.large?.url || p.images?.original?.url)
                .filter(Boolean);
            }
          }
        } catch (e) {
          console.log('Photos fetch failed for:', locationId);
        }

        // Step 3: Get location details
        try {
          const detailsResponse = await fetch(
            `https://travel-advisor.p.rapidapi.com/locations/${locationId}/details?currency=EUR&lang=fr_FR`,
            {
              headers: {
                'X-RapidAPI-Key': rapidApiKey,
                'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com'
              }
            }
          );
          
          if (detailsResponse.ok) {
            details = await detailsResponse.json();
          }
        } catch (e) {
          console.log('Details fetch failed for:', locationId);
        }

        const mainImage = photos[0] || loc.photo?.images?.large?.url || getDefaultImage(query);
        const category = getCategoryFromType(loc.location_type, loc.subcategory);
        
        results.push({
          id: `ta-${locationId}`,
          name: loc.name || query,
          location: getLocationString(loc),
          country: getCountryFromLocation(loc, details),
          image: mainImage,
          images: photos.length > 0 ? photos : [mainImage],
          rating: parseFloat(loc.rating || details?.rating || '4.5'),
          reviews: parseInt(loc.num_reviews || details?.num_reviews || '0') || generateReviewCount(),
          price: getEstimatedPrice(query, category),
          currency: 'EUR',
          description: details?.description || loc.description || generateDescription(loc.name || query, category),
          category,
          amenities: getAmenitiesForCategory(category),
          highlights: details?.subcategory || getHighlightsForDestination(query),
          temperature: getTemperature(query),
          bestTime: getBestTime(query),
          trending: Math.random() > 0.7,
          source: 'tripadvisor',
        });
      }
    }
    
    console.log('TripAdvisor results:', results.length);
    return results;
  } catch (error) {
    console.error('TripAdvisor API exception:', error);
    return [];
  }
}

// Search TripAdvisor Attractions
async function searchTripAdvisorAttractions(
  query: string,
  rapidApiKey: string
): Promise<Destination[]> {
  try {
    // First get location ID
    const searchResponse = await fetch(
      `https://travel-advisor.p.rapidapi.com/locations/search?query=${encodeURIComponent(query)}&limit=1&offset=0&units=km&currency=EUR&lang=fr_FR`,
      {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com'
        }
      }
    );

    if (!searchResponse.ok) return [];

    const searchData = await searchResponse.json();
    const locationId = searchData.data?.[0]?.result_object?.location_id;
    
    if (!locationId) return [];

    // Get attractions for this location
    const attractionsResponse = await fetch(
      `https://travel-advisor.p.rapidapi.com/attractions/list?location_id=${locationId}&currency=EUR&lang=fr_FR&limit=5&sort=recommended`,
      {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com'
        }
      }
    );

    if (!attractionsResponse.ok) return [];

    const attractionsData = await attractionsResponse.json();
    const results: Destination[] = [];

    if (attractionsData.data && Array.isArray(attractionsData.data)) {
      for (const attraction of attractionsData.data.slice(0, 3)) {
        if (!attraction.name) continue;

        results.push({
          id: `ta-attr-${attraction.location_id || results.length}`,
          name: attraction.name,
          location: attraction.location_string || query,
          country: getCountryFromAttraction(attraction),
          image: attraction.photo?.images?.large?.url || getDefaultImage(attraction.name),
          images: [attraction.photo?.images?.large?.url || getDefaultImage(attraction.name)],
          rating: parseFloat(attraction.rating || '4.5'),
          reviews: parseInt(attraction.num_reviews || '0') || generateReviewCount(),
          price: getEstimatedPrice(query, 'Attraction'),
          currency: 'EUR',
          description: attraction.description || `Découvrez ${attraction.name}`,
          category: 'Attraction',
          amenities: ['Visite guidée', 'Photos autorisées', 'Accessible'],
          highlights: attraction.subcategory?.map((s: any) => s.name) || ['À voir absolument'],
          temperature: getTemperature(query),
          bestTime: getBestTime(query),
          trending: Math.random() > 0.6,
          source: 'tripadvisor-attractions',
        });
      }
    }

    return results;
  } catch (error) {
    console.error('TripAdvisor Attractions error:', error);
    return [];
  }
}

function getLocationString(loc: any): string {
  if (loc.location_string) return loc.location_string;
  if (loc.address_obj) {
    const parts = [loc.address_obj.city, loc.address_obj.state, loc.address_obj.country].filter(Boolean);
    return parts.join(', ') || 'Destination populaire';
  }
  return 'Destination populaire';
}

function getCountryFromLocation(loc: any, details: any): string {
  if (details?.address_obj?.country) return details.address_obj.country;
  if (loc.address_obj?.country) return loc.address_obj.country;
  if (loc.ancestors && Array.isArray(loc.ancestors)) {
    const country = loc.ancestors.find((a: any) => a.level === 'Country');
    if (country) return country.name;
  }
  return 'International';
}

function getCountryFromAttraction(attraction: any): string {
  if (attraction.address_obj?.country) return attraction.address_obj.country;
  const locationParts = (attraction.location_string || '').split(', ');
  return locationParts[locationParts.length - 1] || 'International';
}

function getCategoryFromType(locationType: string, subcategory?: any[]): string {
  const type = (locationType || '').toLowerCase();
  const subNames = subcategory?.map((s: any) => (s.name || '').toLowerCase()).join(' ') || '';
  
  if (type.includes('beach') || subNames.includes('beach') || subNames.includes('plage')) return 'Plage';
  if (type.includes('mountain') || subNames.includes('mountain') || subNames.includes('ski')) return 'Montagne';
  if (type.includes('island') || subNames.includes('island') || subNames.includes('île')) return 'Île';
  if (type.includes('nature') || subNames.includes('parc') || subNames.includes('nature')) return 'Nature';
  if (type.includes('historic') || subNames.includes('historic') || subNames.includes('museum')) return 'Culture';
  return 'Ville';
}

function getEstimatedPrice(destinationName: string, category: string): number {
  const basePrices: Record<string, number> = {
    'Paris': 450, 'Dubai': 650, 'Maldives': 1200, 'Tokyo': 850,
    'Bali': 580, 'New York': 720, 'Rome': 420, 'Barcelona': 380,
    'Bangkok': 490, 'Londres': 520, 'Sydney': 1100, 'Santorini': 680,
    'Marrakech': 320, 'Istanbul': 380, 'Singapour': 780
  };
  
  const categoryMultiplier: Record<string, number> = {
    'Plage': 1.2, 'Île': 1.4, 'Montagne': 1.1, 'Culture': 0.9, 'Nature': 1.0, 'Ville': 1.0, 'Attraction': 0.7
  };
  
  const basePrice = basePrices[destinationName] || (350 + Math.floor(Math.random() * 400));
  const multiplier = categoryMultiplier[category] || 1.0;
  
  return Math.round(basePrice * multiplier);
}

function generateDescription(name: string, category: string): string {
  const descriptions: Record<string, string[]> = {
    'Plage': [
      `Plages paradisiaques et eaux cristallines vous attendent à ${name}.`,
      `${name} offre des plages de sable fin et un soleil généreux toute l'année.`
    ],
    'Montagne': [
      `Découvrez les sommets majestueux et l'air pur de ${name}.`,
      `${name} propose des paysages montagneux à couper le souffle.`
    ],
    'Île': [
      `Évadez-vous sur l'île paradisiaque de ${name}.`,
      `${name} : un écrin de nature préservée au milieu de l'océan.`
    ],
    'Culture': [
      `Plongez dans l'histoire et la culture fascinante de ${name}.`,
      `${name} regorge de trésors historiques et culturels.`
    ],
    'Ville': [
      `Explorez les charmes urbains et la vie trépidante de ${name}.`,
      `${name} : une métropole vibrante aux mille facettes.`
    ],
    'Nature': [
      `Immergez-vous dans la nature préservée de ${name}.`,
      `${name} offre des paysages naturels exceptionnels.`
    ]
  };
  
  const options = descriptions[category] || descriptions['Ville'];
  return options[Math.floor(Math.random() * options.length)];
}

function generateReviewCount(): number {
  return 800 + Math.floor(Math.random() * 4000);
}

function getHighlightsForDestination(name: string): string[] {
  const highlightsMap: Record<string, string[]> = {
    'Paris': ['Tour Eiffel', 'Musée du Louvre', 'Montmartre', 'Notre-Dame', 'Champs-Élysées'],
    'Dubai': ['Burj Khalifa', 'Desert Safari', 'Dubai Mall', 'Palm Jumeirah', 'Gold Souk'],
    'Bali': ['Rizières de Tegallalang', 'Temple Uluwatu', 'Ubud', 'Plage de Kuta', 'Tanah Lot'],
    'Tokyo': ['Temple Senso-ji', 'Shibuya Crossing', 'Mont Fuji', 'Akihabara', 'Harajuku'],
    'New York': ['Statue de la Liberté', 'Times Square', 'Central Park', 'Empire State', 'Brooklyn Bridge'],
    'Rome': ['Colisée', 'Vatican', 'Fontaine de Trevi', 'Panthéon', 'Forum Romain'],
    'Maldives': ['Bungalows sur pilotis', 'Snorkeling', 'Plages privées', 'Couchers de soleil', 'Spa'],
    'Barcelona': ['Sagrada Família', 'Parc Güell', 'La Rambla', 'Plage Barceloneta', 'Casa Batlló'],
    'Bangkok': ['Grand Palais', 'Wat Pho', 'Marchés flottants', 'Cuisine de rue', 'Temples'],
    'Santorini': ['Couchers de soleil à Oia', 'Plages volcaniques', 'Villages blancs', 'Caldera', 'Vin local']
  };
  return highlightsMap[name] || ['Sites historiques', 'Gastronomie locale', 'Culture unique', 'Nature préservée'];
}

function getAmenitiesForCategory(category: string): string[] {
  const amenitiesMap: Record<string, string[]> = {
    'Plage': ['Plage de sable fin', 'Sports nautiques', 'Restaurant bord de mer', 'Transats', 'Parasols'],
    'Montagne': ['Randonnées', 'Vue panoramique', 'Air pur', 'Activités outdoor', 'Refuges'],
    'Île': ['Plage privée', 'Snorkeling', 'Excursions bateau', 'Spa', 'Cuisine locale'],
    'Culture': ['Musées', 'Monuments historiques', 'Visites guidées', 'Artisanat local', 'Festivals'],
    'Nature': ['Randonnées', 'Observation faune', 'Camping', 'Photos nature', 'Éco-tourisme'],
    'Ville': ['Shopping', 'Restaurants', 'Vie nocturne', 'Transports', 'Attractions'],
    'Attraction': ['Billetterie', 'Audio-guide', 'Boutique souvenirs', 'Café', 'WiFi']
  };
  return amenitiesMap[category] || amenitiesMap['Ville'];
}

function getTemperature(name: string): number {
  const tempMap: Record<string, number> = {
    'Paris': 15, 'Dubai': 35, 'Maldives': 30, 'Tokyo': 18, 'Bali': 28,
    'New York': 14, 'Rome': 20, 'Barcelona': 22, 'Bangkok': 32, 'Santorini': 25,
    'Marrakech': 28, 'Londres': 12, 'Sydney': 22, 'Istanbul': 18, 'Singapour': 31
  };
  return tempMap[name] || (18 + Math.floor(Math.random() * 15));
}

function getBestTime(name: string): string {
  const timeMap: Record<string, string> = {
    'Paris': 'Avril - Octobre', 'Dubai': 'Novembre - Mars', 'Maldives': 'Décembre - Avril',
    'Tokyo': 'Mars - Mai', 'Bali': 'Avril - Octobre', 'New York': 'Avril - Juin',
    'Rome': 'Avril - Juin', 'Barcelona': 'Mai - Septembre', 'Bangkok': 'Novembre - Février',
    'Santorini': 'Mai - Octobre', 'Marrakech': 'Mars - Mai', 'Londres': 'Mai - Septembre'
  };
  return timeMap[name] || 'Toute l\'année';
}

function getDefaultImage(query: string): string {
  const imageMap: Record<string, string> = {
    'Paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
    'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
    'Maldives': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
    'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    'Bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
    'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
    'Rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80',
    'Barcelona': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80',
    'Bangkok': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80',
    'Santorini': 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&q=80',
    'Marrakech': 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&q=80',
    'Londres': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
    'Sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80',
    'Istanbul': 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&q=80',
    'Singapour': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80'
  };
  
  return imageMap[query] || `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80`;
}

function getFallbackDestinations(): Destination[] {
  return [
    { id: "1", name: "Paris", location: "Île-de-France, France", country: "France", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80", images: ["https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80"], rating: 4.9, reviews: 3245, price: 450, currency: "EUR", description: "La Ville Lumière vous attend avec ses monuments iconiques, sa gastronomie raffinée et son art de vivre unique.", category: "Ville", amenities: ["Monuments historiques", "Gastronomie", "Shopping", "Musées", "Vie nocturne"], highlights: ["Tour Eiffel", "Louvre", "Montmartre", "Notre-Dame", "Champs-Élysées"], temperature: 15, bestTime: "Avril - Octobre", trending: true, source: "fallback" },
    { id: "2", name: "Dubaï", location: "Émirats Arabes Unis", country: "UAE", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80", images: ["https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80"], rating: 4.9, reviews: 2890, price: 650, currency: "EUR", description: "Entre luxe futuriste et traditions arabes, Dubaï offre une expérience unique au cœur du désert.", category: "Ville", amenities: ["Shopping luxe", "Plages", "Architecture", "Désert", "Restaurants étoilés"], highlights: ["Burj Khalifa", "Desert Safari", "Dubai Mall", "Palm Jumeirah"], temperature: 35, bestTime: "Novembre - Mars", trending: true, source: "fallback" },
    { id: "3", name: "Maldives", location: "Océan Indien", country: "Maldives", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80", images: ["https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80"], rating: 5.0, reviews: 1876, price: 1200, currency: "EUR", description: "Paradis sur terre avec ses eaux turquoise, ses bungalows sur pilotis et ses récifs coralliens préservés.", category: "Île", amenities: ["Plage privée", "Snorkeling", "Spa", "Bungalows pilotis", "Plongée"], highlights: ["Bungalows sur l'eau", "Récifs coralliens", "Couchers de soleil", "Dauphins"], temperature: 30, bestTime: "Décembre - Avril", trending: true, source: "fallback" },
    { id: "4", name: "Tokyo", location: "Japon", country: "Japon", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80", images: ["https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80"], rating: 4.8, reviews: 2567, price: 850, currency: "EUR", description: "Fusion parfaite entre tradition millénaire et innovation technologique dans la capitale nippone.", category: "Ville", amenities: ["Temples", "Technologie", "Gastronomie", "Shopping", "Culture pop"], highlights: ["Temple Senso-ji", "Shibuya Crossing", "Mont Fuji", "Akihabara"], temperature: 18, bestTime: "Mars - Mai", trending: false, source: "fallback" },
    { id: "5", name: "Bali", location: "Indonésie", country: "Indonésie", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80", images: ["https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80"], rating: 4.9, reviews: 3102, price: 580, currency: "EUR", description: "L'île des dieux enchante par ses rizières en terrasses, ses temples mystiques et ses plages de rêve.", category: "Île", amenities: ["Plages", "Temples", "Rizières", "Yoga", "Spa"], highlights: ["Rizières de Tegallalang", "Temple Uluwatu", "Ubud", "Tanah Lot"], temperature: 28, bestTime: "Avril - Octobre", trending: true, source: "fallback" },
    { id: "6", name: "New York", location: "États-Unis", country: "USA", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80", images: ["https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80"], rating: 4.7, reviews: 4123, price: 720, currency: "EUR", description: "La ville qui ne dort jamais offre une énergie unique, des gratte-ciels iconiques et une diversité culturelle sans pareille.", category: "Ville", amenities: ["Shopping", "Broadway", "Musées", "Parcs", "Gastronomie"], highlights: ["Statue de la Liberté", "Times Square", "Central Park", "Empire State"], temperature: 14, bestTime: "Avril - Juin", trending: false, source: "fallback" },
    { id: "7", name: "Santorini", location: "Grèce", country: "Grèce", image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&q=80", images: ["https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&q=80"], rating: 4.9, reviews: 2156, price: 680, currency: "EUR", description: "Villages blancs perchés sur la caldeira, couchers de soleil légendaires et charme grec authentique.", category: "Île", amenities: ["Couchers de soleil", "Vins locaux", "Plages volcaniques", "Architecture", "Gastronomie"], highlights: ["Oia", "Caldeira", "Plage Rouge", "Fira", "Vignobles"], temperature: 25, bestTime: "Mai - Octobre", trending: true, source: "fallback" },
    { id: "8", name: "Marrakech", location: "Maroc", country: "Maroc", image: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&q=80", images: ["https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&q=80"], rating: 4.6, reviews: 1987, price: 320, currency: "EUR", description: "La ville ocre envoûte par ses souks colorés, ses riads secrets et son atmosphère magique.", category: "Culture", amenities: ["Souks", "Riads", "Hammams", "Jardins", "Artisanat"], highlights: ["Médina", "Jardins Majorelle", "Place Jemaa el-Fna", "Palais Bahia"], temperature: 28, bestTime: "Mars - Mai", trending: false, source: "fallback" },
    { id: "9", name: "Barcelona", location: "Espagne", country: "Espagne", image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80", images: ["https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80"], rating: 4.8, reviews: 2789, price: 380, currency: "EUR", description: "Architecture de Gaudí, plages méditerranéennes et vie nocturne animée dans la capitale catalane.", category: "Ville", amenities: ["Plages", "Architecture", "Tapas", "Vie nocturne", "Football"], highlights: ["Sagrada Família", "Parc Güell", "La Rambla", "Plage Barceloneta"], temperature: 22, bestTime: "Mai - Septembre", trending: true, source: "fallback" }
  ];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const searchQuery = url.searchParams.get('query');
    const category = url.searchParams.get('category');
    
    // Generate cache key
    const cacheKey = getCacheKey(searchQuery, category);
    
    // Check cache first
    const cached = await getCachedDestinations(cacheKey);
    if (cached) {
      console.log(`Returning cached destinations for: ${cacheKey}`);
      return new Response(
        JSON.stringify({ 
          destinations: cached.destinations, 
          source: cached.source, 
          total: cached.destinations.length,
          cached: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    
    if (!rapidApiKey) {
      console.log('RAPIDAPI_KEY not configured, returning fallback destinations');
      let destinations = getFallbackDestinations();
      
      if (searchQuery) {
        destinations = destinations.filter(d => 
          d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.country.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      if (category && category !== 'all') {
        destinations = destinations.filter(d => d.category.toLowerCase() === category.toLowerCase());
      }
      
      // Cache fallback results too
      await setCachedDestinations(cacheKey, destinations, 'fallback');
      
      return new Response(
        JSON.stringify({ destinations, source: 'fallback', total: destinations.length, cached: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching destinations from TripAdvisor API...');

    const popularQueries = searchQuery 
      ? [searchQuery] 
      : ['Paris', 'Dubai', 'Bali', 'Tokyo', 'Maldives', 'Santorini', 'Barcelona', 'Marrakech', 'New York'];
    
    // Fetch from TripAdvisor with locations and attractions
    const allResults = await Promise.all(
      popularQueries.map(async (query) => {
        const [locations, attractions] = await Promise.all([
          searchTripAdvisorLocation(query, rapidApiKey),
          searchTripAdvisorAttractions(query, rapidApiKey),
        ]);
        return [...locations, ...attractions];
      })
    );

    // Flatten and deduplicate by name
    const allDestinations = allResults.flat();
    let uniqueDestinations = allDestinations.reduce((acc: Destination[], dest) => {
      if (!acc.find(d => d.name.toLowerCase() === dest.name.toLowerCase())) {
        acc.push(dest);
      }
      return acc;
    }, []);

    // Apply category filter
    if (category && category !== 'all') {
      uniqueDestinations = uniqueDestinations.filter(d => 
        d.category.toLowerCase() === category.toLowerCase()
      );
    }

    console.log(`Total unique destinations: ${uniqueDestinations.length}`);

    if (uniqueDestinations.length > 0) {
      // Cache the API results
      await setCachedDestinations(cacheKey, uniqueDestinations, 'tripadvisor');
      
      return new Response(
        JSON.stringify({ 
          destinations: uniqueDestinations, 
          source: 'tripadvisor', 
          total: uniqueDestinations.length,
          cached: false 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fallback if no results
    console.log('No destinations from API, using fallback');
    let fallback = getFallbackDestinations();
    
    if (category && category !== 'all') {
      fallback = fallback.filter(d => d.category.toLowerCase() === category.toLowerCase());
    }
    
    // Cache fallback too
    await setCachedDestinations(cacheKey, fallback, 'fallback');
    
    return new Response(
      JSON.stringify({ destinations: fallback, source: 'fallback', total: fallback.length, cached: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-destinations function:', error);
    return new Response(
      JSON.stringify({ destinations: getFallbackDestinations(), source: 'error-fallback', cached: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
