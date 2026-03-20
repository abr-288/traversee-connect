import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

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

interface NewsletterRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: NewsletterRequest = await req.json();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Email invalide" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Check if email already exists
    const { data: existing } = await supabaseClient
      .from('newsletter_subscribers')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ message: "Vous êtes déjà inscrit à notre newsletter" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Insert new subscriber
    const { error: insertError } = await supabaseClient
      .from('newsletter_subscribers')
      .insert([{ email }]);

    if (insertError) throw insertError;

    // Send welcome email
    const welcomeHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .benefits { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
            .benefit-item { margin: 10px 0; padding-left: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Bienvenue chez B-Reserve !</h1>
            </div>
            <div class="content">
              <p>Merci de vous être inscrit à notre newsletter !</p>
              <p>Vous recevrez désormais :</p>
              <div class="benefits">
                <div class="benefit-item">✈️ Les meilleures offres de vols</div>
                <div class="benefit-item">🏨 Des promotions exclusives sur les hôtels</div>
                <div class="benefit-item">🚗 Des réductions sur la location de voitures</div>
                <div class="benefit-item">🎫 Des offres spéciales sur les événements</div>
              </div>
              <p>À très bientôt pour de nouvelles aventures !</p>
              <p>Cordialement,<br>L'équipe B-Reserve</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await smtpClient.send({
      from: "B-Reserve <noreply@bossiz.com>",
      to: email,
      subject: "Bienvenue chez B-Reserve ! 🎉",
      html: welcomeHtml,
    });

    console.log("Newsletter subscription successful");

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Merci de vous être inscrit à notre newsletter !" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in newsletter-subscribe function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Une erreur est survenue" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
