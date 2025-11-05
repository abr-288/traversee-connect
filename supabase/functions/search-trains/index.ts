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

    // Raileurope API for European trains
    const raileuropeApiKey = Deno.env.get('RAILEUROPE_API_KEY');
    
    // Trainline API for UK and European trains
    const trainlineApiKey = Deno.env.get('TRAINLINE_API_KEY');
    
    // Amtrak API for US trains
    const amtrakApiKey = Deno.env.get('AMTRAK_API_KEY');
    
    // China Railway API for Chinese trains
    const chinaRailwayApiKey = Deno.env.get('CHINA_RAILWAY_API_KEY');

    const trains = [];

    // Search European trains via Raileurope
    if (raileuropeApiKey) {
      try {
        const raileuropeResponse = await fetch('https://api.raileurope.com/v1/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${raileuropeApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            origin,
            destination,
            departureDate,
            returnDate,
            passengers: {
              adults: adults || 1,
              children: children || 0,
            },
            class: travelClass || 'economy',
          }),
        });

        if (raileuropeResponse.ok) {
          const raileuropeData = await raileuropeResponse.json();
          trains.push(...(raileuropeData.trains || []));
        }
      } catch (error) {
        console.error('Raileurope API error:', error);
      }
    }

    // Search UK/European trains via Trainline
    if (trainlineApiKey) {
      try {
        const trainlineResponse = await fetch('https://api.trainline.com/v1/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${trainlineApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: origin,
            to: destination,
            departureDate,
            returnDate,
            adults: adults || 1,
            children: children || 0,
            class: travelClass || 'standard',
          }),
        });

        if (trainlineResponse.ok) {
          const trainlineData = await trainlineResponse.json();
          trains.push(...(trainlineData.journeys || []));
        }
      } catch (error) {
        console.error('Trainline API error:', error);
      }
    }

    // Search US trains via Amtrak
    if (amtrakApiKey) {
      try {
        const amtrakResponse = await fetch('https://api.amtrak.com/v1/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${amtrakApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            origin,
            destination,
            departureDate,
            returnDate,
            passengers: adults + (children || 0),
            class: travelClass || 'coach',
          }),
        });

        if (amtrakResponse.ok) {
          const amtrakData = await amtrakResponse.json();
          trains.push(...(amtrakData.trains || []));
        }
      } catch (error) {
        console.error('Amtrak API error:', error);
      }
    }

    // Search Chinese trains via China Railway
    if (chinaRailwayApiKey) {
      try {
        const chinaRailwayResponse = await fetch('https://api.china-railway.com/v1/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${chinaRailwayApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: origin,
            to: destination,
            date: departureDate,
            returnDate,
            adults: adults || 1,
            children: children || 0,
            seatType: travelClass || 'second_class',
          }),
        });

        if (chinaRailwayResponse.ok) {
          const chinaRailwayData = await chinaRailwayResponse.json();
          trains.push(...(chinaRailwayData.trains || []));
        }
      } catch (error) {
        console.error('China Railway API error:', error);
      }
    }

    // If no API keys configured, return mock data
    if (!raileuropeApiKey && !trainlineApiKey && !amtrakApiKey && !chinaRailwayApiKey) {
      console.log('No train API keys configured, returning mock data');
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
              price: 89.00,
              currency: 'EUR',
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
              price: 120.00,
              currency: 'EUR',
              class: travelClass || 'economy',
              availableSeats: 32,
            },
          ],
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
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
