import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

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
    const { name, email, bookingReference, subject, message }: SupportMessageRequest = await req.json();

    // Send email to support
    const emailResponse = await resend.emails.send({
      from: "Support Bossiz <info@bossiz.com>",
      to: ["support@bossiz.com"],
      replyTo: email,
      subject: `Support: ${subject}`,
      html: `
        <h2>Nouveau message de support</h2>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${bookingReference ? `<p><strong>Référence de réservation:</strong> ${bookingReference}</p>` : ''}
        <p><strong>Sujet:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    // Send confirmation to user
    await resend.emails.send({
      from: "Support Bossiz <info@bossiz.com>",
      to: [email],
      subject: "Message reçu - Support Bossiz",
      html: `
        <h2>Merci de nous avoir contactés, ${name}!</h2>
        <p>Nous avons bien reçu votre message concernant: <strong>${subject}</strong></p>
        <p>Notre équipe vous répondra dans les plus brefs délais.</p>
        <hr>
        <p><em>Votre message:</em></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <br>
        <p>Cordialement,<br>L'équipe Bossiz</p>
      `,
    });

    console.log("Support email sent successfully:", emailResponse);

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
