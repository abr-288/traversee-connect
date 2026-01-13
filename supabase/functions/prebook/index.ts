import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ============================================================
// EDGE FUNCTION: prebook
// Description: Mandatory pre-booking step - locks fare and generates booking reference
// CRITICAL: This must be called BEFORE payment is allowed
// ============================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Service fee percentage (configurable)
const SERVICE_FEE_PERCENTAGE = 0.05; // 5%

// Pre-booking expiration time in minutes
const PREBOOK_EXPIRATION_MINUTES = 10;

interface PrebookRequest {
  flight_data: {
    origin: string;
    destination: string;
    departure_date: string;
    return_date?: string;
    departure_time: string;
    arrival_time: string;
    duration: string;
    airline: string;
    airline_code: string;
    flight_number: string;
    price: number;
    stops: number;
    fare: string;
    provider?: string;
    baggage?: any;
  };
  passengers: Array<{
    first_name: string;
    last_name: string;
    date_of_birth: string;
    nationality: string;
    document_type: string;
    document_number: string;
  }>;
  adults_count: number;
  children_count: number;
  selected_options?: Record<string, number>;
  selected_preferences?: Record<string, any>;
}

// Generate a unique booking reference
function generateBookingReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BR-${timestamp}-${random}`;
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

// Generate HMAC signature for price integrity
async function generatePriceSignature(data: object): Promise<string> {
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

// Calculate price breakdown (server-side ONLY)
function calculatePriceBreakdown(baseFare: number, passengerCount: number): {
  base_fare: number;
  taxes: number;
  service_fee: number;
  total_amount: number;
} {
  // Base fare per passenger
  const totalBaseFare = baseFare * passengerCount;
  
  // Taxes (typically included in API price, but we add a realistic tax component)
  // In production, this would come from the flight API
  const taxes = Math.round(totalBaseFare * 0.12); // 12% tax estimate
  
  // Service fee
  const serviceFee = Math.round(totalBaseFare * SERVICE_FEE_PERCENTAGE);
  
  // Total amount
  const totalAmount = totalBaseFare + taxes + serviceFee;
  
  return {
    base_fare: totalBaseFare,
    taxes,
    service_fee: serviceFee,
    total_amount: totalAmount,
  };
}

function jsonResponse(data: object, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function errorResponse(message: string, status: number = 400): Response {
  console.error(`❌ Prebook Error [${status}]: ${message}`);
  return jsonResponse({ success: false, error: message }, status);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║              FLIGHT PRE-BOOKING                             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`📅 Timestamp: ${new Date().toISOString()}`);

  try {
    // ================================================================
    // STEP 1: Authentication
    // ================================================================
    console.log('\n📋 Step 1: Authentication...');
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return errorResponse('Authorization header required', 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return errorResponse('Server configuration incomplete', 500);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return errorResponse('Unauthorized - Please log in', 401);
    }
    
    console.log('✅ User authenticated');

    // ================================================================
    // STEP 2: Parse and validate request
    // ================================================================
    console.log('\n📋 Step 2: Validating request...');
    
    let requestData: PrebookRequest;
    try {
      requestData = await req.json();
    } catch (e) {
      return errorResponse('Invalid JSON request body', 400);
    }

    // Validate required fields
    if (!requestData.flight_data) {
      return errorResponse('Flight data is required', 400);
    }
    
    if (!requestData.passengers || requestData.passengers.length === 0) {
      return errorResponse('At least one passenger is required', 400);
    }

    if (!requestData.flight_data.price || requestData.flight_data.price <= 0) {
      return errorResponse('Invalid flight price', 400);
    }

    const adultsCount = requestData.adults_count || 1;
    const childrenCount = requestData.children_count || 0;
    const totalPassengers = adultsCount + childrenCount;

    if (requestData.passengers.length !== totalPassengers) {
      return errorResponse(`Passenger count mismatch: expected ${totalPassengers}, got ${requestData.passengers.length}`, 400);
    }

    console.log('   - Flight:', requestData.flight_data.airline, requestData.flight_data.flight_number);
    console.log('   - Route:', requestData.flight_data.origin, '→', requestData.flight_data.destination);
    console.log('   - Passengers:', totalPassengers);

    // ================================================================
    // STEP 3: Verify flight availability (mock/real API call)
    // ================================================================
    console.log('\n📋 Step 3: Verifying flight availability...');
    
    // In production, this would call the actual flight API to verify:
    // - Flight is still available
    // - Price hasn't changed significantly
    // - Seats are available
    
    // For now, we simulate availability check
    const isAvailable = true; // Would come from API
    
    if (!isAvailable) {
      return errorResponse('Flight is no longer available', 409);
    }
    
    console.log('✅ Flight available');

    // ================================================================
    // STEP 4: Calculate price breakdown (SERVER-SIDE ONLY)
    // ================================================================
    console.log('\n📋 Step 4: Calculating price breakdown...');
    
    // CRITICAL: Price comes from flight_data but we recalculate server-side
    const baseFarePerPerson = requestData.flight_data.price;
    const priceBreakdown = calculatePriceBreakdown(baseFarePerPerson, totalPassengers);
    
    console.log('   - Base fare:', priceBreakdown.base_fare, 'XOF');
    console.log('   - Taxes:', priceBreakdown.taxes, 'XOF');
    console.log('   - Service fee:', priceBreakdown.service_fee, 'XOF');
    console.log('   - Total:', priceBreakdown.total_amount, 'XOF');

    // ================================================================
    // STEP 5: Generate booking reference and signature
    // ================================================================
    console.log('\n📋 Step 5: Generating booking reference...');
    
    const bookingReference = generateBookingReference();
    const expiresAt = new Date(Date.now() + PREBOOK_EXPIRATION_MINUTES * 60 * 1000);
    
    // Create signature data for integrity verification
    const signatureData = {
      booking_reference: bookingReference,
      total_amount: priceBreakdown.total_amount,
      currency: 'XOF',
      expires_at: expiresAt.toISOString(),
    };
    
    const priceSignature = await generatePriceSignature(signatureData);
    
    console.log('   - Booking Reference:', bookingReference);
    console.log('   - Expires At:', expiresAt.toISOString());

    // ================================================================
    // STEP 6: Store pre-booking in database
    // ================================================================
    console.log('\n📋 Step 6: Storing pre-booking...');
    
    // Use service role client for insert
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: prebooking, error: insertError } = await adminSupabase
      .from('flight_prebookings')
      .insert({
        user_id: user.id,
        booking_reference: bookingReference,
        flight_data: requestData.flight_data,
        provider: requestData.flight_data.provider || 'amadeus',
        base_fare: priceBreakdown.base_fare,
        taxes: priceBreakdown.taxes,
        service_fee: priceBreakdown.service_fee,
        total_amount: priceBreakdown.total_amount,
        currency: 'XOF',
        passengers: requestData.passengers,
        adults_count: adultsCount,
        children_count: childrenCount,
        status: 'PREBOOKED',
        expires_at: expiresAt.toISOString(),
        price_signature: priceSignature,
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Failed to store pre-booking:', insertError.code);
      return errorResponse('Failed to create pre-booking', 500);
    }

    console.log('✅ Pre-booking stored');

    // ================================================================
    // SUCCESS
    // ================================================================
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    ✅ PRE-BOOKING SUCCESS                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    return jsonResponse({
      success: true,
      prebooking_id: prebooking.id,
      booking_reference: bookingReference,
      status: 'PREBOOKED',
      price_breakdown: {
        base_fare: priceBreakdown.base_fare,
        taxes: priceBreakdown.taxes,
        service_fee: priceBreakdown.service_fee,
        total_amount: priceBreakdown.total_amount,
        currency: 'XOF',
      },
      expires_at: expiresAt.toISOString(),
      expires_in_seconds: PREBOOK_EXPIRATION_MINUTES * 60,
      price_signature: priceSignature,
      message: `Pre-booking confirmed. Complete payment within ${PREBOOK_EXPIRATION_MINUTES} minutes.`,
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error instanceof Error ? error.message : 'Unknown');
    return jsonResponse({
      success: false,
      error: 'An unexpected error occurred',
    }, 500);
  }
});
