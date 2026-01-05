import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ============================================================
// EDGE FUNCTION: process-payment
// Description: Initie un paiement via CinetPay
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
function errorResponse(message: string, status: number = 400, details?: string): Response {
  console.error(`❌ Error [${status}]: ${message}`);
  if (details) {
    console.error(`   Details: ${details}`);
  }
  return jsonResponse({
    success: false,
    error: message,
    code: status,
  }, status);
}

// Validation du montant
function validateAmount(amount: unknown): { valid: boolean; value: number; error?: string } {
  if (amount === undefined || amount === null) {
    return { valid: false, value: 0, error: "Le montant est requis" };
  }
  
  const numAmount = Number(amount);
  
  if (isNaN(numAmount)) {
    return { valid: false, value: 0, error: "Le montant doit être un nombre" };
  }
  
  if (numAmount <= 0) {
    return { valid: false, value: 0, error: "Le montant doit être supérieur à 0" };
  }
  
  if (numAmount > 10000000) {
    return { valid: false, value: 0, error: "Le montant dépasse le maximum autorisé (10,000,000)" };
  }
  
  // CinetPay requiert un montant entier en XOF
  return { valid: true, value: Math.round(numAmount) };
}

// Validation de la devise - XOF uniquement
function validateCurrency(currency: unknown): { valid: boolean; value: string; error?: string } {
  // Toujours utiliser XOF - devise unique de la plateforme
  return { valid: true, value: 'XOF' };
}

// Nettoyage et formatage du numéro de téléphone
function formatPhoneNumber(phone: string | undefined | null): string {
  if (!phone) return '';
  
  // Supprimer tous les caractères non numériques sauf +
  let cleaned = phone.toString().replace(/[^\d+]/g, '');
  
  // Supprimer le + au début si présent
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  // Ajouter le préfixe Côte d'Ivoire si nécessaire
  if (cleaned.startsWith('0')) {
    cleaned = '225' + cleaned.substring(1);
  } else if (!cleaned.startsWith('225') && cleaned.length <= 10) {
    cleaned = '225' + cleaned;
  }
  
  return cleaned;
}

// Nettoyage des chaînes
function sanitizeString(input: string | undefined | null, maxLength: number = 100): string {
  if (!input) return '';
  return input.toString().trim().substring(0, maxLength);
}

