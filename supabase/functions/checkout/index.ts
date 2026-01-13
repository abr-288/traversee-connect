import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ============================================================
// EDGE FUNCTION: checkout
// Description: Validates pre-booking and returns signed price summary
// CRITICAL: Payment can ONLY proceed with a valid checkout
// ============================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckoutRequest {
  prebooking_id?: string;
  booking_reference?: string;
}

// Helper to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Verify HMAC signature
async function verifyPriceSignature(data: object, signature: string): Promise<boolean> {
  const secretKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const messageData = encoder.encode(JSON.stringify(data));
  
  try {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const signatureBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
    return await crypto.subtle.verify('HMAC', cryptoKey, signatureBytes, messageData);
  } catch {
    return false;
  }
}

// Generate checkout signature
async function generateCheckoutSignature(data: object): Promise<string> {
  const secretKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const messageData = encoder.encode(JSON.stringify(data));
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  return arrayBufferToBase64(signature);
}

function jsonResponse(data: object, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function errorResponse(message: string, code: string, status: number = 400): Response {
  console.error(`❌ Checkout Error [${status}]: ${message}`);
  return jsonResponse({ success: false, error: message, code }, status);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                    CHECKOUT                                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`📅 Timestamp: ${new Date().toISOString()}`);

  try {
    // ================================================================
    // STEP 1: Authentication
    // ================================================================
    console.log('\n📋 Step 1: Authentication...');
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return errorResponse('Authorization header required', 'AUTH_REQUIRED', 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return errorResponse('Server configuration incomplete', 'CONFIG_ERROR', 500);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return errorResponse('Unauthorized - Please log in', 'UNAUTHORIZED', 401);
    }
    
    console.log('✅ User authenticated');

    // ================================================================
    // STEP 2: Parse request
    // ================================================================
    console.log('\n📋 Step 2: Parsing request...');
    
    let requestData: CheckoutRequest;
    try {
      requestData = await req.json();
    } catch (e) {
      return errorResponse('Invalid JSON request body', 'INVALID_JSON', 400);
    }

    if (!requestData.prebooking_id && !requestData.booking_reference) {
      return errorResponse('Pre-booking ID or booking reference required', 'MISSING_REFERENCE', 400);
    }

    // ================================================================
    // STEP 3: Retrieve pre-booking
    // ================================================================
    console.log('\n📋 Step 3: Retrieving pre-booking...');
    
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
    
    let query = adminSupabase
      .from('flight_prebookings')
      .select('*');
    
    if (requestData.prebooking_id) {
      query = query.eq('id', requestData.prebooking_id);
    } else {
      query = query.eq('booking_reference', requestData.booking_reference);
    }
    
    const { data: prebooking, error: fetchError } = await query
      .eq('user_id', user.id)
      .single();

    if (fetchError || !prebooking) {
      console.error('Pre-booking not found');
      return errorResponse('Pre-booking not found', 'NOT_FOUND', 404);
    }

    console.log('   - Booking Reference:', prebooking.booking_reference);
    console.log('   - Status:', prebooking.status);

    // ================================================================
    // STEP 4: Validate pre-booking status
    // ================================================================
    console.log('\n📋 Step 4: Validating pre-booking status...');
    
    // Check if expired
    const expiresAt = new Date(prebooking.expires_at);
    const now = new Date();
    
    if (now > expiresAt && prebooking.status === 'PREBOOKED') {
      // Update status to expired
      await adminSupabase
        .from('flight_prebookings')
        .update({ status: 'EXPIRED', updated_at: now.toISOString() })
        .eq('id', prebooking.id);
      
      return errorResponse('Pre-booking has expired. Please start a new booking.', 'EXPIRED', 410);
    }

    // Check status
    if (prebooking.status === 'EXPIRED') {
      return errorResponse('Pre-booking has expired. Please start a new booking.', 'EXPIRED', 410);
    }
    
    if (prebooking.status === 'FAILED') {
      return errorResponse('Pre-booking failed. Please start a new booking.', 'FAILED', 400);
    }
    
    if (prebooking.status === 'PAYMENT_CONFIRMED' || prebooking.status === 'TICKET_ISSUED') {
      return errorResponse('This booking has already been paid.', 'ALREADY_PAID', 400);
    }

    if (prebooking.status !== 'PREBOOKED' && prebooking.status !== 'PENDING_PAYMENT') {
      return errorResponse(`Invalid pre-booking status: ${prebooking.status}`, 'INVALID_STATUS', 400);
    }

    console.log('✅ Pre-booking valid');

    // ================================================================
    // STEP 5: Verify price signature integrity
    // ================================================================
    console.log('\n📋 Step 5: Verifying price integrity...');
    
    const signatureData = {
      booking_reference: prebooking.booking_reference,
      total_amount: prebooking.total_amount,
      currency: prebooking.currency,
      expires_at: prebooking.expires_at,
    };
    
    const isValid = await verifyPriceSignature(signatureData, prebooking.price_signature);
    
    if (!isValid) {
      console.error('❌ Price signature verification failed - possible tampering');
      return errorResponse('Price verification failed. Please start a new booking.', 'SIGNATURE_INVALID', 400);
    }
    
    console.log('✅ Price signature verified');

    // ================================================================
    // STEP 6: Generate checkout summary
    // ================================================================
    console.log('\n📋 Step 6: Generating checkout summary...');
    
    const remainingSeconds = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
    
    // Generate checkout signature for payment
    const checkoutData = {
      prebooking_id: prebooking.id,
      booking_reference: prebooking.booking_reference,
      total_amount: prebooking.total_amount,
      currency: prebooking.currency,
      checkout_time: now.toISOString(),
    };
    
    const checkoutSignature = await generateCheckoutSignature(checkoutData);

    // Update status to PENDING_PAYMENT
    if (prebooking.status === 'PREBOOKED') {
      await adminSupabase
        .from('flight_prebookings')
        .update({ status: 'PENDING_PAYMENT', updated_at: now.toISOString() })
        .eq('id', prebooking.id);
    }

    // ================================================================
    // SUCCESS
    // ================================================================
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    ✅ CHECKOUT SUCCESS                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    return jsonResponse({
      success: true,
      checkout: {
        prebooking_id: prebooking.id,
        booking_reference: prebooking.booking_reference,
        status: 'PENDING_PAYMENT',
        
        // Flight details
        flight: prebooking.flight_data,
        
        // Passenger info
        passengers: prebooking.passengers,
        adults_count: prebooking.adults_count,
        children_count: prebooking.children_count,
        
        // Price breakdown (from server - NEVER from client)
        price_breakdown: {
          base_fare: prebooking.base_fare,
          taxes: prebooking.taxes,
          service_fee: prebooking.service_fee,
          total_amount: prebooking.total_amount,
          currency: prebooking.currency,
        },
        
        // Expiration
        expires_at: prebooking.expires_at,
        expires_in_seconds: remainingSeconds,
        
        // Checkout signature for payment validation
        checkout_signature: checkoutSignature,
      },
      message: 'Checkout ready. Proceed to payment.',
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error instanceof Error ? error.message : 'Unknown');
    return jsonResponse({
      success: false,
      error: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
    }, 500);
  }
});
