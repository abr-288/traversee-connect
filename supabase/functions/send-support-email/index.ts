import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

    console.log("Support message received:", { name, email, subject, bookingReference });

    // Log the support message (in production, integrate with email service)
    console.log(`
      New support message:
      Name: ${name}
      Email: ${email}
      Booking Reference: ${bookingReference || 'N/A'}
      Subject: ${subject}
      Message: ${message}
    `);

    console.log("Support email logged successfully");

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
