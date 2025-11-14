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
    const body = await req.json();
    
    console.log('CinetPay callback received:', {
      transaction_id: body.cpm_trans_id,
      timestamp: new Date().toISOString(),
    });

    const cinetpayApiKey = Deno.env.get('CINETPAY_API_KEY');
    const cinetpaySiteId = Deno.env.get('CINETPAY_SITE_ID');

    if (!cinetpayApiKey || !cinetpaySiteId) {
      console.error('CinetPay credentials not configured');
      throw new Error('CinetPay credentials not configured');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if transaction was already processed (idempotency)
    const transactionId = body.cpm_trans_id;
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id, status')
      .eq('transaction_id', transactionId)
      .single();

    if (existingPayment && existingPayment.status === 'completed') {
      console.log('Transaction already processed:', transactionId);
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Transaction already processed',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify payment status with CinetPay
    const checkResponse = await fetch('https://api-checkout.cinetpay.com/v2/payment/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        apikey: cinetpayApiKey,
        site_id: cinetpaySiteId,
        transaction_id: transactionId,
      }),
    });

    const checkData = await checkResponse.json();
    console.log('CinetPay verification:', {
      code: checkData.code,
      payment_status: checkData.data?.payment_status,
      transaction_id: transactionId
    });

    if (checkData.code !== '00') {
      throw new Error(`Payment verification failed: ${checkData.message}`);
    }

    // Extract booking_id from metadata
    let bookingId;
    try {
      const metadata = JSON.parse(checkData.data.metadata || '{}');
      bookingId = metadata.booking_id;
    } catch (e) {
      // Fallback: extract from transaction_id (TXN-{bookingId}-{timestamp})
      const match = transactionId.match(/TXN-([a-f0-9-]+)-\d+/);
      bookingId = match ? match[1] : null;
    }

    if (!bookingId) {
      console.error('Cannot extract booking_id from:', checkData.data);
      throw new Error('Unable to extract booking_id');
    }

    const paymentStatus = checkData.data.payment_status;

    if (paymentStatus === 'ACCEPTED' || paymentStatus === 'SUCCESSFUL') {
      // Update payment status
      const { error: paymentError } = await supabase
        .from('payments')
        .update({ 
          status: 'completed',
          payment_data: checkData.data
        })
        .eq('transaction_id', transactionId);

      if (paymentError) {
        console.error('Error updating payment:', paymentError);
      }

      // Update booking status
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ 
          payment_status: 'paid', 
          status: 'confirmed' 
        })
        .eq('id', bookingId);

      if (bookingError) {
        console.error('Error updating booking:', bookingError);
      }

      // Generate invoice
      try {
        await supabase.functions.invoke('generate-invoice', {
          body: { bookingId },
        });
      } catch (invoiceError) {
        console.error('Error generating invoice:', invoiceError);
      }

      console.log('Payment successful for booking:', bookingId);

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
      // Update payment as failed
      const { error: paymentError } = await supabase
        .from('payments')
        .update({ 
          status: 'failed',
          payment_data: checkData.data
        })
        .eq('transaction_id', transactionId);

      if (paymentError) {
        console.error('Error updating payment:', paymentError);
      }

      console.log('Payment failed for booking:', bookingId);

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
