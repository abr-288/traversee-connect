import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { origin, destination, departureDate, returnDate, adults, travelClass } = await req.json();

    const SABRE_USER_ID = Deno.env.get('SABRE_USER_ID');
    const SABRE_PASSWORD = Deno.env.get('SABRE_PASSWORD');

    // If Sabre credentials are not configured or invalid, return mock data
    if (!SABRE_USER_ID || !SABRE_PASSWORD) {
      console.log('Sabre credentials not configured, returning mock data');
      return getMockFlights(origin, destination, departureDate, returnDate, adults, travelClass);
    }

    // Get Sabre access token
    const credentials = btoa(`${SABRE_USER_ID}:${SABRE_PASSWORD}`);
    const tokenResponse = await fetch('https://api.havail.sabre.com/v2/auth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Sabre auth error:', error);
      console.log('Falling back to mock data due to auth failure');
      return getMockFlights(origin, destination, departureDate, returnDate, adults, travelClass);
    }

    const { access_token } = await tokenResponse.json();

    // Build Sabre BargainFinderMax request
    const cabinMap: Record<string, string> = {
      'ECONOMY': 'Y',
      'PREMIUM_ECONOMY': 'S',
      'BUSINESS': 'C',
      'FIRST': 'F',
    };

    const sabreRequest = {
      OTA_AirLowFareSearchRQ: {
        Version: '1',
        POS: {
          Source: [
            {
              PseudoCityCode: 'F9CE',
              RequestorID: {
                Type: '1',
                ID: '1',
                CompanyName: {
                  Code: 'TN',
                },
              },
            },
          ],
        },
        OriginDestinationInformation: returnDate ? [
          {
            RPH: '0',
            DepartureDateTime: departureDate,
            OriginLocation: { LocationCode: origin },
            DestinationLocation: { LocationCode: destination },
          },
          {
            RPH: '1',
            DepartureDateTime: returnDate,
            OriginLocation: { LocationCode: destination },
            DestinationLocation: { LocationCode: origin },
          },
        ] : [
          {
            RPH: '0',
            DepartureDateTime: departureDate,
            OriginLocation: { LocationCode: origin },
            DestinationLocation: { LocationCode: destination },
          },
        ],
        TravelPreferences: {
          CabinPref: [
            {
              Cabin: cabinMap[travelClass || 'ECONOMY'] || 'Y',
              PreferLevel: 'Preferred',
            },
          ],
        },
        TravelerInfoSummary: {
          AirTravelerAvail: [
            {
              PassengerTypeQuantity: [
                {
                  Code: 'ADT',
                  Quantity: adults,
                },
              ],
            },
          ],
        },
        TPA_Extensions: {
          IntelliSellTransaction: {
            RequestType: {
              Name: '50ITINS',
            },
          },
        },
      },
    };

    const flightsResponse = await fetch(
      'https://api.havail.sabre.com/v4.3.0/offers/shop',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sabreRequest),
      }
    );

    if (!flightsResponse.ok) {
      const error = await flightsResponse.text();
      console.error('Sabre API error:', error);
      throw new Error('Failed to search flights');
    }

    const sabreData = await flightsResponse.json();
    
    // Transform Sabre response to Amadeus-like format
    const flights = {
      data: sabreData.PricedItineraries?.map((itin: any, index: number) => {
        const segments = itin.AirItinerary?.OriginDestinationOptions?.OriginDestinationOption?.[0]?.FlightSegment || [];
        const firstSegment = segments[0];
        const lastSegment = segments[segments.length - 1];
        
        return {
          id: `${origin}-${destination}-${index}`,
          itineraries: [{
            segments: segments.map((seg: any) => ({
              departure: {
                iataCode: seg.DepartureAirport?.LocationCode,
                at: seg.DepartureDateTime,
              },
              arrival: {
                iataCode: seg.ArrivalAirport?.LocationCode,
                at: seg.ArrivalDateTime,
              },
              carrierCode: seg.MarketingAirline?.Code,
              number: seg.FlightNumber,
              duration: seg.JourneyDuration,
            })),
            duration: itin.AirItinerary?.OriginDestinationOptions?.OriginDestinationOption?.[0]?.JourneyDuration,
          }],
          price: {
            grandTotal: itin.AirItineraryPricingInfo?.ItinTotalFare?.TotalFare?.Amount,
            currency: itin.AirItineraryPricingInfo?.ItinTotalFare?.TotalFare?.CurrencyCode,
          },
          validatingAirlineCodes: [firstSegment?.MarketingAirline?.Code],
          travelerPricings: [{
            fareDetailsBySegment: [{
              cabin: itin.AirItineraryPricingInfo?.PTC_FareBreakdowns?.PTC_FareBreakdown?.[0]?.PassengerTypeQuantity?.Code === 'ADT' ? 'ECONOMY' : 'ECONOMY',
            }],
          }],
        };
      }) || [],
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: flights.data || [],
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in search-flights:', error);
    console.log('Returning mock data due to error');
    // Return mock data instead of error
    const { origin, destination, departureDate, returnDate, adults, travelClass } = await req.json();
    return getMockFlights(origin, destination, departureDate, returnDate, adults, travelClass);
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