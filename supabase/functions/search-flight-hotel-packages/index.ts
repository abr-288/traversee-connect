import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BaggageInfo {
  cabin: { quantity: number; weight: string };
  checked: { quantity: number; weight: string };
  extraBagPrice?: number;
}

interface FlightOffer {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  logo: string;
  price: number;
  currency: string;
  departure: {
    date: string;
    time: string;
    airport: string;
    city: string;
  };
  arrival: {
    date: string;
    time: string;
    airport: string;
    city: string;
  };
  returnFlight?: {
    date: string;
    time: string;
    departureAirport: string;
    arrivalAirport: string;
  };
  duration: string;
  stops: number;
  stopCities?: string[];
  travelClass: string;
  baggage: BaggageInfo;
  fareType: string;
  source: string;
}

interface HotelOffer {
  id: string;
  name: string;
  rating: number;
  reviewScore: number;
  reviewCount: number;
  price: number;
  currency: string;
  image: string;
  images: string[];
  address: string;
  city: string;
  amenities: string[];
  description: string;
  roomType: string;
  breakfast: boolean;
  freeCancellation: boolean;
  source: string;
}

// Get airline logo URL
function getAirlineLogo(airlineCode: string): string {
  return `https://images.kiwi.com/airlines/64/${airlineCode}.png`;
}

// Get default baggage based on airline and class
function getDefaultBaggage(airline: string, travelClass: string): BaggageInfo {
  const lowCostAirlines = ['ryanair', 'easyjet', 'spirit', 'frontier', 'wizzair', 'transavia'];
  const isLowCost = lowCostAirlines.some(lc => airline.toLowerCase().includes(lc));
  
  if (isLowCost) {
    return {
      cabin: { quantity: 1, weight: '10kg' },
      checked: { quantity: 0, weight: '0kg' },
      extraBagPrice: 35,
    };
  }
  
  if (travelClass === 'BUSINESS' || travelClass === 'FIRST') {
    return {
      cabin: { quantity: 2, weight: '12kg' },
      checked: { quantity: 2, weight: '32kg' },
    };
  }
  
  return {
    cabin: { quantity: 1, weight: '10kg' },
    checked: { quantity: 1, weight: '23kg' },
    extraBagPrice: 50,
  };
}

// Search flights using Travelpayouts API
async function searchTravelpayoutsFlights(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate: string,
  adults: number,
  travelClass: string
): Promise<FlightOffer[]> {
  try {
    console.log('Searching Travelpayouts for package flights...');
    const token = Deno.env.get('TRAVELPAYOUTS_TOKEN');
    if (!token) return [];

    const params = new URLSearchParams({
      origin: origin,
      destination: destination,
      departure_at: departureDate,
      return_at: returnDate,
      currency: 'EUR',
      market: 'fr',
      limit: '10',
      sorting: 'price',
      token: token,
    });

    const response = await fetch(`https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${params}`);
    if (!response.ok) return [];
    
    const data = await response.json();
    if (!data.data || !Array.isArray(data.data)) return [];

    return data.data.slice(0, 8).map((flight: any, index: number) => {
      const airlineCode = flight.airline || 'XX';
      const airline = getAirlineName(airlineCode);
      const baggage = getDefaultBaggage(airline, travelClass);
      
      return {
        id: `tp-flight-${index}`,
        airline: airline,
        airlineCode: airlineCode,
        flightNumber: `${airlineCode}${flight.flight_number || Math.floor(Math.random() * 9000) + 1000}`,
        logo: getAirlineLogo(airlineCode),
        price: flight.price || 350,
        currency: 'EUR',
        departure: {
          date: departureDate,
          time: flight.departure_at?.split('T')[1]?.slice(0, 5) || '08:30',
          airport: origin,
          city: origin,
        },
        arrival: {
          date: departureDate,
          time: calculateArrivalTime(flight.departure_at?.split('T')[1]?.slice(0, 5) || '08:30', flight.duration || 180),
          airport: destination,
          city: destination,
        },
        returnFlight: returnDate ? {
          date: returnDate,
          time: '14:30',
          departureAirport: destination,
          arrivalAirport: origin,
        } : undefined,
        duration: formatDuration(flight.duration || 180),
        stops: flight.transfers || 0,
        stopCities: flight.transfers > 0 ? ['Transit'] : [],
        travelClass: travelClass,
        baggage: baggage,
        fareType: 'Standard',
        source: 'travelpayouts',
      };
    });
  } catch (error) {
    console.error('Travelpayouts API exception:', error);
    return [];
  }
}

