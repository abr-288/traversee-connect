import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EventResult {
  id: string;
  name: string;
  description: string;
  location: string;
  address: string;
  date: string;
  endDate: string;
  price: string;
  currency: string;
  image: string;
  category: string;
  link: string;
  source: string;
}

// Search using Real-Time Events Search API (seule API disponible sur RapidAPI)
async function searchRealTimeEvents(
  location: string,
  date: string | undefined,
  category: string | undefined,
  rapidApiKey: string
): Promise<EventResult[]> {
  try {
    console.log('Searching Real-Time Events Search API...');
    
    const searchParams = new URLSearchParams({
      query: location,
      ...(date && { start_date: date }),
    });

    const response = await fetch(
      `https://real-time-events-search.p.rapidapi.com/search-events?${searchParams}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'real-time-events-search.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      console.error('Real-Time Events API error:', response.status);
      return [];
    }

    const data = await response.json();
    console.log('Real-Time Events found:', data.data?.length || 0);

    return (data.data || []).slice(0, 15).map((event: any, index: number) => ({
      id: `realtime-${event.event_id || index}`,
      name: event.name || 'Événement',
      description: event.description || '',
      location: event.venue?.name || location,
      address: event.venue?.address || '',
      date: event.start_time || date || '',
      endDate: event.end_time || '',
      price: event.ticket_price || 'N/A',
      currency: 'EUR',
      image: event.thumbnail || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
      category: event.category?.[0] || category || 'Événement',
      link: event.link || '',
      source: 'realtime-events',
    }));
  } catch (error) {
    console.error('Real-Time Events API exception:', error);
    return [];
  }
}

// Note: Les APIs Ticketmaster et SerpApi n'existent pas sur RapidAPI - supprimées

// Mock events as fallback
function getMockEvents(location: string, date: string | undefined, category: string | undefined): EventResult[] {
  const mockDate = date || new Date().toISOString().split('T')[0];
  
  return [
    {
      id: 'mock-1',
      name: `Festival de Musique ${location}`,
      description: `Grand festival de musique à ${location} avec des artistes internationaux`,
      location: `Centre culturel de ${location}`,
      address: `Avenue principale, ${location}`,
      date: mockDate,
      endDate: '',
      price: '38 EUR',
      currency: 'EUR',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
      category: category || 'Festival',
      link: '',
      source: 'mock',
    },
    {
      id: 'mock-2',
      name: `Concert Jazz ${location}`,
      description: `Soirée jazz avec artistes internationaux et locaux`,
      location: `Palais des congrès de ${location}`,
      address: `Boulevard central, ${location}`,
      date: mockDate,
      endDate: '',
      price: '23 EUR',
      currency: 'EUR',
      image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae',
      category: 'Concert',
      link: '',
      source: 'mock',
    },
    {
      id: 'mock-3',
      name: `Exposition Art Contemporain`,
      description: `Découvrez les artistes locaux et internationaux`,
      location: `Musée d'art de ${location}`,
      address: `Rue de la culture, ${location}`,
      date: mockDate,
      endDate: '',
      price: '8 EUR',
      currency: 'EUR',
      image: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e',
      category: 'Exposition',
      link: '',
      source: 'mock',
    },
    {
      id: 'mock-4',
      name: `Match de Football`,
      description: `Match de championnat national`,
      location: `Stade municipal de ${location}`,
      address: `Avenue du stade, ${location}`,
      date: mockDate,
      endDate: '',
      price: '15 EUR',
      currency: 'EUR',
      image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e',
      category: 'Sport',
      link: '',
      source: 'mock',
    },
    {
      id: 'mock-5',
      name: `Spectacle de Danse Traditionnelle`,
      description: `Découvrez les danses traditionnelles de la région`,
      location: `Théâtre national de ${location}`,
      address: `Place centrale, ${location}`,
      date: mockDate,
      endDate: '',
      price: '12 EUR',
      currency: 'EUR',
      image: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4',
      category: 'Spectacle',
      link: '',
      source: 'mock',
    },
  ];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, date, category } = await req.json();
    
    console.log('Searching events:', { location, date, category });

    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    
    if (!rapidApiKey) {
      console.log('RAPIDAPI_KEY not configured, returning mock data');
      return new Response(
        JSON.stringify({
          success: true,
          events: getMockEvents(location, date, category),
          total: 5,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search Real-Time Events API (seule API disponible)
    const realTimeResults = await searchRealTimeEvents(location, date, category, rapidApiKey);
    
    console.log(`Total events found: ${realTimeResults.length}`);

    // If no results from API, return mock data
    if (realTimeResults.length === 0) {
      console.log('No events from API, returning mock data');
      return new Response(
        JSON.stringify({
          success: true,
          events: getMockEvents(location, date, category),
          total: 5,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        events: realTimeResults,
        total: realTimeResults.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in search-events:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        events: [],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