// Génération d'un ID de transaction unique
function generateTransactionId(bookingId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${bookingId.substring(0, 8)}-${timestamp}-${random}`;
}

serve(async (req) => {
  // Gestion des requêtes CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║            PROCESS PAYMENT - CINETPAY                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`📅 Timestamp: ${new Date().toISOString()}`);

  try {
    // ================================================================
    // ÉTAPE 1: Vérification de l'authentification
    // ================================================================
    console.log('\n📋 Étape 1: Vérification de l\'authentification...');
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return errorResponse('Header d\'autorisation manquant', 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Configuration Supabase manquante');
      return errorResponse('Configuration serveur incomplète', 500);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ Authentification échouée:', userError?.message || 'Utilisateur non trouvé');
      return errorResponse('Non autorisé - Veuillez vous connecter', 401);
    }
    
    console.log('✅ Utilisateur authentifié');

    // ================================================================
    // ÉTAPE 2: Parsing et validation du body
    // ================================================================
    console.log('\n📋 Étape 2: Validation des données de paiement...');
    
    let body: any;
    try {
      body = await req.json();
    } catch (parseError) {
      return errorResponse('Corps de la requête invalide - JSON attendu', 400);
    }
    
    console.log('   - bookingId:', body.bookingId ? '✓' : '✗');
    console.log('   - amount:', body.amount);
    console.log('   - currency:', body.currency);
    console.log('   - paymentMethod:', body.paymentMethod);
    console.log('   - customerInfo:', body.customerInfo ? '✓' : '✗');

    // Validation du bookingId
    if (!body.bookingId || typeof body.bookingId !== 'string') {
      return errorResponse('ID de réservation manquant ou invalide', 400);
    }

    // Validation du montant
    const amountValidation = validateAmount(body.amount);
    if (!amountValidation.valid) {
      return errorResponse(amountValidation.error!, 400);
    }

    // Validation de la devise
    const currencyValidation = validateCurrency(body.currency);
    if (!currencyValidation.valid) {
      return errorResponse(currencyValidation.error!, 400);
    }

    // Validation des infos client
    if (!body.customerInfo || typeof body.customerInfo !== 'object') {
      return errorResponse('Informations client manquantes', 400);
    }

    const customerEmail = sanitizeString(body.customerInfo.email, 255);
    const customerName = sanitizeString(body.customerInfo.name, 100);
    const customerPhone = formatPhoneNumber(body.customerInfo.phone);

    if (!customerEmail || !customerEmail.includes('@')) {
      return errorResponse('Email client invalide', 400);
    }

    if (!customerName || customerName.length < 2) {
      return errorResponse('Nom client invalide (minimum 2 caractères)', 400);
    }

    console.log('✅ Données validées');
    console.log('   - Montant:', amountValidation.value, currencyValidation.value);
    console.log('   - Méthode:', body.paymentMethod);

    // ================================================================
    // ÉTAPE 3: Vérification des credentials CinetPay
    // ================================================================
    console.log('\n📋 Étape 3: Vérification de la configuration CinetPay...');
    
    const cinetpayApiKey = Deno.env.get('CINETPAY_API_KEY');
    const cinetpaySiteId = Deno.env.get('CINETPAY_SITE_ID');
    
    if (!cinetpayApiKey) {
      console.error('❌ CINETPAY_API_KEY non configurée');
      return errorResponse('Passerelle de paiement non configurée (API Key)', 500);
    }
    
    if (!cinetpaySiteId) {
      console.error('❌ CINETPAY_SITE_ID non configuré');
      return errorResponse('Passerelle de paiement non configurée (Site ID)', 500);
    }
    
    console.log('✅ Credentials CinetPay présents');

    // ================================================================
    // ÉTAPE 4: Préparation du payload CinetPay
    // ================================================================
    console.log('\n📋 Étape 4: Préparation du payload CinetPay...');
    
    const transactionId = generateTransactionId(body.bookingId);
    console.log('   - Transaction ID:', transactionId);

    // Déterminer les canaux de paiement
    let channels = 'ALL';
    const paymentMethod = (body.paymentMethod || 'all').toLowerCase();
    
    switch (paymentMethod) {
      case 'card':
        channels = 'CREDIT_CARD';
        break;
      case 'mobile_money':
        channels = 'MOBILE_MONEY';
        break;
      case 'wave':
        channels = 'WALLET';
        break;
      case 'bank_transfer':
        channels = 'CREDIT_CARD';
        break;
      default:
        channels = 'ALL';
    }
    console.log('   - Channels:', channels);

    // Séparer prénom/nom
    const nameParts = customerName.split(' ').filter(p => p.length > 0);
    const firstName = nameParts[0] || 'Client';
    let lastName = nameParts.slice(1).join(' ') || firstName;
    
    // CinetPay requiert un nom de famille d'au moins 2 caractères
    if (lastName.length < 2) {
      lastName = firstName.length >= 2 ? firstName : 'Client';
    }

    // URLs de retour et notification
    const returnUrl = 'https://traversee-connect.lovable.app/dashboard?tab=bookings';
    const notifyUrl = `${supabaseUrl}/functions/v1/payment-callback`;

    console.log('   - Return URL:', returnUrl);
    console.log('   - Notify URL:', notifyUrl);

    const cinetpayPayload = {
      apikey: cinetpayApiKey,
      site_id: cinetpaySiteId,
      transaction_id: transactionId,
      amount: amountValidation.value,
      currency: currencyValidation.value,
      description: `Réservation #${body.bookingId.substring(0, 8)}`,
      customer_name: firstName,
      customer_surname: lastName,
      customer_email: customerEmail,
      customer_phone_number: customerPhone || '225000000000',
      customer_address: sanitizeString(body.customerInfo.address, 255) || 'N/A',
      customer_city: sanitizeString(body.customerInfo.city, 100) || 'Abidjan',
      customer_country: 'CI',
      customer_state: 'CI',
      customer_zip_code: '00225',
      notify_url: notifyUrl,
      return_url: returnUrl,
      channels: channels,
      lang: 'fr',
      metadata: JSON.stringify({
        booking_id: body.bookingId,
        user_id: user.id,
        payment_method: paymentMethod,
        created_at: new Date().toISOString(),
      }),
    };

    console.log('✅ Payload préparé');

    // ================================================================
    // ÉTAPE 5: Appel à l'API CinetPay
    // ================================================================
    console.log('\n📋 Étape 5: Appel à l\'API CinetPay...');
    console.log('   - URL: https://api-checkout.cinetpay.com/v2/payment');
    
    let cinetpayResponse: Response;
    let cinetpayData: any;
    
    try {
      cinetpayResponse = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(cinetpayPayload),
      });
      
      console.log('   - HTTP Status:', cinetpayResponse.status);
      
      const responseText = await cinetpayResponse.text();
      
      try {
        cinetpayData = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('❌ Réponse CinetPay non-JSON:', responseText.substring(0, 200));
        return errorResponse('Réponse invalide de la passerelle de paiement', 502);
      }
      
    } catch (fetchError) {
      console.error('❌ Erreur réseau lors de l\'appel CinetPay:', fetchError);
      return errorResponse('Impossible de contacter la passerelle de paiement. Veuillez réessayer.', 503);
    }

    console.log('   - Response Code:', cinetpayData.code);
    console.log('   - Message:', cinetpayData.message || 'N/A');

    // ================================================================
    // ÉTAPE 6: Traitement de la réponse CinetPay
    // ================================================================
    console.log('\n📋 Étape 6: Traitement de la réponse CinetPay...');
    
    // CinetPay retourne '201' pour une création réussie
    if (cinetpayData.code !== '201') {
      console.error('❌ Création du paiement échouée');
      console.error('   - Code:', cinetpayData.code);
      console.error('   - Message:', cinetpayData.message || 'Inconnu');
      console.error('   - Description:', cinetpayData.description || 'N/A');
      
      // Messages d'erreur personnalisés selon le code
      let userMessage = 'La création du paiement a échoué';
      
      if (cinetpayData.code === '401' || cinetpayData.code === '403') {
        userMessage = 'Erreur de configuration de la passerelle de paiement';
      } else if (cinetpayData.code === '422') {
        userMessage = 'Données de paiement invalides';
      } else if (cinetpayData.message) {
        userMessage = cinetpayData.message;
      }
      
      return errorResponse(userMessage, 400, `CinetPay code: ${cinetpayData.code}`);
    }

    // Vérifier la présence de l'URL de paiement
    if (!cinetpayData.data?.payment_url) {
      console.error('❌ URL de paiement manquante dans la réponse');
      return errorResponse('URL de paiement non reçue. Veuillez réessayer.', 502);
    }

    console.log('✅ Paiement créé avec succès');
    console.log('   - Payment URL:', cinetpayData.data.payment_url.substring(0, 50) + '...');

    // ================================================================
    // ÉTAPE 7: Enregistrement en base de données
    // ================================================================
    console.log('\n📋 Étape 7: Enregistrement du paiement...');
    
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id: body.bookingId,
        user_id: user.id,
        amount: amountValidation.value,
        currency: currencyValidation.value,
        payment_method: paymentMethod,
        payment_provider: 'cinetpay',
        transaction_id: transactionId,
        status: 'pending',
        payment_data: {
          transaction_id: transactionId,
          payment_url: cinetpayData.data.payment_url,
          payment_token: cinetpayData.data.payment_token || null,
          channels: channels,
          cinetpay_code: cinetpayData.code,
          created_at: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (paymentError) {
      console.error('❌ Erreur d\'enregistrement:', paymentError.message);
      // On retourne quand même l'URL car le paiement est créé côté CinetPay
      console.warn('⚠️ Le paiement est créé mais non enregistré localement');
    } else {
      console.log('✅ Paiement enregistré avec succès');
      console.log('   - Payment ID:', payment.id);
    }

    // ================================================================
    // SUCCÈS FINAL
    // ================================================================
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    ✅ SUCCÈS                                ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');

    return jsonResponse({
      success: true,
      payment_url: cinetpayData.data.payment_url,
      transaction_id: transactionId,
      payment_id: payment?.id || null,
    }, 200);

  } catch (error) {
    // ================================================================
    // GESTION DES ERREURS NON CATCHÉES
    // ================================================================
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    ❌ ERREUR                                ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    const errorType = error instanceof Error ? error.constructor.name : 'UnknownError';
    
    console.error('Type:', errorType);
    console.error('Message:', errorMessage);
    console.error('Stack:', error instanceof Error ? error.stack : 'N/A');
    console.log('');

    return jsonResponse({
      success: false,
      error: 'Une erreur inattendue est survenue lors du traitement du paiement. Veuillez réessayer.',
      code: 500,
    }, 500);
  }
});
