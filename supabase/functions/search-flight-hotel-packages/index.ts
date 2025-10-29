import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { origin, destination, departureDate, returnDate, adults, children = 0, rooms = 1, travelClass = 'ECONOMY' } = await req.json();

    console.log('Searching flight + hotel packages:', { origin, destination, departureDate, returnDate, adults, children, rooms, travelClass });

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Fetch flights using Supabase client
    const { data: flightsData, error: flightsError } = await supabaseClient.functions.invoke('search-flights', {
      body: {
        origin,
        destination,
        departureDate,
        returnDate,
        adults,
        children,
        travelClass,
      },
    });

    if (flightsError) {
      console.error('Error fetching flights:', flightsError);
    }

    // Fetch hotels using Supabase client
    const { data: hotelsData, error: hotelsError } = await supabaseClient.functions.invoke('search-hotels', {
      body: {
        location: destination,
        checkIn: departureDate,
        checkOut: returnDate,
        adults,
        children,
        rooms,
      },
    });

    if (hotelsError) {
      console.error('Error fetching hotels:', hotelsError);
    }

    // Combine flights and hotels into packages
    const packages = [];
    const flights = flightsData.flights || [];
    const hotels = hotelsData.hotels || [];

    // Create packages by combining each flight with each hotel
    for (let i = 0; i < Math.min(flights.length, 3); i++) {
      for (let j = 0; j < Math.min(hotels.length, 2); j++) {
        const flight = flights[i];
        const hotel = hotels[j];
        
        const flightPrice = parseFloat(flight.price) || 0;
        const hotelPrice = parseFloat(hotel.price) || 0;
        const totalPrice = flightPrice + hotelPrice;
        const discountedPrice = totalPrice * 0.7; // 30% discount
        const savings = totalPrice - discountedPrice;

        packages.push({
          id: `${i}-${j}`,
          destination: destination,
          flight: {
            airline: flight.airline || 'Compagnie aérienne',
            departure: flight.departure || departureDate,
            return: flight.return || returnDate,
            price: flightPrice,
            origin: origin,
            destination: destination,
            duration: flight.duration || '2h 30min',
            stops: flight.stops || 0,
          },
          hotel: {
            name: hotel.name || 'Hôtel',
            stars: hotel.rating || 4,
            address: hotel.address || destination,
            price: hotelPrice,
            image: hotel.images?.[0] || hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
            amenities: hotel.amenities || ['WiFi', 'Piscine', 'Climatisation'],
            description: hotel.description || 'Hôtel confortable avec toutes les commodités',
          },
          originalPrice: totalPrice,
          discountedPrice: discountedPrice,
          savings: savings,
          currency: 'FCFA',
          duration: calculateNights(departureDate, returnDate),
          includes: [
            'Vol aller-retour',
            `Hôtel ${hotel.rating || 4} étoiles`,
            'Petit-déjeuner',
            'Transferts aéroport',
            'Taxes et frais inclus'
          ],
        });
      }
    }

    console.log(`Created ${packages.length} packages`);

    return new Response(
      JSON.stringify({ packages }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-flight-hotel-packages:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function calculateNights(checkIn: string, checkOut: string): string {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return `${nights} nuit${nights > 1 ? 's' : ''}`;
}
