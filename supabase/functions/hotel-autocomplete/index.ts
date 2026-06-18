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
    const { query } = await req.json();
    console.log('Hotel autocomplete search for:', query);

    if (!query || query.length < 2) {
      return new Response(
        JSON.stringify({ success: true, data: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');
    const results: any[] = [];

    // Search Booking.com for destinations
    if (RAPIDAPI_KEY) {
      try {
        const destSearchParams = new URLSearchParams({
          query: query,
        });

        console.log('Searching Booking.com destinations for:', query);
        
        const destResponse = await fetch(
          `https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination?${destSearchParams}`,
          {
            headers: {
              'X-RapidAPI-Key': RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com',
            },
          }
        );

        if (destResponse.ok) {
          const destData = await destResponse.json();
          console.log('Booking.com autocomplete response:', JSON.stringify(destData).substring(0, 300));
          
          if (destData.data && Array.isArray(destData.data)) {
            const suggestions = destData.data.slice(0, 8).map((item: any) => {
              // Estimate average price based on destination type and location
              let avgPrice = 80; // Default price in EUR
              
              if (item.search_type === 'CITY') {
                // Estimate based on number of hotels (more hotels = more variety = potentially lower avg)
                const hotelCount = item.nr_hotels || 100;
                if (hotelCount > 500) avgPrice = 70;
                else if (hotelCount > 200) avgPrice = 85;
                else avgPrice = 100;
              } else if (item.search_type === 'HOTEL') {
                avgPrice = 115; // Hotels directly tend to be mid-range
              }

              return {
                id: item.dest_id || item.id,
                name: item.search_type === 'CITY' 
                  ? `${item.dest_name || item.name}`
                  : item.dest_name || item.name,
                type: item.search_type || 'CITY',
                country: item.country || '',
                region: item.region || '',
                description: item.search_type === 'CITY'
                  ? `Ville - ${item.nr_hotels || 0} hôtels disponibles`
                  : item.search_type === 'HOTEL'
                  ? `Hôtel`
                  : `Destination`,
                image: item.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
                hotels_count: item.nr_hotels || 0,
                average_price: avgPrice,
                price_range: {
                  min: Math.round(avgPrice * 0.5),
                  max: Math.round(avgPrice * 2)
                }
              };
            });
            
            results.push(...suggestions);
            console.log('Found', suggestions.length, 'autocomplete suggestions');
          }
        } else {
          console.error('Booking.com autocomplete failed:', destResponse.status);
        }
      } catch (error) {
        console.error('Booking.com autocomplete exception:', error);
      }
    }

    // No fallback — return only real API suggestions


    return new Response(
      JSON.stringify({
        success: true,
        data: results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in hotel-autocomplete:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
