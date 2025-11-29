import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FlightOffer {
  id: string;
  airline: string;
  price: number;
  currency: string;
  departure: string;
  return: string;
  duration: string;
  stops: number;
  source: string;
}

interface HotelOffer {
  id: string;
  name: string;
  rating: number;
  price: number;
  currency: string;
  image: string;
  address: string;
  amenities: string[];
  description: string;
  source: string;
}

// Search flights using Kiwi.com API
async function searchKiwiFlights(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate: string,
  adults: number,
  rapidApiKey: string
): Promise<FlightOffer[]> {
  try {
    console.log('Searching Kiwi.com for package flights...');
    
    const params = new URLSearchParams({
      fly_from: origin,
      fly_to: destination,
      date_from: departureDate.replace(/-/g, '/'),
      date_to: departureDate.replace(/-/g, '/'),
      return_from: returnDate.replace(/-/g, '/'),
      return_to: returnDate.replace(/-/g, '/'),
      adults: adults.toString(),
      curr: 'EUR',
      limit: '5',
    });

    const response = await fetch(
      `https://kiwi-com-cheapest-flights.p.rapidapi.com/v2/search?${params}`,
      {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'kiwi-com-cheapest-flights.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      console.error('Kiwi API error:', response.status);
      return [];
    }

    const data = await response.json();
    
    if (data.data && Array.isArray(data.data)) {
      return data.data.slice(0, 5).map((flight: any, index: number) => {
        const route = flight.route?.[0] || {};
        return {
          id: `kiwi-flight-${index}`,
          airline: route.airline || flight.airlines?.[0] || 'Airline',
          price: flight.price || 300,
          currency: 'EUR',
          departure: departureDate,
          return: returnDate,
          duration: `${Math.floor((flight.fly_duration || 7200) / 3600)}h ${Math.floor(((flight.fly_duration || 7200) % 3600) / 60)}min`,
          stops: flight.routes?.[0]?.stops || 0,
          source: 'kiwi',
        };
      });
    }

    return [];
  } catch (error) {
    console.error('Kiwi API exception:', error);
    return [];
  }
}

// Search flights using Sky-Scrapper API (Google Flights)
async function searchSkyScrapperFlights(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate: string,
  adults: number,
  rapidApiKey: string
): Promise<FlightOffer[]> {
  try {
    console.log('Searching Sky-Scrapper for package flights...');
    
    const originResp = await fetch(
      `https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchAirport?query=${origin}`,
      {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'sky-scrapper.p.rapidapi.com',
        },
      }
    );

    if (!originResp.ok) return [];
    const originData = await originResp.json();
    const originAirport = originData.data?.[0];
    if (!originAirport) return [];

    const destResp = await fetch(
      `https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchAirport?query=${destination}`,
      {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'sky-scrapper.p.rapidapi.com',
        },
      }
    );

    if (!destResp.ok) return [];
    const destData = await destResp.json();
    const destAirport = destData.data?.[0];
    if (!destAirport) return [];

    const flightParams = new URLSearchParams({
      originSkyId: originAirport.skyId,
      destinationSkyId: destAirport.skyId,
      originEntityId: originAirport.entityId,
      destinationEntityId: destAirport.entityId,
      date: departureDate,
      returnDate: returnDate,
      adults: adults.toString(),
      currency: 'EUR',
    });

    const flightResp = await fetch(
      `https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchFlights?${flightParams}`,
      {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'sky-scrapper.p.rapidapi.com',
        },
      }
    );

    if (!flightResp.ok) return [];
    const flightData = await flightResp.json();
    
    const itineraries = flightData.data?.itineraries || [];
    return itineraries.slice(0, 5).map((itinerary: any, index: number) => {
      const price = itinerary.price?.raw || 400;
      const firstLeg = itinerary.legs?.[0] || {};
      return {
        id: `sky-flight-${index}`,
        airline: firstLeg.carriers?.marketing?.[0]?.name || 'Airline',
        price: price,
        currency: 'EUR',
        departure: departureDate,
        return: returnDate,
        duration: `${Math.floor((firstLeg.durationInMinutes || 180) / 60)}h ${(firstLeg.durationInMinutes || 180) % 60}min`,
        stops: firstLeg.stopCount || 0,
        source: 'sky-scrapper',
      };
    });
  } catch (error) {
    console.error('Sky-Scrapper API exception:', error);
    return [];
  }
}

