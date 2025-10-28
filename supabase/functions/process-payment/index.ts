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

    const { bookingId, amount, currency, paymentMethod, customerInfo, paymentDetails } = await req.json();

    if (!amount || amount <= 0) {
      throw new Error('Invalid payment amount');
    }

    console.log('Processing payment for booking:', bookingId, 'Amount:', amount, currency);

    // Appel à l'API Lygos pour traiter le paiement
    const lygosApiKey = Deno.env.get('LYGOS_API_KEY');
    if (!lygosApiKey) {
      throw new Error('LYGOS_API_KEY not configured');
    }

    let paymentData;
    try {
      console.log('Calling Lygos API with:', {
        amount,
        currency,
        payment_method: paymentMethod,
        customer: customerInfo.name,
      });
      
      const lygosResponse = await fetch('https://api.lygosapp.com/v1/gateway', {
        method: 'POST',
        headers: {
          'api-key': lygosApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          shop_name: 'Booking Payment',
          message: `Payment for booking ${bookingId}`,
          order_id: bookingId,
          success_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-callback?status=success&booking_id=${bookingId}`,
          failure_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-callback?status=failed&booking_id=${bookingId}`,
        }),
      });

      console.log('Lygos response status:', lygosResponse.status);
      
      if (!lygosResponse.ok) {
        const errorData = await lygosResponse.json();
        console.error('Lygos API error:', errorData);
        throw new Error(errorData.message || 'Payment processing failed');
      }

      const lygosData = await lygosResponse.json();
      console.log('Lygos response:', lygosData);

      paymentData = {
        transaction_id: lygosData.id || `TXN-${Date.now()}`,
        status: 'pending',
        payment_url: lygosData.link || null,
        message: 'Payment gateway created. Please complete payment at the provided URL.',
        raw_response: lygosData,
      };
      
      console.log('Payment gateway created:', paymentData);
    } catch (error) {
      console.error('Error calling Lygos API:', error);
      throw new Error(`Failed to process payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }


    // Enregistrer le paiement dans la base de données
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id: bookingId,
        user_id: user.id,
        amount: amount,
        currency: currency || 'XOF',
        payment_method: paymentMethod,
        payment_provider: 'lygos',
        transaction_id: paymentData.transaction_id,
        status: paymentData.status === 'success' ? 'completed' : 'pending',
        payment_data: paymentData,
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Database error:', paymentError);
      throw new Error('Failed to record payment');
    }

    // Le statut sera mis à jour par le callback webhook de Lygos

    return new Response(
      JSON.stringify({
        success: true,
        payment: payment,
        lygos_data: {
          payment_url: paymentData.payment_url,
          transaction_id: paymentData.transaction_id,
          status: paymentData.status,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in process-payment:', error);
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