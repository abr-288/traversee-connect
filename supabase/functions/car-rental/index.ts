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

// Car images by category for realistic display
const carImages: Record<string, string[]> = {
  economy: [
    'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400',
    'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400',
  ],
  compact: [
    'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=400',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400',
  ],
  suv: [
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400',
    'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400',
  ],
  luxury: [
    'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=400',
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400',
    'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=400',
  ],
  default: [
    'https://images.unsplash.com/photo-1494905998402-395d579af36f?w=400',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400',
  ],
};

function getCarImage(category: string): string {
  const lowerCat = category.toLowerCase();
  let images = carImages.default;
  
  if (lowerCat.includes('économique') || lowerCat.includes('economy') || lowerCat.includes('mini')) {
    images = carImages.economy;
  } else if (lowerCat.includes('compact') || lowerCat.includes('berline') || lowerCat.includes('sedan')) {
    images = carImages.compact;
  } else if (lowerCat.includes('suv') || lowerCat.includes('4x4') || lowerCat.includes('crossover')) {
    images = carImages.suv;
  } else if (lowerCat.includes('luxe') || lowerCat.includes('luxury') || lowerCat.includes('premium')) {
    images = carImages.luxury;
  }
  
  return images[Math.floor(Math.random() * images.length)];
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
        console.log('Booking.com coordinates found');
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

    if (data.data?.vehicles && Array.isArray(data.data.vehicles)) {
      return data.data.vehicles.slice(0, 10).map((vehicle: any, index: number) => {
        const category = vehicle.category || vehicle.vehicle_info?.category || 'Standard';
        return {
          id: `booking-${vehicle.id || index}`,
          name: vehicle.name || vehicle.vehicle_info?.v_name || 'Véhicule',
          category,
          price: parseFloat(vehicle.price?.total_price || vehicle.pricing?.total || 50),
          currency: 'EUR',
          rating: vehicle.supplier_info?.rating || 4.5,
          reviews: vehicle.supplier_info?.reviews_count || 0,
          image: vehicle.image_url || vehicle.vehicle_info?.image || getCarImage(category),
          seats: vehicle.passengers || vehicle.vehicle_info?.passengers || 5,
          transmission: vehicle.transmission?.toLowerCase().includes('auto') ? 'Automatique' : 'Manuelle',
          fuel: vehicle.fuel_type || 'Essence',
          luggage: vehicle.bags_fit || vehicle.vehicle_info?.bags || 3,
          airConditioning: vehicle.has_ac !== false,
          provider: vehicle.supplier_name || 'Booking.com',
          source: 'booking',
        };
      });
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
    
    // First search for location
    const locationResponse = await fetch(
      `https://priceline-com-provider.p.rapidapi.com/v2/cars/autoComplete?string=${encodeURIComponent(pickupLocation)}`,
      {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'priceline-com-provider.p.rapidapi.com',
        },
      }
    );

    let locationId = '';
    if (locationResponse.ok) {
      const locData = await locationResponse.json();
      if (locData.results && locData.results[0]) {
        locationId = locData.results[0].id || locData.results[0].cityId || '';
      }
    }

    if (!locationId) {
      console.log('Priceline: No location found');
      return [];
    }

    const pricelineParams = new URLSearchParams({
      pickUpLocationId: locationId,
      dropOffLocationId: locationId,
      pickUpDate: pickupDate,
      dropOffDate: dropoffDate,
      pickUpTime: pickupTime,
      dropOffTime: dropoffTime,
    });

    const response = await fetch(
      `https://priceline-com-provider.p.rapidapi.com/v2/cars/resultsPage?${pricelineParams}`,
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

    if (data.cars && Array.isArray(data.cars)) {
      return data.cars.slice(0, 10).map((car: any, index: number) => {
        const category = car.category || car.class || 'Standard';
        return {
          id: `priceline-${index}`,
          name: car.name || car.vehicle_name || car.description || 'Véhicule',
          category,
          price: parseFloat(car.price || car.total_price || car.displayPrice || 45),
          currency: 'EUR',
          rating: car.rating || 4.3,
          reviews: car.reviews_count || 0,
          image: car.image || car.vehicleImage || getCarImage(category),
          seats: car.passengers || car.capacity || 5,
          transmission: car.transmission?.toLowerCase().includes('auto') ? 'Automatique' : 'Manuelle',
          fuel: car.fuel || car.fuelType || 'Essence',
          luggage: car.baggage || car.bags || 3,
          airConditioning: true,
          provider: car.provider || car.supplierName || 'Priceline',
          source: 'priceline',
        };
      });
    }

    return [];
  } catch (error) {
    console.error('Priceline Cars exception:', error);
    return [];
  }
}

