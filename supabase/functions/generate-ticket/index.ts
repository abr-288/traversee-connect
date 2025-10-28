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

    if (!bookingId) {
      throw new Error('Booking ID is required');
    }

    // Récupérer les détails de la réservation
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        services (
          name,
          type,
          location,
          description
        )
      `)
      .eq('id', bookingId)
      .eq('user_id', user.id)
      .single();

    if (bookingError || !booking) {
      throw new Error('Booking not found');
    }

    // Vérifier que le paiement est bien effectué
    if (booking.payment_status !== 'paid') {
      throw new Error('Booking not paid');
    }

    // Générer le contenu du billet en HTML
    const ticketHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Billet - ${booking.services.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px 20px;
              background: #f5f5f5;
            }
            .ticket {
              background: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #0EA5E9;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #0EA5E9;
              margin: 0 0 10px 0;
            }
            .section {
              margin: 25px 0;
            }
            .section-title {
              font-weight: bold;
              color: #0EA5E9;
              font-size: 14px;
              text-transform: uppercase;
              margin-bottom: 10px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 12px 0;
              border-bottom: 1px solid #eee;
            }
            .info-label {
              color: #666;
              font-weight: 500;
            }
            .info-value {
              font-weight: bold;
              color: #333;
            }
            .qr-code {
              text-align: center;
              margin: 30px 0;
              padding: 20px;
              background: #f9f9f9;
              border-radius: 8px;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #eee;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <h1>🎫 BILLET DE VOYAGE</h1>
              <p style="color: #666; margin: 5px 0;">Réservation confirmée</p>
            </div>

            <div class="section">
              <div class="section-title">Informations du service</div>
              <div class="info-row">
                <span class="info-label">Service</span>
                <span class="info-value">${booking.services.name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Type</span>
                <span class="info-value">${booking.services.type}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Destination</span>
                <span class="info-value">${booking.services.location}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Détails de la réservation</div>
              <div class="info-row">
                <span class="info-label">Référence</span>
                <span class="info-value">${bookingId.substring(0, 8).toUpperCase()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Passager</span>
                <span class="info-value">${booking.customer_name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Date de départ</span>
                <span class="info-value">${new Date(booking.start_date).toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              ${booking.end_date ? `
              <div class="info-row">
                <span class="info-label">Date de retour</span>
                <span class="info-value">${new Date(booking.end_date).toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              ` : ''}
              <div class="info-row">
                <span class="info-label">Nombre de voyageurs</span>
                <span class="info-value">${booking.guests} personne(s)</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Informations de paiement</div>
              <div class="info-row">
                <span class="info-label">Montant payé</span>
                <span class="info-value">${booking.total_price.toLocaleString()} ${booking.currency}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Statut</span>
                <span class="info-value" style="color: #10B981;">✓ PAYÉ</span>
              </div>
            </div>

            <div class="qr-code">
              <p style="color: #666; margin-bottom: 15px;">Code de réservation</p>
              <div style="font-size: 24px; font-weight: bold; letter-spacing: 3px; color: #0EA5E9;">
                ${bookingId.substring(0, 8).toUpperCase()}
              </div>
            </div>

            <div class="footer">
              <p><strong>Remarque importante :</strong></p>
              <p>Veuillez présenter ce billet lors de votre voyage.</p>
              <p>Pour toute question, contactez notre service client.</p>
              <p style="margin-top: 15px;">Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Encoder en base64 pour le téléchargement
    const encoder = new TextEncoder();
    const data = encoder.encode(ticketHtml);
    const base64 = btoa(String.fromCharCode(...data));

    return new Response(
      JSON.stringify({
        success: true,
        ticket: {
          bookingId: bookingId,
          html: ticketHtml,
          base64: base64,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error generating ticket:', error);
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
