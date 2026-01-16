import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, Smartphone, Check, Shield, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SubscriptionPlan {
  id: string;
  plan_id: string;
  name: string;
  subtitle: string | null;
  price: string;
  price_note: string | null;
  features: string[] | null;
  color: string | null;
}

// Extraire le montant numérique du prix (ex: "150 000 - 300 000 FCFA/mois" -> 150000)
const extractPrice = (priceString: string): number => {
  // Chercher le premier nombre dans la chaîne
  const match = priceString.replace(/\s/g, '').match(/(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return 0;
};

export default function SubscriptionPayment() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const planId = searchParams.get("planId");
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("wave");
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Customer info
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");

  useEffect(() => {
    if (planId) {
      loadPlanAndUser();
    } else {
      navigate("/subscriptions");
    }
  }, [planId]);

  const loadPlanAndUser = async () => {
    try {
      // Charger le plan
      const { data: planData, error: planError } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("plan_id", planId)
        .eq("is_active", true)
        .maybeSingle();

      if (planError) throw planError;

      if (!planData) {
        toast({
          title: t("common.error", "Erreur"),
          description: t("subscriptions.planNotFound", "Plan d'abonnement introuvable"),
          variant: "destructive",
        });
        navigate("/subscriptions");
        return;
      }

      setPlan(planData);

      // Charger les infos de l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCustomerEmail(user.email || "");
        
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (profile) {
          setCustomerName(profile.full_name || "");
          setCustomerPhone(profile.phone || "");
        }
      }
    } catch (error: any) {
      console.error("Error loading plan:", error);
      toast({
        title: t("common.error", "Erreur"),
        description: error.message || t("common.tryAgain", "Une erreur est survenue"),
        variant: "destructive",
      });
      navigate("/subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!customerName.trim()) {
      toast({
        title: t("common.error", "Erreur"),
        description: t("subscriptions.nameRequired", "Le nom est requis"),
        variant: "destructive",
      });
      return false;
    }
    if (!customerEmail.trim() || !customerEmail.includes("@")) {
      toast({
        title: t("common.error", "Erreur"),
        description: t("subscriptions.emailRequired", "Un email valide est requis"),
        variant: "destructive",
      });
      return false;
    }
    if (!customerPhone.trim() || customerPhone.length < 8) {
      toast({
        title: t("common.error", "Erreur"),
        description: t("subscriptions.phoneRequired", "Un numéro de téléphone valide est requis"),
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handlePayment = () => {
    if (!validateForm()) return;
    
    // Show confirmation for mobile payments
    if (paymentMethod === 'wave' || paymentMethod === 'mobile_money') {
      setShowConfirmDialog(true);
      return;
    }
    
    processPayment();
  };

  const processPayment = async () => {
    if (!plan || processing) return;

    setProcessing(true);
    setGeneralError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: t("auth.required", "Connexion requise"),
          description: t("auth.pleaseLogin", "Veuillez vous connecter pour continuer"),
          variant: "destructive",
        });
        navigate("/auth?redirect=/subscription-payment?planId=" + planId);
        return;
      }

      const amount = extractPrice(plan.price);
      
      if (amount <= 0) {
        throw new Error(t("subscriptions.invalidPrice", "Prix invalide pour ce plan"));
      }

      // Créer d'abord une entrée dans subscription_requests comme trace
      const { data: requestData, error: requestError } = await supabase
        .from("subscription_requests")
        .insert({
          plan_id: plan.plan_id,
          plan_name: plan.name,
          name: customerName.trim(),
          email: customerEmail.trim(),
          phone: customerPhone.trim(),
          company: customerCompany.trim() || null,
          status: "payment_pending",
          message: `Paiement direct - ${paymentMethod}`,
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // Appeler l'edge function de paiement
      // On utilise subscriptionRequestId comme bookingId pour le traitement unifié
      const { data, error } = await supabase.functions.invoke("process-payment", {
        body: {
          bookingId: requestData.id, // On utilise l'ID de la demande d'abonnement
          subscriptionRequestId: requestData.id,
          amount: amount,
          currency: "XOF",
          paymentMethod: paymentMethod,
          customerInfo: {
            name: customerName.trim(),
            email: customerEmail.trim(),
            phone: customerPhone.trim(),
          },
          metadata: {
            type: "subscription",
            planId: plan.plan_id,
            planName: plan.name,
            subscriptionRequestId: requestData.id,
          },
        },
      });

      if (error) {
        console.error("Payment error:", error);
        throw new Error(error.message || t("payment.error", "Erreur de paiement"));
      }

      if (!data?.success || !data?.payment_url) {
        throw new Error(data?.error || t("payment.noUrl", "URL de paiement non reçue"));
      }

      toast({
        title: t("payment.redirecting", "Redirection vers le paiement"),
        description: t("payment.secureRedirect", "Vous allez être redirigé vers la page de paiement sécurisée..."),
      });

      setTimeout(() => {
        window.location.href = data.payment_url;
      }, 500);

    } catch (error: any) {
      console.error("Payment processing error:", error);
      setGeneralError(error.message || t("common.tryAgain", "Une erreur est survenue"));
      toast({
        title: t("payment.error", "Erreur de paiement"),
        description: error.message || t("common.tryAgain", "Veuillez réessayer"),
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  const priceAmount = extractPrice(plan.price);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/subscriptions")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("common.back", "Retour")}
          </Button>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Plan Summary */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>{t("subscriptions.selectedPlan", "Plan sélectionné")}</CardTitle>
                <CardDescription>{plan.subtitle}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color || 'from-primary to-primary/80'} flex items-center justify-center text-white`}>
                  <Shield className="w-8 h-8" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <p className="text-xl font-semibold text-primary mt-2">{plan.price}</p>
                  {plan.price_note && (
                    <p className="text-sm text-muted-foreground">{plan.price_note}</p>
                  )}
                </div>

                {plan.features && plan.features.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-3">{t("subscriptions.includedServices", "Services inclus :")}</h4>
                    <ul className="space-y-2">
                      {plan.features.slice(0, 5).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {plan.features.length > 5 && (
                        <li className="text-xs text-muted-foreground italic">
                          +{plan.features.length - 5} {t("subscriptions.moreFeatures", "autres avantages...")}
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>{t("payment.total", "Total à payer")}</span>
                    <span className="text-primary">{priceAmount.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <div className="space-y-6">
              {generalError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{generalError}</AlertDescription>
                </Alert>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>{t("subscriptions.yourInfo", "Vos informations")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("subscriptions.fullName", "Nom complet")} *</Label>
                    <Input
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={t("subscriptions.fullNamePlaceholder", "Votre nom complet")}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("subscriptions.email", "Email")} *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("subscriptions.phone", "Téléphone")} *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+225 XX XX XX XX XX"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company">{t("subscriptions.company", "Entreprise")} ({t("common.optional", "optionnel")})</Label>
                    <Input
                      id="company"
                      value={customerCompany}
                      onChange={(e) => setCustomerCompany(e.target.value)}
                      placeholder={t("subscriptions.companyPlaceholder", "Nom de votre entreprise")}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("payment.method", "Mode de paiement")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentMethodSelector
                    value={paymentMethod}
                    onChange={setPaymentMethod}
                  />

                  {(paymentMethod === 'wave' || paymentMethod === 'mobile_money') && customerPhone && (
                    <Alert className="mt-4 border-primary/30 bg-primary/5">
                      <Smartphone className="h-4 w-4 text-primary" />
                      <AlertDescription className="text-foreground">
                        {t("payment.mobileNotice", "La demande de paiement sera envoyée au numéro")}: <strong>{customerPhone}</strong>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Button
                className="w-full"
                size="lg"
                onClick={handlePayment}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("payment.processing", "Traitement en cours...")}
                  </>
                ) : (
                  <>
                    {t("payment.pay", "Payer")} {priceAmount.toLocaleString('fr-FR')} FCFA
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                {t("payment.secure", "Paiement sécurisé. Vos données sont protégées.")}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("payment.confirmTitle", "Confirmer le paiement")}</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>{t("payment.confirmDesc", "Vous allez effectuer un paiement de")} <strong>{priceAmount.toLocaleString('fr-FR')} FCFA</strong> {t("payment.for", "pour")} <strong>{plan.name}</strong>.</p>
              <p>{t("payment.mobileConfirm", "Une demande de paiement sera envoyée au numéro")}: <strong>{customerPhone}</strong></p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel", "Annuler")}</AlertDialogCancel>
            <AlertDialogAction onClick={processPayment}>
              {t("payment.confirm", "Confirmer")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
