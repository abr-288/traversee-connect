import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PNRRequest {
  booking_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== CREATE PNR START ===');
    
    // Use service role key for internal operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const requestData: PNRRequest = await req.json();
    console.log('Booking ID:', requestData.booking_id);

    if (!requestData.booking_id) {
      throw new Error('Missing booking_id');
    }

    // Get booking details
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
      console.error('Booking not found:', bookingError);
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

    // Generate PNR (mock implementation)
    // In production, this would call the actual provider API (Amadeus, Sabre, etc.)
    const pnr = `BR${Date.now().toString().slice(-8)}`;
    console.log('Generated PNR:', pnr);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real implementation, you would:
    // 1. Call the provider API with booking details
    // 2. Handle the response
    // 3. Store the PNR and any additional data

    // Mock success (95% success rate)
    const success = Math.random() > 0.05;

    if (success) {
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
        console.error('Failed to update booking:', updateError);
        throw new Error('Failed to update booking with PNR');
      }

      console.log('✅ PNR created and booking confirmed');
      console.log('=== CREATE PNR SUCCESS ===');

      // TODO: Send confirmation email
      // await sendConfirmationEmail(booking, pnr);

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
    } else {
      // PNR creation failed
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'failed',
          notes: booking.notes 
            ? `${booking.notes}\n\nPNR creation failed`
            : 'PNR creation failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.id);

      if (updateError) {
        console.error('Failed to update booking status:', updateError);
      }

      console.log('❌ PNR creation failed (provider error)');
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Provider API error - PNR creation failed',
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
    console.error('❌ ERROR in create-pnr:', error);
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
