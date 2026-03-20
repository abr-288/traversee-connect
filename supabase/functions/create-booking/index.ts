import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Passenger {
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  document_type?: string;
  document_number?: string;
  nationality?: string;
}

interface BookingRequest {
  service_id?: string;
  service_type: string;
  service_name: string;
  service_description?: string;
  location: string;
  start_date: string;
  end_date?: string;
  guests: number;
  total_price: number;
  currency: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes?: string;
  passengers: Passenger[];
  booking_details?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== CREATE BOOKING START ===');
    
    // Authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const requestData: BookingRequest = await req.json();
    
    // Security: Only log non-sensitive metadata
    console.log('Processing booking - Service type:', requestData.service_type);
    console.log('Passenger count:', requestData.passengers.length);

    // Validate input
    if (!requestData.service_type || !requestData.service_name || 
        !requestData.start_date || requestData.total_price === undefined ||
        !requestData.currency || !requestData.customer_name || 
        !requestData.customer_email || !requestData.customer_phone) {
      throw new Error('Missing required fields');
    }

    if (requestData.passengers.length === 0) {
      throw new Error('At least one passenger is required');
    }

    // Create or get service
    let serviceId = requestData.service_id;
    
    if (!serviceId) {
      console.log('Creating service...');
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .insert({
          type: requestData.service_type,
          name: requestData.service_name,
          description: requestData.service_description || requestData.service_name,
          location: requestData.location,
          price_per_unit: requestData.total_price / requestData.guests,
          currency: requestData.currency,
          available: true,
        })
        .select()
        .single();

      if (serviceError) {
        // Security: Don't log full error details
        console.error('Service creation failed - Code:', serviceError.code);
        throw new Error('Failed to create service');
      }

      serviceId = service.id;
      console.log('Service created successfully');
    }

    // Create booking
    console.log('Creating booking...');
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        service_id: serviceId,
        status: 'pending',
        payment_status: 'pending',
        start_date: requestData.start_date,
        end_date: requestData.end_date || requestData.start_date,
        guests: requestData.guests,
        total_price: requestData.total_price,
        currency: requestData.currency,
        customer_name: requestData.customer_name,
        customer_email: requestData.customer_email,
        customer_phone: requestData.customer_phone,
        notes: requestData.notes,
        booking_details: requestData.booking_details,
      })
      .select()
      .single();

    if (bookingError) {
      // Security: Don't log full error details
      console.error('Booking creation failed - Code:', bookingError.code);
      throw new Error('Failed to create booking');
    }

    console.log('Booking created successfully');

    // Create passengers
    console.log('Creating passengers...');
    const passengersData = requestData.passengers.map((p) => ({
      booking_id: booking.id,
      first_name: p.first_name,
      last_name: p.last_name,
      date_of_birth: p.date_of_birth || null,
      document_type: p.document_type || null,
      document_number: p.document_number || null,
      nationality: p.nationality || null,
    }));

    const { data: passengers, error: passengersError } = await supabase
      .from('passengers')
      .insert(passengersData)
      .select();

    if (passengersError) {
      // Security: Don't log full error details
      console.error('Passengers creation failed - Code:', passengersError.code);
      // Don't fail the whole booking if passengers fail
      console.warn('Continuing without passengers...');
    } else {
      console.log('Passengers created:', passengers.length);
    }

    console.log('=== CREATE BOOKING SUCCESS ===');

    return new Response(
      JSON.stringify({
        success: true,
        booking_id: booking.id,
        status: booking.status,
        message: 'Booking created successfully',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    // Security: Only log error type, not full error details
    console.error('❌ ERROR in create-booking:', error instanceof Error ? error.constructor.name : 'Unknown');
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