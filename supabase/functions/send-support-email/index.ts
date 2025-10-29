import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { validateSupportMessage, sanitizeString } from "../_shared/validation.ts";

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

    // Log the support message (in production, integrate with email service)
    console.log(`
      New support message:
      Name: ${sanitizedData.name}
      Email: ${sanitizedData.email}
      Booking Reference: ${sanitizedData.bookingReference || 'N/A'}
      Subject: ${sanitizedData.subject}
      Message: ${sanitizedData.message}
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