// Search flights using Amadeus API
async function searchAmadeusFlights(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate: string,
  adults: number
): Promise<FlightOffer[]> {
  try {
    console.log('Searching Amadeus for package flights...');
    
    const AMADEUS_API_KEY = Deno.env.get('AMADEUS_API_KEY');
    const AMADEUS_API_SECRET = Deno.env.get('AMADEUS_API_SECRET');
    
    if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) return [];

    // Get access token
    const tokenResponse = await fetch('https://api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: AMADEUS_API_KEY,
        client_secret: AMADEUS_API_SECRET,
      }),
    });

    if (!tokenResponse.ok) return [];
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    const searchParams = new URLSearchParams({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate: departureDate,
      returnDate: returnDate,
      adults: adults.toString(),
      currencyCode: 'EUR',
      max: '5',
    });

    const response = await fetch(
      `https://api.amadeus.com/v2/shopping/flight-offers?${searchParams}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) return [];
    const data = await response.json();

    return (data.data || []).slice(0, 5).map((offer: any, index: number) => ({
      id: `amadeus-flight-${index}`,
      airline: offer.validatingAirlineCodes?.[0] || 'Airline',
      price: parseFloat(offer.price?.total || '400'),
      currency: 'EUR',
      departure: departureDate,
      return: returnDate,
      duration: offer.itineraries?.[0]?.duration?.replace('PT', '').toLowerCase() || '3h 00min',
      stops: (offer.itineraries?.[0]?.segments?.length || 1) - 1,
      source: 'amadeus',
    }));
  } catch (error) {
    console.error('Amadeus API exception:', error);
    return [];
  }
}

// Search hotels using Booking.com API
async function searchBookingHotels(
  destination: string,
  checkIn: string,
  checkOut: string,
  adults: number,
  rooms: number,
  rapidApiKey: string
): Promise<HotelOffer[]> {
  try {
    console.log('Searching Booking.com for package hotels...');
    
    const destResp = await fetch(
      `https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination?query=${encodeURIComponent(destination)}`,
      {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com',
        },
      }
    );

    let destId = '-1';
    if (destResp.ok) {
      const destData = await destResp.json();
      if (destData.data?.[0]) {
        destId = destData.data[0].dest_id || destData.data[0].id || '-1';
      }
    }

    const hotelParams = new URLSearchParams({
      dest_id: destId,
      search_type: 'CITY',
      arrival_date: checkIn,
      departure_date: checkOut,
      adults: adults.toString(),
      room_qty: rooms.toString(),
      page_number: '1',
      currency_code: 'EUR',
    });

    const response = await fetch(
      `https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotels?${hotelParams}`,
      {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) return [];
    const data = await response.json();
    
    if (data.data?.hotels && Array.isArray(data.data.hotels)) {
      return data.data.hotels.slice(0, 5).map((hotel: any, index: number) => ({
        id: `booking-hotel-${index}`,
        name: hotel.hotel_name || hotel.name || 'Hôtel',
        rating: Math.round((hotel.review_score || 8) / 2),
        price: Math.round((hotel.min_total_price || 80) * 655.957),
        currency: 'XOF',
        image: hotel.main_photo_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
        address: hotel.address || hotel.city || destination,
        amenities: hotel.hotel_facilities?.slice(0, 5) || ['WiFi', 'Climatisation', 'Restaurant'],
        description: hotel.hotel_name || 'Hôtel confortable',
        source: 'booking',
      }));
    }

    return [];
  } catch (error) {
    console.error('Booking.com API exception:', error);
    return [];
  }
}

// Search hotels using Hotels.com Provider API
async function searchHotelsComProvider(
  destination: string,
  checkIn: string,
  checkOut: string,
  adults: number,
  rapidApiKey: string
): Promise<HotelOffer[]> {
  try {
    console.log('Searching Hotels.com Provider for package hotels...');
    
    const params = new URLSearchParams({
      q: destination,
      locale: 'en_US',
      checkin: checkIn,
      checkout: checkOut,
      adults: adults.toString(),
      currency: 'EUR',
    });

    const response = await fetch(
      `https://hotels-com-provider.p.rapidapi.com/v2/hotels/search?${params}`,
      {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'hotels-com-provider.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) return [];
    const data = await response.json();

    if (data.hotels && Array.isArray(data.hotels)) {
      return data.hotels.slice(0, 5).map((hotel: any, index: number) => ({
        id: `hotelscom-hotel-${index}`,
        name: hotel.name || hotel.hotel_name || 'Hôtel',
        rating: hotel.star_rating || 4,
        price: Math.round((hotel.price || 75) * 655.957),
        currency: 'XOF',
        image: hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
        address: hotel.address || destination,
        amenities: hotel.amenities?.slice(0, 5) || ['WiFi', 'Piscine', 'Restaurant'],
        description: hotel.name || 'Hôtel de qualité',
        source: 'hotels-com',
      }));
    }

    return [];
  } catch (error) {
    console.error('Hotels.com Provider API exception:', error);
    return [];
  }
}

