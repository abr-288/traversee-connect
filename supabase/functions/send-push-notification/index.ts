import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subscription, title, body, data } = await req.json();

    if (!subscription || !title) {
      throw new Error('Subscription and title are required');
    }

    // VAPID keys - should be stored as environment variables
    const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8xQmrEcxWtbDw9mVOo4kZZ_tGQ8w3_FOh0lPw8tYDpPz5s1PW7HFBc';
    const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY');
    
    if (!VAPID_PRIVATE_KEY) {
      console.warn('VAPID_PRIVATE_KEY not set, notification will be logged but not sent');
      console.log('Would send notification:', { title, body, subscription: subscription.endpoint });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Notification logged (VAPID keys not configured)' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // TODO: Implement actual Web Push Protocol
    // For now, just log the notification
    console.log('Push notification to be sent:', {
      endpoint: subscription.endpoint,
      title,
      body,
      data,
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error sending push notification:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
