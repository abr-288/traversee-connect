import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const bookingId = url.searchParams.get('booking_id');

    if (!bookingId) {
      throw new Error('Missing booking_id parameter');
    }

    console.log('Payment callback received:', { status, bookingId });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (status === 'success') {
      // Mettre à jour le statut du paiement et de la réservation
      const { error: paymentError } = await supabase
        .from('payments')
        .update({ status: 'completed' })
        .eq('booking_id', bookingId);

      if (paymentError) {
        console.error('Error updating payment:', paymentError);
      }

      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ payment_status: 'paid', status: 'confirmed' })
        .eq('id', bookingId);

      if (bookingError) {
        console.error('Error updating booking:', bookingError);
      }

      // Générer la facture
      await supabase.functions.invoke('generate-invoice', {
        body: { bookingId },
      });

      // Rediriger vers la page de succès
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': `${Deno.env.get('SITE_URL') || 'https://lovableproject.com'}/dashboard?tab=bookings&payment=success`,
        },
      });
    } else {
      // Mettre à jour le statut du paiement comme échoué
      const { error: paymentError } = await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('booking_id', bookingId);

      if (paymentError) {
        console.error('Error updating payment:', paymentError);
      }

      // Rediriger vers la page d'échec
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': `${Deno.env.get('SITE_URL') || 'https://lovableproject.com'}/payment?bookingId=${bookingId}&payment=failed`,
        },
      });
    }
  } catch (error) {
    console.error('Error in payment-callback:', error);
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
