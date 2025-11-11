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
    const { origin, destination, departureDate, returnDate, adults, children = 0, travelClass = 'ECONOMY' } = await req.json();

    console.log('Searching flights:', { origin, destination, departureDate, returnDate, adults, children, travelClass });

    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    if (!rapidApiKey) {
      console.log('RapidAPI key not configured, returning mock data');
      return getMockFlights(origin, destination, departureDate, returnDate, adults, travelClass);
    }

    const results = [];

    // Try Kiwi.com API for cheap flights
    try {
      const cabinClass = travelClass === 'BUSINESS' ? 'BUSINESS' : 'ECONOMY';
      const kiwiParams = new URLSearchParams({
        source: `City:${origin.toLowerCase()}`,
        destination: `City:${destination.toLowerCase()}`,
        currency: 'EUR',
        locale: 'fr',
        adults: adults.toString(),
        children: children.toString(),
        cabinClass,
        sortBy: 'QUALITY',
        limit: '10',
      });

      if (returnDate) {
        kiwiParams.append('return', returnDate);
      }

      const kiwiResponse = await fetch(
        `https://kiwi-com-cheap-flights.p.rapidapi.com/round-trip?${kiwiParams}`,
        {
          headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': 'kiwi-com-cheap-flights.p.rapidapi.com',
          },
        }
      );

      if (kiwiResponse.ok) {
        const kiwiData = await kiwiResponse.json();
        console.log('Kiwi.com API response status:', kiwiResponse.status);
        console.log('Kiwi.com API response sample:', JSON.stringify(kiwiData).substring(0, 500));
        
        if (kiwiData.data && Array.isArray(kiwiData.data)) {
          const transformed = kiwiData.data.slice(0, 10).map((flight: any) => ({
            id: flight.id,
            itineraries: [{
              segments: [{
                departure: {
                  iataCode: flight.cityFrom || origin,
                  at: flight.local_departure || departureDate,
                },
                arrival: {
                  iataCode: flight.cityTo || destination,
                  at: flight.local_arrival || departureDate,
                },
                carrierCode: flight.airlines?.[0] || 'XX',
                number: flight.route?.[0]?.flight_no || '0000',
                duration: `PT${Math.floor(flight.duration?.total / 3600)}H${Math.floor((flight.duration?.total % 3600) / 60)}M`,
              }],
              duration: `PT${Math.floor(flight.duration?.total / 3600)}H${Math.floor((flight.duration?.total % 3600) / 60)}M`,
            }],
            price: {
              grandTotal: flight.price || flight.conversion?.XOF || '0',
              currency: 'XOF',
            },
            validatingAirlineCodes: flight.airlines || ['XX'],
            travelerPricings: [{
              fareDetailsBySegment: [{
                cabin: cabinClass,
              }],
            }],
          }));
          results.push(...transformed);
          console.log(`Found ${transformed.length} flights from Kiwi.com`);
        } else {
          console.log('Kiwi.com API returned no data array');
        }
      } else {
        const errorText = await kiwiResponse.text();
        console.error('Kiwi.com API failed with status:', kiwiResponse.status, 'Error:', errorText.substring(0, 500));
      }
    } catch (error) {
      console.error('Kiwi.com API exception:', error instanceof Error ? error.message : String(error));
    }

    // If no results, return mock data
    if (results.length === 0) {
      console.log('No results from APIs, returning mock data');
      return getMockFlights(origin, destination, departureDate, returnDate, adults, travelClass);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in search-flights:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: [],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function getMockFlights(origin: string, destination: string, departureDate: string, returnDate: string | undefined, adults: number, travelClass: string) {
  const mockFlights = {
    data: [
      {
        id: `${origin}-${destination}-1`,
        itineraries: [{
          segments: [{
            departure: {
              iataCode: origin,
              at: `${departureDate}T08:00:00`,
            },
            arrival: {
              iataCode: destination,
              at: `${departureDate}T12:30:00`,
            },
            carrierCode: 'AF',
            number: '1234',
            duration: 'PT4H30M',
          }],
          duration: 'PT4H30M',
        }],
        price: {
          grandTotal: '450.00',
          currency: 'EUR',
        },
        validatingAirlineCodes: ['AF'],
        travelerPricings: [{
          fareDetailsBySegment: [{
            cabin: travelClass || 'ECONOMY',
          }],
        }],
      },
      {
        id: `${origin}-${destination}-2`,
        itineraries: [{
          segments: [{
            departure: {
              iataCode: origin,
              at: `${departureDate}T14:00:00`,
            },
            arrival: {
              iataCode: destination,
              at: `${departureDate}T18:30:00`,
            },
            carrierCode: 'ET',
            number: '5678',
            duration: 'PT4H30M',
          }],
          duration: 'PT4H30M',
        }],
        price: {
          grandTotal: '380.00',
          currency: 'EUR',
        },
        validatingAirlineCodes: ['ET'],
        travelerPricings: [{
          fareDetailsBySegment: [{
            cabin: travelClass || 'ECONOMY',
          }],
        }],
      },
    ],
  };

  return new Response(
    JSON.stringify({
      success: true,
      data: mockFlights.data,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}