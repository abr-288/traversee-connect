import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const errorResponse = (message: string, status: number) =>
  new Response(
    JSON.stringify({ success: false, error: message }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city } = await req.json();
    const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');

    if (!RAPIDAPI_KEY) {
      console.error('RAPIDAPI_KEY not configured');
      return errorResponse('Weather service is not configured', 503);
    }

    if (!city) {
      return errorResponse('City is required', 400);
    }

    console.log('Fetching weather for city:', city);

    const response = await fetch(
      `https://weatherapi-com.p.rapidapi.com/current.json?q=${encodeURIComponent(city)}`,
      {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com',
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Weather API error:', response.status, errorText);
      return errorResponse('Weather provider returned an error', 502);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          location: data.location.name,
          country: data.location.country,
          temperature: data.current.temp_c,
          condition: data.current.condition.text,
          icon: data.current.condition.icon,
          humidity: data.current.humidity,
          windSpeed: data.current.wind_kph,
          feelsLike: data.current.feelslike_c,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Error in get-weather function:', error);
    return errorResponse('Failed to fetch weather data', 500);
  }
});
