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
    // CinetPay envoie les données en POST
    const body = await req.json();
    
    console.log('CinetPay callback received:', body);

    const cinetpayApiKey = Deno.env.get('CINETPAY_API_KEY');
    const cinetpaySiteId = Deno.env.get('CINETPAY_SITE_ID');

    if (!cinetpayApiKey || !cinetpaySiteId) {
      throw new Error('CinetPay credentials not configured');
    }

    // Vérifier le statut du paiement auprès de CinetPay
    const checkResponse = await fetch('https://api-checkout.cinetpay.com/v2/payment/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apikey: cinetpayApiKey,
        site_id: cinetpaySiteId,
        transaction_id: body.cpm_trans_id,
      }),
    });

    const checkData = await checkResponse.json();
    console.log('CinetPay check response:', checkData);

    if (checkData.code !== '00') {
      throw new Error('Payment verification failed');
    }

    // Extraire le booking_id des metadata
    let bookingId;
    try {
      const metadata = JSON.parse(checkData.data.metadata || '{}');
      bookingId = metadata.booking_id;
    } catch (e) {
      // Fallback: extraire du transaction_id si le format est TXN-{bookingId}-{timestamp}
      const transactionId = checkData.data.transaction_id;
      const match = transactionId.match(/TXN-([a-f0-9-]+)-\d+/);
      bookingId = match ? match[1] : null;
    }

    if (!bookingId) {
      throw new Error('Unable to extract booking_id from payment data');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const paymentStatus = checkData.data.payment_status;

    if (paymentStatus === 'ACCEPTED' || paymentStatus === 'SUCCESSFUL') {
      // Mettre à jour le statut du paiement
      const { error: paymentError } = await supabase
        .from('payments')
        .update({ 
          status: 'completed',
          payment_data: checkData.data
        })
        .eq('transaction_id', checkData.data.transaction_id);

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

      // Retourner une réponse de succès pour CinetPay
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Payment processed successfully',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      // Mettre à jour le statut du paiement comme échoué
      const { error: paymentError } = await supabase
        .from('payments')
        .update({ 
          status: 'failed',
          payment_data: checkData.data
        })
        .eq('transaction_id', checkData.data.transaction_id);

      if (paymentError) {
        console.error('Error updating payment:', paymentError);
      }

      // Retourner une réponse d'échec pour CinetPay
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Payment failed',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
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
