import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode } from "https://deno.land/std@0.208.0/encoding/base64.ts";
import { generateQRCodeSVG, generateTicketHTML } from "./_utils.ts";

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
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FlightConfirmationRequest {
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  bookingId: string;
  flight: {
    airline: string;
    from: string;
    to: string;
    departure: string;
    arrival: string;
    class: string;
  };
  departureDate: string;
  returnDate?: string;
  passengers: number;
  totalPrice: number;
  passportNumber: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  tripType: string;
  currency: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      customerEmail,
      customerName,
      customerPhone,
      bookingId,
      flight,
      departureDate,
      returnDate,
      passengers,
      totalPrice,
      passportNumber,
      passportIssueDate,
      passportExpiryDate,
      tripType,
      currency,
    }: FlightConfirmationRequest = await req.json();

    console.log("Sending flight confirmation to:", customerEmail);

    // Generate QR code data
    const qrData = {
      bookingId,
      passenger: customerName,
      from: flight.from,
      to: flight.to,
      date: departureDate,
      flight: flight.airline,
    };
    const qrDataString = JSON.stringify(qrData);
    const qrCodeSvg = await generateQRCodeSVG(qrDataString);

    const formattedDepartureDate = new Date(departureDate).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const formattedReturnDate = returnDate 
      ? new Date(returnDate).toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : null;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .section {
              background: white;
              padding: 20px;
              margin: 20px 0;
              border-radius: 8px;
              border-left: 4px solid #667eea;
            }
            .section-title {
              color: #667eea;
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 15px;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
            .detail-label {
              color: #666;
              font-weight: 500;
            }
            .detail-value {
              color: #333;
              font-weight: 600;
            }
            .route {
              font-size: 24px;
              font-weight: bold;
              color: #667eea;
              text-align: center;
              margin: 20px 0;
            }
            .total-price {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              margin: 20px 0;
            }
            .total-price .amount {
              font-size: 32px;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 12px;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>✈️ Confirmation de réservation</h1>
            <p>Référence: ${bookingId.substring(0, 8).toUpperCase()}</p>
          </div>
          
          <div class="content">
            <p>Bonjour <strong>${customerName}</strong>,</p>
            <p>Nous avons bien reçu votre réservation de vol. Voici le récapitulatif de votre voyage :</p>
            
            <div class="section">
              <div class="section-title">📋 Détails du vol</div>
              <div class="route">${flight.from} → ${flight.to}</div>
              <div class="detail-row">
                <span class="detail-label">Compagnie aérienne</span>
                <span class="detail-value">${flight.airline}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Classe</span>
                <span class="detail-value">${flight.class}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Type de vol</span>
                <span class="detail-value">${tripType}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">📅 Dates et horaires</div>
              <div class="detail-row">
                <span class="detail-label">Départ</span>
                <span class="detail-value">${formattedDepartureDate} à ${flight.departure}</span>
              </div>
              ${formattedReturnDate ? `
              <div class="detail-row">
                <span class="detail-label">Retour</span>
                <span class="detail-value">${formattedReturnDate} à ${flight.arrival}</span>
              </div>
              ` : ''}
            </div>

            <div class="section">
              <div class="section-title">👥 Informations passagers</div>
              <div class="detail-row">
                <span class="detail-label">Nombre de passagers</span>
                <span class="detail-value">${passengers}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Nom</span>
                <span class="detail-value">${customerName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Passeport N°</span>
                <span class="detail-value">${passportNumber}</span>
              </div>
            </div>

            <div class="total-price">
              <p style="margin: 0; font-size: 16px;">Montant total</p>
              <div class="amount">${totalPrice.toLocaleString()} FCFA</div>
              <p style="margin: 10px 0 0 0; font-size: 14px;">pour ${passengers} passager${passengers > 1 ? 's' : ''}</p>
            </div>

            <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <strong>⚠️ Important :</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Présentez-vous à l'aéroport au moins 2 heures avant le départ</li>
                <li>Vérifiez la validité de votre passeport</li>
                <li>Conservez ce mail comme preuve de réservation</li>
              </ul>
            </div>

            <p>Pour finaliser votre réservation, veuillez procéder au paiement.</p>
            <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>

            <div class="footer">
              <p>Merci d'avoir choisi nos services !</p>
              <p>Cet email est un récapitulatif automatique de votre réservation.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Generate ticket PDF HTML
    const ticketHtml = generateTicketHTML({
      customerName,
      customerEmail,
      customerPhone,
      bookingId,
      flight,
      departureDate,
      returnDate,
      passengers,
      totalPrice,
      passportNumber,
      passportIssueDate,
      passportExpiryDate,
      currency,
      qrCodeSvg,
    });

    const ticketBase64 = encode(new TextEncoder().encode(ticketHtml).buffer);

    const emailResponse = await smtpClient.send({
      from: "B-Reserve Réservations <notifications@bossiz.com>",
      to: customerEmail,
      subject: `✈️ Confirmation de vol ${flight.from} → ${flight.to}`,
      html: emailHtml,
      attachments: [
        {
          filename: `billet-vol-${bookingId.substring(0, 8)}.html`,
          content: ticketBase64,
          encoding: "base64",
          contentType: "text/html",
        },
      ],
    });

    console.log("Email sent successfully via SMTP with ticket attachment");

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending flight confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
