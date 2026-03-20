import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

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

    const bookingDetails = booking.booking_details || {};
    const isRoundTrip = bookingDetails.tripType !== "Aller simple";
    
    // Générer le contenu du billet et de la facture en HTML
    const ticketHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Billet et Facture - ${booking.services.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 900px;
              margin: 0 auto;
              padding: 20px;
              background: #f5f5f5;
            }
            .document {
              background: white;
              border-radius: 12px;
              padding: 40px;
              margin-bottom: 30px;
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
            .passport-info {
              background: #f0f9ff;
              border-left: 4px solid #0EA5E9;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
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
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #eee;
            }
            th {
              background: #f9f9f9;
              font-weight: bold;
              color: #0EA5E9;
            }
            .total-row {
              font-weight: bold;
              font-size: 18px;
              background: #f0f9ff;
            }
            .page-break {
              page-break-before: always;
            }
          </style>
        </head>
        <body>
          <!-- BILLET -->
          <div class="document">
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
              ${isRoundTrip && booking.end_date ? `
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

            <div class="passport-info">
              <div class="section-title" style="margin-bottom: 15px;">Informations du Passeport</div>
              <div class="info-row" style="border: none; padding: 8px 0;">
                <span class="info-label">Numéro de passeport</span>
                <span class="info-value">${bookingDetails.passportNumber || 'N/A'}</span>
              </div>
              <div class="info-row" style="border: none; padding: 8px 0;">
                <span class="info-label">Date de délivrance</span>
                <span class="info-value">${bookingDetails.passportIssueDate ? new Date(bookingDetails.passportIssueDate).toLocaleDateString('fr-FR') : 'N/A'}</span>
              </div>
              <div class="info-row" style="border: none; padding: 8px 0;">
                <span class="info-label">Date d'expiration</span>
                <span class="info-value">${bookingDetails.passportExpiryDate ? new Date(bookingDetails.passportExpiryDate).toLocaleDateString('fr-FR') : 'N/A'}</span>
              </div>
            </div>
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
              <p>Veuillez présenter ce billet et votre passeport lors de votre voyage.</p>
              <p>Pour toute question, contactez notre service client.</p>
            </div>
          </div>

          <!-- FACTURE -->
          <div class="document page-break">
            <div class="header">
              <h1>📄 FACTURE</h1>
              <p style="color: #666; margin: 5px 0;">Détails de la transaction</p>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
              <div>
                <h3 style="margin: 0 0 10px 0;">Informations client</h3>
                <p style="margin: 5px 0;"><strong>${booking.customer_name}</strong></p>
                <p style="margin: 5px 0; color: #666;">${booking.customer_email}</p>
                <p style="margin: 5px 0; color: #666;">${booking.customer_phone}</p>
              </div>
              <div style="text-align: right;">
                <h3 style="margin: 0 0 10px 0;">Détails de la facture</h3>
                <p style="margin: 5px 0;"><strong>N° Facture:</strong> ${bookingId.substring(0, 8).toUpperCase()}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
                <p style="margin: 5px 0;"><strong>Statut:</strong> <span style="color: #10B981;">PAYÉ</span></p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantité</th>
                  <th>Prix unitaire</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${booking.services.name}</td>
                  <td>${booking.guests}</td>
                  <td>${(booking.total_price / booking.guests).toLocaleString()} ${booking.currency}</td>
                  <td>${booking.total_price.toLocaleString()} ${booking.currency}</td>
                </tr>
                <tr class="total-row">
                  <td colspan="3" style="text-align: right;">Total à payer</td>
                  <td>${booking.total_price.toLocaleString()} ${booking.currency}</td>
                </tr>
              </tbody>
            </table>

            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin-top: 30px;">
              <h3 style="margin: 0 0 10px 0; color: #0EA5E9;">Informations de paiement</h3>
              <p style="margin: 5px 0;"><strong>Montant payé:</strong> ${booking.total_price.toLocaleString()} ${booking.currency}</p>
              <p style="margin: 5px 0;"><strong>Méthode de paiement:</strong> Mobile Money</p>
              <p style="margin: 5px 0;"><strong>Date de paiement:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
            </div>

            <div class="footer">
              <p style="margin-top: 15px;">Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
              <p style="margin-top: 10px;">Merci pour votre confiance!</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Encoder le HTML en base64
    const encoder = new TextEncoder();
    const htmlData = encoder.encode(ticketHtml);
    const htmlBase64 = btoa(String.fromCharCode(...htmlData));

    // Envoyer le PDF par email
    try {
      await resend.emails.send({
        from: 'Voyage <onboarding@resend.dev>',
        to: [booking.customer_email],
        subject: `Votre billet de voyage - ${booking.services.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #0EA5E9;">Votre billet de voyage est prêt!</h1>
            <p>Bonjour ${booking.customer_name},</p>
            <p>Nous sommes ravis de confirmer votre réservation pour <strong>${booking.services.name}</strong>.</p>
            <p>Vous trouverez en pièce jointe votre billet et votre facture au format PDF.</p>
            <p><strong>Référence de réservation:</strong> ${bookingId.substring(0, 8).toUpperCase()}</p>
            <p>N'oubliez pas d'apporter votre passeport lors de votre voyage.</p>
            <p style="margin-top: 30px;">Bon voyage!<br>L'équipe Voyage</p>
          </div>
        `,
        attachments: [
          {
            filename: `billet-${bookingId.substring(0, 8)}.html`,
            content: htmlBase64,
          }
        ]
      });
      console.log('Email sent successfully');
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Continue même si l'email échoue
    }

    return new Response(
      JSON.stringify({
        success: true,
        ticket: {
          bookingId: bookingId,
          html: ticketHtml,
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
