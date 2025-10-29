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
    const { origin, destination, departureDate, returnDate, adults, children = 0, rooms = 1, travelClass = 'ECONOMY' } = await req.json();

    console.log('Searching flight + hotel packages:', { origin, destination, departureDate, returnDate, adults, children, rooms, travelClass });

    // Fetch flights
    const flightsResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/search-flights`, {
      method: 'POST',
      headers: {
        'Authorization': req.headers.get('Authorization') || '',
        'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        origin,
        destination,
        departureDate,
        returnDate,
        adults,
        children,
        travelClass,
      }),
    });

    const flightsData = await flightsResponse.json();

    // Fetch hotels
    const hotelsResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/search-hotels`, {
      method: 'POST',
      headers: {
        'Authorization': req.headers.get('Authorization') || '',
        'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location: destination,
        checkIn: departureDate,
        checkOut: returnDate,
        adults,
        children,
        rooms,
      }),
    });

    const hotelsData = await hotelsResponse.json();

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
    return new Response(
      JSON.stringify({ error: error.message }),
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
