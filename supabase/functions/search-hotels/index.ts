import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mock hotel data for different cities
const getMockHotels = (location: string) => {
  const baseHotels = [
    {
      id: `${location}-1`,
      name: `Grand Hotel ${location}`,
      location: location,
      price: { grandTotal: 45000 + Math.random() * 20000 },
      rating: 4.5 + Math.random() * 0.4,
      reviews: Math.floor(Math.random() * 200) + 50,
      image: '/placeholder.svg',
      amenities: ['Wifi', 'Restaurant', 'Parking', 'Piscine']
    },
    {
      id: `${location}-2`,
      name: `Luxury Resort ${location}`,
      location: location,
      price: { grandTotal: 75000 + Math.random() * 30000 },
      rating: 4.7 + Math.random() * 0.2,
      reviews: Math.floor(Math.random() * 150) + 80,
      image: '/placeholder.svg',
      amenities: ['Wifi', 'Restaurant', 'Spa', 'Bar']
    },
    {
      id: `${location}-3`,
      name: `Budget Inn ${location}`,
      location: location,
      price: { grandTotal: 25000 + Math.random() * 10000 },
      rating: 4.2 + Math.random() * 0.3,
      reviews: Math.floor(Math.random() * 100) + 30,
      image: '/placeholder.svg',
      amenities: ['Wifi', 'Restaurant']
    },
    {
      id: `${location}-4`,
      name: `Business Hotel ${location}`,
      location: location,
      price: { grandTotal: 55000 + Math.random() * 15000 },
      rating: 4.4 + Math.random() * 0.3,
      reviews: Math.floor(Math.random() * 180) + 60,
      image: '/placeholder.svg',
      amenities: ['Wifi', 'Restaurant', 'Gym', 'Parking']
    }
  ];
  
  return baseHotels;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, checkIn, checkOut, adults, children, rooms } = await req.json();
    console.log('Search hotels for:', { location, checkIn, checkOut, adults, children, rooms });

    const BOOKING_API_KEY = Deno.env.get('BOOKING_API_KEY');
    const AIRBNB_API_KEY = Deno.env.get('AIRBNB_API_KEY');

    const results: {
      booking: any[];
      airbnb: any[];
    } = {
      booking: [],
      airbnb: [],
    };

    let apiSuccess = false;

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
          apiSuccess = true;
          console.log('Booking.com results:', results.booking.length);
        } else {
          console.error('Booking.com API failed:', bookingResponse.status);
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
          apiSuccess = true;
          console.log('Airbnb results:', results.airbnb.length);
        } else {
          console.error('Airbnb API failed:', airbnbResponse.status);
        }
      } catch (error) {
        console.error('Airbnb API error:', error);
      }
    }

    // If no API results, use mock data
    if (!apiSuccess || (results.booking.length === 0 && results.airbnb.length === 0)) {
      console.log('Using mock hotel data for location:', location);
      const mockHotels = getMockHotels(location);
      results.booking = mockHotels;
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: results,
        count: results.booking.length + results.airbnb.length,
        mock: !apiSuccess,
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