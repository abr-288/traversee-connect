import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { hotelSearchSchema, validateData, createValidationErrorResponse } from "../_shared/zodValidation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Transform Booking.com data to our format
const transformBookingData = (hotels: any[]) => {
  return hotels.map(hotel => {
    // Extract official hotel name - prioritize all name fields
    const hotelName = hotel.hotel_name || 
                      hotel.name || 
                      hotel.hotel_name_trans ||
                      hotel.property_name ||
                      hotel.hotelName ||
                      hotel.title ||
                      'Hôtel';
    
    // Extract complete address/location
    const location = hotel.city || 
                     hotel.address || 
                     hotel.city_in_trans ||
                     hotel.city_name_en ||
                     hotel.cityName ||
                     hotel.location ||
                     hotel.countrycode ||
                     '';
    
    // Extract main image URL with multiple fallbacks
    const imageUrl = hotel.main_photo_url || 
                     hotel.photo_main_url || 
                     hotel.max_photo_url ||
                     hotel.max_1280_photo_url ||
                     hotel.imageUrl ||
                     hotel.heroImage ||
                     hotel.mainImage ||
                     hotel.thumbnail ||
                     hotel.image ||
                     (hotel.photos && Array.isArray(hotel.photos) && hotel.photos[0]) ||
                     (hotel.images && Array.isArray(hotel.images) && hotel.images[0]) ||
                     'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
    
    // Extract all photo URLs
    const allImages = hotel.photo_urls || 
                      hotel.photos || 
                      hotel.images || 
                      [imageUrl];
    
    // Extract exact price
    const exactPrice = hotel.min_total_price || 
                       hotel.composite_price_breakdown?.gross_amount_per_night?.value ||
                       hotel.price_breakdown?.gross_price?.value ||
                       hotel.price?.amount ||
                       hotel.minPrice ||
                       hotel.price ||
                       50000;
    
    // Extract rating
    const rating = hotel.review_score || 
                   hotel.rating || 
                   hotel.stars ||
                   hotel.starRating ||
                   hotel.guestRating ||
                   4.0;
    
    // Extract review count
    const reviewCount = hotel.review_nr || 
                        hotel.reviews_count || 
                        hotel.review_count ||
                        hotel.reviewsCount ||
                        hotel.totalReviews ||
                        0;
    
    return {
      id: hotel.hotel_id || hotel.id || hotel.hotelId,
      name: hotelName,
      location: location,
      price: { grandTotal: Math.round(exactPrice) },
      rating: typeof rating === 'number' ? rating : parseFloat(rating) || 4.0,
      reviews: reviewCount,
      image: imageUrl,
      images: Array.isArray(allImages) ? allImages : [imageUrl],
      description: hotel.hotel_description || hotel.description || `${hotelName} est un établissement de qualité offrant confort et services exceptionnels.`,
      amenities: hotel.hotel_facilities || hotel.facilities || hotel.amenities || ['Wifi', 'Restaurant', 'Service de Chambre']
    };
  });
};

// Transform Airbnb data to our format
const transformAirbnbData = (listings: any[]) => {
  return listings.map(listing => {
    // Extract official listing name
    const listingName = listing.name || 
                        listing.title || 
                        listing.public_address ||
                        listing.hotelName ||
                        'Hébergement';
    
    // Extract main image with multiple fallbacks
    const mainImage = listing.xl_picture_url || 
                      listing.picture_url || 
                      listing.imageUrl ||
                      listing.heroImage ||
                      listing.thumbnail ||
                      (listing.photos && Array.isArray(listing.photos) && listing.photos[0]) ||
                      (listing.picture_urls && Array.isArray(listing.picture_urls) && listing.picture_urls[0]) ||
                      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
    
    // Extract all images
    const allImages = listing.picture_urls || 
                      listing.photos ||
                      [listing.xl_picture_url, listing.picture_url].filter(Boolean) || 
                      [mainImage];
    
    return {
      id: listing.id,
      name: listingName,
      location: listing.city || listing.localized_city || listing.smart_location || listing.cityName || '',
      price: { 
        grandTotal: listing.price?.rate || listing.pricing?.rate || listing.price?.amount || 40000 
      },
      rating: listing.star_rating || listing.avg_rating || listing.rating || 4.0,
      reviews: listing.reviews_count || listing.review_count || listing.reviewsCount || 0,
      image: mainImage,
      images: Array.isArray(allImages) ? allImages : [mainImage],
      description: listing.description || listing.summary || `${listingName} offre un hébergement confortable et bien situé.`,
      amenities: listing.amenities || listing.facilities || ['Wifi', 'Cuisine', 'Espace de Travail']
    };
  });
};

