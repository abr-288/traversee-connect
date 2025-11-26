import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { paymentSchema, type PaymentInput } from "@/lib/validationSchemas";
import { validateWithSchema, getUserFriendlyErrorMessage } from "@/lib/formHelpers";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ErrorBoundary, { ErrorFallback } from "@/components/ErrorBoundary";

export default function Payment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const bookingId = searchParams.get("bookingId");

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("wave");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  
  // Customer info
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerCity, setCustomerCity] = useState("Abidjan");

  useEffect(() => {
    if (bookingId) {
      loadBooking();
      loadUserProfile();
    } else {
      navigate("/dashboard?tab=bookings");
    }
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Non authentifié",
          description: "Veuillez vous connecter pour continuer",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("bookings")
        .select("*, services(name, type, location)")
        .eq("id", bookingId)
        .eq("user_id", user.id) // Security: Only load user's own bookings
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Erreur",
          description: "Réservation introuvable ou accès refusé",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      // Check if payment already completed
      if (data.payment_status === "paid") {
        toast({
          title: "Paiement déjà effectué",
          description: "Cette réservation a déjà été payée",
        });
        navigate("/dashboard");
        return;
      }

      // Check if booking is cancelled
      if (data.status === "cancelled") {
        toast({
          title: "Réservation annulée",
          description: "Cette réservation a été annulée",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setBooking(data);
      setCustomerName(data.customer_name || "");
      setCustomerEmail(data.customer_email || "");
      setCustomerPhone(data.customer_phone || "");
    } catch (error: any) {
      console.error("Error loading booking:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger la réservation",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (profile) {
          if (!customerName) setCustomerName(profile.full_name || "");
          if (!customerPhone) setCustomerPhone(profile.phone || "");
          if (!customerEmail) setCustomerEmail(user.email || "");
        } else if (!customerEmail) {
          setCustomerEmail(user.email || "");
        }
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const handlePayment = async () => {
    if (!booking) return;

    // Clear previous errors
    setValidationErrors({});
    setGeneralError(null);

    // Validate form data with Zod
    const formData: PaymentInput = {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress: customerAddress || undefined,
      customerCity,
      paymentMethod: paymentMethod as "wave" | "mobile_money" | "card" | "bank_transfer",
    };

    const validation = validateWithSchema(paymentSchema, formData);

    if (validation.success === false) {
      // Accès safe aux erreurs après vérification explicite
      setValidationErrors(validation.errors);
      toast({
        title: "Erreur de validation",
        description: "Veuillez corriger les erreurs dans le formulaire",
        variant: "destructive",
      });
      
      // Scroll to first error
      const firstErrorField = Object.keys(validation.errors)[0];
      document.getElementById(firstErrorField)?.focus();
      return;
    }

    // Accès safe à data après vérification explicite
    const validatedData = validation.data;

    // Prevent double processing
    if (processing) return;

    setProcessing(true);

    // Set timeout for payment process (30 seconds)
    const timeoutId = setTimeout(() => {
      setProcessing(false);
      setGeneralError("Le délai de traitement du paiement a expiré. Veuillez réessayer.");
      toast({
        title: "Délai dépassé",
        description: "Le traitement du paiement a pris trop de temps. Veuillez réessayer.",
        variant: "destructive",
      });
    }, 30000);

    try {
      console.log("=== INITIATING PAYMENT ===");
      console.log("Booking ID:", bookingId);
      console.log("Amount:", booking.total_price, booking.currency);

      // Double-check booking status before payment
      const { data: currentBooking, error: checkError } = await supabase
        .from("bookings")
        .select("payment_status, status")
        .eq("id", bookingId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (!currentBooking) {
        throw new Error("Réservation introuvable");
      }

      if (currentBooking.payment_status === "paid") {
        toast({
          title: "Paiement déjà effectué",
          description: "Cette réservation a déjà été payée",
        });
        navigate("/dashboard");
        return;
      }

      if (currentBooking.status === "cancelled") {
        toast({
          title: "Réservation annulée",
          description: "Cette réservation a été annulée et ne peut être payée",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      const { data, error } = await supabase.functions.invoke("process-payment", {
        body: {
          bookingId: bookingId,
          amount: booking.total_price,
          currency: booking.currency,
          paymentMethod: validatedData.paymentMethod,
          customerInfo: {
            name: validatedData.customerName,
            email: validatedData.customerEmail,
            phone: validatedData.customerPhone,
            address: validatedData.customerAddress,
            city: validatedData.customerCity,
          },
        },
      });

      clearTimeout(timeoutId);

      if (error) {
        console.error("Payment error:", error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || "Échec de la création du paiement");
      }

      if (!data.payment_url) {
        throw new Error("URL de paiement non reçue");
      }

      console.log("✅ Redirecting to payment provider");

      // Redirect to payment provider page
      window.location.href = data.payment_url;
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error("Payment error:", error);
      
      const userMessage = getUserFriendlyErrorMessage(error);
      setGeneralError(userMessage);
      
      toast({
        title: "Erreur de paiement",
        description: userMessage,
        variant: "destructive",
      });
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <ErrorBoundary fallback={<ErrorFallback title="Erreur de paiement" description="Impossible de charger la page de paiement" />}>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Paiement</h1>
            <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8">
              Complétez votre réservation en effectuant le paiement
            </p>

            {generalError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{generalError}</AlertDescription>
              </Alert>
            )}

          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Détails de la réservation</h2>
            <div className="space-y-3">
              {/* Service Information */}
              {booking.services && (
                <>
                  <div className="flex justify-between items-start">
                    <span className="text-muted-foreground">Service:</span>
                    <span className="font-medium text-right">{booking.services.name}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium text-right capitalize">{booking.services.type}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-muted-foreground">Localisation:</span>
                    <span className="font-medium text-right">{booking.services.location}</span>
                  </div>
                </>
              )}
              
              {/* Dates */}
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Date de début:</span>
                <span className="font-medium text-right">
                  {new Date(booking.start_date).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              
              {booking.end_date && (
                <div className="flex justify-between items-start">
                  <span className="text-muted-foreground">Date de fin:</span>
                  <span className="font-medium text-right">
                    {new Date(booking.end_date).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}
              
              {/* Guests */}
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Nombre de personnes:</span>
                <span className="font-medium text-right">{booking.guests}</span>
              </div>
              
              {/* Customer Info */}
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-muted-foreground">Nom du client:</span>
                  <span className="font-medium text-right">{booking.customer_name}</span>
                </div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium text-right">{booking.customer_email}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-muted-foreground">Téléphone:</span>
                  <span className="font-medium text-right">{booking.customer_phone}</span>
                </div>
              </div>
              
              {/* Notes if available */}
              {booking.notes && (
                <div className="border-t pt-3 mt-3">
                  <span className="text-muted-foreground block mb-1">Notes:</span>
                  <p className="text-sm">{booking.notes}</p>
                </div>
              )}
              
              {/* Booking Reference & Total */}
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Référence:</span>
                  <span className="font-mono text-sm">{booking.id.substring(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-lg">Montant total:</span>
                  <span className="font-bold text-2xl text-primary">
                    {booking.total_price.toLocaleString()} {booking.currency}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Informations de paiement</h2>
            
            <div className="space-y-6">
              {/* Payment Method */}
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Méthode de paiement
                </Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="wave" id="wave" />
                    <Label htmlFor="wave" className="flex-1 cursor-pointer">
                      Wave (Mobile Money)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="mobile_money" id="mobile_money" />
                    <Label htmlFor="mobile_money" className="flex-1 cursor-pointer">
                      Mobile Money (Orange, MTN, Moov)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      Carte bancaire
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                    <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer">
                      Virement bancaire
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Customer Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customerName">Nom complet *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (validationErrors.customerName) {
                        setValidationErrors(prev => {
                          const { customerName, ...rest } = prev;
                          return rest;
                        });
                      }
                    }}
                    placeholder="Votre nom complet"
                    className={validationErrors.customerName ? "border-destructive" : ""}
                    aria-invalid={!!validationErrors.customerName}
                    aria-describedby={validationErrors.customerName ? "customerName-error" : undefined}
                  />
                  {validationErrors.customerName && (
                    <p id="customerName-error" className="text-xs text-destructive mt-1">
                      {validationErrors.customerName}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="customerEmail">Email *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => {
                      setCustomerEmail(e.target.value);
                      if (validationErrors.customerEmail) {
                        setValidationErrors(prev => {
                          const { customerEmail, ...rest } = prev;
                          return rest;
                        });
                      }
                    }}
                    placeholder="votre@email.com"
                    className={validationErrors.customerEmail ? "border-destructive" : ""}
                    aria-invalid={!!validationErrors.customerEmail}
                    aria-describedby={validationErrors.customerEmail ? "customerEmail-error" : undefined}
                  />
                  {validationErrors.customerEmail && (
                    <p id="customerEmail-error" className="text-xs text-destructive mt-1">
                      {validationErrors.customerEmail}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="customerPhone">Téléphone *</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      if (validationErrors.customerPhone) {
                        setValidationErrors(prev => {
                          const { customerPhone, ...rest } = prev;
                          return rest;
                        });
                      }
                    }}
                    placeholder="+225 07 XX XX XX XX"
                    className={validationErrors.customerPhone ? "border-destructive" : ""}
                    aria-invalid={!!validationErrors.customerPhone}
                    aria-describedby={validationErrors.customerPhone ? "customerPhone-error" : undefined}
                  />
                  {validationErrors.customerPhone && (
                    <p id="customerPhone-error" className="text-xs text-destructive mt-1">
                      {validationErrors.customerPhone}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Ce numéro sera utilisé pour le paiement mobile
                  </p>
                </div>

                <div>
                  <Label htmlFor="customerAddress">Adresse</Label>
                  <Input
                    id="customerAddress"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Votre adresse"
                  />
                </div>

                <div>
                  <Label htmlFor="customerCity">Ville *</Label>
                  <Input
                    id="customerCity"
                    value={customerCity}
                    onChange={(e) => {
                      setCustomerCity(e.target.value);
                      if (validationErrors.customerCity) {
                        setValidationErrors(prev => {
                          const { customerCity, ...rest } = prev;
                          return rest;
                        });
                      }
                    }}
                    placeholder="Abidjan"
                    className={validationErrors.customerCity ? "border-destructive" : ""}
                    aria-invalid={!!validationErrors.customerCity}
                    aria-describedby={validationErrors.customerCity ? "customerCity-error" : undefined}
                  />
                  {validationErrors.customerCity && (
                    <p id="customerCity-error" className="text-xs text-destructive mt-1">
                      {validationErrors.customerCity}
                    </p>
                  )}
                </div>
              </div>

              <Button
                onClick={handlePayment}
                disabled={processing}
                className="w-full"
                size="lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  `Payer ${booking.total_price.toLocaleString()} ${booking.currency}`
                )}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Paiement sécurisé par CinetPay
              </p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  </ErrorBoundary>
  );
}
