import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrainResult {
  id: string;
  operator: string;
  trainNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  currency: string;
  class: string;
  availableSeats: number;
  source: string;
}

// Search trains using Trainline API via RapidAPI
async function searchTrainline(
  origin: string,
  destination: string,
  departureDate: string,
  travelClass: string,
  adults: number,
  rapidApiKey: string
): Promise<TrainResult[]> {
  try {
    console.log('Searching Trainline API...');
    
    const response = await fetch(
      `https://trainline-eu.p.rapidapi.com/search?` + 
      new URLSearchParams({
        from: origin,
        to: destination,
        date: departureDate,
        passengers: adults.toString(),
      }),
      {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'trainline-eu.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      console.error('Trainline API error:', response.status);
      return [];
    }

    const data = await response.json();
    console.log('Trainline response:', JSON.stringify(data).substring(0, 300));

    if (data.journeys && Array.isArray(data.journeys)) {
      return data.journeys.slice(0, 10).map((journey: any, index: number) => ({
        id: `trainline-${index}`,
        operator: journey.carrier || journey.operator || 'Trainline',
        trainNumber: journey.train_number || journey.trainId || `TL${index + 100}`,
        origin: origin,
        destination: destination,
        departureTime: journey.departure_time || journey.departureTime || '09:00',
        arrivalTime: journey.arrival_time || journey.arrivalTime || '12:00',
        duration: journey.duration || '3h 00m',
        price: Math.round((journey.price?.amount || journey.price || 50) * 655.957), // EUR to XOF
        currency: 'XOF',
        class: travelClass || 'economy',
        availableSeats: journey.available_seats || 50,
        source: 'trainline',
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Trainline API exception:', error);
    return [];
  }
}

// Search trains using Omio API via RapidAPI
async function searchOmio(
  origin: string,
  destination: string,
  departureDate: string,
  travelClass: string,
  adults: number,
  rapidApiKey: string
): Promise<TrainResult[]> {
  try {
    console.log('Searching Omio/GoEuro API...');
    
    const response = await fetch(
      `https://omio-goeuro.p.rapidapi.com/api/v3/search?` +
      new URLSearchParams({
        from: origin,
        to: destination,
        departure_date: departureDate,
        adult: adults.toString(),
        sort: 'price',
      }),
      {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'omio-goeuro.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      console.error('Omio API error:', response.status);
      return [];
    }

    const data = await response.json();
    console.log('Omio response:', JSON.stringify(data).substring(0, 300));

    if (data.trains && Array.isArray(data.trains)) {
      return data.trains.slice(0, 10).map((train: any, index: number) => ({
        id: `omio-${index}`,
        operator: train.operator || train.company || 'Omio',
        trainNumber: train.train_number || `OM${index + 100}`,
        origin: origin,
        destination: destination,
        departureTime: train.departure || '10:00',
        arrivalTime: train.arrival || '13:00',
        duration: train.duration || '3h 00m',
        price: Math.round((train.price || 45) * 655.957), // EUR to XOF
        currency: 'XOF',
        class: travelClass || 'economy',
        availableSeats: train.seats || 40,
        source: 'omio',
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Omio API exception:', error);
    return [];
  }
}

// Search trains using Rome2Rio API
async function searchRome2Rio(
  origin: string,
  destination: string,
  departureDate: string,
  travelClass: string,
  rapidApiKey: string
): Promise<TrainResult[]> {
  try {
    console.log('Searching Rome2Rio API for trains...');
    
    const response = await fetch(
      `https://rome2rio12.p.rapidapi.com/Search/Sync?` +
      new URLSearchParams({
        key: 'search',
        oName: origin,
        dName: destination,
        departureDate: departureDate,
      }),
      {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'rome2rio12.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      console.error('Rome2Rio API error:', response.status);
      return [];
    }

    const data = await response.json();
    console.log('Rome2Rio response:', JSON.stringify(data).substring(0, 300));

    // Filter only train routes
    const trainRoutes = (data.routes || []).filter((route: any) => 
      route.name?.toLowerCase().includes('train') || 
      route.segments?.some((s: any) => s.kind === 'train')
    );

    return trainRoutes.slice(0, 5).map((route: any, index: number) => {
      const trainSegment = route.segments?.find((s: any) => s.kind === 'train') || {};
      return {
        id: `rome2rio-${index}`,
        operator: trainSegment.operatingCompany?.name || route.name || 'Train',
        trainNumber: `R2R${index + 100}`,
        origin: origin,
        destination: destination,
        departureTime: '08:00',
        arrivalTime: '12:00',
        duration: route.totalDuration ? `${Math.floor(route.totalDuration / 60)}h ${route.totalDuration % 60}m` : '4h 00m',
        price: Math.round((route.indicativePrice?.price || 60) * 655.957), // EUR to XOF
        currency: 'XOF',
        class: travelClass || 'economy',
        availableSeats: 35,
        source: 'rome2rio',
      };
    });
  } catch (error) {
    console.error('Rome2Rio API exception:', error);
    return [];
  }
}

function getMockTrains(origin: string, destination: string, departureDate: string, travelClass: string): TrainResult[] {
  const basePrice = 45000;
  const operators = [
    { name: 'SNCF', prefix: 'TGV' },
    { name: 'Eurostar', prefix: 'ES' },
    { name: 'Thalys', prefix: 'TH' },
    { name: 'Deutsche Bahn', prefix: 'ICE' },
    { name: 'Trenitalia', prefix: 'FR' },
  ];

  return operators.map((op, index) => ({
    id: `mock-${index}`,
    operator: op.name,
    trainNumber: `${op.prefix} ${6600 + index}`,
    origin: origin,
    destination: destination,
    departureTime: `${8 + index * 2}:${index % 2 === 0 ? '00' : '30'}`,
    arrivalTime: `${11 + index * 2}:${index % 2 === 0 ? '30' : '00'}`,
    duration: '3h 30m',
    price: basePrice + (index * 5000),
    currency: 'XOF',
    class: travelClass || 'economy',
    availableSeats: 45 - (index * 5),
    source: 'mock',
  }));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { origin, destination, departureDate, returnDate, adults = 1, children = 0, travelClass = 'economy' } = await req.json();
    
    console.log('Train search params:', { origin, destination, departureDate, returnDate, adults, children, travelClass });

    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    
    if (!rapidApiKey) {
      console.log('RapidAPI key not configured, returning mock data');
      return new Response(
        JSON.stringify({ trains: getMockTrains(origin, destination, departureDate, travelClass) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search all train APIs in parallel
    const [trainlineResults, omioResults, rome2rioResults] = await Promise.all([
      searchTrainline(origin, destination, departureDate, travelClass, adults, rapidApiKey),
      searchOmio(origin, destination, departureDate, travelClass, adults, rapidApiKey),
      searchRome2Rio(origin, destination, departureDate, travelClass, rapidApiKey),
    ]);

    const allTrains = [...trainlineResults, ...omioResults, ...rome2rioResults];
    
    console.log(`Total trains found: ${allTrains.length} (Trainline: ${trainlineResults.length}, Omio: ${omioResults.length}, Rome2Rio: ${rome2rioResults.length})`);

    // If no API results, use mock data
    if (allTrains.length === 0) {
      console.log('No train results from APIs, returning mock data');
      return new Response(
        JSON.stringify({ trains: getMockTrains(origin, destination, departureDate, travelClass) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sort by price
    allTrains.sort((a, b) => a.price - b.price);

    return new Response(
      JSON.stringify({ trains: allTrains }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in search-trains:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
