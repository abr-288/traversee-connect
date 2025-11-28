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
      `https://api.tequila.kiwi.com/v2/search?${params}`,
      {
        headers: {
          'apikey': rapidApiKey,
          'Content-Type': 'application/json',
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
          price: Math.round((flight.price || 300) * 655.957), // EUR to XOF
          currency: 'XOF',
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
    
    // Search for origin airport
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

    // Search for destination airport
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

    // Search for flights
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
        price: Math.round(price * 655.957), // EUR to XOF
        currency: 'XOF',
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
    
    // First get destination ID
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

    // Search hotels
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

    if (!response.ok) {
      console.error('Booking.com API error:', response.status);
      return [];
    }

    const data = await response.json();
    
    if (data.data?.hotels && Array.isArray(data.data.hotels)) {
      return data.data.hotels.slice(0, 5).map((hotel: any, index: number) => ({
        id: `booking-hotel-${index}`,
        name: hotel.hotel_name || hotel.name || 'Hôtel',
        rating: Math.round((hotel.review_score || 8) / 2),
        price: Math.round((hotel.min_total_price || 80) * 655.957), // EUR to XOF
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

function getMockData(origin: string, destination: string, departureDate: string, returnDate: string) {
  return {
    flights: [
      {
        id: 'mock-flight-1',
        airline: 'Air France',
        price: 450000,
        currency: 'XOF',
        departure: departureDate,
        return: returnDate,
        duration: '2h 30min',
        stops: 0,
        source: 'mock',
      },
      {
        id: 'mock-flight-2',
        airline: 'Brussels Airlines',
        price: 380000,
        currency: 'XOF',
        departure: departureDate,
        return: returnDate,
        duration: '3h 15min',
        stops: 1,
        source: 'mock',
      },
      {
        id: 'mock-flight-3',
        airline: 'Royal Air Maroc',
        price: 420000,
        currency: 'XOF',
        departure: departureDate,
        return: returnDate,
        duration: '4h 45min',
        stops: 1,
        source: 'mock',
      }
    ],
    hotels: [
      {
        id: 'mock-hotel-1',
        name: 'Hôtel Sofitel',
        rating: 5,
        price: 180000,
        currency: 'XOF',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
        address: destination,
        amenities: ['WiFi', 'Piscine', 'Spa', 'Restaurant', 'Bar'],
        description: 'Hôtel de luxe avec vue exceptionnelle',
        source: 'mock',
      },
      {
        id: 'mock-hotel-2',
        name: 'Hôtel Pullman',
        rating: 4,
        price: 120000,
        currency: 'XOF',
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa',
        address: destination,
        amenities: ['WiFi', 'Piscine', 'Climatisation', 'Restaurant'],
        description: 'Hôtel moderne au cœur de la ville',
        source: 'mock',
      },
      {
        id: 'mock-hotel-3',
        name: 'Hôtel Azalaï',
        rating: 4,
        price: 95000,
        currency: 'XOF',
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
        address: destination,
        amenities: ['WiFi', 'Piscine', 'Climatisation'],
        description: 'Hôtel avec excellent rapport qualité-prix',
        source: 'mock',
      }
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

    // Search all APIs in parallel
    const [kiwiFlights, skyFlights, bookingHotels] = await Promise.all([
      searchKiwiFlights(origin, destination, departureDate, returnDate, adults, rapidApiKey),
      searchSkyScrapperFlights(origin, destination, departureDate, returnDate, adults, rapidApiKey),
      searchBookingHotels(destination, departureDate, returnDate, adults, rooms, rapidApiKey),
    ]);

    const allFlights = [...kiwiFlights, ...skyFlights];
    const allHotels = [...bookingHotels];

    console.log(`Package search: ${allFlights.length} flights (Kiwi: ${kiwiFlights.length}, Sky: ${skyFlights.length}), ${allHotels.length} hotels`);

    // If no results, return mock data
    if (allFlights.length === 0 && allHotels.length === 0) {
      console.log('No results from APIs, returning mock data');
      return new Response(
        JSON.stringify(getMockData(origin, destination, departureDate, returnDate)),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sort by price
    allFlights.sort((a, b) => a.price - b.price);
    allHotels.sort((a, b) => a.price - b.price);

    // Use mock data for missing results
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
