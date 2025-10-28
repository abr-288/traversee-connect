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

    const { bookingId } = await req.json();

    // Récupérer les informations de la réservation
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error('Booking not found');
    }

    // Vérifier que la réservation appartient à l'utilisateur
    if (booking.user_id !== user.id) {
      throw new Error('Unauthorized access to booking');
    }

    // Générer un numéro de facture unique
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Calculer les taxes (10% TVA par exemple)
    const taxRate = 0.10;
    const taxAmount = Number(booking.total_price) * taxRate;
    const totalAmount = Number(booking.total_price) + taxAmount;

    // Créer les données de la facture
    const invoiceData = {
      invoice_number: invoiceNumber,
      booking_reference: booking.booking_reference,
      customer_name: booking.customer_name,
      customer_email: booking.customer_email,
      customer_phone: booking.customer_phone,
      booking_type: booking.booking_type,
      booking_details: booking.booking_data,
      subtotal: booking.total_price,
      tax_amount: taxAmount.toFixed(2),
      total_amount: totalAmount.toFixed(2),
      currency: booking.currency,
      issue_date: new Date().toISOString(),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours
    };

    // Enregistrer la facture dans la base de données
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        booking_id: bookingId,
        user_id: user.id,
        invoice_number: invoiceNumber,
        amount: totalAmount.toFixed(2),
        currency: booking.currency,
        tax_amount: taxAmount.toFixed(2),
        invoice_data: invoiceData,
        status: 'sent',
        issued_at: new Date().toISOString(),
        due_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (invoiceError) {
      console.error('Database error:', invoiceError);
      throw new Error('Failed to create invoice');
    }

    return new Response(
      JSON.stringify({
        success: true,
        invoice: invoice,
        invoice_data: invoiceData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-invoice:', error);
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