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

// Search using Real-Time Events Search API
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

    return (data.data || []).slice(0, 10).map((event: any, index: number) => ({
      id: `realtime-${event.event_id || index}`,
      name: event.name || 'Événement',
      description: event.description || '',
      location: event.venue?.name || location,
      address: event.venue?.address || '',
      date: event.start_time || date || '',
      endDate: event.end_time || '',
      price: event.ticket_price || 'N/A',
      currency: 'XOF',
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

// Search using Ticketmaster Events API
async function searchTicketmaster(
  location: string,
  date: string | undefined,
  category: string | undefined,
  rapidApiKey: string
): Promise<EventResult[]> {
  try {
    console.log('Searching Ticketmaster API...');
    
    const searchParams = new URLSearchParams({
      keyword: location,
      size: '10',
      ...(date && { startDateTime: `${date}T00:00:00Z` }),
    });

    const response = await fetch(
      `https://ticketmaster-api.p.rapidapi.com/events?${searchParams}`,
      {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'ticketmaster-api.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      console.error('Ticketmaster API error:', response.status);
      return [];
    }

    const data = await response.json();
    const events = data._embedded?.events || data.events || [];
    console.log('Ticketmaster events found:', events.length);

    return events.slice(0, 10).map((event: any, index: number) => ({
      id: `ticketmaster-${event.id || index}`,
      name: event.name || 'Événement',
      description: event.info || event.description || '',
      location: event._embedded?.venues?.[0]?.name || location,
      address: event._embedded?.venues?.[0]?.address?.line1 || '',
      date: event.dates?.start?.localDate || date || '',
      endDate: event.dates?.end?.localDate || '',
      price: event.priceRanges?.[0]?.min ? `${Math.round(event.priceRanges[0].min * 655.957)} XOF` : 'N/A',
      currency: 'XOF',
      image: event.images?.[0]?.url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
      category: event.classifications?.[0]?.segment?.name || category || 'Événement',
      link: event.url || '',
      source: 'ticketmaster',
    }));
  } catch (error) {
    console.error('Ticketmaster API exception:', error);
    return [];
  }
}

// Search using SerpApi Google Events
async function searchSerpApiEvents(
  location: string,
  date: string | undefined,
  rapidApiKey: string
): Promise<EventResult[]> {
  try {
    console.log('Searching SerpApi Google Events...');
    
    const searchParams = new URLSearchParams({
      q: `events in ${location}`,
      engine: 'google_events',
      hl: 'fr',
    });

    const response = await fetch(
      `https://serpapi.p.rapidapi.com/search?${searchParams}`,
      {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'serpapi.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      console.error('SerpApi Events error:', response.status);
      return [];
    }

    const data = await response.json();
    const events = data.events_results || [];
    console.log('SerpApi events found:', events.length);

    return events.slice(0, 10).map((event: any, index: number) => ({
      id: `serpapi-${index}`,
      name: event.title || 'Événement',
      description: event.description || '',
      location: event.venue?.name || location,
      address: event.address?.[0] || event.venue?.address || '',
      date: event.date?.start_date || date || '',
      endDate: event.date?.end_date || '',
      price: event.ticket_info?.price || 'N/A',
      currency: 'XOF',
      image: event.thumbnail || event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
      category: 'Événement',
      link: event.link || '',
      source: 'serpapi',
    }));
  } catch (error) {
    console.error('SerpApi Events exception:', error);
    return [];
  }
}

// Mock events as fallback
function getMockEvents(location: string, date: string | undefined, category: string | undefined): EventResult[] {
  const categories = ['Concert', 'Festival', 'Sport', 'Théâtre', 'Conférence'];
  const mockDate = date || new Date().toISOString().split('T')[0];
  
  return [
    {
      id: 'mock-1',
      name: `Festival de Musique ${location}`,
      description: `Grand festival de musique à ${location}`,
      location: `Centre culturel de ${location}`,
      address: `Avenue principale, ${location}`,
      date: mockDate,
      endDate: '',
      price: '25000 XOF',
      currency: 'XOF',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
      category: category || 'Festival',
      link: '',
      source: 'mock',
    },
    {
      id: 'mock-2',
      name: `Concert Jazz ${location}`,
      description: `Soirée jazz avec artistes internationaux`,
      location: `Palais des congrès de ${location}`,
      address: `Boulevard central, ${location}`,
      date: mockDate,
      endDate: '',
      price: '15000 XOF',
      currency: 'XOF',
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
      price: '5000 XOF',
      currency: 'XOF',
      image: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e',
      category: 'Exposition',
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
          total: 3,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search all event APIs in parallel
    const [realTimeResults, ticketmasterResults, serpApiResults] = await Promise.all([
      searchRealTimeEvents(location, date, category, rapidApiKey),
      searchTicketmaster(location, date, category, rapidApiKey),
      searchSerpApiEvents(location, date, rapidApiKey),
    ]);

    const allEvents = [...realTimeResults, ...ticketmasterResults, ...serpApiResults];
    
    console.log(`Total events found: ${allEvents.length} (RealTime: ${realTimeResults.length}, Ticketmaster: ${ticketmasterResults.length}, SerpApi: ${serpApiResults.length})`);

    // If no results from APIs, return mock data
    if (allEvents.length === 0) {
      console.log('No events from APIs, returning mock data');
      return new Response(
        JSON.stringify({
          success: true,
          events: getMockEvents(location, date, category),
          total: 3,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        events: allEvents,
        total: allEvents.length,
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
