import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingConfirmationRequest {
  bookingId: string;
}

const getServiceTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    flight: "Vol",
    hotel: "Hôtel",
    car: "Location de voiture",
    tour: "Circuit touristique",
    event: "Événement",
    flight_hotel: "Vol + Hôtel",
    stay: "Séjour",
    activity: "Activité",
    train: "Train",
  };
  return labels[type] || type;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatPrice = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' ' + currency;
};

const generateEmailHTML = (booking: any, service: any, passengers: any[]): string => {
  const bookingRef = booking.id.substring(0, 8).toUpperCase();
  const serviceType = getServiceTypeLabel(service?.type || 'service');
  
  const passengersHTML = passengers.map((p, i) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${i + 1}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${p.first_name} ${p.last_name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${p.document_number || '-'}</td>
    </tr>
  `).join('');

  const bookingDetails = booking.booking_details || {};
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmation de réservation</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Réservation Confirmée</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Merci pour votre confiance !</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Booking Reference -->
          <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #f6f8fb 0%, #e9ecf1 100%); border-radius: 8px;">
            <p style="margin: 0; color: #666; font-size: 14px;">Référence de réservation</p>
            <p style="margin: 5px 0 0 0; font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 2px;">${bookingRef}</p>
          </div>

          <p style="font-size: 16px;">Bonjour <strong>${booking.customer_name}</strong>,</p>
          <p style="font-size: 15px; color: #555;">Votre réservation a été confirmée avec succès. Voici le récapitulatif de votre ${serviceType.toLowerCase()} :</p>

          <!-- Service Details -->
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea;">
            <h3 style="margin: 0 0 15px 0; color: #667eea; font-size: 18px;">📋 Détails du service</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Type de service</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${serviceType}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Service</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${service?.name || bookingDetails.serviceName || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Lieu</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${service?.location || bookingDetails.location || 'N/A'}</td>
              </tr>
            </table>
          </div>

          <!-- Dates -->
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981;">
            <h3 style="margin: 0 0 15px 0; color: #10b981; font-size: 18px;">📅 Dates</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Date de début</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${formatDate(booking.start_date)}</td>
              </tr>
              ${booking.end_date && booking.end_date !== booking.start_date ? `
              <tr>
                <td style="padding: 8px 0; color: #666;">Date de fin</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${formatDate(booking.end_date)}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <!-- Passengers -->
          ${passengers.length > 0 ? `
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
            <h3 style="margin: 0 0 15px 0; color: #f59e0b; font-size: 18px;">👥 Voyageurs (${passengers.length})</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #eee;">
                  <th style="padding: 10px 8px; text-align: left; font-size: 13px;">#</th>
                  <th style="padding: 10px 8px; text-align: left; font-size: 13px;">Nom complet</th>
                  <th style="padding: 10px 8px; text-align: left; font-size: 13px;">Document</th>
                </tr>
              </thead>
              <tbody>
                ${passengersHTML}
              </tbody>
            </table>
          </div>
          ` : ''}

          <!-- Price -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 8px; text-align: center; margin: 25px 0;">
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">Montant total payé</p>
            <p style="margin: 10px 0 0 0; font-size: 36px; font-weight: bold;">${formatPrice(booking.total_price, booking.currency)}</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">pour ${booking.guests} voyageur${booking.guests > 1 ? 's' : ''}</p>
          </div>

          <!-- Contact Info -->
          <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h4 style="margin: 0 0 10px 0; color: #856404;">📞 Informations de contact</h4>
            <p style="margin: 5px 0; color: #856404;"><strong>Email:</strong> ${booking.customer_email}</p>
            <p style="margin: 5px 0; color: #856404;"><strong>Téléphone:</strong> ${booking.customer_phone}</p>
          </div>

          <!-- Important Notes -->
          <div style="background: #e8f4fd; border: 1px solid #0284c7; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h4 style="margin: 0 0 10px 0; color: #0369a1;">💡 Informations importantes</h4>
            <ul style="margin: 10px 0; padding-left: 20px; color: #0369a1;">
              <li>Conservez cet email comme preuve de réservation</li>
              <li>Présentez votre référence de réservation le jour du service</li>
              <li>Arrivez avec une pièce d'identité valide</li>
              <li>Pour toute modification, contactez-nous au moins 48h à l'avance</li>
            </ul>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #888; font-size: 14px; margin: 0;">Merci d'avoir choisi nos services !</p>
            <p style="color: #888; font-size: 12px; margin: 10px 0 0 0;">
              © ${new Date().getFullYear()} B-Reserve. Tous droits réservés.
            </p>
          </div>
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
    const { bookingId }: BookingConfirmationRequest = await req.json();

    if (!bookingId) {
      throw new Error("Booking ID is required");
    }

    console.log("Processing booking confirmation request");

    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Rate limiting: Check if confirmation was already sent recently
    const { data: existingBooking } = await supabase
      .from("bookings")
      .select("id, updated_at")
      .eq("id", bookingId)
      .single();

    if (existingBooking) {
      const lastUpdate = new Date(existingBooking.updated_at);
      const now = new Date();
      const timeDiff = now.getTime() - lastUpdate.getTime();
      // Prevent sending more than once per minute
      if (timeDiff < 60000) {
        console.log("Rate limit: confirmation email already sent recently");
        return new Response(
          JSON.stringify({
            success: true,
            message: "Confirmation already sent recently",
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Fetch booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      console.error("Booking not found:", bookingError);
      throw new Error("Booking not found");
    }

    // Fetch service details
    const { data: service } = await supabase
      .from("services")
      .select("*")
      .eq("id", booking.service_id)
      .single();

    // Fetch passengers
    const { data: passengers } = await supabase
      .from("passengers")
      .select("*")
      .eq("booking_id", bookingId);

    // Generate email HTML
    const emailHTML = generateEmailHTML(booking, service, passengers || []);

    // Send email
    const { error: emailError } = await resend.emails.send({
      from: "B-Reserve <notifications@bossiz.com>",
      to: [booking.customer_email],
      subject: `✅ Confirmation de réservation #${bookingId.substring(0, 8).toUpperCase()}`,
      html: emailHTML,
    });

    if (emailError) {
      console.error("Email sending error:", emailError);
      throw new Error("Failed to send confirmation email");
    }

    console.log("✅ Confirmation email sent successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Confirmation email sent successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("❌ Error in send-booking-confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