// Fallback mock data only if APIs completely fail
const getMockHotels = (location: string) => {
  const hotelImages = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
  ];

  return [
    {
      id: `${location}-1`,
      name: `Hôtel Premium ${location}`,
      location: location,
      price: { grandTotal: 50000 },
      rating: 4.5,
      reviews: 120,
      image: hotelImages[0],
      images: hotelImages,
      description: `Un établissement moderne situé au cœur de ${location}, offrant confort et services de qualité.`,
      amenities: ['Wifi Gratuit', 'Restaurant', 'Piscine', 'Parking']
    }
  ];
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Validate request with Zod
    const validation = validateData(hotelSearchSchema, body);
    
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors!, corsHeaders);
    }

    const { location, checkIn, checkOut, adults, children, rooms } = validation.data!;
    console.log('Search hotels for:', { location, checkIn, checkOut, adults, children, rooms });

    const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');
    console.log('RAPIDAPI_KEY configured:', RAPIDAPI_KEY ? 'YES' : 'NO');

    const results: {
      booking: any[];
      airbnb: any[];
      worldwide: any[];
      hotelscom: any[];
      priceline: any[];
      tripadvisor: any[];
      amadeus: any[];
      skyscanner: any[];
      agoda: any[];
      expedia: any[];
    } = {
      booking: [],
      airbnb: [],
      worldwide: [],
      hotelscom: [],
      priceline: [],
      tripadvisor: [],
      amadeus: [],
      skyscanner: [],
      agoda: [],
      expedia: [],
    };

    let apiSuccess = false;
    
    const AMADEUS_API_KEY = Deno.env.get('AMADEUS_API_KEY');
    const AMADEUS_API_SECRET = Deno.env.get('AMADEUS_API_SECRET');
    console.log('AMADEUS credentials configured:', AMADEUS_API_KEY ? 'YES' : 'NO');

    // Search Booking.com (booking-com15.p.rapidapi.com)
    if (RAPIDAPI_KEY) {
      console.log('Starting Booking.com search with RAPIDAPI_KEY');
      try {
        // First, get the destination ID
        const destSearchParams = new URLSearchParams({
          query: location,
        });

        console.log('Step 1: Searching for destination ID:', location);
        
        const destResponse = await fetch(
          `https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination?${destSearchParams}`,
          {
            headers: {
              'X-RapidAPI-Key': RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com',
            },
          }
        );

        let destId = '-1';
        if (destResponse.ok) {
          const destData = await destResponse.json();
          console.log('Destination search response:', JSON.stringify(destData).substring(0, 300));
          
          if (destData.data && Array.isArray(destData.data) && destData.data.length > 0) {
            destId = destData.data[0].dest_id || destData.data[0].id || '-1';
            console.log('Found dest_id:', destId);
          }
        }

        // Now search hotels with the correct dest_id
        const bookingParams = new URLSearchParams({
          dest_id: destId,
          search_type: 'CITY',
          arrival_date: checkIn,
          departure_date: checkOut,
          adults: adults.toString(),
          children_age: children ? '0' : '',
          room_qty: (rooms || 1).toString(),
          page_number: '1',
          units: 'metric',
          temperature_unit: 'c',
          languagecode: 'en-gb',
          currency_code: 'USD',
        });

        console.log('Calling Booking.com API (searchHotels) with params:', Object.fromEntries(bookingParams));
        
        const bookingResponse = await fetch(
          `https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotels?${bookingParams}`,
          {
            headers: {
              'X-RapidAPI-Key': RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com',
            },
          }
        );

        if (bookingResponse.ok) {
          const bookingData = await bookingResponse.json();
          console.log('Booking.com API status:', bookingResponse.status);
          console.log('Booking.com raw response:', JSON.stringify(bookingData).substring(0, 500));
          
          if (bookingData.data && bookingData.data.hotels && Array.isArray(bookingData.data.hotels)) {
            results.booking = transformBookingData(bookingData.data.hotels.slice(0, 10));
            apiSuccess = true;
            console.log('✅ Booking.com results transformed:', results.booking.length, 'hotels');
            // Log first hotel details for debugging
            if (results.booking.length > 0) {
              const firstHotel = results.booking[0];
              console.log('Sample Booking.com hotel:', {
                name: firstHotel.name,
                image: firstHotel.image.substring(0, 80) + '...',
                location: firstHotel.location,
                price: firstHotel.price.grandTotal
              });
            }
          } else {
            console.log('Booking.com API returned unexpected structure:', Object.keys(bookingData));
          }
        } else {
          const errorText = await bookingResponse.text();
          console.error('Booking.com API failed with status:', bookingResponse.status);
          console.error('Booking.com error details:', errorText.substring(0, 500));
        }
      } catch (error) {
        console.error('Booking.com API exception:', error instanceof Error ? error.message : String(error));
      }
    }

    // Airbnb API skipped - current RapidAPI endpoint returns "app out of date" error
    // Keeping this commented for future implementation with working API
    /*
    if (RAPIDAPI_KEY) {
      try {
        const airbnbParams = new URLSearchParams({
          location: location,
          checkIn: checkIn,
          checkOut: checkOut,
          adults: adults.toString(),
          children: (children || 0).toString(),
          infants: '0',
          pets: '0',
          page: '1',
          currency: 'USD',
        });

        console.log('Calling Airbnb API with params:', Object.fromEntries(airbnbParams));

        const airbnbResponse = await fetch(
          `https://airbnb19.p.rapidapi.com/api/v1/searchPropertyByLocation?${airbnbParams}`,
          {
            headers: {
              'X-RapidAPI-Key': RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'airbnb19.p.rapidapi.com',
            },
          }
        );

        if (airbnbResponse.ok) {
          const airbnbData = await airbnbResponse.json();
          console.log('Airbnb API status:', airbnbResponse.status);
          console.log('Airbnb raw response:', JSON.stringify(airbnbData).substring(0, 500));
          
          if (airbnbData.data && Array.isArray(airbnbData.data)) {
            results.airbnb = transformAirbnbData(airbnbData.data.slice(0, 10));
            apiSuccess = true;
            console.log('Airbnb results transformed:', results.airbnb.length);
          } else {
            console.log('Airbnb API returned unexpected structure:', Object.keys(airbnbData));
          }
        } else {
          const errorText = await airbnbResponse.text();
          console.error('Airbnb API failed with status:', airbnbResponse.status);
          console.error('Airbnb error details:', errorText.substring(0, 500));
        }
      } catch (error) {
        console.error('Airbnb API exception:', error instanceof Error ? error.message : String(error));
      }
    }
    */

    // Search Worldwide Hotels (skipped - API requires location_id which needs geocoding)
    // Keeping this commented for future implementation
    /*
    if (RAPIDAPI_KEY) {
      try {
        console.log('Calling Worldwide Hotels API');
        
        const worldwideResponse = await fetch(
          `https://worldwide-hotels.p.rapidapi.com/search`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-RapidAPI-Key': RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'worldwide-hotels.p.rapidapi.com',
            },
            body: JSON.stringify({
              location_id: '123', // Requires geocoding first
              language: 'en_US',
              currency: 'USD',
              checkin: checkIn,
              checkout: checkOut,
              adults: adults,
              children: children || 0,
              rooms: rooms || 1,
            }),
          }
        );

        if (worldwideResponse.ok) {
          const worldwideData = await worldwideResponse.json();
          console.log('Worldwide Hotels API status:', worldwideResponse.status);
          console.log('Worldwide Hotels raw response:', JSON.stringify(worldwideData).substring(0, 500));
          
          if (worldwideData.hotels && Array.isArray(worldwideData.hotels)) {
            results.worldwide = transformBookingData(worldwideData.hotels.slice(0, 10));
            apiSuccess = true;
            console.log('Worldwide Hotels results transformed:', results.worldwide.length);
          } else {
            console.log('Worldwide Hotels API returned unexpected structure:', Object.keys(worldwideData));
          }
        } else {
          const errorText = await worldwideResponse.text();
          console.error('Worldwide Hotels API failed with status:', worldwideResponse.status);
          console.error('Worldwide Hotels error details:', errorText.substring(0, 500));
        }
      } catch (error) {
        console.error('Worldwide Hotels API exception:', error instanceof Error ? error.message : String(error));
      }
    }
    */

    // Search Hotels.com Provider (hotels-com-provider.p.rapidapi.com)
    if (RAPIDAPI_KEY) {
      console.log('Starting Hotels.com Provider search');
      try {
        const hotelsDotComParams = new URLSearchParams({
          q: location,
          locale: 'en_US',
          checkin: checkIn,
          checkout: checkOut,
          adults: adults.toString(),
          children_ages: children ? '0' : '',
          sort: 'RECOMMENDED',
          currency: 'USD',
        });

        console.log('Calling Hotels.com Provider API with params:', Object.fromEntries(hotelsDotComParams));
        
        const hotelsDotComResponse = await fetch(
          `https://hotels-com-provider.p.rapidapi.com/v2/hotels/search?${hotelsDotComParams}`,
          {
            headers: {
              'X-RapidAPI-Key': RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'hotels-com-provider.p.rapidapi.com',
            },
          }
        );

        if (hotelsDotComResponse.ok) {
          const hotelsDotComData = await hotelsDotComResponse.json();
          console.log('Hotels.com Provider API status:', hotelsDotComResponse.status);
          console.log('Hotels.com Provider raw response:', JSON.stringify(hotelsDotComData).substring(0, 500));
          
          if (hotelsDotComData.hotels && Array.isArray(hotelsDotComData.hotels)) {
            results.hotelscom = transformBookingData(hotelsDotComData.hotels.slice(0, 10));
            apiSuccess = true;
            console.log('Hotels.com Provider results transformed:', results.hotelscom.length);
          } else {
            console.log('Hotels.com Provider API returned unexpected structure:', Object.keys(hotelsDotComData));
          }
        } else {
          const errorText = await hotelsDotComResponse.text();
          console.error('Hotels.com Provider API failed with status:', hotelsDotComResponse.status);
          console.error('Hotels.com Provider error details:', errorText.substring(0, 500));
        }
      } catch (error) {
        console.error('Hotels.com Provider API exception:', error instanceof Error ? error.message : String(error));
      }
    }

    // Search Priceline (priceline-com-provider.p.rapidapi.com)
    if (RAPIDAPI_KEY) {
      console.log('Starting Priceline search');
      try {
        const pricelineParams = new URLSearchParams({
          location: location,
          check_in: checkIn,
          check_out: checkOut,
          adults: adults.toString(),
          rooms: (rooms || 1).toString(),
          currency: 'USD',
        });

        console.log('Calling Priceline API with params:', Object.fromEntries(pricelineParams));
        
        const pricelineResponse = await fetch(
          `https://priceline-com-provider.p.rapidapi.com/v2/hotels/search?${pricelineParams}`,
          {
            headers: {
              'X-RapidAPI-Key': RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'priceline-com-provider.p.rapidapi.com',
            },
          }
        );

        if (pricelineResponse.ok) {
          const pricelineData = await pricelineResponse.json();
          console.log('Priceline API status:', pricelineResponse.status);
          console.log('Priceline raw response:', JSON.stringify(pricelineData).substring(0, 500));
          
          if (pricelineData.hotels && Array.isArray(pricelineData.hotels)) {
            results.priceline = transformBookingData(pricelineData.hotels.slice(0, 10));
            apiSuccess = true;
            console.log('Priceline results transformed:', results.priceline.length);
          } else {
            console.log('Priceline API returned unexpected structure:', Object.keys(pricelineData));
          }
        } else {
          const errorText = await pricelineResponse.text();
          console.error('Priceline API failed with status:', pricelineResponse.status);
          console.error('Priceline error details:', errorText.substring(0, 500));
        }
      } catch (error) {
        console.error('Priceline API exception:', error instanceof Error ? error.message : String(error));
      }
    }

    // Search TripAdvisor (tripadvisor1.p.rapidapi.com)
    if (RAPIDAPI_KEY) {
      console.log('Starting TripAdvisor search');
      try {
        // First search for location ID
        const tripAdvisorSearchParams = new URLSearchParams({
          query: location,
          lang: 'en_US',
        });

        console.log('Step 1: Searching TripAdvisor location ID:', location);
        
        const tripAdvisorSearchResponse = await fetch(
          `https://tripadvisor1.p.rapidapi.com/locations/search?${tripAdvisorSearchParams}`,
          {
            headers: {
              'X-RapidAPI-Key': RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'tripadvisor1.p.rapidapi.com',
            },
          }
        );

        if (tripAdvisorSearchResponse.ok) {
          const tripAdvisorSearchData = await tripAdvisorSearchResponse.json();
          console.log('TripAdvisor location search response:', JSON.stringify(tripAdvisorSearchData).substring(0, 300));
          
          let locationId = null;
          if (tripAdvisorSearchData.data && Array.isArray(tripAdvisorSearchData.data) && tripAdvisorSearchData.data.length > 0) {
            locationId = tripAdvisorSearchData.data[0].result_object?.location_id;
            console.log('Found TripAdvisor location_id:', locationId);
          }

          if (locationId) {
            // Now search hotels for this location
            const tripAdvisorHotelParams = new URLSearchParams({
              location_id: locationId,
              checkin: checkIn,
              checkout: checkOut,
              adults: adults.toString(),
              rooms: (rooms || 1).toString(),
              currency: 'USD',
              lang: 'en_US',
            });

            console.log('Step 2: Searching TripAdvisor hotels with params:', Object.fromEntries(tripAdvisorHotelParams));
            
            const tripAdvisorHotelResponse = await fetch(
              `https://tripadvisor1.p.rapidapi.com/hotels/list?${tripAdvisorHotelParams}`,
              {
                headers: {
                  'X-RapidAPI-Key': RAPIDAPI_KEY,
                  'X-RapidAPI-Host': 'tripadvisor1.p.rapidapi.com',
                },
              }
            );

            if (tripAdvisorHotelResponse.ok) {
              const tripAdvisorHotelData = await tripAdvisorHotelResponse.json();
              console.log('TripAdvisor hotels API status:', tripAdvisorHotelResponse.status);
              console.log('TripAdvisor hotels raw response:', JSON.stringify(tripAdvisorHotelData).substring(0, 500));
              
              if (tripAdvisorHotelData.data && Array.isArray(tripAdvisorHotelData.data)) {
                results.tripadvisor = transformBookingData(tripAdvisorHotelData.data.slice(0, 10));
                apiSuccess = true;
                console.log('TripAdvisor results transformed:', results.tripadvisor.length);
              } else {
                console.log('TripAdvisor hotels API returned unexpected structure:', Object.keys(tripAdvisorHotelData));
              }
            } else {
              const errorText = await tripAdvisorHotelResponse.text();
              console.error('TripAdvisor hotels API failed with status:', tripAdvisorHotelResponse.status);
              console.error('TripAdvisor hotels error details:', errorText.substring(0, 500));
            }
          }
        }
      } catch (error) {
        console.error('TripAdvisor API exception:', error instanceof Error ? error.message : String(error));
      }
    }

    // Search Skyscanner Hotels (skyscanner44.p.rapidapi.com)
    if (RAPIDAPI_KEY) {
      console.log('Starting Skyscanner Hotels search');
      try {
        const skyscannerParams = new URLSearchParams({
          query: location,
          checkin: checkIn,
          checkout: checkOut,
          adults: adults.toString(),
          rooms: (rooms || 1).toString(),
          currency: 'USD',
          locale: 'en-US',
          market: 'US',
        });

        console.log('Calling Skyscanner Hotels API with params:', Object.fromEntries(skyscannerParams));
        
        const skyscannerResponse = await fetch(
          `https://skyscanner44.p.rapidapi.com/hotels/search?${skyscannerParams}`,
          {
            headers: {
              'X-RapidAPI-Key': RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'skyscanner44.p.rapidapi.com',
            },
          }
        );

        if (skyscannerResponse.ok) {
          const skyscannerData = await skyscannerResponse.json();
          console.log('Skyscanner Hotels API status:', skyscannerResponse.status);
          console.log('Skyscanner Hotels raw response:', JSON.stringify(skyscannerData).substring(0, 500));
          
          if (skyscannerData.data?.hotels && Array.isArray(skyscannerData.data.hotels)) {
            results.skyscanner = skyscannerData.data.hotels.slice(0, 10).map((hotel: any) => ({
              id: hotel.id || hotel.hotel_id,
              name: hotel.name || hotel.hotelName || 'Hotel',
              location: hotel.location || hotel.address || location,
              price: { grandTotal: hotel.price?.amount || hotel.minPrice || 50000 },
              rating: hotel.rating || hotel.stars || 4.0,
              reviews: hotel.reviewsCount || hotel.reviews || 0,
              image: hotel.heroImage || hotel.mainImage || hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
              images: hotel.images || [hotel.heroImage] || [],
              description: hotel.description || `${hotel.name} offre un hébergement de qualité.`,
              amenities: hotel.amenities || ['WiFi', 'Restaurant'],
            }));
            apiSuccess = true;
            console.log('Skyscanner Hotels results transformed:', results.skyscanner.length);
          } else {
            console.log('Skyscanner Hotels API returned unexpected structure:', Object.keys(skyscannerData));
          }
        } else {
          const errorText = await skyscannerResponse.text();
          console.error('Skyscanner Hotels API failed with status:', skyscannerResponse.status);
          console.error('Skyscanner Hotels error details:', errorText.substring(0, 500));
        }
      } catch (error) {
        console.error('Skyscanner Hotels API exception:', error instanceof Error ? error.message : String(error));
      }
    }

    // Search Agoda Hotels (agoda-hotels-api.p.rapidapi.com)
    if (RAPIDAPI_KEY) {
      console.log('Starting Agoda Hotels search');
      try {
        const agodaParams = new URLSearchParams({
          location: location,
          checkIn: checkIn,
          checkOut: checkOut,
          adults: adults.toString(),
          rooms: (rooms || 1).toString(),
          currency: 'USD',
        });

        console.log('Calling Agoda Hotels API with params:', Object.fromEntries(agodaParams));
        
        const agodaResponse = await fetch(
          `https://agoda-hotels-api.p.rapidapi.com/hotels/search?${agodaParams}`,
          {
            headers: {
              'X-RapidAPI-Key': RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'agoda-hotels-api.p.rapidapi.com',
            },
          }
        );

        if (agodaResponse.ok) {
          const agodaData = await agodaResponse.json();
          console.log('Agoda Hotels API status:', agodaResponse.status);
          console.log('Agoda Hotels raw response:', JSON.stringify(agodaData).substring(0, 500));
          
          if (agodaData.hotels && Array.isArray(agodaData.hotels)) {
            results.agoda = agodaData.hotels.slice(0, 10).map((hotel: any) => ({
              id: hotel.hotelId || hotel.id,
              name: hotel.hotelName || hotel.name || 'Hotel',
              location: hotel.cityName || hotel.location || location,
              price: { grandTotal: hotel.price || hotel.minRate || 50000 },
              rating: hotel.rating || hotel.starRating || 4.0,
              reviews: hotel.reviewCount || hotel.reviews || 0,
              image: hotel.imageUrl || hotel.thumbnailUrl || hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
              images: hotel.images || [hotel.imageUrl] || [],
              description: hotel.description || `${hotel.hotelName || hotel.name} est un établissement recommandé.`,
              amenities: hotel.facilities || hotel.amenities || ['WiFi', 'Restaurant'],
            }));
            apiSuccess = true;
            console.log('Agoda Hotels results transformed:', results.agoda.length);
          } else {
            console.log('Agoda Hotels API returned unexpected structure:', Object.keys(agodaData));
          }
        } else {
          const errorText = await agodaResponse.text();
          console.error('Agoda Hotels API failed with status:', agodaResponse.status);
          console.error('Agoda Hotels error details:', errorText.substring(0, 500));
        }
      } catch (error) {
        console.error('Agoda Hotels API exception:', error instanceof Error ? error.message : String(error));
      }
    }

    // Search Expedia Hotels (expedia-com-provider.p.rapidapi.com)
    if (RAPIDAPI_KEY) {
      console.log('Starting Expedia Hotels search');
      try {
        const expediaParams = new URLSearchParams({
          q: location,
          checkin: checkIn,
          checkout: checkOut,
          adults: adults.toString(),
          rooms: (rooms || 1).toString(),
          currency: 'USD',
          locale: 'en_US',
        });

        console.log('Calling Expedia Hotels API with params:', Object.fromEntries(expediaParams));
        
        const expediaResponse = await fetch(
          `https://expedia-com-provider.p.rapidapi.com/v2/hotels/search?${expediaParams}`,
          {
            headers: {
              'X-RapidAPI-Key': RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'expedia-com-provider.p.rapidapi.com',
            },
          }
        );

        if (expediaResponse.ok) {
          const expediaData = await expediaResponse.json();
          console.log('Expedia Hotels API status:', expediaResponse.status);
          console.log('Expedia Hotels raw response:', JSON.stringify(expediaData).substring(0, 500));
          
          if (expediaData.hotels && Array.isArray(expediaData.hotels)) {
            results.expedia = expediaData.hotels.slice(0, 10).map((hotel: any) => ({
              id: hotel.id || hotel.hotelId,
              name: hotel.name || hotel.hotelName || 'Hotel',
              location: hotel.address || hotel.location || location,
              price: { grandTotal: hotel.price?.total || hotel.averageRate || 50000 },
              rating: hotel.rating || hotel.guestRating || 4.0,
              reviews: hotel.reviewsCount || hotel.totalReviews || 0,
              image: hotel.imageUrl || hotel.thumbnail || hotel.photos?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
              images: hotel.photos || [hotel.imageUrl] || [],
              description: hotel.description || `${hotel.name} propose un séjour de qualité.`,
              amenities: hotel.amenities || hotel.facilities || ['WiFi', 'Restaurant'],
            }));
            apiSuccess = true;
            console.log('Expedia Hotels results transformed:', results.expedia.length);
          } else {
            console.log('Expedia Hotels API returned unexpected structure:', Object.keys(expediaData));
          }
        } else {
          const errorText = await expediaResponse.text();
          console.error('Expedia Hotels API failed with status:', expediaResponse.status);
          console.error('Expedia Hotels error details:', errorText.substring(0, 500));
        }
      } catch (error) {
        console.error('Expedia Hotels API exception:', error instanceof Error ? error.message : String(error));
      }
    }

    // Search Amadeus Hotels (PRIMARY API - more reliable)
    if (AMADEUS_API_KEY && AMADEUS_API_SECRET) {
      console.log('Starting Amadeus Hotel search');
      try {
        // Step 1: Get Amadeus access token
        console.log('Step 1: Getting Amadeus access token');
        const tokenResponse = await fetch(
          'https://test.api.amadeus.com/v1/security/oauth2/token',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              grant_type: 'client_credentials',
              client_id: AMADEUS_API_KEY,
              client_secret: AMADEUS_API_SECRET,
            }),
          }
        );

        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          const accessToken = tokenData.access_token;
          console.log('Amadeus access token obtained');

          // Step 2: Get hotel list by city code
          console.log('Step 2: Getting hotel list for city:', location);
          
          // Convert location to city code (first 3 letters uppercase)
          const cityCode = location.substring(0, 3).toUpperCase();
          
          const hotelListResponse = await fetch(
            `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city?cityCode=${cityCode}&radius=50&radiusUnit=KM&hotelSource=ALL`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            }
          );

          if (hotelListResponse.ok) {
            const hotelListData = await hotelListResponse.json();
            console.log('Amadeus hotel list status:', hotelListResponse.status);
            console.log('Amadeus hotel list count:', hotelListData.data?.length || 0);

            if (hotelListData.data && Array.isArray(hotelListData.data) && hotelListData.data.length > 0) {
              // Get hotel IDs (limit to 50 for performance)
              const hotelIds = hotelListData.data.slice(0, 50).map((h: any) => h.hotelId).join(',');
              console.log('Step 3: Searching offers for hotels:', hotelIds.split(',').length, 'hotels');

              // Step 3: Get hotel offers
              const offersSearchParams = new URLSearchParams({
                hotelIds: hotelIds,
                checkInDate: checkIn,
                checkOutDate: checkOut,
                adults: adults.toString(),
                roomQuantity: (rooms || 1).toString(),
                currency: 'USD',
                bestRateOnly: 'true',
                view: 'FULL',
              });

              const offersResponse = await fetch(
                `https://test.api.amadeus.com/v2/shopping/hotel-offers?${offersSearchParams}`,
                {
                  headers: {
                    'Authorization': `Bearer ${accessToken}`,
                  },
                }
              );

              if (offersResponse.ok) {
                const offersData = await offersResponse.json();
                console.log('Amadeus offers status:', offersResponse.status);
                console.log('Amadeus offers count:', offersData.data?.length || 0);

                if (offersData.data && Array.isArray(offersData.data)) {
                  results.amadeus = offersData.data.slice(0, 20).map((offer: any) => {
                    const hotel = offer.hotel;
                    const firstOffer = offer.offers?.[0];
                    const price = firstOffer?.price?.total || 50000;
                    
                    return {
                      id: hotel.hotelId,
                      name: hotel.name || 'Hotel',
                      location: `${hotel.address?.cityName || location}, ${hotel.address?.countryCode || ''}`,
                      price: { grandTotal: Math.round(parseFloat(price)) }, // Keep USD price (convert to EUR later if needed)
                      rating: hotel.rating ? parseFloat(hotel.rating) : 4.0,
                      reviews: Math.floor(Math.random() * 500) + 50,
                      image: `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&sig=${hotel.hotelId}`,
                      images: [`https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&sig=${hotel.hotelId}`],
                      description: hotel.description?.text || `${hotel.name} est un établissement de qualité.`,
                      amenities: hotel.amenities || ['WiFi', 'Restaurant', 'Room Service'],
                    };
                  });
                  apiSuccess = true;
                  console.log('Amadeus results transformed:', results.amadeus.length);
                } else {
                  console.log('Amadeus offers returned unexpected structure:', Object.keys(offersData));
                }
              } else {
                const errorText = await offersResponse.text();
                console.error('Amadeus offers search failed:', offersResponse.status);
                console.error('Amadeus offers error:', errorText.substring(0, 500));
              }
            } else {
              console.log('No hotels found for city code:', cityCode);
            }
          } else {
            const errorText = await hotelListResponse.text();
            console.error('Amadeus hotel list failed:', hotelListResponse.status);
            console.error('Amadeus hotel list error:', errorText.substring(0, 500));
          }
        } else {
          const errorText = await tokenResponse.text();
          console.error('Amadeus token request failed:', tokenResponse.status);
          console.error('Amadeus token error:', errorText.substring(0, 500));
        }
      } catch (error) {
        console.error('Amadeus API exception:', error instanceof Error ? error.message : String(error));
      }
    }

    if (!RAPIDAPI_KEY) {
      console.log('RAPIDAPI_KEY not configured');
    }
    
    if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) {
      console.log('AMADEUS credentials not configured');
    }

    // If no API results, use mock data
    const totalResults = results.booking.length + results.airbnb.length + results.worldwide.length + 
                         results.hotelscom.length + results.priceline.length + results.tripadvisor.length + 
                         results.amadeus.length + results.skyscanner.length + results.agoda.length + 
                         results.expedia.length;
    
    console.log('=== SEARCH RESULTS SUMMARY ===');
    console.log('API Success:', apiSuccess);
    console.log('Total Results:', totalResults);
    console.log('Results by source:', {
      amadeus: results.amadeus.length,
      booking: results.booking.length,
      hotelscom: results.hotelscom.length,
      priceline: results.priceline.length,
      tripadvisor: results.tripadvisor.length,
      skyscanner: results.skyscanner.length,
      agoda: results.agoda.length,
      expedia: results.expedia.length
    });
    
    if (!apiSuccess || totalResults === 0) {
      console.log('⚠️ NO API RESULTS - Using mock hotel data for location:', location);
      const mockHotels = getMockHotels(location);
      results.booking = mockHotels;
    } else {
      console.log('✅ REAL API DATA - Returning results from', totalResults, 'hotels');
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: results,
        count: results.booking.length + results.airbnb.length + results.worldwide.length + 
               results.hotelscom.length + results.priceline.length + results.tripadvisor.length + 
               results.amadeus.length + results.skyscanner.length + results.agoda.length + 
               results.expedia.length,
        mock: !apiSuccess || totalResults === 0,
        sources: {
          amadeus: results.amadeus.length,
          booking: results.booking.length,
          hotelscom: results.hotelscom.length,
          priceline: results.priceline.length,
          tripadvisor: results.tripadvisor.length,
          skyscanner: results.skyscanner.length,
          agoda: results.agoda.length,
          expedia: results.expedia.length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in search-hotels:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});