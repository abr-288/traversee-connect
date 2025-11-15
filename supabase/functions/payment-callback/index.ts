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
    const requestData = await req.json();
    console.log('=== PAYMENT CALLBACK START ===');
    console.log('Raw callback data:', JSON.stringify(requestData, null, 2));

    const { cpm_trans_id, cpm_site_id, signature } = requestData;

    if (!cpm_trans_id || !cpm_site_id) {
      console.error('❌ Missing required parameters');
      throw new Error('Missing transaction ID or site ID');
    }

    // Get CinetPay credentials
    const cinetpayApiKey = Deno.env.get('CINETPAY_API_KEY');
    const cinetpaySiteId = Deno.env.get('CINETPAY_SITE_ID');
    
    if (!cinetpayApiKey || !cinetpaySiteId) {
      console.error('❌ CinetPay credentials missing');
      throw new Error('Payment gateway not configured');
    }

    // Verify site ID matches
    if (cpm_site_id !== cinetpaySiteId) {
      console.error('❌ Site ID mismatch');
      throw new Error('Invalid site ID');
    }

    // Initialize Supabase client with service role for server-side operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check idempotency - avoid processing same callback twice
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id, status, transaction_id')
      .eq('transaction_id', cpm_trans_id)
      .single();

    if (existingPayment && existingPayment.status === 'completed') {
      console.log('⚠️ Payment already processed:', cpm_trans_id);
      return new Response(
        JSON.stringify({ success: true, message: 'Payment already processed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify payment status with CinetPay
    console.log('=== VERIFYING WITH CINETPAY ===');
    const verifyPayload = {
      apikey: cinetpayApiKey,
      site_id: cinetpaySiteId,
      transaction_id: cpm_trans_id,
    };

    const verifyResponse = await fetch('https://api-checkout.cinetpay.com/v2/payment/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(verifyPayload),
    });

    const verifyData = await verifyResponse.json();
    console.log('CinetPay verification response:', JSON.stringify(verifyData, null, 2));

    if (verifyData.code !== '00') {
      console.error('❌ Payment verification failed:', verifyData.message);
      
      // Update payment as failed
      if (existingPayment) {
        await supabase
          .from('payments')
          .update({
            status: 'failed',
            payment_data: { ...existingPayment, verification_response: verifyData },
            updated_at: new Date().toISOString(),
          })
          .eq('transaction_id', cpm_trans_id);
      }

      throw new Error(verifyData.message || 'Payment verification failed');
    }

    const paymentStatus = verifyData.data?.status;
    const metadata = verifyData.data?.metadata ? JSON.parse(verifyData.data.metadata) : {};
    const bookingId = metadata.booking_id;

    console.log('Payment status:', paymentStatus);
    console.log('Booking ID:', bookingId);

    if (!bookingId) {
      console.error('❌ No booking ID in metadata');
      throw new Error('No booking ID found');
    }

    // Update payment record
    const paymentUpdateData: any = {
      status: paymentStatus === 'ACCEPTED' ? 'completed' : 'failed',
      payment_data: {
        verification_response: verifyData,
        callback_data: requestData,
      },
      updated_at: new Date().toISOString(),
    };

    const { error: paymentUpdateError } = await supabase
      .from('payments')
      .update(paymentUpdateData)
      .eq('transaction_id', cpm_trans_id);

    if (paymentUpdateError) {
      console.error('❌ Failed to update payment:', paymentUpdateError);
      throw new Error('Failed to update payment');
    }

    console.log('✅ Payment updated:', cpm_trans_id, paymentUpdateData.status);

    // If payment successful, update booking
    if (paymentStatus === 'ACCEPTED') {
      const { error: bookingUpdateError } = await supabase
        .from('bookings')
        .update({
          payment_status: 'paid',
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      if (bookingUpdateError) {
        console.error('❌ Failed to update booking:', bookingUpdateError);
      } else {
        console.log('✅ Booking confirmed:', bookingId);
      }

      // Generate invoice
      try {
        console.log('Generating invoice...');
        const { data: invoiceData, error: invoiceError } = await supabase.functions.invoke(
          'generate-invoice',
          { body: { bookingId } }
        );

        if (invoiceError) {
          console.error('⚠️ Invoice generation failed:', invoiceError);
        } else {
          console.log('✅ Invoice generated');
        }
      } catch (invoiceErr) {
        console.error('⚠️ Invoice generation error:', invoiceErr);
      }
    }

    console.log('=== PAYMENT CALLBACK END ===');

    return new Response(
      JSON.stringify({
        success: true,
        status: paymentStatus,
        booking_id: bookingId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ ERROR in payment-callback:', error);
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
