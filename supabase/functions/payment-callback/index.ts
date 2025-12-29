import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ============================================================
// EDGE FUNCTION: payment-callback
// Description: Gère les callbacks de paiement CinetPay
// Auteur: B-Reserve
// Version: 2.0.0 - Production Ready
// ============================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fonction utilitaire pour créer une réponse JSON
function jsonResponse(data: object, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Fonction utilitaire pour créer une réponse d'erreur
function errorResponse(message: string, status: number = 400): Response {
  console.error(`❌ Callback Error [${status}]: ${message}`);
  return jsonResponse({
    success: false,
    error: message,
    code: status,
  }, status);
}

serve(async (req) => {
  // Gestion des requêtes CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║            PAYMENT CALLBACK - CINETPAY                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`📅 Timestamp: ${new Date().toISOString()}`);
  console.log(`📝 Method: ${req.method}`);

  try {
    // ================================================================
    // ÉTAPE 1: Parsing des données du callback
    // ================================================================
    console.log('\n📋 Étape 1: Parsing des données du callback...');
    
    let requestData: any;
    
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error('❌ Impossible de parser le body JSON');
      return errorResponse('Corps de requête invalide', 400);
    }
    
    console.log('   - cpm_trans_id:', requestData.cpm_trans_id ? '✓' : '✗');
    console.log('   - cpm_site_id:', requestData.cpm_site_id ? '✓' : '✗');

    const { cpm_trans_id, cpm_site_id } = requestData;

    if (!cpm_trans_id) {
      return errorResponse('ID de transaction manquant', 400);
    }

    if (!cpm_site_id) {
      return errorResponse('ID du site manquant', 400);
    }

    // ================================================================
    // ÉTAPE 2: Vérification des credentials
    // ================================================================
    console.log('\n📋 Étape 2: Vérification des credentials...');
    
    const cinetpayApiKey = Deno.env.get('CINETPAY_API_KEY');
    const cinetpaySiteId = Deno.env.get('CINETPAY_SITE_ID');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!cinetpayApiKey || !cinetpaySiteId) {
      console.error('❌ Credentials CinetPay manquants');
      return errorResponse('Configuration passerelle de paiement incomplète', 500);
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Configuration Supabase manquante');
      return errorResponse('Configuration serveur incomplète', 500);
    }

    // Vérifier que le site_id correspond
    if (cpm_site_id !== cinetpaySiteId) {
      console.error('❌ Site ID ne correspond pas');
      console.error('   - Reçu:', cpm_site_id);
      console.error('   - Attendu:', cinetpaySiteId);
      return errorResponse('Site ID invalide', 403);
    }

    console.log('✅ Credentials vérifiés');

    // ================================================================
    // ÉTAPE 3: Initialisation Supabase
    // ================================================================
    console.log('\n📋 Étape 3: Initialisation Supabase...');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('✅ Client Supabase initialisé');

    // ================================================================
    // ÉTAPE 4: Vérification idempotence
    // ================================================================
    console.log('\n📋 Étape 4: Vérification idempotence...');
    
    const { data: existingPayment, error: fetchError } = await supabase
      .from('payments')
      .select('id, status, transaction_id, booking_id')
      .eq('transaction_id', cpm_trans_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Erreur de récupération du paiement:', fetchError.message);
    }

    if (existingPayment?.status === 'completed') {
      console.log('⚠️ Paiement déjà traité, ignoré');
      return jsonResponse({
        success: true,
        message: 'Paiement déjà traité',
        status: 'completed',
      });
    }

    console.log('   - Paiement existant:', existingPayment ? '✓' : '✗');

    // ================================================================
    // ÉTAPE 5: Vérification du statut auprès de CinetPay
    // ================================================================
    console.log('\n📋 Étape 5: Vérification du statut auprès de CinetPay...');
    
    let verifyData: any;
    
    try {
      const verifyResponse = await fetch('https://api-checkout.cinetpay.com/v2/payment/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          apikey: cinetpayApiKey,
          site_id: cinetpaySiteId,
          transaction_id: cpm_trans_id,
        }),
      });

      console.log('   - HTTP Status:', verifyResponse.status);
      
      const responseText = await verifyResponse.text();
      
      try {
        verifyData = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('❌ Réponse CinetPay non-JSON');
        return errorResponse('Réponse invalide de CinetPay', 502);
      }
      
    } catch (fetchError) {
      console.error('❌ Erreur réseau lors de la vérification:', fetchError);
      return errorResponse('Impossible de vérifier le paiement', 503);
    }

    console.log('   - Verify Code:', verifyData.code);
    console.log('   - Status:', verifyData.data?.status || 'N/A');

    // ================================================================
    // ÉTAPE 6: Traitement du résultat
    // ================================================================
    console.log('\n📋 Étape 6: Traitement du résultat...');
    
    // Code '00' = vérification réussie
    if (verifyData.code !== '00') {
      console.error('❌ Vérification échouée, code:', verifyData.code);
      
      // Mettre à jour le paiement comme échoué si existant
      if (existingPayment) {
        await supabase
          .from('payments')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('transaction_id', cpm_trans_id);
      }
      
      return jsonResponse({
        success: false,
        error: 'Vérification du paiement échouée',
        code: verifyData.code,
      }, 400);
    }

    const paymentStatus = verifyData.data?.status;
    console.log('   - Statut du paiement:', paymentStatus);
    
    // Extraire le booking_id des métadonnées
    let bookingId: string | null = null;
    
    if (verifyData.data?.metadata) {
      try {
        const metadata = JSON.parse(verifyData.data.metadata);
        bookingId = metadata.booking_id || null;
      } catch (e) {
        console.warn('⚠️ Impossible de parser les métadonnées');
      }
    }
    
    // Fallback: utiliser le booking_id du paiement existant
    if (!bookingId && existingPayment?.booking_id) {
      bookingId = existingPayment.booking_id;
    }

    console.log('   - Booking ID:', bookingId || 'Non trouvé');

    // ================================================================
    // ÉTAPE 7: Mise à jour du paiement
    // ================================================================
    console.log('\n📋 Étape 7: Mise à jour du paiement...');
    
    const isAccepted = paymentStatus === 'ACCEPTED';
    const newStatus = isAccepted ? 'completed' : 'failed';
    
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: newStatus,
        payment_data: {
          verification_code: verifyData.code,
          payment_status: paymentStatus,
          verified_at: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      })
      .eq('transaction_id', cpm_trans_id);

    if (updateError) {
      console.error('❌ Erreur mise à jour paiement:', updateError.message);
    } else {
      console.log('✅ Paiement mis à jour:', newStatus);
    }

    // ================================================================
    // ÉTAPE 8: Actions post-paiement (si accepté)
    // ================================================================
    if (isAccepted && bookingId) {
      console.log('\n📋 Étape 8: Actions post-paiement...');
      
      // Mise à jour de la réservation
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({
          payment_status: 'paid',
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      if (bookingError) {
        console.error('❌ Erreur mise à jour réservation:', bookingError.message);
      } else {
        console.log('✅ Réservation confirmée');
      }

      // Envoi de l'email de confirmation (async, non bloquant)
      try {
        console.log('   - Déclenchement email de confirmation...');
        fetch(`${supabaseUrl}/functions/v1/send-booking-confirmation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ bookingId }),
        }).catch(e => console.warn('⚠️ Email non envoyé:', e.message));
      } catch (emailError) {
        console.warn('⚠️ Erreur déclenchement email');
      }

      // Génération de la facture (async, non bloquant)
      try {
        console.log('   - Déclenchement génération facture...');
        supabase.functions.invoke('generate-invoice', {
          body: { bookingId }
        }).catch(e => console.warn('⚠️ Facture non générée'));
      } catch (invoiceError) {
        console.warn('⚠️ Erreur génération facture');
      }

      // Création PNR (async, non bloquant)
      try {
        console.log('   - Déclenchement création PNR...');
        fetch(`${supabaseUrl}/functions/v1/create-pnr`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ booking_id: bookingId }),
        }).catch(e => console.warn('⚠️ PNR non créé'));
      } catch (pnrError) {
        console.warn('⚠️ Erreur création PNR');
      }
    }

    // ================================================================
    // SUCCÈS FINAL
    // ================================================================
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    ✅ CALLBACK TRAITÉ                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');

    return jsonResponse({
      success: true,
      status: paymentStatus,
      booking_id: bookingId,
      processed: true,
    });

  } catch (error) {
    // ================================================================
    // GESTION DES ERREURS NON CATCHÉES
    // ================================================================
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    ❌ ERREUR CALLBACK                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    const errorType = error instanceof Error ? error.constructor.name : 'UnknownError';
    
    console.error('Type:', errorType);
    console.error('Message:', errorMessage);
    console.log('');

    return jsonResponse({
      success: false,
      error: 'Erreur lors du traitement du callback',
      code: 500,
    }, 500);
  }
});
