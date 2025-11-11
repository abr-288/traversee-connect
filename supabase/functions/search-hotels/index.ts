import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Transform Booking.com data to our format
const transformBookingData = (hotels: any[]) => {
  return hotels.map(hotel => ({
    id: hotel.hotel_id || hotel.id,
    name: hotel.hotel_name || hotel.name,
    location: hotel.city || hotel.address || '',
    price: { 
      grandTotal: hotel.min_total_price || hotel.price_breakdown?.gross_price?.value || 50000 
    },
    rating: hotel.review_score || hotel.rating || 4.0,
    reviews: hotel.review_nr || hotel.reviews_count || 0,
    image: hotel.main_photo_url || hotel.photo_main_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    images: hotel.photo_urls || [hotel.main_photo_url] || [],
    description: hotel.hotel_description || hotel.description || `${hotel.hotel_name || hotel.name} est un établissement de qualité offrant confort et services exceptionnels.`,
    amenities: hotel.hotel_facilities || hotel.facilities || ['Wifi', 'Restaurant', 'Service de Chambre']
  }));
};

// Transform Airbnb data to our format
const transformAirbnbData = (listings: any[]) => {
  return listings.map(listing => ({
    id: listing.id,
    name: listing.name || listing.title,
    location: listing.city || listing.localized_city || '',
    price: { 
      grandTotal: listing.price?.rate || listing.pricing?.rate || 40000 
    },
    rating: listing.star_rating || listing.avg_rating || 4.0,
    reviews: listing.reviews_count || listing.review_count || 0,
    image: listing.xl_picture_url || listing.picture_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    images: listing.picture_urls || [listing.xl_picture_url] || [],
    description: listing.description || listing.summary || `${listing.name} offre un hébergement confortable et bien situé.`,
    amenities: listing.amenities || ['Wifi', 'Cuisine', 'Espace de Travail']
  }));
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
    const { location, checkIn, checkOut, adults, children, rooms } = await req.json();
    console.log('Search hotels for:', { location, checkIn, checkOut, adults, children, rooms });

    const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');

    const results: {
      booking: any[];
      airbnb: any[];
      worldwide: any[];
    } = {
      booking: [],
      airbnb: [],
      worldwide: [],
    };

    let apiSuccess = false;

    // Search Booking.com (booking-com15.p.rapidapi.com)
    if (RAPIDAPI_KEY) {
      try {
        const bookingParams = new URLSearchParams({
          query: location,
        });

        console.log('Calling Booking.com API (searchDestination) with params:', Object.fromEntries(bookingParams));
        
        const bookingResponse = await fetch(
          `https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination?${bookingParams}`,
          {
            headers: {
              'X-RapidAPI-Key': RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com',
            },
          }
        );

        if (bookingResponse.ok) {
          const bookingData = await bookingResponse.json();
          console.log('Booking.com raw response:', JSON.stringify(bookingData).substring(0, 500));
          
          if (bookingData.data && Array.isArray(bookingData.data)) {
            results.booking = transformBookingData(bookingData.data.slice(0, 10));
            apiSuccess = true;
            console.log('Booking.com results transformed:', results.booking.length);
          }
        } else {
          const errorText = await bookingResponse.text();
          console.error('Booking.com API failed:', bookingResponse.status, errorText);
        }
      } catch (error) {
        console.error('Booking.com API error:', error);
      }
    }

    // Search Airbnb (airbnb19.p.rapidapi.com)
    if (RAPIDAPI_KEY) {
      try {
        // Pour Airbnb19, nous devons d'abord obtenir un placeId. Pour simplifier, nous utilisons un placeId par défaut
        // Dans une vraie implémentation, il faudrait d'abord appeler une API de géocodage
        const airbnbParams = new URLSearchParams({
          placeId: 'ChIJ7cv00DwsDogRAMDACa2m4K8', // Chicago par défaut
          adults: adults.toString(),
          guestFavorite: 'false',
          ib: 'false',
          currency: 'USD',
        });

        console.log('Calling Airbnb API with params:', Object.fromEntries(airbnbParams));

        const airbnbResponse = await fetch(
          `https://airbnb19.p.rapidapi.com/api/v2/searchPropertyByPlaceId?${airbnbParams}`,
          {
            headers: {
              'X-RapidAPI-Key': RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'airbnb19.p.rapidapi.com',
            },
          }
        );

        if (airbnbResponse.ok) {
          const airbnbData = await airbnbResponse.json();
          console.log('Airbnb raw response:', JSON.stringify(airbnbData).substring(0, 500));
          
          if (airbnbData.data && Array.isArray(airbnbData.data)) {
            results.airbnb = transformAirbnbData(airbnbData.data.slice(0, 10));
            apiSuccess = true;
            console.log('Airbnb results transformed:', results.airbnb.length);
          }
        } else {
          const errorText = await airbnbResponse.text();
          console.error('Airbnb API failed:', airbnbResponse.status, errorText);
        }
      } catch (error) {
        console.error('Airbnb API error:', error);
      }
    }

    // Search Worldwide Hotels (worldwide-hotels.p.rapidapi.com)
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
              location: location,
              checkIn: checkIn,
              checkOut: checkOut,
              adults: adults,
              children: children || 0,
              rooms: rooms || 1,
            }),
          }
        );

        if (worldwideResponse.ok) {
          const worldwideData = await worldwideResponse.json();
          console.log('Worldwide Hotels raw response:', JSON.stringify(worldwideData).substring(0, 500));
          
          if (worldwideData.hotels && Array.isArray(worldwideData.hotels)) {
            results.worldwide = transformBookingData(worldwideData.hotels.slice(0, 10));
            apiSuccess = true;
            console.log('Worldwide Hotels results transformed:', results.worldwide.length);
          }
        } else {
          const errorText = await worldwideResponse.text();
          console.error('Worldwide Hotels API failed:', worldwideResponse.status, errorText);
        }
      } catch (error) {
        console.error('Worldwide Hotels API error:', error);
      }
    }

    if (!RAPIDAPI_KEY) {
      console.log('RAPIDAPI_KEY not configured');
    }

    // If no API results, use mock data
    if (!apiSuccess || (results.booking.length === 0 && results.airbnb.length === 0 && results.worldwide.length === 0)) {
      console.log('Using mock hotel data for location:', location);
      const mockHotels = getMockHotels(location);
      results.booking = mockHotels;
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: results,
        count: results.booking.length + results.airbnb.length + results.worldwide.length,
        mock: !apiSuccess,
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