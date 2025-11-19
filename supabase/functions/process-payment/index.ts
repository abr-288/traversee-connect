import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  bookingId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const requestData: PaymentRequest = await req.json();
    console.log('=== PAYMENT REQUEST START ===');
    console.log('Booking ID:', requestData.bookingId);
    console.log('Amount:', requestData.amount, requestData.currency);
    console.log('Method:', requestData.paymentMethod);
    console.log('Customer:', requestData.customerInfo.name);

    // Validate input
    if (!requestData.bookingId || !requestData.amount || !requestData.currency || !requestData.paymentMethod) {
      throw new Error('Missing required fields');
    }

    if (requestData.amount <= 0) {
      throw new Error('Invalid amount');
    }

    // Get CinetPay credentials
    const cinetpayApiKey = Deno.env.get('CINETPAY_API_KEY');
    const cinetpaySiteId = Deno.env.get('CINETPAY_SITE_ID');
    
    if (!cinetpayApiKey || !cinetpaySiteId) {
      console.error('❌ CinetPay credentials missing');
      throw new Error('Payment gateway not configured');
    }

    // Format phone number for Côte d'Ivoire (+225)
    let formattedPhone = requestData.customerInfo.phone.replace(/[\s\-\(\)]/g, '');
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+225' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('225')) {
        formattedPhone = '+225' + formattedPhone;
      } else {
        formattedPhone = '+' + formattedPhone;
      }
    }
    console.log('Formatted phone:', formattedPhone);

    // Generate unique transaction ID
    const transactionId = `TXN-${requestData.bookingId}-${Date.now()}`;
    
    // Determine payment channels based on method
    let channels = 'ALL';
    if (requestData.paymentMethod === 'card') {
      channels = 'CREDIT_CARD';
    } else if (requestData.paymentMethod === 'mobile_money') {
      channels = 'MOBILE_MONEY';
    } else if (requestData.paymentMethod === 'wave') {
      channels = 'WAVE'; // Wave has its own channel in CinetPay
    } else if (requestData.paymentMethod === 'bank_transfer') {
      channels = 'BANK_TRANSFER';
    }

    // Split customer name
    const nameParts = requestData.customerInfo.name.trim().split(' ');
    const firstName = nameParts[0] || requestData.customerInfo.name;
    const lastName = nameParts.slice(1).join(' ') || firstName;

    // Build CinetPay payload
    const cinetpayPayload = {
      apikey: cinetpayApiKey,
      site_id: cinetpaySiteId,
      transaction_id: transactionId,
      amount: requestData.amount,
      currency: requestData.currency === 'FCFA' ? 'XOF' : requestData.currency,
      description: `Booking #${requestData.bookingId}`,
      customer_name: firstName,
      customer_surname: lastName,
      customer_email: requestData.customerInfo.email,
      customer_phone_number: formattedPhone,
      customer_address: requestData.customerInfo.address || 'N/A',
      customer_city: requestData.customerInfo.city || 'Abidjan',
      customer_country: 'CI',
      customer_state: 'CI',
      customer_zip_code: '00225',
      notify_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-callback`,
      return_url: `https://traversee-connect.lovable.app/dashboard?tab=bookings`,
      channels: channels,
      lang: 'fr',
      metadata: JSON.stringify({
        booking_id: requestData.bookingId,
        user_id: user.id,
        payment_method: requestData.paymentMethod
      }),
    };

    console.log('=== CINETPAY REQUEST ===');
    console.log('Transaction ID:', transactionId);
    console.log('Amount:', cinetpayPayload.amount, cinetpayPayload.currency);
    console.log('Channels:', channels);
    console.log('Notify URL:', cinetpayPayload.notify_url);

    // Call CinetPay API
    const cinetpayResponse = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(cinetpayPayload),
    });

    const cinetpayData = await cinetpayResponse.json();
    
    console.log('=== CINETPAY RESPONSE ===');
    console.log('Status:', cinetpayResponse.status);
    console.log('Code:', cinetpayData.code);
    console.log('Message:', cinetpayData.message);
    console.log('Has payment URL:', !!cinetpayData.data?.payment_url);
    
    if (cinetpayData.code !== '201') {
      console.error('❌ CinetPay error:', cinetpayData);
      throw new Error(cinetpayData.message || 'Payment creation failed');
    }

    if (!cinetpayData.data?.payment_url) {
      console.error('❌ No payment URL in response');
      throw new Error('No payment URL received');
    }

    // Save payment to database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id: requestData.bookingId,
        user_id: user.id,
        amount: requestData.amount,
        currency: requestData.currency === 'FCFA' ? 'XOF' : requestData.currency,
        payment_method: requestData.paymentMethod,
        payment_provider: 'cinetpay',
        transaction_id: transactionId,
        status: 'pending',
        payment_data: {
          transaction_id: transactionId,
          payment_url: cinetpayData.data.payment_url,
          payment_token: cinetpayData.data.payment_token,
          channels: channels,
          cinetpay_response: cinetpayData,
        },
      })
      .select()
      .single();

    if (paymentError) {
      console.error('❌ Database error:', paymentError);
      throw new Error('Failed to save payment record');
    }

    console.log('✅ Payment record created:', payment.id);
    console.log('=== PAYMENT REQUEST END ===');

    return new Response(
      JSON.stringify({
        success: true,
        payment_url: cinetpayData.data.payment_url,
        transaction_id: transactionId,
        payment_id: payment.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ ERROR in process-payment:', error);
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
