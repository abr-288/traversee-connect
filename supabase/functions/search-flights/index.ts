import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { flightSearchSchema, validateData, createValidationErrorResponse } from "../_shared/zodValidation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Validate request with Zod
    const validation = validateData(flightSearchSchema, body);
    
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors!, corsHeaders);
    }

    const { origin, destination, departureDate, returnDate, adults, children, travelClass } = validation.data!;

    // children and travelClass have defaults from schema, ensure they're not undefined
    const finalChildren = children ?? 0;
    const finalTravelClass = travelClass || 'ECONOMY';

    // Extract IATA codes from strings like "Dakar (DSS)" or just "DSS"
    const extractIataCode = (location: string): string => {
      if (!location || location.trim() === '') return '';
      const match = location.match(/\(([A-Z]{3})\)/);
      return match ? match[1] : location.replace(/[^A-Z]/g, '').substring(0, 3);
    };

    const originCode = extractIataCode(origin);
    const destinationCode = extractIataCode(destination);

    // Validation des codes IATA extraits
    if (!originCode || originCode.length !== 3 || !destinationCode || destinationCode.length !== 3) {
      console.error('Invalid IATA codes:', { originCode, destinationCode, origin, destination });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Codes IATA invalides. Veuillez sélectionner des aéroports valides.',
          data: [],
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Searching flights:', { origin: originCode, destination: destinationCode, departureDate, returnDate, adults, children: finalChildren, travelClass: finalTravelClass });

    const amadeusKey = Deno.env.get('AMADEUS_API_KEY');
    const amadeusSecret = Deno.env.get('AMADEUS_API_SECRET');
    const sabreUserId = Deno.env.get('SABRE_USER_ID');
    const sabrePassword = Deno.env.get('SABRE_PASSWORD');
    
    const results: any[] = [];

    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    
    // Try all APIs in parallel
    const apiPromises = [];

    // Amadeus API (primary)
    if (amadeusKey && amadeusSecret) {
      apiPromises.push(searchAmadeus(originCode, destinationCode, departureDate, returnDate, adults, finalChildren, finalTravelClass, amadeusKey, amadeusSecret));
    }

    // Kiwi.com API via RapidAPI (secondary)
    if (rapidApiKey) {
      apiPromises.push(searchKiwi(originCode, destinationCode, departureDate, returnDate, adults, finalChildren, finalTravelClass, rapidApiKey));
    }

    // Sabre API (tertiary)
    if (sabreUserId && sabrePassword) {
      apiPromises.push(searchSabre(originCode, destinationCode, departureDate, returnDate, adults, finalChildren, finalTravelClass, sabreUserId, sabrePassword));
    }

    if (apiPromises.length === 0) {
      console.log('No API credentials configured, returning mock data');
      return getMockFlights(originCode, destinationCode, departureDate, returnDate, adults, finalTravelClass);
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
      return getMockFlights(originCode, destinationCode, departureDate, returnDate, adults, finalTravelClass);
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

// Kiwi.com API via RapidAPI
async function searchKiwi(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate: string | undefined,
  adults: number,
  children: number,
  travelClass: string,
  rapidApiKey: string
): Promise<any[]> {
  try {
    console.log('Searching flights with Kiwi.com API via RapidAPI...');
    
    // Map travel class to Kiwi format
    const cabinMap: Record<string, string> = {
      'ECONOMY': 'ECONOMY',
      'PREMIUM_ECONOMY': 'PREMIUM_ECONOMY',
      'BUSINESS': 'BUSINESS',
      'FIRST': 'FIRST'
    };
    const selectedCabin = cabinMap[travelClass] || 'ECONOMY';
    
    // Determine if one-way or round-trip
    const endpoint = returnDate ? 'round-trip' : 'one-way';
    
    // Build URL with required parameters
    const params = new URLSearchParams({
      source: `Airport:${origin}`,
      destination: `Airport:${destination}`,
      currency: 'eur',
      locale: 'en',
      adults: adults.toString(),
      children: children.toString(),
      infants: '0',
      handbags: '1',
      holdbags: '0',
      cabinClass: selectedCabin,
      sortBy: 'PRICE',
      sortOrder: 'ASCENDING',
      limit: '15'
    });
    
    // Add date parameters based on endpoint type
    if (returnDate) {
      // Round trip: outboundDepartureMinDate, outboundDepartureMaxDate, inboundDepartureMinDate, inboundDepartureMaxDate
      params.append('outboundDepartureMinDate', departureDate);
      params.append('outboundDepartureMaxDate', departureDate);
      params.append('inboundDepartureMinDate', returnDate);
      params.append('inboundDepartureMaxDate', returnDate);
    } else {
      // One-way: departureMinDate, departureMaxDate
      params.append('departureMinDate', departureDate);
      params.append('departureMaxDate', departureDate);
    }
    
    const searchResponse = await fetch(
      `https://kiwi-com-cheap-flights.p.rapidapi.com/${endpoint}?${params}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'kiwi-com-cheap-flights.p.rapidapi.com'
        }
      }
    );

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('Kiwi.com API error:', searchResponse.status, errorText.substring(0, 300));
      return [];
    }

    const searchData = await searchResponse.json();
    console.log('Kiwi.com API response received, keys:', Object.keys(searchData));
    
    // Handle different response structures from Kiwi API
    const flightsArray = searchData.itineraries || searchData.data || [];
    
    if (Array.isArray(flightsArray) && flightsArray.length > 0) {
      // Log first item structure for debugging
      const firstItem = flightsArray[0];
      console.log('Kiwi first item keys:', Object.keys(firstItem));
      if (firstItem.legs) {
        console.log('Kiwi first leg:', JSON.stringify(firstItem.legs[0])?.substring(0, 800));
      }
      if (firstItem.sector) {
        console.log('Kiwi sector:', JSON.stringify(firstItem.sector)?.substring(0, 800));
      }
      if (firstItem.priceEur) {
        console.log('Kiwi priceEur:', firstItem.priceEur);
      }
      
      const flights = flightsArray.slice(0, 15).map((flight: any, index: number) => {
        // Handle Kiwi RapidAPI structure (sector contains segments)
        const sector = flight.sector || {};
        const segments = sector.sectorSegments || flight.legs || flight.route || [];
        const firstSegment = segments[0]?.segment || segments[0] || {};
        const lastSegment = segments[segments.length - 1]?.segment || segments[segments.length - 1] || {};
        
        // Get price - priceEur.amount is the main price in this API
        const priceEur = flight.priceEur?.amount || flight.price?.amount || flight.price || 0;
        
        // Get duration from sector
        const durationSeconds = sector.duration || flight.duration?.total || 0;
        const durationMinutes = Math.floor(durationSeconds / 60);
        
        // Get departure info from first segment
        const departureCode = firstSegment.source?.station?.code || 
          firstSegment.origin?.id || 
          firstSegment.flyFrom || 
          origin;
        const arrivalCode = lastSegment.destination?.station?.code || 
          lastSegment.destination?.id || 
          lastSegment.flyTo || 
          destination;
        
        // Get times
        const departureTime = firstSegment.source?.localTime || 
          firstSegment.departure || 
          firstSegment.local_departure || 
          `${departureDate}T00:00:00`;
        const arrivalTime = lastSegment.destination?.localTime || 
          lastSegment.arrival || 
          lastSegment.local_arrival || 
          `${departureDate}T23:59:00`;
        
        // Get carrier info
        const carrierCode = firstSegment.carrier?.code || 
          firstSegment.airline || 
          flight.carriers?.[0]?.code ||
          'XX';
        const carrierName = firstSegment.carrier?.name || flight.carriers?.[0]?.name || '';
        const flightNumber = firstSegment.flightNumber?.toString() || 
          firstSegment.flight_no?.toString() || 
          '0000';
        
        return {
          id: `KIWI-${origin}-${destination}-${index}`,
          itineraries: [{
            segments: [{
              departure: {
                iataCode: departureCode,
                at: departureTime,
              },
              arrival: {
                iataCode: arrivalCode,
                at: arrivalTime,
              },
              carrierCode: carrierCode,
              number: flightNumber,
              duration: `PT${Math.floor(durationMinutes / 60)}H${durationMinutes % 60}M`,
            }],
            duration: `PT${Math.floor(durationMinutes / 60)}H${durationMinutes % 60}M`,
          }],
          price: {
            grandTotal: Math.round(parseFloat(priceEur.toString()) * 655).toString(), // Convert EUR to XOF
            currency: 'XOF',
          },
          validatingAirlineCodes: [carrierCode],
          travelerPricings: [{
            fareDetailsBySegment: [{
              cabin: travelClass || 'ECONOMY',
            }],
          }],
          source: 'kiwi',
          deepLink: flight.deepLink || flight.shareId
        };
      });
      
      console.log(`Found ${flights.length} flights from Kiwi.com`);
      return flights;
    }
    
    console.log('No flights found in Kiwi.com response');
    return [];
  } catch (error) {
    console.error('Kiwi.com API exception:', error instanceof Error ? error.message : String(error));
    return [];
  }
}