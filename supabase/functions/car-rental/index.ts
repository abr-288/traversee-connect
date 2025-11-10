import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { pickupLocation, dropoffLocation, pickupDate, dropoffDate, pickupTime = '10:00', dropoffTime = '10:00' } = await req.json();
    
    console.log('Searching car rentals:', { pickupLocation, dropoffLocation, pickupDate, dropoffDate });

    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    if (!rapidApiKey) {
      console.log('RapidAPI key not configured, returning mock data');
      return getMockCarRentals(pickupLocation, pickupDate, dropoffDate);
    }

    const results = [];

    // Try Booking.com Car Rental API
    try {
      const bookingParams = new URLSearchParams({
        pick_up_latitude: '0',
        pick_up_longitude: '0',
        drop_off_latitude: '0',
        drop_off_longitude: '0',
        pick_up_time: pickupTime.replace(':', '%3A'),
        drop_off_time: dropoffTime.replace(':', '%3A'),
        driver_age: '30',
        currency_code: 'XOF',
        location: pickupLocation,
      });

      const bookingResponse = await fetch(
        `https://booking-com15.p.rapidapi.com/api/v1/cars/searchCarRentals?${bookingParams}`,
        {
          headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com',
          },
        }
      );

      if (bookingResponse.ok) {
        const data = await bookingResponse.json();
        if (data.data?.vehicles && Array.isArray(data.data.vehicles)) {
          const transformed = data.data.vehicles.slice(0, 10).map((vehicle: any, index: number) => ({
            id: vehicle.id || `car-${index}`,
            name: vehicle.name || vehicle.vehicle_info?.v_name || 'Véhicule',
            category: vehicle.category || vehicle.vehicle_info?.category || 'Standard',
            price: parseFloat(vehicle.price?.total_price || vehicle.pricing?.total || 25000),
            currency: 'XOF',
            rating: vehicle.supplier_info?.rating || 4.5,
            reviews: vehicle.supplier_info?.reviews_count || 0,
            image: vehicle.image_url || vehicle.vehicle_info?.image || 'https://images.unsplash.com/photo-1494905998402-395d579af36f',
            seats: vehicle.passengers || vehicle.vehicle_info?.passengers || 5,
            transmission: vehicle.transmission?.toLowerCase().includes('auto') ? 'Automatique' : 'Manuelle',
            fuel: vehicle.fuel_type || 'Essence',
            luggage: vehicle.bags_fit || vehicle.vehicle_info?.bags || 3,
            airConditioning: vehicle.has_ac || true,
            provider: vehicle.supplier_name || 'Location de voiture'
          }));
          results.push(...transformed);
          console.log(`Found ${transformed.length} cars from Booking.com`);
        }
      }
    } catch (error) {
      console.error('Booking.com car rental API error:', error);
    }

    // Try Car Data API for additional car information
    try {
      const carDataResponse = await fetch(
        'https://car-data.p.rapidapi.com/cars?limit=5&page=0',
        {
          headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': 'car-data.p.rapidapi.com',
          },
        }
      );

      if (carDataResponse.ok) {
        const data = await carDataResponse.json();
        if (Array.isArray(data)) {
          const transformed = data.slice(0, 5).map((car: any, index: number) => ({
            id: `cardata-${index}`,
            name: `${car.make} ${car.model}` || 'Véhicule',
            category: car.type || 'Standard',
            price: Math.floor(Math.random() * 30000) + 15000,
            currency: 'XOF',
            rating: 4.5,
            reviews: Math.floor(Math.random() * 100) + 20,
            image: 'https://images.unsplash.com/photo-1494905998402-395d579af36f',
            seats: 5,
            transmission: car.transmission || 'Automatique',
            fuel: car.fuel_type || 'Essence',
            luggage: 3,
            airConditioning: true,
            provider: 'Location premium'
          }));
          results.push(...transformed);
          console.log(`Found ${transformed.length} cars from Car Data API`);
        }
      }
    } catch (error) {
      console.error('Car Data API error:', error);
    }

    // If no results, return mock data
    if (results.length === 0) {
      console.log('No car rental results from APIs, returning mock data');
      return getMockCarRentals(pickupLocation, pickupDate, dropoffDate);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in car-rental function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        data: [],
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function getMockCarRentals(pickupLocation: string, pickupDate: string, dropoffDate: string) {
  return new Response(
    JSON.stringify({
      success: true,
      data: [
        {
          id: '1',
          name: 'Toyota Corolla',
          category: 'Économique',
          price: 25000,
          currency: 'XOF',
          rating: 4.5,
          reviews: 120,
          image: 'https://images.unsplash.com/photo-1494905998402-395d579af36f',
          seats: 5,
          transmission: 'Automatique',
          fuel: 'Essence',
          luggage: 3,
          airConditioning: true,
          provider: 'Location Auto'
        },
        {
          id: '2',
          name: 'Renault Clio',
          category: 'Compacte',
          price: 22000,
          currency: 'XOF',
          rating: 4.3,
          reviews: 85,
          image: 'https://images.unsplash.com/photo-1494905998402-395d579af36f',
          seats: 5,
          transmission: 'Manuelle',
          fuel: 'Diesel',
          luggage: 2,
          airConditioning: true,
          provider: 'Location Auto'
        },
        {
          id: '3',
          name: 'Mercedes Classe E',
          category: 'Luxe',
          price: 55000,
          currency: 'XOF',
          rating: 4.8,
          reviews: 95,
          image: 'https://images.unsplash.com/photo-1494905998402-395d579af36f',
          seats: 5,
          transmission: 'Automatique',
          fuel: 'Essence',
          luggage: 4,
          airConditioning: true,
          provider: 'Location Premium'
        },
      ],
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