// Search cars using Sky-Scanner API (via RapidAPI)
async function searchSkyscannerCars(
  pickupLocation: string,
  pickupDate: string,
  dropoffDate: string,
  pickupTime: string,
  dropoffTime: string,
  rapidApiKey: string
): Promise<CarResult[]> {
  try {
    console.log('Searching Skyscanner Car Rentals...');
    
    // Search for location entity
    const locationResponse = await fetch(
      `https://sky-scrapper.p.rapidapi.com/api/v1/cars/searchLocation?query=${encodeURIComponent(pickupLocation)}`,
      {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'sky-scrapper.p.rapidapi.com',
        },
      }
    );

    let entityId = '';
    if (locationResponse.ok) {
      const locData = await locationResponse.json();
      if (locData.data && locData.data[0]) {
        entityId = locData.data[0].entityId || locData.data[0].id || '';
      }
    }

    if (!entityId) {
      console.log('Skyscanner: No location entity found');
      return [];
    }

    const searchParams = new URLSearchParams({
      pickUpEntityId: entityId,
      dropOffEntityId: entityId,
      pickUpDate: pickupDate,
      dropOffDate: dropoffDate,
      pickUpTime: pickupTime,
      dropOffTime: dropoffTime,
      currency: 'EUR',
      market: 'FR',
      locale: 'fr-FR',
    });

    const response = await fetch(
      `https://sky-scrapper.p.rapidapi.com/api/v1/cars/searchCars?${searchParams}`,
      {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'sky-scrapper.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      console.error('Skyscanner Cars API error:', response.status);
      return [];
    }

    const data = await response.json();

    if (data.data?.cars && Array.isArray(data.data.cars)) {
      return data.data.cars.slice(0, 10).map((car: any, index: number) => {
        const category = car.category || car.carType || 'Standard';
        return {
          id: `skyscanner-${index}`,
          name: car.name || car.carName || car.model || 'Véhicule',
          category,
          price: parseFloat(car.price?.amount || car.totalPrice || 55),
          currency: 'EUR',
          rating: car.rating || 4.4,
          reviews: car.reviewsCount || 0,
          image: car.imageUrl || car.image || getCarImage(category),
          seats: car.seats || car.passengers || 5,
          transmission: car.transmission?.toLowerCase().includes('manual') ? 'Manuelle' : 'Automatique',
          fuel: car.fuelType || car.fuel || 'Essence',
          luggage: car.bags || car.luggage || 3,
          airConditioning: car.airConditioning !== false,
          provider: car.supplier || car.providerName || 'Skyscanner',
          source: 'skyscanner',
        };
      });
    }

    return [];
  } catch (error) {
    console.error('Skyscanner Cars exception:', error);
    return [];
  }
}

// Search cars using Hotels4/Hotels.com API (Expedia Group)
async function searchHotels4Cars(
  pickupLocation: string,
  pickupDate: string,
  dropoffDate: string,
  rapidApiKey: string
): Promise<CarResult[]> {
  try {
    console.log('Searching Hotels4/Expedia Car Rentals...');
    
    // Get location ID
    const locationResponse = await fetch(
      `https://hotels4.p.rapidapi.com/locations/v3/search?q=${encodeURIComponent(pickupLocation)}&locale=fr_FR`,
      {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'hotels4.p.rapidapi.com',
        },
      }
    );

    let geoId = '';
    if (locationResponse.ok) {
      const locData = await locationResponse.json();
      if (locData.sr && locData.sr[0]) {
        geoId = locData.sr[0].gapiId || locData.sr[0].regionId || '';
      }
    }

    if (!geoId) {
      console.log('Hotels4: No location found');
      return [];
    }

    // Note: Hotels4 primarily provides hotel data, car rental may not be available
    // This is a placeholder for potential future API expansion
    console.log('Hotels4: Car rental endpoint not available');
    return [];
  } catch (error) {
    console.error('Hotels4 Cars exception:', error);
    return [];
  }
}

