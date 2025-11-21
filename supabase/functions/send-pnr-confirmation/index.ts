import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const smtpClient = new SMTPClient({
  connection: {
    hostname: Deno.env.get("SMTP_HOST")!,
    port: Number(Deno.env.get("SMTP_PORT")),
    tls: true,
    auth: {
      username: Deno.env.get("SMTP_USERNAME")!,
      password: Deno.env.get("SMTP_PASSWORD")!,
    },
  },
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  booking_id: string;
  pnr: string;
}

const generateEmailHTML = (booking: any, pnr: string) => {
  const startDate = new Date(booking.start_date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const endDate = booking.end_date 
    ? new Date(booking.end_date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .pnr-box { background: #f8f9fa; border: 2px dashed #667eea; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
        .pnr-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 3px; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
        .info-label { font-weight: bold; color: #667eea; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✈️ Réservation Confirmée!</h1>
          <p>Votre voyage est maintenant confirmé</p>
        </div>
        
        <div class="content">
          <div class="pnr-box">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Votre Numéro de Réservation (PNR)</p>
            <div class="pnr-code">${pnr}</div>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Conservez ce numéro précieusement</p>
          </div>

          <h2 style="color: #667eea;">Détails de votre réservation</h2>
          
          <div class="info-row">
            <span class="info-label">Service:</span>
            <span>${booking.services.name}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">Type:</span>
            <span>${booking.services.type}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">Destination:</span>
            <span>${booking.services.location}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">Date de départ:</span>
            <span>${startDate}</span>
          </div>
          
          ${endDate ? `
          <div class="info-row">
            <span class="info-label">Date de retour:</span>
            <span>${endDate}</span>
          </div>
          ` : ''}
          
          <div class="info-row">
            <span class="info-label">Nombre de voyageurs:</span>
            <span>${booking.guests} personne(s)</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">Prix total:</span>
            <span style="font-size: 18px; color: #667eea; font-weight: bold;">${booking.total_price.toLocaleString()} ${booking.currency}</span>
          </div>

          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #1976d2;">📋 Informations importantes</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Présentez votre PNR lors de votre arrivée</li>
              <li>Vérifiez vos documents de voyage (passeport, visa si nécessaire)</li>
              <li>Arrivez au moins 2h avant le départ</li>
              <li>Conservez une copie de cette confirmation</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 14px; color: #666;">Besoin d'aide?</p>
            <p style="font-size: 12px; color: #999;">Contactez-nous à support@bossiz.com</p>
          </div>
        </div>

        <div class="footer">
          <p>Merci d'avoir choisi B-RESERVE</p>
          <p style="font-size: 12px;">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== SEND PNR CONFIRMATION START ===');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { booking_id, pnr }: EmailRequest = await req.json();
    console.log('Sending PNR confirmation for booking:', booking_id, 'PNR:', pnr);

    if (!booking_id || !pnr) {
      throw new Error('Missing booking_id or pnr');
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        services (
          name,
          type,
          location,
          description
        ),
        passengers (
          first_name,
          last_name
        )
      `)
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      console.error('Booking not found:', bookingError);
      throw new Error('Booking not found');
    }

    console.log('Sending email to:', booking.customer_email);

    // Generate email HTML
    const htmlContent = generateEmailHTML(booking, pnr);

    // Send email via SMTP
    await smtpClient.send({
      from: "B-RESERVE <noreply@bossiz.com>",
      to: booking.customer_email,
      subject: `✈️ Confirmation de réservation - PNR: ${pnr}`,
      content: htmlContent,
      html: htmlContent,
    });

    console.log('✅ Email sent successfully');
    console.log('=== SEND PNR CONFIRMATION SUCCESS ===');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'PNR confirmation email sent',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('❌ ERROR in send-pnr-confirmation:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
