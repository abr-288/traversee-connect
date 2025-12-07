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
  // Additional fields for Trip.com/Kiwi style
  unlimitedMileage: boolean;
  freeCancellation: boolean;
  fuelPolicy: string;
  deposit: number | null;
  doors: number;
  engineSize: string;
  model: string;
  brand: string;
  year: number;
  pickupLocation: string;
  features: string[];
}

// Car images by category for realistic display
const carImages: Record<string, string[]> = {
  economy: [
    'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&h=400&fit=crop',
  ],
  compact: [
    'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&h=400&fit=crop',
  ],
  sedan: [
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&h=400&fit=crop',
  ],
  suv: [
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&h=400&fit=crop',
  ],
  luxury: [
    'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&h=400&fit=crop',
  ],
  minivan: [
    'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
  ],
  premium: [
    'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=400&fit=crop',
  ],
  default: [
    'https://images.unsplash.com/photo-1494905998402-395d579af36f?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&h=400&fit=crop',
  ],
};

function getCarImage(category: string): string {
  const lowerCat = category.toLowerCase();
  let images = carImages.default;
  
  if (lowerCat.includes('économique') || lowerCat.includes('economy') || lowerCat.includes('mini')) {
    images = carImages.economy;
  } else if (lowerCat.includes('compact') || lowerCat.includes('compacte')) {
    images = carImages.compact;
  } else if (lowerCat.includes('berline') || lowerCat.includes('sedan') || lowerCat.includes('standard')) {
    images = carImages.sedan;
  } else if (lowerCat.includes('suv') || lowerCat.includes('4x4') || lowerCat.includes('crossover')) {
    images = carImages.suv;
  } else if (lowerCat.includes('luxe') || lowerCat.includes('luxury') || lowerCat.includes('premium')) {
    images = carImages.luxury;
  } else if (lowerCat.includes('minivan') || lowerCat.includes('monospace') || lowerCat.includes('family')) {
    images = carImages.minivan;
  }
  
  return images[Math.floor(Math.random() * images.length)];
}

