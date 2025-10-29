import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FlightOffer {
  id: string;
  airline: string;
  price: number;
  departure: string;
  return: string;
  duration: string;
  stops: number;
}

interface HotelOffer {
  id: string;
  name: string;
  rating: number;
  price: number;
  image: string;
  address: string;
  amenities: string[];
  description: string;
}

// Fetch flights from RapidAPI Skyscanner
async function fetchFlightsFromRapidAPI(origin: string, destination: string, departureDate: string, returnDate: string, adults: number, travelClass: string) {
  const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
  
  if (!rapidApiKey) {
    console.log('RapidAPI key not found, using fallback');
    return null;
  }

  try {
    const response = await fetch(
      `https://skyscanner-api.p.rapidapi.com/v3/flights/live/search/create`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'skyscanner-api.p.rapidapi.com'
        },
        body: JSON.stringify({
          query: {
            market: 'US',
            locale: 'fr-FR',
            currency: 'XOF',
            queryLegs: [
              {
                originPlace: { queryPlace: { iata: origin } },
                destinationPlace: { queryPlace: { iata: destination } },
                date: { year: parseInt(departureDate.split('-')[0]), month: parseInt(departureDate.split('-')[1]), day: parseInt(departureDate.split('-')[2]) }
              },
              {
                originPlace: { queryPlace: { iata: destination } },
                destinationPlace: { queryPlace: { iata: origin } },
                date: { year: parseInt(returnDate.split('-')[0]), month: parseInt(returnDate.split('-')[1]), day: parseInt(returnDate.split('-')[2]) }
              }
            ],
            adults: adults,
            cabinClass: travelClass
          }
        })
      }
    );

    if (!response.ok) {
      console.error('Skyscanner API error:', response.status);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching flights from RapidAPI:', error);
    return null;
  }
}

