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

    // Extract IATA codes from strings like "Dakar (DSS)" or just "DSS"
    const extractIataCode = (location: string): string => {
      const match = location.match(/\(([A-Z]{3})\)/);
      return match ? match[1] : location.replace(/[^A-Z]/g, '').substring(0, 3);
    };

    const originCode = extractIataCode(origin);
    const destinationCode = extractIataCode(destination);

    console.log('Searching flights:', { origin: originCode, destination: destinationCode, departureDate, returnDate, adults, children, travelClass });

    const amadeusKey = Deno.env.get('AMADEUS_API_KEY');
    const amadeusSecret = Deno.env.get('AMADEUS_API_SECRET');
    const sabreUserId = Deno.env.get('SABRE_USER_ID');
    const sabrePassword = Deno.env.get('SABRE_PASSWORD');
    
    const results: any[] = [];

    // Try both APIs in parallel
    const apiPromises = [];

    // Amadeus API
    if (amadeusKey && amadeusSecret) {
      apiPromises.push(searchAmadeus(originCode, destinationCode, departureDate, returnDate, adults, children, travelClass, amadeusKey, amadeusSecret));
    }

    // Sabre API
    if (sabreUserId && sabrePassword) {
      apiPromises.push(searchSabre(originCode, destinationCode, departureDate, returnDate, adults, children, travelClass, sabreUserId, sabrePassword));
    }

    if (apiPromises.length === 0) {
      console.log('No API credentials configured, returning mock data');
      return getMockFlights(originCode, destinationCode, departureDate, returnDate, adults, travelClass);
    }

    // Wait for all API calls to complete
    const apiResults = await Promise.allSettled(apiPromises);
    
    // Collect all successful results
    apiResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        results.push(...result.value);
        console.log(`API ${index + 1} returned ${result.value.length} flights`);
      } else if (result.status === 'rejected') {
        console.error(`API ${index + 1} failed:`, result.reason);
      }
    });

    // If no results, return mock data
    if (results.length === 0) {
      console.log('No results from API, returning mock data');
      return getMockFlights(originCode, destinationCode, departureDate, returnDate, adults, travelClass);
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
          grandTotal: '185000',
          currency: 'XOF',
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
          grandTotal: '165000',
          currency: 'XOF',
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

// Amadeus API search function
async function searchAmadeus(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate: string | undefined,
  adults: number,
  children: number,
  travelClass: string,
  amadeusKey: string,
  amadeusSecret: string
): Promise<any[]> {
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
      console.log('Found flights from Amadeus:', flightData.data?.length || 0);
      
      if (flightData.data && Array.isArray(flightData.data)) {
        return flightData.data;
      }
    } else {
      const errorText = await flightResponse.text();
      console.error('Amadeus API failed with status:', flightResponse.status, 'Error:', errorText.substring(0, 500));
    }
  } catch (error) {
    console.error('Amadeus API exception:', error instanceof Error ? error.message : String(error));
  }
  
  return [];
}

// Sabre API search function
async function searchSabre(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate: string | undefined,
  adults: number,
  children: number,
  travelClass: string,
  sabreUserId: string,
  sabrePassword: string
): Promise<any[]> {
  try {
    console.log('Getting Sabre access token...');
    
    // Sabre authentication
    const credentials = btoa(`${sabreUserId}:${sabrePassword}`);
    const tokenResponse = await fetch('https://api.cert.platform.sabre.com/v2/auth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Failed to get Sabre token:', tokenResponse.status, errorText);
      throw new Error('Failed to authenticate with Sabre');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    console.log('Sabre access token obtained successfully');

    // Search for flights with Sabre
    const searchBody = {
      OTA_AirLowFareSearchRQ: {
        Version: '1.0.0',
        OriginDestinationInformation: [
          {
            DepartureDateTime: `${departureDate}T00:00:00`,
            OriginLocation: { LocationCode: origin },
            DestinationLocation: { LocationCode: destination },
          },
        ],
        TravelPreferences: {
          CabinPref: [{ Cabin: travelClass, PreferLevel: 'Preferred' }],
        },
        TravelerInfoSummary: {
          AirTravelerAvail: [
            {
              PassengerTypeQuantity: [
                { Code: 'ADT', Quantity: adults },
                ...(children > 0 ? [{ Code: 'CNN', Quantity: children }] : []),
              ],
            },
          ],
        },
        POS: {
          Source: [{ PseudoCityCode: 'F9CE' }],
        },
      },
    };

    if (returnDate) {
      searchBody.OTA_AirLowFareSearchRQ.OriginDestinationInformation.push({
        DepartureDateTime: `${returnDate}T00:00:00`,
        OriginLocation: { LocationCode: destination },
        DestinationLocation: { LocationCode: origin },
      });
    }

    console.log('Searching flights with Sabre API...');
    const flightResponse = await fetch(
      'https://api.cert.platform.sabre.com/v1/shop/flights',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchBody),
      }
    );

    if (flightResponse.ok) {
      const flightData = await flightResponse.json();
      console.log('Sabre API response status:', flightResponse.status);
      
      // Transform Sabre response to Amadeus format
      const priceItineraries = flightData.PricedItineraries || [];
      console.log('Found flights from Sabre:', priceItineraries.length);
      
      if (priceItineraries.length > 0) {
        const transformedFlights = priceItineraries.slice(0, 20).map((itinerary: any, index: number) => {
          const firstFlight = itinerary.AirItinerary?.OriginDestinationOptions?.[0]?.FlightSegment?.[0];
          const lastFlight = itinerary.AirItinerary?.OriginDestinationOptions?.[0]?.FlightSegment?.slice(-1)[0];
          const totalPrice = itinerary.AirItineraryPricingInfo?.ItinTotalFare?.TotalFare?.Amount || 0;
          
          return {
            id: `SABRE-${origin}-${destination}-${index}`,
            itineraries: [{
              segments: [{
                departure: {
                  iataCode: firstFlight?.DepartureAirport?.LocationCode || origin,
                  at: firstFlight?.DepartureDateTime || `${departureDate}T00:00:00`,
                },
                arrival: {
                  iataCode: lastFlight?.ArrivalAirport?.LocationCode || destination,
                  at: lastFlight?.ArrivalDateTime || `${departureDate}T23:59:00`,
                },
                carrierCode: firstFlight?.MarketingAirline?.Code || 'XX',
                number: firstFlight?.FlightNumber || '0000',
                duration: itinerary.AirItinerary?.OriginDestinationOptions?.[0]?.ElapsedTime || 'PT0H',
              }],
              duration: itinerary.AirItinerary?.OriginDestinationOptions?.[0]?.ElapsedTime || 'PT0H',
            }],
            price: {
              grandTotal: (parseFloat(totalPrice) * 655).toString(), // Convert USD to XOF
              currency: 'XOF',
            },
            validatingAirlineCodes: [firstFlight?.MarketingAirline?.Code || 'XX'],
            travelerPricings: [{
              fareDetailsBySegment: [{
                cabin: travelClass || 'ECONOMY',
              }],
            }],
          };
        });
        
        return transformedFlights;
      }
    } else {
      const errorText = await flightResponse.text();
      console.error('Sabre API failed with status:', flightResponse.status, 'Error:', errorText.substring(0, 500));
    }
  } catch (error) {
    console.error('Sabre API exception:', error instanceof Error ? error.message : String(error));
  }
  
  return [];
}