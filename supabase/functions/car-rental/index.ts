import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { carRentalSchema, validateData, createValidationErrorResponse } from "../_shared/zodValidation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CarResult {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  rating: number;
  reviews: number;
  image: string;
  seats: number;
  transmission: string;
  fuel: string;
  luggage: number;
  airConditioning: boolean;
  provider: string;
  source: string;
}

// Search cars using Booking.com Car Rental API
async function searchBookingCars(
  pickupLocation: string,
  pickupDate: string,
  dropoffDate: string,
  pickupTime: string,
  dropoffTime: string,
  rapidApiKey: string
): Promise<CarResult[]> {
  try {
    console.log('Searching Booking.com Car Rentals...');
    
    // First get location coordinates
    const locationResponse = await fetch(
      `https://booking-com15.p.rapidapi.com/api/v1/cars/searchDestination?query=${encodeURIComponent(pickupLocation)}`,
      {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com',
        },
      }
    );

    let coordinates = { lat: '0', lng: '0' };
    if (locationResponse.ok) {
      const locData = await locationResponse.json();
      if (locData.data && locData.data[0]) {
        coordinates.lat = locData.data[0].latitude || '0';
        coordinates.lng = locData.data[0].longitude || '0';
        console.log('Found coordinates:', coordinates);
      }
    }

    const bookingParams = new URLSearchParams({
      pick_up_latitude: coordinates.lat,
      pick_up_longitude: coordinates.lng,
      drop_off_latitude: coordinates.lat,
      drop_off_longitude: coordinates.lng,
      pick_up_date: pickupDate,
      drop_off_date: dropoffDate,
      pick_up_time: pickupTime,
      drop_off_time: dropoffTime,
      driver_age: '30',
      currency_code: 'EUR',
    });

    const response = await fetch(
      `https://booking-com15.p.rapidapi.com/api/v1/cars/searchCarRentals?${bookingParams}`,
      {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      console.error('Booking.com Cars API error:', response.status);
      return [];
    }

    const data = await response.json();
    console.log('Booking.com Cars response:', JSON.stringify(data).substring(0, 300));

    if (data.data?.vehicles && Array.isArray(data.data.vehicles)) {
      return data.data.vehicles.slice(0, 10).map((vehicle: any, index: number) => ({
        id: `booking-${vehicle.id || index}`,
        name: vehicle.name || vehicle.vehicle_info?.v_name || 'Véhicule',
        category: vehicle.category || vehicle.vehicle_info?.category || 'Standard',
        price: parseFloat(vehicle.price?.total_price || vehicle.pricing?.total || 50),
        currency: 'EUR',
        rating: vehicle.supplier_info?.rating || 4.5,
        reviews: vehicle.supplier_info?.reviews_count || 0,
        image: vehicle.image_url || vehicle.vehicle_info?.image || 'https://images.unsplash.com/photo-1494905998402-395d579af36f',
        seats: vehicle.passengers || vehicle.vehicle_info?.passengers || 5,
        transmission: vehicle.transmission?.toLowerCase().includes('auto') ? 'Automatique' : 'Manuelle',
        fuel: vehicle.fuel_type || 'Essence',
        luggage: vehicle.bags_fit || vehicle.vehicle_info?.bags || 3,
        airConditioning: vehicle.has_ac !== false,
        provider: vehicle.supplier_name || 'Booking.com',
        source: 'booking',
      }));
    }

    return [];
  } catch (error) {
    console.error('Booking.com Cars exception:', error);
    return [];
  }
}