// Search flights using Kiwi.com API
async function searchKiwiFlights(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate: string,
  adults: number,
  travelClass: string,
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
      limit: '8',
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

    if (!response.ok) return [];
    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data)) return [];

    return data.data.slice(0, 8).map((flight: any, index: number) => {
      const route = flight.route?.[0] || {};
      const airlineCode = route.airline || flight.airlines?.[0] || 'XX';
      const airline = getAirlineName(airlineCode);
      const baggage = flight.bags_price ? {
        cabin: { quantity: 1, weight: '8kg' },
        checked: { quantity: flight.bags_price['1'] ? 1 : 0, weight: flight.bags_price['1'] ? '23kg' : '0kg' },
        extraBagPrice: flight.bags_price['1'] || 45,
      } : getDefaultBaggage(airline, travelClass);
      
      return {
        id: `kiwi-flight-${index}`,
        airline: airline,
        airlineCode: airlineCode,
        flightNumber: `${airlineCode}${route.flight_no || Math.floor(Math.random() * 9000) + 1000}`,
        logo: getAirlineLogo(airlineCode),
        price: flight.price || 300,
        currency: 'EUR',
        departure: {
          date: departureDate,
          time: formatTime(route.local_departure || flight.local_departure),
          airport: route.flyFrom || origin,
          city: flight.cityFrom || origin,
        },
        arrival: {
          date: departureDate,
          time: formatTime(route.local_arrival || flight.local_arrival),
          airport: route.flyTo || destination,
          city: flight.cityTo || destination,
        },
        returnFlight: returnDate ? {
          date: returnDate,
          time: '16:00',
          departureAirport: destination,
          arrivalAirport: origin,
        } : undefined,
        duration: formatDuration(flight.fly_duration || flight.duration / 60 || 180),
        stops: flight.route?.length > 2 ? Math.floor(flight.route.length / 2) - 1 : 0,
        stopCities: [],
        travelClass: travelClass,
        baggage: baggage,
        fareType: flight.availability?.seats ? 'Flexible' : 'Standard',
        source: 'kiwi',
      };
    });
  } catch (error) {
    console.error('Kiwi API exception:', error);
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
      return data.data.hotels.slice(0, 8).map((hotel: any, index: number) => {
        const photos = [
          hotel.main_photo_url || hotel.max_photo_url,
          ...(hotel.photos || []).slice(0, 4),
        ].filter(Boolean);
        
        return {
          id: `booking-hotel-${index}`,
          name: hotel.hotel_name || hotel.name || 'Hôtel',
          rating: hotel.class || Math.round((hotel.review_score || 8) / 2),
          reviewScore: hotel.review_score || 8.0,
          reviewCount: hotel.review_nr || Math.floor(Math.random() * 500) + 50,
          price: Math.round(hotel.min_total_price || hotel.composite_price_breakdown?.gross_amount?.value || 80),
          currency: 'EUR',
          image: photos[0] || getHotelPlaceholder(destination),
          images: photos.length > 0 ? photos : [getHotelPlaceholder(destination)],
          address: hotel.address || hotel.district || destination,
          city: hotel.city || destination,
          amenities: extractAmenities(hotel.hotel_facilities || hotel.unit_configuration_label),
          description: hotel.unit_configuration_label || `Hôtel ${hotel.class || 4} étoiles`,
          roomType: hotel.unit_configuration_label || 'Chambre Standard',
          breakfast: hotel.hotel_include_breakfast || false,
          freeCancellation: hotel.is_free_cancellable || false,
          source: 'booking',
        };
      });
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
    console.log('Searching Hotels.com for package hotels...');
    
    const params = new URLSearchParams({
      q: destination,
      locale: 'fr_FR',
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

    const hotels = data.properties || data.hotels || [];
    if (Array.isArray(hotels)) {
      return hotels.slice(0, 6).map((hotel: any, index: number) => ({
        id: `hotelscom-hotel-${index}`,
        name: hotel.name || hotel.hotel_name || 'Hôtel',
        rating: hotel.star || hotel.star_rating || 4,
        reviewScore: hotel.reviews?.score || hotel.guestReviews?.rating || 8.0,
        reviewCount: hotel.reviews?.total || hotel.guestReviews?.total || Math.floor(Math.random() * 300) + 30,
        price: Math.round(hotel.price?.lead?.amount || hotel.ratePlan?.price?.current || 75),
        currency: 'EUR',
        image: hotel.propertyImage?.image?.url || hotel.image || getHotelPlaceholder(destination),
        images: [hotel.propertyImage?.image?.url || hotel.image].filter(Boolean),
        address: hotel.neighborhood?.name || hotel.address || destination,
        city: destination,
        amenities: hotel.amenities?.slice(0, 5) || ['WiFi', 'Piscine', 'Restaurant'],
        description: hotel.tagline || 'Hôtel de qualité',
        roomType: 'Chambre Double',
        breakfast: false,
        freeCancellation: hotel.offerSummary?.messages?.some((m: any) => m.type === 'FREE_CANCELLATION') || false,
        source: 'hotels-com',
      }));
    }

    return [];
  } catch (error) {
    console.error('Hotels.com Provider API exception:', error);
    return [];
  }
}

// Helper functions
function getAirlineName(code: string): string {
  const airlines: Record<string, string> = {
    'AF': 'Air France', 'ET': 'Ethiopian Airlines', 'TK': 'Turkish Airlines',
    'EK': 'Emirates', 'KQ': 'Kenya Airways', 'AT': 'Royal Air Maroc',
    'SN': 'Brussels Airlines', 'MS': 'EgyptAir', 'QR': 'Qatar Airways',
    'LH': 'Lufthansa', 'BA': 'British Airways', 'KL': 'KLM',
    'SA': 'South African Airways', 'W3': 'Asky Airlines', 'HF': 'Air Côte d\'Ivoire',
  };
  return airlines[code?.toUpperCase()] || code || 'Airline';
}

function formatTime(isoString: string | undefined): string {
  if (!isoString) return '08:00';
  const time = isoString.includes('T') ? isoString.split('T')[1] : isoString;
  return time?.slice(0, 5) || '08:00';
}

function formatDuration(minutes: number | string): string {
  const mins = typeof minutes === 'string' ? parseInt(minutes) : minutes;
  if (isNaN(mins)) return '3h 00min';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m.toString().padStart(2, '0')}min`;
}

function calculateArrivalTime(departure: string, durationMinutes: number): string {
  const [hours, minutes] = departure.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const arrHours = Math.floor(totalMinutes / 60) % 24;
  const arrMinutes = totalMinutes % 60;
  return `${arrHours.toString().padStart(2, '0')}:${arrMinutes.toString().padStart(2, '0')}`;
}

function extractAmenities(facilities: any): string[] {
  if (Array.isArray(facilities)) {
    return facilities.slice(0, 6).map((f: any) => typeof f === 'string' ? f : f.name || 'WiFi');
  }
  return ['WiFi', 'Climatisation', 'Restaurant', 'Parking', 'Piscine'];
}

function getHotelPlaceholder(city: string): string {
  const placeholders: Record<string, string> = {
    'paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
    'abidjan': 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b',
    'dakar': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96',
    'dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
    'london': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad',
  };
  const cityLower = city.toLowerCase();
  for (const [key, url] of Object.entries(placeholders)) {
    if (cityLower.includes(key)) return url;
  }
  return 'https://images.unsplash.com/photo-1566073771259-6a8506099945';
}

function getMockData(origin: string, destination: string, departureDate: string, returnDate: string, travelClass: string): { flights: FlightOffer[], hotels: HotelOffer[] } {
  const airlines = [
    { code: 'AF', name: 'Air France' },
    { code: 'ET', name: 'Ethiopian Airlines' },
    { code: 'TK', name: 'Turkish Airlines' },
    { code: 'EK', name: 'Emirates' },
    { code: 'KQ', name: 'Kenya Airways' },
    { code: 'AT', name: 'Royal Air Maroc' },
  ];

  const flights: FlightOffer[] = airlines.map((airline, index) => ({
    id: `mock-flight-${index}`,
    airline: airline.name,
    airlineCode: airline.code,
    flightNumber: `${airline.code}${1000 + index * 111}`,
    logo: getAirlineLogo(airline.code),
    price: 350 + index * 75 + Math.floor(Math.random() * 100),
    currency: 'EUR',
    departure: {
      date: departureDate,
      time: `${6 + index * 2}:${index % 2 === 0 ? '30' : '00'}`,
      airport: origin,
      city: origin,
    },
    arrival: {
      date: departureDate,
      time: `${11 + index * 2}:${index % 2 === 0 ? '45' : '15'}`,
      airport: destination,
      city: destination,
    },
    returnFlight: {
      date: returnDate,
      time: '14:30',
      departureAirport: destination,
      arrivalAirport: origin,
    },
    duration: `${3 + Math.floor(index / 2)}h ${15 + (index % 3) * 15}min`,
    stops: index % 3 === 0 ? 0 : 1,
    stopCities: index % 3 === 0 ? [] : ['Transit'],
    travelClass: travelClass,
    baggage: getDefaultBaggage(airline.name, travelClass),
    fareType: index % 2 === 0 ? 'Standard' : 'Flexible',
    source: 'mock',
  }));

  const hotels: HotelOffer[] = [
    { name: 'Sofitel', rating: 5, price: 275, reviewScore: 9.2 },
    { name: 'Pullman', rating: 5, price: 220, reviewScore: 8.8 },
    { name: 'Novotel', rating: 4, price: 145, reviewScore: 8.4 },
    { name: 'Ibis Styles', rating: 3, price: 85, reviewScore: 7.8 },
    { name: 'Radisson Blu', rating: 5, price: 195, reviewScore: 8.9 },
  ].map((h, index) => ({
    id: `mock-hotel-${index}`,
    name: `${h.name} ${destination}`,
    rating: h.rating,
    reviewScore: h.reviewScore,
    reviewCount: Math.floor(Math.random() * 800) + 100,
    price: h.price,
    currency: 'EUR',
    image: getHotelPlaceholder(destination),
    images: [getHotelPlaceholder(destination)],
    address: `Centre-ville, ${destination}`,
    city: destination,
    amenities: ['WiFi gratuit', 'Piscine', 'Restaurant', 'Spa', 'Parking'],
    description: `Hôtel ${h.rating} étoiles au cœur de ${destination}`,
    roomType: 'Chambre Supérieure',
    breakfast: index % 2 === 0,
    freeCancellation: index % 3 !== 0,
    source: 'mock',
  }));

  return { flights, hotels };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { origin, destination, departureDate, returnDate, adults = 1, children = 0, rooms = 1, travelClass = 'ECONOMY' } = await req.json();

    console.log('Searching flight + hotel packages:', { origin, destination, departureDate, returnDate, adults, rooms, travelClass });

    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    
    if (!rapidApiKey) {
      console.log('RapidAPI key not configured, returning mock data');
      return new Response(
        JSON.stringify(getMockData(origin, destination, departureDate, returnDate, travelClass)),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search all APIs in parallel
    const [travelpayoutsFlights, kiwiFlights, bookingHotels, hotelsComHotels] = await Promise.all([
      searchTravelpayoutsFlights(origin, destination, departureDate, returnDate, adults, travelClass),
      searchKiwiFlights(origin, destination, departureDate, returnDate, adults, travelClass, rapidApiKey),
      searchBookingHotels(destination, departureDate, returnDate, adults, rooms, rapidApiKey),
      searchHotelsComProvider(destination, departureDate, returnDate, adults, rapidApiKey),
    ]);

    const allFlights = [...travelpayoutsFlights, ...kiwiFlights];
    const allHotels = [...bookingHotels, ...hotelsComHotels];

    console.log(`Package search: ${allFlights.length} flights, ${allHotels.length} hotels`);

    // Use mock data if no results
    if (allFlights.length === 0 && allHotels.length === 0) {
      console.log('No results from APIs, returning mock data');
      return new Response(
        JSON.stringify(getMockData(origin, destination, departureDate, returnDate, travelClass)),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sort by price
    allFlights.sort((a, b) => a.price - b.price);
    allHotels.sort((a, b) => a.price - b.price);

    // Fallback to mock if partial results
    const finalFlights = allFlights.length > 0 ? allFlights : getMockData(origin, destination, departureDate, returnDate, travelClass).flights;
    const finalHotels = allHotels.length > 0 ? allHotels : getMockData(origin, destination, departureDate, returnDate, travelClass).hotels;

    return new Response(
      JSON.stringify({ flights: finalFlights, hotels: finalHotels }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in search-flight-hotel-packages:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
