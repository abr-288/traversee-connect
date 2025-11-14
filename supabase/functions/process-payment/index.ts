import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validatePaymentInput, sanitizeString } from "../_shared/validation.ts";

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

    const requestData = await req.json();
    const { bookingId, amount, currency, paymentMethod, customerInfo, paymentDetails } = requestData;

    // Validate input
    const validationErrors = validatePaymentInput({
      bookingId,
      amount,
      currency,
      paymentMethod,
      customerInfo,
    });

    if (validationErrors.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Validation failed",
          details: validationErrors,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Sanitize customer info
    const sanitizedCustomerInfo = {
      name: sanitizeString(customerInfo.name, 100),
      email: sanitizeString(customerInfo.email, 255),
      phone: customerInfo.phone ? sanitizeString(customerInfo.phone, 20) : '0000000000',
      address: customerInfo.address ? sanitizeString(customerInfo.address, 200) : 'N/A',
      city: customerInfo.city ? sanitizeString(customerInfo.city, 100) : 'Abidjan',
    };

    console.log('Processing payment for booking:', bookingId, 'Amount:', amount, currency);

    // Appel à l'API CinetPay pour traiter le paiement
    const cinetpayApiKey = Deno.env.get('CINETPAY_API_KEY');
    const cinetpaySiteId = Deno.env.get('CINETPAY_SITE_ID');
    
    if (!cinetpayApiKey || !cinetpaySiteId) {
      throw new Error('CinetPay credentials not configured');
    }

    let paymentData;
    try {
      const transactionId = `TXN-${bookingId}-${Date.now()}`;
      
      console.log('Calling CinetPay API with:', {
        transaction_id: transactionId,
        amount,
        currency,
        customer: customerInfo.name,
      });
      
      // Déterminer les canaux de paiement en fonction de la méthode choisie
      let channels = 'ALL';
      let operator = undefined;
      
      if (paymentMethod === 'card') {
        channels = 'CREDIT_CARD';
      } else if (paymentMethod === 'mobile_money') {
        channels = 'MOBILE_MONEY';
      } else if (paymentMethod === 'wave') {
        channels = 'MOBILE_MONEY';
        operator = 'WAVE';
      } else if (paymentMethod === 'bank_transfer') {
        channels = 'BANK_TRANSFER';
      }
      
      const payloadData: any = {
        apikey: cinetpayApiKey,
        site_id: cinetpaySiteId,
        transaction_id: transactionId,
        amount: amount,
        currency: currency === 'FCFA' ? 'XOF' : currency,
        description: `Payment for booking ${bookingId}`,
        customer_name: sanitizedCustomerInfo.name.split(' ')[0] || sanitizedCustomerInfo.name,
        customer_surname: sanitizedCustomerInfo.name.split(' ').slice(1).join(' ') || sanitizedCustomerInfo.name,
        customer_email: sanitizedCustomerInfo.email,
        customer_phone_number: sanitizedCustomerInfo.phone,
        customer_address: sanitizedCustomerInfo.address,
        customer_city: sanitizedCustomerInfo.city,
        customer_country: 'CI',
        customer_state: 'CI',
        customer_zip_code: '00225',
        notify_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-callback`,
        return_url: `${Deno.env.get('SITE_URL') || 'https://lovableproject.com'}/dashboard?tab=bookings`,
        channels: channels,
        metadata: JSON.stringify({ booking_id: bookingId }),
      };

      // Ajouter l'opérateur si spécifié (pour Wave)
      if (operator) {
        payloadData.operator = operator;
      }

      const cinetpayResponse = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payloadData),
      });

      console.log('CinetPay response status:', cinetpayResponse.status);
      
      const cinetpayData = await cinetpayResponse.json();
      console.log('CinetPay response:', cinetpayData);
      
      if (cinetpayData.code !== '201') {
        console.error('CinetPay API error:', cinetpayData);
        throw new Error(cinetpayData.message || 'Payment processing failed');
      }

      paymentData = {
        transaction_id: transactionId,
        status: 'pending',
        payment_url: cinetpayData.data?.payment_url || null,
        payment_token: cinetpayData.data?.payment_token || null,
        message: 'Payment gateway created. Please complete payment at the provided URL.',
        raw_response: cinetpayData,
      };
      
      console.log('CinetPay payment gateway created:', paymentData);
    } catch (error) {
      console.error('Error calling CinetPay API:', error);
      throw new Error(`Failed to process payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }


    // Enregistrer le paiement dans la base de données
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id: bookingId,
        user_id: user.id,
        amount: amount,
        currency: currency === 'FCFA' ? 'XOF' : currency || 'XOF',
        payment_method: paymentMethod,
        payment_provider: 'cinetpay',
        transaction_id: paymentData.transaction_id,
        status: 'pending',
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
        cinetpay_data: {
          payment_url: paymentData.payment_url,
          payment_token: paymentData.payment_token,
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