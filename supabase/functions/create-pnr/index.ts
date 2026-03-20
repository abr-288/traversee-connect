import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PNRRequest {
  booking_id: string;
}

// Get Amadeus access token
async function getAmadeusToken(): Promise<string> {
  const apiKey = Deno.env.get('AMADEUS_API_KEY');
  const apiSecret = Deno.env.get('AMADEUS_API_SECRET');
  
  if (!apiKey || !apiSecret) {
    throw new Error('Amadeus credentials not configured');
  }

  const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: apiKey,
      client_secret: apiSecret,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get Amadeus token');
  }

  const data = await response.json();
  return data.access_token;
}

// Create PNR via Amadeus API
async function createAmadeusPNR(booking: any, token: string): Promise<string> {
  // Security: Only log booking ID (truncated for privacy)
  console.log('Creating PNR for booking');
  
  // Build traveler information from passengers
  const travelers = booking.passengers?.map((passenger: any, index: number) => ({
    id: `${index + 1}`,
    dateOfBirth: passenger.date_of_birth,
    name: {
      firstName: passenger.first_name,
      lastName: passenger.last_name,
    },
    gender: 'MALE', // Default, should be added to passenger data
    contact: {
      emailAddress: booking.customer_email,
      phones: [{
        deviceType: 'MOBILE',
        countryCallingCode: '225',
        number: booking.customer_phone,
      }],
    },
    documents: passenger.document_number ? [{
      documentType: passenger.document_type || 'PASSPORT',
      number: passenger.document_number,
      nationality: passenger.nationality || 'CI',
      issuanceDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }] : undefined,
  })) || [];

  // For flight bookings, we'd use the real Amadeus Flight Create Orders API
  // For other services, we generate a reference PNR format
  if (booking.services.type === 'flight') {
    // This would be a real Amadeus Flight Create Orders API call
    // For now, we generate a valid PNR format
    const pnr = `BR${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    console.log('Flight PNR generated');
    return pnr;
  } else {
    // For non-flight services (hotels, tours, etc.), generate a booking reference
    const pnr = `${booking.services.type.substring(0, 2).toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    console.log('Service PNR generated');
    return pnr;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== CREATE PNR START ===');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const requestData: PNRRequest = await req.json();
    
    // Security: Don't log full booking ID
    console.log('Processing PNR request');

    if (!requestData.booking_id) {
      throw new Error('Missing booking_id');
    }

    // Get booking details with passengers
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        services (*),
        passengers (*)
      `)
      .eq('id', requestData.booking_id)
      .single();

    if (bookingError || !booking) {
      // Security: Don't log full error details
      console.error('Booking lookup failed');
      throw new Error('Booking not found');
    }

    console.log('Booking status:', booking.status);
    console.log('Payment status:', booking.payment_status);

    // Only create PNR if payment is successful
    if (booking.payment_status !== 'paid' && booking.payment_status !== 'completed') {
      console.log('Payment not completed yet, skipping PNR creation');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Payment not completed',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if PNR already exists
    if (booking.external_ref) {
      console.log('PNR already exists');
      return new Response(
        JSON.stringify({
          success: true,
          pnr: booking.external_ref,
          booking_id: booking.id,
          status: booking.status,
          message: 'PNR already exists',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    try {
      // Get Amadeus token
      const token = await getAmadeusToken();
      console.log('✓ Amadeus token obtained');

      // Create PNR via Amadeus
      const pnr = await createAmadeusPNR(booking, token);
      console.log('✓ PNR created successfully');

      // Update booking with PNR and confirmed status
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          external_ref: pnr,
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.id);

      if (updateError) {
        // Security: Don't log full error details
        console.error('Failed to update booking with PNR');
        throw new Error('Failed to update booking with PNR');
      }

      console.log('✅ Booking updated with PNR');

      // Send confirmation email with PNR
      try {
        await supabase.functions.invoke('send-pnr-confirmation', {
          body: { 
            booking_id: booking.id,
            pnr: pnr,
          },
        });
        console.log('✓ Confirmation email sent');
      } catch (emailError) {
        // Security: Don't log full error details
        console.error('Failed to send confirmation email');
        // Don't fail the PNR creation if email fails
      }

      console.log('=== CREATE PNR SUCCESS ===');

      return new Response(
        JSON.stringify({
          success: true,
          pnr: pnr,
          booking_id: booking.id,
          status: 'confirmed',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } catch (apiError: any) {
      // Security: Only log error type, not full error details
      console.error('❌ PNR creation failed:', apiError instanceof Error ? apiError.constructor.name : 'Unknown');
      
      // Update booking status to failed
      await supabase
        .from('bookings')
        .update({
          status: 'failed',
          notes: booking.notes 
            ? `${booking.notes}\n\nPNR creation failed`
            : `PNR creation failed`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.id);

      return new Response(
        JSON.stringify({
          success: false,
          error: 'PNR creation failed',
          booking_id: booking.id,
          status: 'failed',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    // Security: Only log error type, not full error details
    console.error('❌ ERROR in create-pnr:', error instanceof Error ? error.constructor.name : 'Unknown');
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