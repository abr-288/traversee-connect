import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscriptionConfirmationRequest {
  subscriptionRequestId: string;
  planName: string;
  planPrice: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: string;
  transactionId: string;
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getPaymentMethodLabel = (method: string): string => {
  const labels: Record<string, string> = {
    wave: "Wave",
    mobile_money: "Mobile Money",
    card: "Carte bancaire",
    bank_transfer: "Virement bancaire",
  };
  return labels[method] || method;
};

const generateEmailHTML = (data: SubscriptionConfirmationRequest): string => {
  const subscriptionRef = data.subscriptionRequestId.substring(0, 8).toUpperCase();
  const paymentDate = formatDate(new Date());
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmation d'abonnement</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Abonnement Activé</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Bienvenue dans la famille B-Reserve !</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Subscription Reference -->
          <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 8px; border: 2px solid #10b981;">
            <p style="margin: 0; color: #166534; font-size: 14px;">Référence d'abonnement</p>
            <p style="margin: 5px 0 0 0; font-size: 32px; font-weight: bold; color: #10b981; letter-spacing: 2px;">${subscriptionRef}</p>
          </div>

          <p style="font-size: 16px;">Bonjour <strong>${data.customerName}</strong>,</p>
          <p style="font-size: 15px; color: #555;">Votre abonnement a été activé avec succès ! Voici le récapitulatif de votre souscription :</p>

          <!-- Plan Details -->
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981;">
            <h3 style="margin: 0 0 15px 0; color: #10b981; font-size: 18px;">📋 Détails de l'abonnement</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Plan souscrit</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${data.planName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Montant payé</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #10b981;">${data.planPrice}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Mode de paiement</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${getPaymentMethodLabel(data.paymentMethod)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Date d'activation</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${paymentDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">ID Transaction</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600; font-size: 12px;">${data.transactionId}</td>
              </tr>
            </table>
          </div>

          <!-- Contact Info -->
          <div style="background: #f0fdf4; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h4 style="margin: 0 0 10px 0; color: #166534;">📞 Vos informations de contact</h4>
            <p style="margin: 5px 0; color: #166534;"><strong>Nom:</strong> ${data.customerName}</p>
            <p style="margin: 5px 0; color: #166534;"><strong>Email:</strong> ${data.customerEmail}</p>
            <p style="margin: 5px 0; color: #166534;"><strong>Téléphone:</strong> ${data.customerPhone}</p>
          </div>

          <!-- What's Next -->
          <div style="background: #eff6ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h4 style="margin: 0 0 10px 0; color: #1d4ed8;">🚀 Prochaines étapes</h4>
            <ul style="margin: 10px 0; padding-left: 20px; color: #1d4ed8;">
              <li>Notre équipe va vous contacter dans les 24h pour finaliser l'activation de vos services</li>
              <li>Vous recevrez un accès à votre espace client dédié</li>
              <li>Un conseiller personnel vous sera attribué</li>
              <li>Profitez de tous les avantages de votre abonnement ${data.planName}</li>
            </ul>
          </div>

          <!-- Support -->
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h4 style="margin: 0 0 10px 0; color: #b45309;">💬 Besoin d'aide ?</h4>
            <p style="margin: 5px 0; color: #b45309;">Notre équipe support est disponible 24/7 pour vous accompagner :</p>
            <p style="margin: 5px 0; color: #b45309;"><strong>Email:</strong> support@b-reserve.com</p>
            <p style="margin: 5px 0; color: #b45309;"><strong>Téléphone:</strong> +225 XX XX XX XX</p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #10b981; font-size: 16px; margin: 0; font-weight: 600;">Merci de votre confiance !</p>
            <p style="color: #888; font-size: 14px; margin: 10px 0;">Bienvenue parmi nos membres premium.</p>
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
    const data: SubscriptionConfirmationRequest = await req.json();

    console.log("📧 Processing subscription confirmation email...");
    console.log("   - Subscription ID:", data.subscriptionRequestId);
    console.log("   - Plan:", data.planName);
    console.log("   - Customer:", data.customerEmail);

    if (!data.subscriptionRequestId || !data.customerEmail) {
      throw new Error("Missing required fields: subscriptionRequestId and customerEmail");
    }

    // Generate email HTML
    const emailHTML = generateEmailHTML(data);

    // Send email
    const { error: emailError } = await resend.emails.send({
      from: "B-Reserve <notifications@bossiz.com>",
      to: [data.customerEmail],
      subject: `✅ Abonnement ${data.planName} activé - Bienvenue chez B-Reserve !`,
      html: emailHTML,
    });

    if (emailError) {
      console.error("❌ Email sending error:", emailError);
      throw new Error("Failed to send confirmation email");
    }

    console.log("✅ Subscription confirmation email sent successfully");

    // Initialize Supabase client to update subscription request status
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Update subscription request status
    const { error: updateError } = await supabase
      .from("subscription_requests")
      .update({
        status: "confirmed",
        notes: `Paiement confirmé le ${new Date().toISOString()}. Transaction: ${data.transactionId}`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.subscriptionRequestId);

    if (updateError) {
      console.warn("⚠️ Could not update subscription request:", updateError.message);
    } else {
      console.log("✅ Subscription request status updated to confirmed");
    }

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
    console.error("❌ Error in send-subscription-confirmation:", error);
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
