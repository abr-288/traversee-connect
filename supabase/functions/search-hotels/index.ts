import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mock hotel data with detailed descriptions and images
const getMockHotels = (location: string) => {
  const hotelImages = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800'
  ];

  const baseHotels = [
    {
      id: `${location}-1`,
      name: `Grand Hotel ${location}`,
      location: location,
      price: { grandTotal: 45000 + Math.random() * 20000 },
      rating: 4.5 + Math.random() * 0.4,
      reviews: Math.floor(Math.random() * 200) + 50,
      image: hotelImages[0],
      images: [hotelImages[0], hotelImages[1], hotelImages[2]],
      description: `Le Grand Hotel ${location} est un établissement de luxe situé au cœur de la ville. Avec ses chambres élégantes et son service impeccable, cet hôtel offre une expérience inoubliable. Profitez de notre piscine sur le toit, de notre restaurant gastronomique et de notre spa moderne.`,
      amenities: ['Wifi Gratuit', 'Restaurant Gastronomique', 'Parking Sécurisé', 'Piscine sur Toit', 'Spa', 'Salle de Sport', 'Service de Chambre 24h/24', 'Conciergerie']
    },
    {
      id: `${location}-2`,
      name: `Luxury Resort ${location}`,
      location: location,
      price: { grandTotal: 75000 + Math.random() * 30000 },
      rating: 4.7 + Math.random() * 0.2,
      reviews: Math.floor(Math.random() * 150) + 80,
      image: hotelImages[1],
      images: [hotelImages[1], hotelImages[3], hotelImages[4]],
      description: `Le Luxury Resort ${location} combine élégance et confort dans un cadre exceptionnel. Nos suites spacieuses offrent une vue imprenable. Détendez-vous dans notre spa de classe mondiale, savourez une cuisine raffinée dans nos restaurants primés, et profitez de notre plage privée.`,
      amenities: ['Wifi Gratuit', 'Restaurant Étoilé', 'Spa Premium', 'Bar Lounge', 'Plage Privée', 'Tennis', 'Service Majordome', 'Transfert Aéroport']
    },
    {
      id: `${location}-3`,
      name: `Budget Inn ${location}`,
      location: location,
      price: { grandTotal: 25000 + Math.random() * 10000 },
      rating: 4.2 + Math.random() * 0.3,
      reviews: Math.floor(Math.random() * 100) + 30,
      image: hotelImages[2],
      images: [hotelImages[2], hotelImages[5], hotelImages[0]],
      description: `Le Budget Inn ${location} offre un excellent rapport qualité-prix pour les voyageurs avisés. Nos chambres confortables et propres sont parfaites pour un séjour économique. Profitez de notre petit-déjeuner continental gratuit et de notre emplacement central pratique.`,
      amenities: ['Wifi Gratuit', 'Restaurant', 'Petit-déjeuner Inclus', 'Parking', 'Réception 24h/24']
    },
    {
      id: `${location}-4`,
      name: `Business Hotel ${location}`,
      location: location,
      price: { grandTotal: 55000 + Math.random() * 15000 },
      rating: 4.4 + Math.random() * 0.3,
      reviews: Math.floor(Math.random() * 180) + 60,
      image: hotelImages[3],
      images: [hotelImages[3], hotelImages[2], hotelImages[1]],
      description: `Le Business Hotel ${location} est conçu pour les voyageurs d'affaires modernes. Nos chambres équipées de bureaux ergonomiques, notre centre d'affaires ultramoderne et nos salles de réunion high-tech garantissent votre productivité. Détendez-vous après le travail dans notre gym ou notre bar lounge.`,
      amenities: ['Wifi Haut Débit', 'Restaurant', 'Salle de Sport', 'Parking', 'Centre d\'Affaires', 'Salles de Réunion', 'Blanchisserie Express', 'Bar']
    },
    {
      id: `${location}-5`,
      name: `Boutique Hotel ${location}`,
      location: location,
      price: { grandTotal: 60000 + Math.random() * 25000 },
      rating: 4.6 + Math.random() * 0.3,
      reviews: Math.floor(Math.random() * 120) + 40,
      image: hotelImages[4],
      images: [hotelImages[4], hotelImages[0], hotelImages[3]],
      description: `Le Boutique Hotel ${location} allie charme authentique et design contemporain. Chaque chambre est unique, décorée avec goût et attention aux détails. Découvrez notre bar à cocktails signature, notre restaurant fusion et notre galerie d'art intégrée.`,
      amenities: ['Wifi Gratuit', 'Restaurant Fusion', 'Bar à Cocktails', 'Galerie d\'Art', 'Terrasse Panoramique', 'Service Personnalisé', 'Petit-déjeuner Gourmet']
    },
    {
      id: `${location}-6`,
      name: `Seaside Resort ${location}`,
      location: location,
      price: { grandTotal: 85000 + Math.random() * 35000 },
      rating: 4.8 + Math.random() * 0.15,
      reviews: Math.floor(Math.random() * 250) + 100,
      image: hotelImages[5],
      images: [hotelImages[5], hotelImages[4], hotelImages[2]],
      description: `Le Seaside Resort ${location} est un paradis tropical en bord de mer. Profitez de nos villas avec piscine privée, de nos sports nautiques, et de nos restaurants en bord de plage. Notre spa en plein air et nos excursions organisées font de chaque séjour une aventure mémorable.`,
      amenities: ['Wifi Gratuit', 'Restaurants', 'Spa en Plein Air', 'Plage Privée', 'Piscines Multiples', 'Sports Nautiques', 'Kids Club', 'Animations', 'Excursions']
    }
  ];
  
  return baseHotels;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, checkIn, checkOut, adults, children, rooms } = await req.json();
    console.log('Search hotels for:', { location, checkIn, checkOut, adults, children, rooms });

    const BOOKING_API_KEY = Deno.env.get('BOOKING_API_KEY');
    const AIRBNB_API_KEY = Deno.env.get('AIRBNB_API_KEY');

    const results: {
      booking: any[];
      airbnb: any[];
    } = {
      booking: [],
      airbnb: [],
    };

    let apiSuccess = false;

    // Search Booking.com
    if (BOOKING_API_KEY) {
      try {
        const bookingParams = new URLSearchParams({
          location: location,
          checkin: checkIn,
          checkout: checkOut,
          adults: adults.toString(),
          children: children?.toString() || '0',
          room_qty: rooms?.toString() || '1',
        });

        const bookingResponse = await fetch(
          `https://booking-com.p.rapidapi.com/v1/hotels/search?${bookingParams}`,
          {
            headers: {
              'X-RapidAPI-Key': BOOKING_API_KEY,
              'X-RapidAPI-Host': 'booking-com.p.rapidapi.com',
            },
          }
        );

        if (bookingResponse.ok) {
          const bookingData = await bookingResponse.json();
          results.booking = bookingData.result || [];
          apiSuccess = true;
          console.log('Booking.com results:', results.booking.length);
        } else {
          console.error('Booking.com API failed:', bookingResponse.status);
        }
      } catch (error) {
        console.error('Booking.com API error:', error);
      }
    }

    // Search Airbnb
    if (AIRBNB_API_KEY) {
      try {
        const airbnbParams = new URLSearchParams({
          location: location,
          checkIn: checkIn,
          checkOut: checkOut,
          adults: adults.toString(),
        });

        const airbnbResponse = await fetch(
          `https://airbnb13.p.rapidapi.com/search-location?${airbnbParams}`,
          {
            headers: {
              'X-RapidAPI-Key': AIRBNB_API_KEY,
              'X-RapidAPI-Host': 'airbnb13.p.rapidapi.com',
            },
          }
        );

        if (airbnbResponse.ok) {
          const airbnbData = await airbnbResponse.json();
          results.airbnb = airbnbData.results || [];
          apiSuccess = true;
          console.log('Airbnb results:', results.airbnb.length);
        } else {
          console.error('Airbnb API failed:', airbnbResponse.status);
        }
      } catch (error) {
        console.error('Airbnb API error:', error);
      }
    }

    // If no API results, use mock data
    if (!apiSuccess || (results.booking.length === 0 && results.airbnb.length === 0)) {
      console.log('Using mock hotel data for location:', location);
      const mockHotels = getMockHotels(location);
      results.booking = mockHotels;
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: results,
        count: results.booking.length + results.airbnb.length,
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