// Provider logos
const providerLogos: Record<string, string> = {
  'Europcar': 'https://logo.clearbit.com/europcar.com',
  'Hertz': 'https://logo.clearbit.com/hertz.com',
  'Avis': 'https://logo.clearbit.com/avis.com',
  'Sixt': 'https://logo.clearbit.com/sixt.com',
  'Enterprise': 'https://logo.clearbit.com/enterprise.com',
  'Budget': 'https://logo.clearbit.com/budget.com',
  'National': 'https://logo.clearbit.com/nationalcar.com',
  'Alamo': 'https://logo.clearbit.com/alamo.com',
  'Dollar': 'https://logo.clearbit.com/dollar.com',
  'Thrifty': 'https://logo.clearbit.com/thrifty.com',
};

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

    let coordinates = { lat: '0', lng: '0', name: pickupLocation };
    if (locationResponse.ok) {
      const locData = await locationResponse.json();
      if (locData.data && locData.data[0]) {
        coordinates.lat = locData.data[0].latitude || '0';
        coordinates.lng = locData.data[0].longitude || '0';
        coordinates.name = locData.data[0].name || pickupLocation;
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
      return data.data.vehicles.slice(0, 15).map((vehicle: any, index: number) => {
        const category = vehicle.category || vehicle.vehicle_info?.category || 'Standard';
        const brand = vehicle.vehicle_info?.v_make || vehicle.make || 'Unknown';
        const model = vehicle.vehicle_info?.v_name || vehicle.name || 'Véhicule';
        
        return {
          id: `booking-${vehicle.id || index}`,
          name: `${brand} ${model}`.trim(),
          brand,
          model,
          category,
          price: parseFloat(vehicle.price?.total_price || vehicle.pricing?.total || 50),
          currency: 'EUR',
          rating: vehicle.supplier_info?.rating || 4.5,
          reviews: vehicle.supplier_info?.reviews_count || Math.floor(Math.random() * 500) + 50,
          image: vehicle.image_url || vehicle.vehicle_info?.image || getCarImage(category),
          seats: vehicle.passengers || vehicle.vehicle_info?.passengers || 5,
          transmission: vehicle.transmission?.toLowerCase().includes('auto') ? 'Automatique' : 'Manuelle',
          fuel: vehicle.fuel_type || 'Essence',
          luggage: vehicle.bags_fit || vehicle.vehicle_info?.bags || 3,
          airConditioning: vehicle.has_ac !== false,
          provider: vehicle.supplier_name || 'Booking.com',
          source: 'booking',
          unlimitedMileage: vehicle.unlimited_mileage !== false,
          freeCancellation: vehicle.free_cancellation === true,
          fuelPolicy: vehicle.fuel_policy || 'full-to-full',
          deposit: vehicle.deposit_amount || null,
          doors: vehicle.doors || 4,
          engineSize: vehicle.engine_size || '1.4L',
          year: 2024 - Math.floor(Math.random() * 3),
          pickupLocation: coordinates.name,
          features: [
            vehicle.has_ac !== false ? 'Climatisation' : null,
            vehicle.unlimited_mileage !== false ? 'Kilométrage illimité' : null,
            'GPS disponible',
            'Assurance incluse',
          ].filter(Boolean) as string[],
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
    let locationName = pickupLocation;
    if (locationResponse.ok) {
      const locData = await locationResponse.json();
      if (locData.results && locData.results[0]) {
        locationId = locData.results[0].id || locData.results[0].cityId || '';
        locationName = locData.results[0].name || pickupLocation;
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
      return data.cars.slice(0, 15).map((car: any, index: number) => {
        const category = car.category || car.class || 'Standard';
        const nameParts = (car.name || car.vehicle_name || 'Véhicule').split(' ');
        const brand = nameParts[0] || 'Unknown';
        const model = nameParts.slice(1).join(' ') || car.description || 'Model';
        
        return {
          id: `priceline-${index}`,
          name: car.name || car.vehicle_name || car.description || 'Véhicule',
          brand,
          model,
          category,
          price: parseFloat(car.price || car.total_price || car.displayPrice || 45),
          currency: 'EUR',
          rating: car.rating || 4.3,
          reviews: car.reviews_count || Math.floor(Math.random() * 400) + 30,
          image: car.image || car.vehicleImage || getCarImage(category),
          seats: car.passengers || car.capacity || 5,
          transmission: car.transmission?.toLowerCase().includes('auto') ? 'Automatique' : 'Manuelle',
          fuel: car.fuel || car.fuelType || 'Essence',
          luggage: car.baggage || car.bags || 3,
          airConditioning: true,
          provider: car.provider || car.supplierName || 'Priceline',
          source: 'priceline',
          unlimitedMileage: car.unlimitedMileage !== false,
          freeCancellation: car.freeCancellation === true,
          fuelPolicy: car.fuelPolicy || 'full-to-full',
          deposit: car.deposit || null,
          doors: car.doors || 4,
          engineSize: car.engineSize || '1.6L',
          year: 2024 - Math.floor(Math.random() * 3),
          pickupLocation: locationName,
          features: [
            'Climatisation',
            car.unlimitedMileage !== false ? 'Kilométrage illimité' : null,
            'Assistance routière 24/7',
          ].filter(Boolean) as string[],
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
    let locationName = pickupLocation;
    if (locationResponse.ok) {
      const locData = await locationResponse.json();
      if (locData.data && locData.data[0]) {
        entityId = locData.data[0].entityId || locData.data[0].id || '';
        locationName = locData.data[0].name || pickupLocation;
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
      return data.data.cars.slice(0, 15).map((car: any, index: number) => {
        const category = car.category || car.carType || 'Standard';
        const nameParts = (car.name || car.carName || car.model || 'Véhicule').split(' ');
        const brand = nameParts[0] || 'Unknown';
        const model = nameParts.slice(1).join(' ') || 'Model';
        
        return {
          id: `skyscanner-${index}`,
          name: car.name || car.carName || car.model || 'Véhicule',
          brand,
          model,
          category,
          price: parseFloat(car.price?.amount || car.totalPrice || 55),
          currency: 'EUR',
          rating: car.rating || 4.4,
          reviews: car.reviewsCount || Math.floor(Math.random() * 350) + 40,
          image: car.imageUrl || car.image || getCarImage(category),
          seats: car.seats || car.passengers || 5,
          transmission: car.transmission?.toLowerCase().includes('manual') ? 'Manuelle' : 'Automatique',
          fuel: car.fuelType || car.fuel || 'Essence',
          luggage: car.bags || car.luggage || 3,
          airConditioning: car.airConditioning !== false,
          provider: car.supplier || car.providerName || 'Skyscanner',
          source: 'skyscanner',
          unlimitedMileage: car.unlimitedMileage !== false,
          freeCancellation: car.freeCancellation === true,
          fuelPolicy: car.fuelPolicy || 'full-to-full',
          deposit: car.deposit || null,
          doors: car.doors || 4,
          engineSize: car.engineSize || '1.8L',
          year: 2024 - Math.floor(Math.random() * 3),
          pickupLocation: locationName,
          features: [
            car.airConditioning !== false ? 'Climatisation' : null,
            car.unlimitedMileage !== false ? 'Kilométrage illimité' : null,
            'Protection vol',
          ].filter(Boolean) as string[],
        };
      });
    }

    return [];
  } catch (error) {
    console.error('Skyscanner Cars exception:', error);
    return [];
  }
}

// Search cars using Car Rental API (cars-rental.p.rapidapi.com)
async function searchCarsRentalAPI(
  pickupLocation: string,
  pickupDate: string,
  dropoffDate: string,
  pickupTime: string,
  dropoffTime: string,
  rapidApiKey: string
): Promise<CarResult[]> {
  try {
    console.log('Searching Cars Rental API...');
    
    const searchParams = new URLSearchParams({
      pickUpLocation: pickupLocation,
      dropOffLocation: pickupLocation,
      pickUpDate: pickupDate,
      dropOffDate: dropoffDate,
      pickUpTime: pickupTime,
      dropOffTime: dropoffTime,
      currency: 'EUR',
    });

    const response = await fetch(
      `https://cars-rental.p.rapidapi.com/api/cars/search?${searchParams}`,
      {
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'cars-rental.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      console.log('Cars Rental API not available:', response.status);
      return [];
    }

    const data = await response.json();

    if (data.cars && Array.isArray(data.cars)) {
      return data.cars.slice(0, 15).map((car: any, index: number) => {
        const category = car.category || 'Standard';
        return {
          id: `carsrental-${index}`,
          name: car.name || car.model || 'Véhicule',
          brand: car.brand || 'Unknown',
          model: car.model || 'Model',
          category,
          price: parseFloat(car.price || car.totalPrice || 50),
          currency: 'EUR',
          rating: car.rating || 4.3,
          reviews: car.reviews || Math.floor(Math.random() * 300) + 25,
          image: car.image || getCarImage(category),
          seats: car.seats || 5,
          transmission: car.transmission || 'Automatique',
          fuel: car.fuel || 'Essence',
          luggage: car.luggage || 3,
          airConditioning: true,
          provider: car.provider || 'Car Rental',
          source: 'carsrental',
          unlimitedMileage: car.unlimitedMileage !== false,
          freeCancellation: car.freeCancellation === true,
          fuelPolicy: car.fuelPolicy || 'full-to-full',
          deposit: car.deposit || null,
          doors: car.doors || 4,
          engineSize: car.engineSize || '1.5L',
          year: 2024 - Math.floor(Math.random() * 3),
          pickupLocation,
          features: ['Climatisation', 'Kilométrage illimité'],
        };
      });
    }

    return [];
  } catch (error) {
    console.error('Cars Rental API exception:', error);
    return [];
  }
}

// Enhanced mock data with comprehensive car details (Trip.com/Kiwi style)
function getMockCarRentals(pickupLocation: string): CarResult[] {
  const cars = [
    { brand: 'Toyota', model: 'Corolla 2024', category: 'Économique', price: 38, seats: 5, transmission: 'Automatique', fuel: 'Essence', doors: 4, luggage: 3, engine: '1.8L' },
    { brand: 'Renault', model: 'Clio V', category: 'Compacte', price: 33, seats: 5, transmission: 'Manuelle', fuel: 'Essence', doors: 5, luggage: 2, engine: '1.0L' },
    { brand: 'Peugeot', model: '308 GT', category: 'Berline', price: 53, seats: 5, transmission: 'Automatique', fuel: 'Diesel', doors: 5, luggage: 4, engine: '1.5L' },
    { brand: 'Mercedes-Benz', model: 'Classe E', category: 'Luxe', price: 95, seats: 5, transmission: 'Automatique', fuel: 'Diesel', doors: 4, luggage: 4, engine: '2.0L' },
    { brand: 'Toyota', model: 'Land Cruiser', category: 'SUV', price: 110, seats: 7, transmission: 'Automatique', fuel: 'Diesel', doors: 5, luggage: 5, engine: '2.8L' },
    { brand: 'Volkswagen', model: 'Polo', category: 'Économique', price: 30, seats: 5, transmission: 'Manuelle', fuel: 'Essence', doors: 5, luggage: 2, engine: '1.0L' },
    { brand: 'BMW', model: 'X5', category: 'SUV', price: 125, seats: 5, transmission: 'Automatique', fuel: 'Diesel', doors: 5, luggage: 5, engine: '3.0L' },
    { brand: 'Audi', model: 'A4 Avant', category: 'Berline', price: 75, seats: 5, transmission: 'Automatique', fuel: 'Essence', doors: 5, luggage: 4, engine: '2.0L' },
    { brand: 'Nissan', model: 'Qashqai', category: 'SUV', price: 65, seats: 5, transmission: 'Automatique', fuel: 'Essence', doors: 5, luggage: 4, engine: '1.3L' },
    { brand: 'Hyundai', model: 'Tucson Hybrid', category: 'SUV', price: 72, seats: 5, transmission: 'Automatique', fuel: 'Hybride', doors: 5, luggage: 4, engine: '1.6L' },
    { brand: 'Ford', model: 'Fiesta', category: 'Compacte', price: 28, seats: 5, transmission: 'Manuelle', fuel: 'Essence', doors: 5, luggage: 2, engine: '1.0L' },
    { brand: 'Citroën', model: 'C3 Aircross', category: 'Compacte', price: 42, seats: 5, transmission: 'Automatique', fuel: 'Essence', doors: 5, luggage: 3, engine: '1.2L' },
    { brand: 'Kia', model: 'Sportage', category: 'SUV', price: 68, seats: 5, transmission: 'Automatique', fuel: 'Essence', doors: 5, luggage: 4, engine: '1.6L' },
    { brand: 'Skoda', model: 'Octavia', category: 'Berline', price: 48, seats: 5, transmission: 'Automatique', fuel: 'Diesel', doors: 5, luggage: 4, engine: '2.0L' },
    { brand: 'Fiat', model: '500', category: 'Mini', price: 25, seats: 4, transmission: 'Manuelle', fuel: 'Essence', doors: 3, luggage: 1, engine: '1.0L' },
    { brand: 'Seat', model: 'Leon', category: 'Compacte', price: 40, seats: 5, transmission: 'Manuelle', fuel: 'Essence', doors: 5, luggage: 3, engine: '1.5L' },
    { brand: 'Dacia', model: 'Duster', category: 'SUV', price: 45, seats: 5, transmission: 'Manuelle', fuel: 'Diesel', doors: 5, luggage: 4, engine: '1.5L' },
    { brand: 'Volvo', model: 'XC60', category: 'SUV', price: 105, seats: 5, transmission: 'Automatique', fuel: 'Hybride', doors: 5, luggage: 5, engine: '2.0L' },
    { brand: 'Opel', model: 'Corsa-e', category: 'Économique', price: 45, seats: 5, transmission: 'Automatique', fuel: 'Électrique', doors: 5, luggage: 2, engine: 'EV' },
    { brand: 'Tesla', model: 'Model 3', category: 'Luxe', price: 85, seats: 5, transmission: 'Automatique', fuel: 'Électrique', doors: 4, luggage: 3, engine: 'EV' },
  ];

  const providers = ['Europcar', 'Hertz', 'Avis', 'Sixt', 'Enterprise', 'Budget', 'National', 'Alamo', 'Dollar', 'Thrifty'];
  const fuelPolicies = ['full-to-full', 'same-to-same', 'full-to-empty'];

  return cars.map((car, index) => ({
    id: `car-${index + 1}`,
    name: `${car.brand} ${car.model}`,
    brand: car.brand,
    model: car.model,
    category: car.category,
    price: car.price,
    currency: 'EUR',
    rating: parseFloat((4.2 + Math.random() * 0.7).toFixed(1)),
    reviews: Math.floor(Math.random() * 800) + 50,
    image: getCarImage(car.category),
    seats: car.seats,
    transmission: car.transmission,
    fuel: car.fuel,
    luggage: car.luggage,
    airConditioning: true,
    provider: providers[index % providers.length],
    source: 'breserve',
    unlimitedMileage: Math.random() > 0.3,
    freeCancellation: Math.random() > 0.4,
    fuelPolicy: fuelPolicies[Math.floor(Math.random() * fuelPolicies.length)],
    deposit: Math.random() > 0.5 ? Math.floor(Math.random() * 500) + 200 : null,
    doors: car.doors,
    engineSize: car.engine,
    year: 2024 - Math.floor(Math.random() * 2),
    pickupLocation,
    features: [
      'Climatisation',
      Math.random() > 0.3 ? 'Kilométrage illimité' : 'Kilométrage limité (500 km/jour)',
      Math.random() > 0.5 ? 'GPS inclus' : 'GPS en option',
      'Assurance collision (CDW)',
      Math.random() > 0.4 ? 'Protection vol (TP)' : null,
      Math.random() > 0.6 ? 'Siège enfant disponible' : null,
      'Assistance routière 24/7',
    ].filter(Boolean) as string[],
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
        JSON.stringify({ success: true, data: getMockCarRentals(pickupLocation), source: 'mock' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search all available car rental APIs in parallel
    const [bookingResults, pricelineResults, skyscannerResults, carsRentalResults] = await Promise.all([
      searchBookingCars(pickupLocation, pickupDate, dropoffDate, pickupTime, dropoffTime, rapidApiKey),
      searchPricelineCars(pickupLocation, pickupDate, dropoffDate, pickupTime, dropoffTime, rapidApiKey),
      searchSkyscannerCars(pickupLocation, pickupDate, dropoffDate, pickupTime, dropoffTime, rapidApiKey),
      searchCarsRentalAPI(pickupLocation, pickupDate, dropoffDate, pickupTime, dropoffTime, rapidApiKey),
    ]);

    const allCars = [...bookingResults, ...pricelineResults, ...skyscannerResults, ...carsRentalResults];
    
    console.log(`Total cars found: ${allCars.length} (Booking: ${bookingResults.length}, Priceline: ${pricelineResults.length}, Skyscanner: ${skyscannerResults.length}, CarsRental: ${carsRentalResults.length})`);

    // If no API results, return mock data
    if (allCars.length === 0) {
      console.log('No car rental results from APIs, returning mock data');
      return new Response(
        JSON.stringify({ success: true, data: getMockCarRentals(pickupLocation), source: 'mock' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sort by price
    allCars.sort((a, b) => a.price - b.price);

    return new Response(
      JSON.stringify({ success: true, data: allCars, source: 'api' }),
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
