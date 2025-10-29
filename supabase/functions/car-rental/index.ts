import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface AmadeusAuthResponse {
  access_token: string;
  expires_in: number;
}

async function getAmadeusToken(apiKey: string, apiSecret: string): Promise<string> {
  const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: apiKey,
      client_secret: apiSecret,
    }),
  });

  if (!response.ok) {
    throw new Error(`Amadeus auth failed: ${response.status}`);
  }

  const data: AmadeusAuthResponse = await response.json();
  return data.access_token;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pickupLocation, dropoffLocation, pickupDate, dropoffDate, pickupTime = '10:00', dropoffTime = '10:00' } = await req.json();
    const AMADEUS_API_KEY = Deno.env.get('AMADEUS_API_KEY');
    const AMADEUS_API_SECRET = Deno.env.get('AMADEUS_API_SECRET');

    if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) {
      console.error('Amadeus credentials not configured');
      return new Response(
        JSON.stringify({
          success: false,
          data: [],
          message: 'API credentials not configured'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Searching car rentals:', { pickupLocation, dropoffLocation, pickupDate, dropoffDate });

    // Get Amadeus access token
    const token = await getAmadeusToken(AMADEUS_API_KEY, AMADEUS_API_SECRET);

    // Search for car rentals using Amadeus API
    const searchParams = new URLSearchParams({
      pickUpLocationCode: pickupLocation,
      dropOffLocationCode: dropoffLocation || pickupLocation,
      pickUpDateTime: `${pickupDate}T${pickupTime}:00`,
      dropOffDateTime: `${dropoffDate}T${dropoffTime}:00`,
    });

    const response = await fetch(
      `https://test.api.amadeus.com/v1/shopping/car-rental-offers?${searchParams}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Amadeus API error:', response.status, errorText);
      
      return new Response(
        JSON.stringify({
          success: false,
          data: [],
          message: 'No results found for this location'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Car rental search successful, found:', data.data?.length || 0, 'offers');

    // Transform Amadeus data to our format
    const transformedData = (data.data || []).map((offer: any) => {
      const vehicle = offer.vehicle;
      const price = offer.price;
      
      return {
        id: offer.id,
        name: `${vehicle.make} ${vehicle.model}` || vehicle.category || 'Vehicle',
        category: vehicle.category || 'Standard',
        price: parseFloat(price.total),
        currency: price.currency,
        rating: 4.5,
        reviews: 0,
        image: vehicle.imageURL || '/placeholder.svg',
        seats: vehicle.seats || 5,
        transmission: vehicle.transmission === 'AUTOMATIC' ? 'Automatique' : 'Manuelle',
        fuel: vehicle.fuel || 'Essence',
        luggage: vehicle.baggageCapacity || 3,
        airConditioning: vehicle.airConditioning || false,
        provider: offer.provider?.name || 'Unknown'
      };
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: transformedData,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in car-rental function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