// Search cars using Priceline API
async function searchPricelineCars(
  pickupLocation: string,
  pickupDate: string,
  dropoffDate: string,
  pickupTime: string,
  dropoffTime: string,
  rapidApiKey: string
): Promise<CarResult[]> {
  try {
    console.log('Searching Priceline Car Rentals...');
    
    const pricelineParams = new URLSearchParams({
      location: pickupLocation,
      pick_up_date: pickupDate,
      drop_off_date: dropoffDate,
      pick_up_time: pickupTime,
      drop_off_time: dropoffTime,
    });

    const response = await fetch(
      `https://priceline-com-provider.p.rapidapi.com/v2/cars/search?${pricelineParams}`,
      {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'priceline-com-provider.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      console.error('Priceline Cars API error:', response.status);
      return [];
    }

    const data = await response.json();
    console.log('Priceline Cars response:', JSON.stringify(data).substring(0, 300));

    if (data.cars && Array.isArray(data.cars)) {
      return data.cars.slice(0, 10).map((car: any, index: number) => ({
        id: `priceline-${index}`,
        name: car.name || car.vehicle_name || 'Véhicule',
        category: car.category || car.class || 'Standard',
        price: car.price || car.total_price || 45,
        currency: 'EUR',
        rating: car.rating || 4.3,
        reviews: car.reviews_count || 0,
        image: car.image || 'https://images.unsplash.com/photo-1494905998402-395d579af36f',
        seats: car.passengers || 5,
        transmission: car.transmission || 'Automatique',
        fuel: car.fuel || 'Essence',
        luggage: car.baggage || 3,
        airConditioning: true,
        provider: car.provider || 'Priceline',
        source: 'priceline',
      }));
    }

    return [];
  } catch (error) {
    console.error('Priceline Cars exception:', error);
    return [];
  }
}

// Note: Kayak Car Rental API n'existe pas sur RapidAPI - supprimé

function getMockCarRentals(pickupLocation: string): CarResult[] {
  const cars = [
    { name: 'Toyota Corolla', category: 'Économique', price: 38, seats: 5, transmission: 'Automatique' },
    { name: 'Renault Clio', category: 'Compacte', price: 33, seats: 5, transmission: 'Manuelle' },
    { name: 'Peugeot 308', category: 'Berline', price: 53, seats: 5, transmission: 'Automatique' },
    { name: 'Mercedes Classe E', category: 'Luxe', price: 84, seats: 5, transmission: 'Automatique' },
    { name: 'Toyota Land Cruiser', category: 'SUV', price: 99, seats: 7, transmission: 'Automatique' },
    { name: 'Volkswagen Polo', category: 'Économique', price: 30, seats: 5, transmission: 'Manuelle' },
  ];

  return cars.map((car, index) => ({
    id: `mock-${index}`,
    name: car.name,
    category: car.category,
    price: car.price,
    currency: 'EUR',
    rating: 4.5 - (index * 0.1),
    reviews: 120 - (index * 15),
    image: 'https://images.unsplash.com/photo-1494905998402-395d579af36f',
    seats: car.seats,
    transmission: car.transmission,
    fuel: 'Essence',
    luggage: 3,
    airConditioning: true,
    provider: 'Location Auto',
    source: 'mock',
  }));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Validate request with Zod
    const validation = validateData(carRentalSchema, body);
    
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors!, corsHeaders);
    }

    const { pickupLocation, dropoffLocation, pickupDate, dropoffDate, pickupTime = '10:00', dropoffTime = '10:00' } = validation.data!;
    
    console.log('Searching car rentals:', { pickupLocation, dropoffLocation, pickupDate, dropoffDate });

    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    if (!rapidApiKey) {
      console.log('RapidAPI key not configured, returning mock data');
      return new Response(
        JSON.stringify({ success: true, data: getMockCarRentals(pickupLocation) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search available car rental APIs in parallel (Booking.com + Priceline)
    const [bookingResults, pricelineResults] = await Promise.all([
      searchBookingCars(pickupLocation, pickupDate, dropoffDate, pickupTime, dropoffTime, rapidApiKey),
      searchPricelineCars(pickupLocation, pickupDate, dropoffDate, pickupTime, dropoffTime, rapidApiKey),
    ]);

    const allCars = [...bookingResults, ...pricelineResults];
    
    console.log(`Total cars found: ${allCars.length} (Booking: ${bookingResults.length}, Priceline: ${pricelineResults.length})`);

    // If no API results, return mock data
    if (allCars.length === 0) {
      console.log('No car rental results from APIs, returning mock data');
      return new Response(
        JSON.stringify({ success: true, data: getMockCarRentals(pickupLocation) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sort by price
    allCars.sort((a, b) => a.price - b.price);

    return new Response(
      JSON.stringify({ success: true, data: allCars }),
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
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