// Search hotels using Priceline API
async function searchPricelineHotels(
  destination: string,
  checkIn: string,
  checkOut: string,
  adults: number,
  rooms: number,
  rapidApiKey: string
): Promise<HotelOffer[]> {
  try {
    console.log('Searching Priceline for package hotels...');
    
    const params = new URLSearchParams({
      location: destination,
      check_in: checkIn,
      check_out: checkOut,
      adults: adults.toString(),
      rooms: rooms.toString(),
      currency: 'EUR',
    });

    const response = await fetch(
      `https://priceline-com-provider.p.rapidapi.com/v2/hotels/search?${params}`,
      {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'priceline-com-provider.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) return [];
    const data = await response.json();

    if (data.hotels && Array.isArray(data.hotels)) {
      return data.hotels.slice(0, 5).map((hotel: any, index: number) => ({
        id: `priceline-hotel-${index}`,
        name: hotel.name || hotel.hotel_name || 'Hôtel',
        rating: hotel.star_rating || 4,
        price: Math.round((hotel.price || 70) * 655.957),
        currency: 'XOF',
        image: hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
        address: hotel.address || destination,
        amenities: hotel.amenities?.slice(0, 5) || ['WiFi', 'Parking', 'Restaurant'],
        description: hotel.name || 'Hôtel confortable',
        source: 'priceline',
      }));
    }

    return [];
  } catch (error) {
    console.error('Priceline API exception:', error);
    return [];
  }
}

function getMockData(origin: string, destination: string, departureDate: string, returnDate: string) {
  return {
    flights: [
      { id: 'mock-flight-1', airline: 'Air France', price: 685, currency: 'EUR', departure: departureDate, return: returnDate, duration: '2h 30min', stops: 0, source: 'mock' },
      { id: 'mock-flight-2', airline: 'Brussels Airlines', price: 580, currency: 'EUR', departure: departureDate, return: returnDate, duration: '3h 15min', stops: 1, source: 'mock' },
      { id: 'mock-flight-3', airline: 'Royal Air Maroc', price: 640, currency: 'EUR', departure: departureDate, return: returnDate, duration: '4h 45min', stops: 1, source: 'mock' }
    ],
    hotels: [
      { id: 'mock-hotel-1', name: 'Hôtel Sofitel', rating: 5, price: 275, currency: 'EUR', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945', address: destination, amenities: ['WiFi', 'Piscine', 'Spa', 'Restaurant', 'Bar'], description: 'Hôtel de luxe', source: 'mock' },
      { id: 'mock-hotel-2', name: 'Hôtel Pullman', rating: 4, price: 183, currency: 'EUR', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa', address: destination, amenities: ['WiFi', 'Piscine', 'Climatisation', 'Restaurant'], description: 'Hôtel moderne', source: 'mock' },
      { id: 'mock-hotel-3', name: 'Hôtel Azalaï', rating: 4, price: 145, currency: 'EUR', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b', address: destination, amenities: ['WiFi', 'Piscine', 'Climatisation'], description: 'Excellent rapport qualité-prix', source: 'mock' }
    ]
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { origin, destination, departureDate, returnDate, adults = 1, children = 0, rooms = 1, travelClass = 'ECONOMY' } = await req.json();

    console.log('Searching flight + hotel packages:', { origin, destination, departureDate, returnDate, adults, children, rooms, travelClass });

    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    
    if (!rapidApiKey) {
      console.log('RapidAPI key not configured, returning mock data');
      return new Response(
        JSON.stringify(getMockData(origin, destination, departureDate, returnDate)),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search all APIs in parallel (3 flight APIs + 3 hotel APIs)
    const [kiwiFlights, skyFlights, amadeusFlights, bookingHotels, hotelsComHotels, pricelineHotels] = await Promise.all([
      searchKiwiFlights(origin, destination, departureDate, returnDate, adults, rapidApiKey),
      searchSkyScrapperFlights(origin, destination, departureDate, returnDate, adults, rapidApiKey),
      searchAmadeusFlights(origin, destination, departureDate, returnDate, adults),
      searchBookingHotels(destination, departureDate, returnDate, adults, rooms, rapidApiKey),
      searchHotelsComProvider(destination, departureDate, returnDate, adults, rapidApiKey),
      searchPricelineHotels(destination, departureDate, returnDate, adults, rooms, rapidApiKey),
    ]);

    const allFlights = [...kiwiFlights, ...skyFlights, ...amadeusFlights];
    const allHotels = [...bookingHotels, ...hotelsComHotels, ...pricelineHotels];

    console.log(`Package search: ${allFlights.length} flights (Kiwi: ${kiwiFlights.length}, Sky: ${skyFlights.length}, Amadeus: ${amadeusFlights.length}), ${allHotels.length} hotels (Booking: ${bookingHotels.length}, Hotels.com: ${hotelsComHotels.length}, Priceline: ${pricelineHotels.length})`);

    // Use mock data if no results
    if (allFlights.length === 0 && allHotels.length === 0) {
      console.log('No results from APIs, returning mock data');
      return new Response(
        JSON.stringify(getMockData(origin, destination, departureDate, returnDate)),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    allFlights.sort((a, b) => a.price - b.price);
    allHotels.sort((a, b) => a.price - b.price);

    const mockData = getMockData(origin, destination, departureDate, returnDate);

    return new Response(
      JSON.stringify({
        flights: allFlights.length > 0 ? allFlights : mockData.flights,
        hotels: allHotels.length > 0 ? allHotels : mockData.hotels,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-flight-hotel-packages:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Une erreur est survenue' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