// Get destination ID from Booking.com based on IATA code or city name
async function getDestinationId(destination: string) {
  const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
  
  if (!rapidApiKey) {
    return null;
  }

  try {
    const response = await fetch(
      `https://booking-com.p.rapidapi.com/v1/hotels/locations?locale=fr&name=${destination}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'booking-com.p.rapidapi.com'
        }
      }
    );

    if (!response.ok) {
      console.error('Booking.com locations API error:', response.status);
      return null;
    }

    const data = await response.json();
    // Return the first destination ID (city)
    if (data && data.length > 0) {
      const cityLocation = data.find((loc: any) => loc.dest_type === 'city') || data[0];
      console.log('Found destination:', cityLocation.dest_id, cityLocation.name);
      return cityLocation.dest_id;
    }
    return null;
  } catch (error) {
    console.error('Error fetching destination ID:', error);
    return null;
  }
}

// Fetch hotels from RapidAPI Booking.com
async function fetchHotelsFromRapidAPI(destination: string, checkIn: string, checkOut: string, adults: number, rooms: number) {
  const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
  
  if (!rapidApiKey) {
    console.log('RapidAPI key not found, using fallback');
    return null;
  }

  try {
    // First, get the destination ID for the city
    const destId = await getDestinationId(destination);
    
    if (!destId) {
      console.error('Could not find destination ID for:', destination);
      return null;
    }

    const response = await fetch(
      `https://booking-com.p.rapidapi.com/v1/hotels/search?dest_type=city&dest_id=${destId}&adults_number=${adults}&room_number=${rooms}&checkout_date=${checkOut}&checkin_date=${checkIn}&locale=fr&units=metric&order_by=popularity`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'booking-com.p.rapidapi.com'
        }
      }
    );

    if (!response.ok) {
      console.error('Booking.com API error:', response.status);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching hotels from RapidAPI:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { origin, destination, departureDate, returnDate, adults, children = 0, rooms = 1, travelClass = 'ECONOMY' } = await req.json();

    console.log('Searching flight + hotel packages:', { origin, destination, departureDate, returnDate, adults, children, rooms, travelClass });

    // Try to fetch from RapidAPI first
    const [flightsDataRapid, hotelsDataRapid] = await Promise.all([
      fetchFlightsFromRapidAPI(origin, destination, departureDate, returnDate, adults, travelClass),
      fetchHotelsFromRapidAPI(destination, departureDate, returnDate, adults, rooms)
    ]);

    let flights: FlightOffer[] = [];
    let hotels: HotelOffer[] = [];

    // Process flights data
    if (flightsDataRapid && flightsDataRapid.content?.results?.itineraries) {
      const itineraries = Object.values(flightsDataRapid.content.results.itineraries) as any[];
      flights = itineraries.slice(0, 5).map((itinerary: any, index: number) => ({
        id: `flight-${index}`,
        airline: itinerary.legs?.[0]?.carriers?.marketing?.[0]?.name || 'Compagnie aérienne',
        price: parseFloat(itinerary.pricingOptions?.[0]?.price?.amount || 0),
        departure: departureDate,
        return: returnDate,
        duration: `${Math.floor((itinerary.legs?.[0]?.durationInMinutes || 120) / 60)}h ${(itinerary.legs?.[0]?.durationInMinutes || 120) % 60}min`,
        stops: (itinerary.legs?.[0]?.stopCount || 0)
      }));
    }

    // Process hotels data
    if (hotelsDataRapid && hotelsDataRapid.result) {
      hotels = hotelsDataRapid.result.slice(0, 5).map((hotel: any, index: number) => ({
        id: `hotel-${index}`,
        name: hotel.hotel_name || 'Hôtel',
        rating: hotel.review_score ? Math.round(hotel.review_score / 2) : 4,
        price: parseFloat(hotel.min_total_price || hotel.price_breakdown?.gross_price || 0),
        image: hotel.max_photo_url || hotel.main_photo_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
        address: hotel.address || destination,
        amenities: hotel.hotel_facilities?.slice(0, 5).map((f: any) => f.name) || ['WiFi', 'Piscine', 'Climatisation'],
        description: hotel.hotel_name_trans || hotel.hotel_name || 'Hôtel confortable avec toutes les commodités'
      }));
    }

    // If RapidAPI fails or returns no data, fall back to mock data
    if (flights.length === 0 || hotels.length === 0) {
      console.log('Falling back to mock data');
      const mockData = getMockData(origin, destination, departureDate, returnDate);
      return new Response(
        JSON.stringify(mockData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return flights and hotels separately
    console.log(`Returning ${flights.length} flights and ${hotels.length} hotels`);

    return new Response(
      JSON.stringify({ flights, hotels }),
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

function getMockData(origin: string, destination: string, departureDate: string, returnDate: string) {
  return {
    flights: [
      {
        id: 'flight-1',
        airline: 'Air France',
        price: 450000,
        departure: departureDate,
        return: returnDate,
        duration: '2h 30min',
        stops: 0,
      },
      {
        id: 'flight-2',
        airline: 'Brussels Airlines',
        price: 380000,
        departure: departureDate,
        return: returnDate,
        duration: '3h 15min',
        stops: 1,
      },
      {
        id: 'flight-3',
        airline: 'Air Côte d\'Ivoire',
        price: 420000,
        departure: departureDate,
        return: returnDate,
        duration: '2h 45min',
        stops: 0,
      }
    ],
    hotels: [
      {
        id: 'hotel-1',
        name: 'Hôtel Sofitel Abidjan',
        rating: 5,
        price: 180000,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
        address: destination,
        amenities: ['WiFi', 'Piscine', 'Spa', 'Restaurant', 'Bar'],
        description: 'Hôtel de luxe avec vue sur la lagune',
      },
      {
        id: 'hotel-2',
        name: 'Hôtel Pullman',
        rating: 4,
        price: 120000,
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa',
        address: destination,
        amenities: ['WiFi', 'Piscine', 'Climatisation', 'Restaurant'],
        description: 'Hôtel moderne au cœur de la ville',
      },
      {
        id: 'hotel-3',
        name: 'Hôtel Azalaï',
        rating: 4,
        price: 95000,
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
        address: destination,
        amenities: ['WiFi', 'Piscine', 'Climatisation'],
        description: 'Hôtel confortable avec excellent rapport qualité-prix',
      }
    ]
  };
}
