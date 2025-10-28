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

    const { bookingId, amount, currency, paymentMethod, customerInfo } = await req.json();

    const LYGOS_API_KEY = Deno.env.get('LYGOS_API_KEY');
    if (!LYGOS_API_KEY) {
      throw new Error('Lygos API key not configured');
    }

    // Créer une transaction de paiement avec Lygos
    const paymentResponse = await fetch('https://api.lygosapp.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LYGOS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount,
        currency: currency || 'XOF',
        payment_method: paymentMethod,
        customer: customerInfo,
        metadata: {
          booking_id: bookingId,
          user_id: user.id,
        },
      }),
    });

    if (!paymentResponse.ok) {
      const error = await paymentResponse.text();
      console.error('Lygos API error:', error);
      throw new Error('Payment processing failed');
    }

    const paymentData = await paymentResponse.json();

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

    // Mettre à jour le statut de réservation si le paiement est réussi
    if (paymentData.status === 'success') {
      await supabase
        .from('bookings')
        .update({ payment_status: 'paid', status: 'confirmed' })
        .eq('id', bookingId);
    }

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