// Search cars using RentalCars API
async function searchRentalCars(
  pickupLocation: string,
  pickupDate: string,
  dropoffDate: string,
  pickupTime: string,
  dropoffTime: string,
  rapidApiKey: string
): Promise<CarResult[]> {
  try {
    console.log('Searching RentalCars.com...');
    
    // Try alternative rental car API
    const response = await fetch(
      `https://car-api2.p.rapidapi.com/api/makes`,
      {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'car-api2.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      console.log('RentalCars API not available');
      return [];
    }

    // This API provides car makes/models, not rentals directly
    // Using as reference for car data enrichment
    return [];
  } catch (error) {
    console.error('RentalCars exception:', error);
    return [];
  }
}

// Enhanced mock data with diverse real car brands
function getMockCarRentals(pickupLocation: string): CarResult[] {
  const cars = [
    { name: 'Toyota Corolla 2024', category: 'Économique', price: 38, seats: 5, transmission: 'Automatique', fuel: 'Essence' },
    { name: 'Renault Clio V', category: 'Compacte', price: 33, seats: 5, transmission: 'Manuelle', fuel: 'Essence' },
    { name: 'Peugeot 308 GT', category: 'Berline', price: 53, seats: 5, transmission: 'Automatique', fuel: 'Diesel' },
    { name: 'Mercedes Classe E', category: 'Luxe', price: 95, seats: 5, transmission: 'Automatique', fuel: 'Diesel' },
    { name: 'Toyota Land Cruiser', category: 'SUV', price: 110, seats: 7, transmission: 'Automatique', fuel: 'Diesel' },
    { name: 'Volkswagen Polo', category: 'Économique', price: 30, seats: 5, transmission: 'Manuelle', fuel: 'Essence' },
    { name: 'BMW X5', category: 'SUV', price: 125, seats: 5, transmission: 'Automatique', fuel: 'Diesel' },
    { name: 'Audi A4', category: 'Berline', price: 75, seats: 5, transmission: 'Automatique', fuel: 'Essence' },
    { name: 'Nissan Qashqai', category: 'SUV', price: 65, seats: 5, transmission: 'Automatique', fuel: 'Essence' },
    { name: 'Hyundai Tucson', category: 'SUV', price: 58, seats: 5, transmission: 'Automatique', fuel: 'Essence' },
    { name: 'Ford Fiesta', category: 'Compacte', price: 28, seats: 5, transmission: 'Manuelle', fuel: 'Essence' },
    { name: 'Citroën C3', category: 'Économique', price: 32, seats: 5, transmission: 'Manuelle', fuel: 'Essence' },
  ];

  const providers = ['Europcar', 'Hertz', 'Avis', 'Sixt', 'Enterprise', 'Budget', 'National'];

  return cars.map((car, index) => ({
    id: `mock-${index}`,
    name: car.name,
    category: car.category,
    price: car.price,
    currency: 'EUR',
    rating: 4.5 - (index * 0.05),
    reviews: 150 - (index * 10),
    image: getCarImage(car.category),
    seats: car.seats,
    transmission: car.transmission,
    fuel: car.fuel,
    luggage: car.seats > 5 ? 5 : 3,
    airConditioning: true,
    provider: providers[index % providers.length],
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
    
    console.log('Searching car rentals:', { pickupLocation, pickupDate, dropoffDate });

    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    if (!rapidApiKey) {
      console.log('RapidAPI key not configured, returning mock data');
      return new Response(
        JSON.stringify({ success: true, data: getMockCarRentals(pickupLocation) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search all available car rental APIs in parallel
    const [bookingResults, pricelineResults, skyscannerResults] = await Promise.all([
      searchBookingCars(pickupLocation, pickupDate, dropoffDate, pickupTime, dropoffTime, rapidApiKey),
      searchPricelineCars(pickupLocation, pickupDate, dropoffDate, pickupTime, dropoffTime, rapidApiKey),
      searchSkyscannerCars(pickupLocation, pickupDate, dropoffDate, pickupTime, dropoffTime, rapidApiKey),
    ]);

    const allCars = [...bookingResults, ...pricelineResults, ...skyscannerResults];
    
    console.log(`Total cars found: ${allCars.length} (Booking: ${bookingResults.length}, Priceline: ${pricelineResults.length}, Skyscanner: ${skyscannerResults.length})`);

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