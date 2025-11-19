import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { validateSupportMessage, sanitizeString } from "../_shared/validation.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SupportMessageRequest {
  name: string;
  email: string;
  bookingReference?: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: SupportMessageRequest = await req.json();
    const { name, email, bookingReference, subject, message } = requestData;

    // Validate input
    const validationErrors = validateSupportMessage({
      name,
      email,
      subject,
      message,
      bookingReference,
    });

    if (validationErrors.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Validation failed",
          details: validationErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeString(name, 100),
      email: sanitizeString(email, 255),
      bookingReference: bookingReference ? sanitizeString(bookingReference, 50) : undefined,
      subject: sanitizeString(subject, 200),
      message: sanitizeString(message, 2000),
    };

    console.log("Support message received from:", sanitizedData.name, sanitizedData.email);

    // Send email to support team
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .field { margin: 15px 0; padding: 10px; background: white; border-radius: 5px; }
            .label { font-weight: bold; color: #667eea; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 Nouveau message du support</h1>
            </div>
            <div class="content">
              <div class="field">
                <span class="label">Nom :</span> ${sanitizedData.name}
              </div>
              <div class="field">
                <span class="label">Email :</span> ${sanitizedData.email}
              </div>
              ${sanitizedData.bookingReference ? `
                <div class="field">
                  <span class="label">Référence de réservation :</span> ${sanitizedData.bookingReference}
                </div>
              ` : ''}
              <div class="field">
                <span class="label">Sujet :</span> ${sanitizedData.subject}
              </div>
              <div class="field">
                <span class="label">Message :</span><br>
                ${sanitizedData.message.replace(/\n/g, '<br>')}
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send to support team
    await resend.emails.send({
      from: "B-Reserve Support <support@bossiz.com>",
      to: ["support@bossiz.com"],
      reply_to: sanitizedData.email,
      subject: `[Support] ${sanitizedData.subject}`,
      html: emailHtml,
    });

    // Send confirmation to customer
    const confirmationHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Message bien reçu</h1>
            </div>
            <div class="content">
              <p>Bonjour ${sanitizedData.name},</p>
              <p>Nous avons bien reçu votre message concernant : <strong>${sanitizedData.subject}</strong></p>
              <p>Notre équipe vous répondra dans les plus brefs délais.</p>
              ${sanitizedData.bookingReference ? `<p>Référence de réservation : <strong>${sanitizedData.bookingReference}</strong></p>` : ''}
              <p>Cordialement,<br>L'équipe B-Reserve</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: "B-Reserve Support <support@bossiz.com>",
      to: [sanitizedData.email],
      subject: "Confirmation de réception de votre message",
      html: confirmationHtml,
    });

    console.log("Support emails sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-support-email function:", error);
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
