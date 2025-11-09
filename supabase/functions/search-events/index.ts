import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, date, category } = await req.json();
    
    console.log('Searching events:', { location, date, category });

    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    if (!rapidApiKey) {
      throw new Error('RAPIDAPI_KEY not configured');
    }

    // Search for events using RapidAPI Real-Time Events Search
    const searchParams = new URLSearchParams({
      query: location,
      ...(date && { start_date: date }),
      ...(category && { category }),
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
      console.error('RapidAPI error:', response.status, await response.text());
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Events found:', data.data?.length || 0);

    // Transform the data to match our frontend format
    const events = (data.data || []).map((event: any) => ({
      id: event.event_id,
      name: event.name,
      description: event.description,
      location: event.venue?.name || location,
      address: event.venue?.address,
      date: event.start_time,
      endDate: event.end_time,
      price: event.ticket_price || 'N/A',
      currency: 'USD',
      image: event.thumbnail,
      category: event.category?.[0] || category,
      link: event.link,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        events,
        total: events.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
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
