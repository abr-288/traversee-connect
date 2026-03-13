import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ContactMessageRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function sanitize(str: string, maxLength: number): string {
  return escapeHtml(str.trim().slice(0, maxLength));
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name, email, phone, subject, message }: ContactMessageRequest = await req.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      throw new Error("Missing required fields");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // Sanitize and escape all user inputs
    const safeName = sanitize(name, 100);
    const safeEmail = sanitize(email, 255);
    const safePhone = phone ? sanitize(phone, 20) : null;
    const safeSubject = sanitize(subject, 200);
    const safeMessage = sanitize(message, 2000);

    console.log("Sending contact message");

    const emailResponse = await resend.emails.send({
      from: "B-Reserve Contact <onboarding@resend.dev>",
      to: ["katersoro@gmail.com"],
      reply_to: email,
      subject: `[B-Reserve Contact] ${safeSubject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0c4a6e, #1e40af); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #0c4a6e; }
            .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; border-left: 3px solid #0c4a6e; }
            .message-box { white-space: pre-wrap; }
            .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">📧 Nouveau message de contact</h1>
              <p style="margin: 5px 0 0;">B-Reserve - Voyages & Réservations</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">👤 Nom</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">📧 Email</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              ${phone ? `
              <div class="field">
                <div class="label">📞 Téléphone</div>
                <div class="value"><a href="tel:${phone}">${phone}</a></div>
              </div>
              ` : ""}
              <div class="field">
                <div class="label">📝 Sujet</div>
                <div class="value">${subject}</div>
              </div>
              <div class="field">
                <div class="label">💬 Message</div>
                <div class="value message-box">${message}</div>
              </div>
            </div>
            <div class="footer">
              <p>Ce message a été envoyé depuis le formulaire de contact B-Reserve.</p>
              <p>Vous pouvez répondre directement à cet email pour contacter l'expéditeur.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Contact message sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-message function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
