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
    const { bookingId, amount, currency, paymentMethod, customerInfo } = requestData;

    console.log('Processing payment request:', {
      bookingId,
      amount,
      currency,
      paymentMethod,
      customer: customerInfo?.name
    });

    // Validate input
    const validationErrors = validatePaymentInput({
      bookingId,
      amount,
      currency,
      paymentMethod,
      customerInfo,
    });

    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors);
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
      phone: customerInfo.phone ? sanitizeString(customerInfo.phone, 20) : null,
      address: customerInfo.address ? sanitizeString(customerInfo.address, 200) : null,
      city: customerInfo.city ? sanitizeString(customerInfo.city, 100) : 'Abidjan',
    };

    // Get CinetPay credentials
    const cinetpayApiKey = Deno.env.get('CINETPAY_API_KEY');
    const cinetpaySiteId = Deno.env.get('CINETPAY_SITE_ID');
    
    if (!cinetpayApiKey || !cinetpaySiteId) {
      console.error('CinetPay credentials missing');
      throw new Error('CinetPay credentials not configured');
    }

    let paymentData;
    try {
      const transactionId = `TXN-${bookingId}-${Date.now()}`;
      
      // Format phone number for international format
      let formattedPhone = sanitizedCustomerInfo.phone || '';
      if (formattedPhone) {
        // Remove all spaces and special characters
        formattedPhone = formattedPhone.replace(/[\s\-\(\)]/g, '');
        
        // Add +225 prefix if not present
        if (!formattedPhone.startsWith('+')) {
          if (formattedPhone.startsWith('0')) {
            formattedPhone = '+225' + formattedPhone.substring(1);
          } else if (!formattedPhone.startsWith('225')) {
            formattedPhone = '+225' + formattedPhone;
          } else {
            formattedPhone = '+' + formattedPhone;
          }
        }
      }
      
      // Determine payment channels based on method
      let channels = 'ALL';
      if (paymentMethod === 'card') {
        channels = 'CREDIT_CARD';
      } else if (paymentMethod === 'mobile_money' || paymentMethod === 'wave') {
        channels = 'MOBILE_MONEY';
      } else if (paymentMethod === 'bank_transfer') {
        channels = 'BANK_TRANSFER';
      }
      
      console.log('CinetPay request:', {
        transaction_id: transactionId,
        amount,
        currency: currency === 'FCFA' ? 'XOF' : currency,
        channels,
        customer_phone: formattedPhone,
        lock_phone: !formattedPhone // Lock only if phone is provided
      });
      
      // Build CinetPay payload
      const payloadData: any = {
        apikey: cinetpayApiKey,
        site_id: cinetpaySiteId,
        transaction_id: transactionId,
        amount: amount,
        currency: currency === 'FCFA' ? 'XOF' : currency,
        description: `Réservation #${bookingId}`,
        customer_name: sanitizedCustomerInfo.name.split(' ')[0] || sanitizedCustomerInfo.name,
        customer_surname: sanitizedCustomerInfo.name.split(' ').slice(1).join(' ') || sanitizedCustomerInfo.name,
        customer_email: sanitizedCustomerInfo.email,
        customer_phone_number: formattedPhone || '+2250000000000',
        customer_address: sanitizedCustomerInfo.address || 'N/A',
        customer_city: sanitizedCustomerInfo.city,
        customer_country: 'CI',
        customer_state: 'CI',
        customer_zip_code: '00225',
        notify_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-callback`,
        return_url: `https://traversee-connect.lovable.app/dashboard?tab=bookings`,
        channels: channels,
        lock_phone_number: formattedPhone ? false : true,
        metadata: JSON.stringify({ booking_id: bookingId }),
      };

      // Call CinetPay API
      const cinetpayResponse = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payloadData),
      });

      const cinetpayData = await cinetpayResponse.json();
      console.log('CinetPay response:', {
        status: cinetpayResponse.status,
        code: cinetpayData.code,
        message: cinetpayData.message,
        has_payment_url: !!cinetpayData.data?.payment_url
      });
      
      if (cinetpayData.code !== '201') {
        console.error('CinetPay error:', cinetpayData);
        throw new Error(cinetpayData.message || 'Erreur lors de la création du paiement');
      }

      if (!cinetpayData.data?.payment_url) {
        throw new Error('URL de paiement non reçue de CinetPay');
      }

      paymentData = {
        transaction_id: transactionId,
        status: 'pending',
        payment_url: cinetpayData.data.payment_url,
        payment_token: cinetpayData.data.payment_token || null,
        raw_response: cinetpayData,
      };
      
      console.log('Payment created successfully:', transactionId);
    } catch (error) {
      console.error('CinetPay API error:', error);
      throw new Error(`Erreur de paiement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }

    // Save payment to database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id: bookingId,
        user_id: user.id,
        amount: amount,
        currency: currency === 'FCFA' ? 'XOF' : currency,
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
      throw new Error('Impossible d\'enregistrer le paiement');
    }

    console.log('Payment record created:', payment.id);

    return new Response(
      JSON.stringify({
        success: true,
        payment_url: paymentData.payment_url,
        transaction_id: paymentData.transaction_id,
      }),
      {
        status: 200,
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