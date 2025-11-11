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

    const amadeusKey = Deno.env.get('AMADEUS_API_KEY');
    const amadeusSecret = Deno.env.get('AMADEUS_API_SECRET');
    
    if (!amadeusKey || !amadeusSecret) {
      console.log('Amadeus API credentials not configured, returning mock data');
      return getMockFlights(origin, destination, departureDate, returnDate, adults, travelClass);
    }

    const results = [];

    // Get Amadeus access token
    try {
      console.log('Getting Amadeus access token...');
      const tokenResponse = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=client_credentials&client_id=${amadeusKey}&client_secret=${amadeusSecret}`,
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Failed to get Amadeus token:', tokenResponse.status, errorText);
        throw new Error('Failed to authenticate with Amadeus');
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;
      console.log('Amadeus access token obtained successfully');

      // Search for flights
      const params = new URLSearchParams({
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate: departureDate,
        adults: adults.toString(),
        children: children.toString(),
        travelClass: travelClass,
        currencyCode: 'XOF',
        max: '20',
      });

      if (returnDate) {
        params.append('returnDate', returnDate);
      }

      console.log('Searching flights with Amadeus API...');
      const flightResponse = await fetch(
        `https://test.api.amadeus.com/v2/shopping/flight-offers?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (flightResponse.ok) {
        const flightData = await flightResponse.json();
        console.log('Amadeus API response status:', flightResponse.status);
        console.log('Found flights:', flightData.data?.length || 0);
        
        if (flightData.data && Array.isArray(flightData.data)) {
          results.push(...flightData.data);
          console.log(`Successfully retrieved ${flightData.data.length} flights from Amadeus`);
        } else {
          console.log('Amadeus API returned no data array');
        }
      } else {
        const errorText = await flightResponse.text();
        console.error('Amadeus API failed with status:', flightResponse.status, 'Error:', errorText.substring(0, 500));
      }
    } catch (error) {
      console.error('Amadeus API exception:', error instanceof Error ? error.message : String(error));
    }

    // If no results, return mock data
    if (results.length === 0) {
      console.log('No results from API, returning mock data');
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