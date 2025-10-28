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
    const { location, checkIn, checkOut, adults, children, rooms } = await req.json();

    const BOOKING_API_KEY = Deno.env.get('BOOKING_API_KEY');
    const AIRBNB_API_KEY = Deno.env.get('AIRBNB_API_KEY');

    const results = {
      booking: [],
      airbnb: [],
    };

    // Search Booking.com
    if (BOOKING_API_KEY) {
      try {
        const bookingParams = new URLSearchParams({
          location: location,
          checkin: checkIn,
          checkout: checkOut,
          adults: adults.toString(),
          children: children?.toString() || '0',
          room_qty: rooms?.toString() || '1',
        });

        const bookingResponse = await fetch(
          `https://booking-com.p.rapidapi.com/v1/hotels/search?${bookingParams}`,
          {
            headers: {
              'X-RapidAPI-Key': BOOKING_API_KEY,
              'X-RapidAPI-Host': 'booking-com.p.rapidapi.com',
            },
          }
        );

        if (bookingResponse.ok) {
          const bookingData = await bookingResponse.json();
          results.booking = bookingData.result || [];
        }
      } catch (error) {
        console.error('Booking.com API error:', error);
      }
    }

    // Search Airbnb
    if (AIRBNB_API_KEY) {
      try {
        const airbnbParams = new URLSearchParams({
          location: location,
          checkIn: checkIn,
          checkOut: checkOut,
          adults: adults.toString(),
        });

        const airbnbResponse = await fetch(
          `https://airbnb13.p.rapidapi.com/search-location?${airbnbParams}`,
          {
            headers: {
              'X-RapidAPI-Key': AIRBNB_API_KEY,
              'X-RapidAPI-Host': 'airbnb13.p.rapidapi.com',
            },
          }
        );

        if (airbnbResponse.ok) {
          const airbnbData = await airbnbResponse.json();
          results.airbnb = airbnbData.results || [];
        }
      } catch (error) {
        console.error('Airbnb API error:', error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: results,
        count: results.booking.length + results.airbnb.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in search-hotels:', error);
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