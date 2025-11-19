import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingPDFRequest {
  bookingId: string;
}

const generateQRCodeSVG = async (data: string): Promise<string> => {
  const QRCode = await import("https://esm.sh/qrcode@1.5.3");
  return await QRCode.toString(data, { type: "svg", width: 200 });
};

const generatePDFHTML = (booking: any, qrCodeSvg: string): string => {
  const startDate = new Date(booking.start_date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const endDate = booking.end_date
    ? new Date(booking.end_date).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            color: #333;
            padding: 40px;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #667eea;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
          }
          .subtitle {
            color: #666;
            font-size: 14px;
          }
          .booking-info {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
          }
          .booking-id {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .service-name {
            font-size: 20px;
            opacity: 0.9;
          }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          .detail-card {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
          }
          .detail-label {
            font-size: 12px;
            color: #667eea;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 8px;
          }
          .detail-value {
            font-size: 16px;
            font-weight: 600;
            color: #333;
          }
          .qr-section {
            text-align: center;
            padding: 30px;
            background: #f9f9f9;
            border-radius: 12px;
            margin-bottom: 30px;
          }
          .qr-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #667eea;
          }
          .qr-code {
            display: inline-block;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .footer {
            text-align: center;
            padding-top: 30px;
            border-top: 2px solid #eee;
            color: #666;
            font-size: 12px;
          }
          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            margin-top: 10px;
          }
          .status-confirmed {
            background: #10b981;
            color: white;
          }
          .status-pending {
            background: #f59e0b;
            color: white;
          }
          .status-completed {
            background: #3b82f6;
            color: white;
          }
          .important-note {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .important-note strong {
            color: #856404;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🌍 B-Reserve</div>
          <div class="subtitle">Votre réservation de voyage</div>
        </div>

        <div class="booking-info">
          <div class="booking-id">Réservation #${booking.id.substring(0, 8).toUpperCase()}</div>
          <div class="service-name">${booking.services.name}</div>
          <span class="status-badge status-${booking.status}">
            ${booking.status === "confirmed" ? "Confirmée" : booking.status === "pending" ? "En attente" : booking.status === "completed" ? "Terminée" : "Annulée"}
          </span>
        </div>

        <div class="details-grid">
          <div class="detail-card">
            <div class="detail-label">👤 Voyageur</div>
            <div class="detail-value">${booking.customer_name}</div>
          </div>
          
          <div class="detail-card">
            <div class="detail-label">📧 Email</div>
            <div class="detail-value">${booking.customer_email}</div>
          </div>

          <div class="detail-card">
            <div class="detail-label">📱 Téléphone</div>
            <div class="detail-value">${booking.customer_phone}</div>
          </div>

          <div class="detail-card">
            <div class="detail-label">👥 Nombre de voyageurs</div>
            <div class="detail-value">${booking.guests} personne${booking.guests > 1 ? "s" : ""}</div>
          </div>

          <div class="detail-card">
            <div class="detail-label">📍 Destination</div>
            <div class="detail-value">${booking.services.location}</div>
          </div>

          <div class="detail-card">
            <div class="detail-label">📅 Date de début</div>
            <div class="detail-value">${startDate}</div>
          </div>

          ${endDate ? `
            <div class="detail-card">
              <div class="detail-label">📅 Date de fin</div>
              <div class="detail-value">${endDate}</div>
            </div>
          ` : ""}

          <div class="detail-card">
            <div class="detail-label">💳 Montant total</div>
            <div class="detail-value">${Number(booking.total_price).toLocaleString()} ${booking.currency}</div>
          </div>

          <div class="detail-card">
            <div class="detail-label">💰 Statut paiement</div>
            <div class="detail-value">
              ${booking.payment_status === "paid" ? "✅ Payé" : booking.payment_status === "pending" ? "⏳ En attente" : "❌ Échec"}
            </div>
          </div>

          <div class="detail-card">
            <div class="detail-label">🎫 Type de service</div>
            <div class="detail-value">${booking.services.type}</div>
          </div>
        </div>

        ${booking.notes ? `
          <div class="important-note">
            <strong>📝 Notes importantes :</strong><br>
            ${booking.notes}
          </div>
        ` : ""}

        <div class="qr-section">
          <div class="qr-title">🔍 Code QR de votre réservation</div>
          <div class="qr-code">
            ${qrCodeSvg}
          </div>
          <p style="margin-top: 15px; color: #666; font-size: 14px;">
            Scannez ce code pour accéder rapidement aux détails de votre réservation
          </p>
        </div>

        <div class="important-note">
          <strong>ℹ️ Informations importantes :</strong><br>
          • Présentez ce document lors de votre arrivée<br>
          • Vérifiez vos documents de voyage avant le départ<br>
          • Arrivez au moins 2 heures avant l'heure prévue<br>
          • Contactez notre support en cas de question : support@bossiz.com
        </div>

        <div class="footer">
          <p><strong>B-Reserve</strong> - Votre partenaire voyage de confiance</p>
          <p>Email : reservations@bossiz.com | Téléphone : +225 XX XX XX XX XX</p>
          <p style="margin-top: 10px;">© 2025 B-Reserve. Tous droits réservés.</p>
        </div>
      </body>
    </html>
  `;
};

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

    const { bookingId }: BookingPDFRequest = await req.json();

    console.log("Generating PDF for booking:", bookingId);

    // Fetch booking details
    const { data: booking, error } = await supabase
      .from("bookings")
      .select(`
        *,
        services (
          name,
          type,
          location
        )
      `)
      .eq("id", bookingId)
      .single();

    if (error || !booking) {
      throw new Error("Booking not found");
    }

    // Generate QR code with booking info
    const qrData = JSON.stringify({
      id: booking.id,
      customer: booking.customer_name,
      service: booking.services.name,
      date: booking.start_date,
      ref: booking.id.substring(0, 8).toUpperCase(),
    });

    const qrCodeSvg = await generateQRCodeSVG(qrData);
    const pdfHTML = generatePDFHTML(booking, qrCodeSvg);

    return new Response(
      JSON.stringify({
        success: true,
        html: pdfHTML,
        bookingRef: booking.id.substring(0, 8).toUpperCase(),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error generating booking PDF:", error);
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
