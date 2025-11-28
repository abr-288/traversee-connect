import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrainResult {
  id: string;
  operator: string;
  trainNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  currency: string;
  class: string;
  availableSeats: number;
  source: string;
}

// Note: Les APIs de trains (Trainline, Omio, Rome2Rio) n'existent pas sur RapidAPI
// Cette fonction utilise uniquement des données mock réalistes
function getMockTrains(origin: string, destination: string, departureDate: string, travelClass: string): TrainResult[] {
  const basePrice = 45000;
  const operators = [
    { name: 'SNCF', prefix: 'TGV' },
    { name: 'Eurostar', prefix: 'ES' },
    { name: 'Thalys', prefix: 'TH' },
    { name: 'Deutsche Bahn', prefix: 'ICE' },
    { name: 'Trenitalia', prefix: 'FR' },
    { name: 'ONCF', prefix: 'AL' },
    { name: 'Renfe', prefix: 'AVE' },
  ];

  // Generate realistic train schedules
  const trains: TrainResult[] = [];
  const departureTimes = ['06:15', '07:30', '08:45', '10:00', '12:30', '14:15', '16:00', '18:30', '20:00'];
  
  for (let i = 0; i < Math.min(operators.length, 7); i++) {
    const op = operators[i];
    const departureHour = parseInt(departureTimes[i].split(':')[0]);
    const durationHours = 2 + Math.floor(Math.random() * 3);
    const durationMinutes = Math.floor(Math.random() * 60);
    const arrivalHour = (departureHour + durationHours) % 24;
    
    trains.push({
      id: `train-${i}`,
      operator: op.name,
      trainNumber: `${op.prefix} ${6600 + Math.floor(Math.random() * 400)}`,
      origin: origin,
      destination: destination,
      departureTime: departureTimes[i],
      arrivalTime: `${arrivalHour.toString().padStart(2, '0')}:${durationMinutes.toString().padStart(2, '0')}`,
      duration: `${durationHours}h ${durationMinutes.toString().padStart(2, '0')}m`,
      price: basePrice + (i * 5000) + Math.floor(Math.random() * 10000),
      currency: 'XOF',
      class: travelClass || 'economy',
      availableSeats: 45 - (i * 5) + Math.floor(Math.random() * 20),
      source: 'simulation',
    });
  }

  // Sort by price
  return trains.sort((a, b) => a.price - b.price);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { origin, destination, departureDate, returnDate, adults = 1, children = 0, travelClass = 'economy' } = await req.json();
    
    console.log('Train search params:', { origin, destination, departureDate, returnDate, adults, children, travelClass });

    // Note: Aucune API de trains disponible sur RapidAPI, utilisation de données simulées
    const trains = getMockTrains(origin, destination, departureDate, travelClass);
    
    console.log(`Generated ${trains.length} train results`);

    return new Response(
      JSON.stringify({ trains }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in search-trains:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
