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
    const { origin, destination, departureDate, returnDate, adults, children, travelClass } = await req.json();
    
    console.log('Train search params:', { origin, destination, departureDate, returnDate, adults, children, travelClass });

    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    
    if (!rapidApiKey) {
      console.log('RapidAPI key not configured, returning mock data');
      return getMockTrains(origin, destination, departureDate, travelClass);
    }

    const trains = [];

    // Try Indian Railways API
    try {
      const indianRailwaysResponse = await fetch(
        `https://real-time-pnr-status-api-for-indian-railways.p.rapidapi.com/search?from=${origin}&to=${destination}&date=${departureDate}`,
        {
          headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': 'real-time-pnr-status-api-for-indian-railways.p.rapidapi.com',
          },
        }
      );

      if (indianRailwaysResponse.ok) {
        const data = await indianRailwaysResponse.json();
        if (data.trains && Array.isArray(data.trains)) {
          trains.push(...data.trains.map((train: any) => ({
            id: train.train_number || Math.random().toString(),
            operator: 'Indian Railways',
            trainNumber: train.train_number || train.trainNo,
            origin: origin,
            destination: destination,
            departureTime: train.departure_time || train.departureTime || '09:00',
            arrivalTime: train.arrival_time || train.arrivalTime || '14:00',
            duration: train.duration || '5h 00m',
            price: train.fare || 1500,
            currency: 'INR',
            class: travelClass || 'economy',
            availableSeats: train.available_seats || 50,
          })));
          console.log(`Found ${data.trains.length} trains from Indian Railways`);
        }
      }
    } catch (error) {
      console.error('Indian Railways API error:', error);
    }

    // If no results, return mock data
    if (trains.length === 0) {
      console.log('No train results from APIs, returning mock data');
      return getMockTrains(origin, destination, departureDate, travelClass);
    }

    return new Response(
      JSON.stringify({ trains }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in search-trains:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function getMockTrains(origin: string, destination: string, departureDate: string, travelClass: string) {
  return new Response(
    JSON.stringify({
      trains: [
        {
          id: '1',
          operator: 'SNCF',
          trainNumber: 'TGV 6601',
          origin: origin,
          destination: destination,
          departureTime: '09:00',
          arrivalTime: '12:30',
          duration: '3h 30m',
          price: 45000,
          currency: 'XOF',
          class: travelClass || 'economy',
          availableSeats: 45,
        },
        {
          id: '2',
          operator: 'Eurostar',
          trainNumber: 'ES 9012',
          origin: origin,
          destination: destination,
          departureTime: '14:15',
          arrivalTime: '18:00',
          duration: '3h 45m',
          price: 60000,
          currency: 'XOF',
          class: travelClass || 'economy',
          availableSeats: 32,
        },
        {
          id: '3',
          operator: 'Thalys',
          trainNumber: 'TH 9342',
          origin: origin,
          destination: destination,
          departureTime: '16:45',
          arrivalTime: '20:15',
          duration: '3h 30m',
          price: 50000,
          currency: 'XOF',
          class: travelClass || 'economy',
          availableSeats: 28,
        },
      ],
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}
