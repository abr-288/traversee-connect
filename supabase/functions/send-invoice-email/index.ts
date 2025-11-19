import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

interface InvoiceRequest {
  bookingId: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  paymentMethod: string;
  invoiceNumber: string;
  invoiceDate: string;
}

const generateInvoiceHTML = (data: InvoiceRequest): string => {
  const itemsHTML = data.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.description}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${item.unitPrice.toLocaleString()} ${data.currency}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${item.total.toLocaleString()} ${data.currency}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .invoice-details {
            display: flex;
            justify-content: space-between;
            padding: 30px;
            background: #f9f9f9;
          }
          .detail-box {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .detail-label {
            font-size: 12px;
            color: #667eea;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .detail-value {
            font-size: 16px;
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
          }
          th {
            background: #667eea;
            color: white;
            padding: 15px;
            text-align: left;
          }
          .totals {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #ddd;
          }
          .total-row.final {
            font-size: 20px;
            font-weight: bold;
            color: #667eea;
            border-bottom: none;
            padding-top: 20px;
          }
          .footer {
            text-align: center;
            padding: 30px;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🧾 FACTURE</h1>
          <p style="font-size: 18px; margin: 10px 0;">B-Reserve</p>
        </div>

        <div class="invoice-details">
          <div class="detail-box">
            <div class="detail-label">Numéro de facture</div>
            <div class="detail-value">${data.invoiceNumber}</div>
          </div>
          <div class="detail-box">
            <div class="detail-label">Date</div>
            <div class="detail-value">${new Date(data.invoiceDate).toLocaleDateString('fr-FR')}</div>
          </div>
          <div class="detail-box">
            <div class="detail-label">Réservation</div>
            <div class="detail-value">${data.bookingId}</div>
          </div>
        </div>

        <div style="padding: 30px; background: white;">
          <div style="margin-bottom: 30px;">
            <h3 style="color: #667eea; margin-bottom: 10px;">Client</h3>
            <p style="margin: 5px 0;"><strong>${data.customerName}</strong></p>
            <p style="margin: 5px 0;">📧 ${data.customerEmail}</p>
            <p style="margin: 5px 0;">📱 ${data.customerPhone}</p>
          </div>

          <h3 style="color: #667eea; margin-bottom: 15px;">Détails de la réservation</h3>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: center;">Quantité</th>
                <th style="text-align: right;">Prix unitaire</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
        </div>

        <div class="totals">
          <div class="total-row">
            <span>Sous-total</span>
            <span>${data.subtotal.toLocaleString()} ${data.currency}</span>
          </div>
          <div class="total-row">
            <span>TVA / Taxes</span>
            <span>${data.tax.toLocaleString()} ${data.currency}</span>
          </div>
          <div class="total-row final">
            <span>TOTAL</span>
            <span>${data.total.toLocaleString()} ${data.currency}</span>
          </div>
          <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px;">
            <strong>Mode de paiement :</strong> ${data.paymentMethod}
          </div>
        </div>

        <div class="footer">
          <p><strong>B-Reserve</strong></p>
          <p>Votre partenaire de confiance pour tous vos voyages</p>
          <p>📧 factures@bossiz.com | 📱 +225 XX XX XX XX XX</p>
          <p style="margin-top: 20px; font-size: 12px; color: #999;">
            Cette facture a été générée automatiquement. Pour toute question, contactez notre service client.
          </p>
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

    const invoiceData: InvoiceRequest = await req.json();

    console.log("Generating invoice for booking:", invoiceData.bookingId);

    const invoiceHTML = generateInvoiceHTML(invoiceData);

    // Send invoice email via SMTP
    await smtpClient.send({
      from: "B-Reserve Facturation <factures@bossiz.com>",
      to: invoiceData.customerEmail,
      subject: `Facture ${invoiceData.invoiceNumber} - B-Reserve`,
      html: invoiceHTML,
    });

    console.log("Invoice email sent successfully via SMTP");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Facture envoyée avec succès",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-invoice-email function:", error);
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
