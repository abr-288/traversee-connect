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
    console.log('=== PAYMENT CALLBACK RECEIVED ===');
    // Security: Do not log full callback data as it contains sensitive information

    const { cpm_trans_id, cpm_site_id, signature } = requestData;

    if (!cpm_trans_id || !cpm_site_id) {
      console.error('❌ Missing required callback parameters');
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
      console.log('⚠️ Payment already processed');
      return new Response(
        JSON.stringify({ success: true, message: 'Payment already processed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify payment status with CinetPay
    console.log('=== VERIFYING PAYMENT STATUS ===');
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
    console.log('Payment verification completed');
    // Security: Do not log full verification response

    if (verifyData.code !== '00') {
      console.error('❌ Payment verification failed with code:', verifyData.code);
      // Security: Do not log the full error message
      
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

      throw new Error('Payment verification failed');
    }

    const paymentStatus = verifyData.data?.status;
    const metadata = verifyData.data?.metadata ? JSON.parse(verifyData.data.metadata) : {};
    const bookingId = metadata.booking_id;

    console.log('Payment verification successful');

    if (!bookingId) {
      console.error('❌ Booking ID missing in callback metadata');
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
      console.error('❌ Failed to update payment record');
      // Security: Do not log the full error
      throw new Error('Failed to update payment');
    }

    console.log('✅ Payment record updated');

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
        console.error('❌ Failed to update booking status');
        // Security: Do not log the full error
      } else {
        console.log('✅ Booking confirmed successfully');
      }

      // Generate invoice
      try {
        console.log('Generating invoice...');
        const { data: invoiceData, error: invoiceError } = await supabase.functions.invoke(
          'generate-invoice',
          { body: { bookingId } }
        );

        if (invoiceError) {
          console.error('⚠️ Invoice generation failed');
          // Security: Do not log the full error
        } else {
          console.log('✅ Invoice generated successfully');
        }
      } catch (invoiceErr) {
        console.error('⚠️ Invoice generation error occurred');
        // Security: Do not log the full error
      }
    }
    
    // Trigger PNR creation job asynchronously
    if (bookingId && paymentStatus === 'ACCEPTED') {
      console.log('Triggering PNR creation...');
      
      try {
        // Call create-pnr function asynchronously
        fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/create-pnr`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify({ booking_id: bookingId }),
        }).catch(err => {
          console.error('⚠️ PNR creation trigger failed');
          // Security: Do not log the full error
        });
      } catch (pnrErr) {
        console.error('⚠️ PNR creation trigger error occurred');
        // Security: Do not log the full error
      }
    }

    console.log('=== PAYMENT CALLBACK COMPLETED ===');

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
    // Security: Only log error type, not details which may contain sensitive data
    console.error('❌ Payment callback error:', error instanceof Error ? error.constructor.name : 'Unknown');
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Payment callback failed',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
