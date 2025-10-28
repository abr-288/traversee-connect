import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Smartphone, Building2, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import { CountryCodeSelect } from "@/components/CountryCodeSelect";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("mobile_money");
  const [countryCode, setCountryCode] = useState("+225");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [billingCity, setBillingCity] = useState("");

  // Formatage automatique du numéro de carte
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  // Formatage automatique de la date d'expiration
  const formatCardExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    
    if (v.length >= 2) {
      return v.slice(0, 2) + "/" + v.slice(2, 4);
    }
    
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardExpiry(e.target.value);
    setCardExpiry(formatted);
  };

  const bookingId = searchParams.get("bookingId");

  useEffect(() => {
    if (!bookingId) {
      toast({
        title: "Erreur",
        description: "ID de réservation manquant",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (error) throw error;
      setBooking(data);
    } catch (error) {
      console.error("Error loading booking:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la réservation",
        variant: "destructive",
      });
    }
  };

  const handlePayment = async () => {
    if (!booking) return;

    // Validation
    if (paymentMethod === "mobile_money" && !phoneNumber) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer votre numéro de téléphone",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "card") {
      const cleanCardNumber = cardNumber.replace(/\s+/g, "");
      
      if (!cardNumber || cleanCardNumber.length < 16) {
        toast({
          title: "Erreur",
          description: "Veuillez entrer un numéro de carte valide (16 chiffres)",
          variant: "destructive",
        });
        return;
      }
      
      if (!cardExpiry || cardExpiry.length !== 5) {
        toast({
          title: "Erreur",
          description: "Veuillez entrer une date d'expiration valide (MM/AA)",
          variant: "destructive",
        });
        return;
      }
      
      if (!cardCvv || cardCvv.length !== 3) {
        toast({
          title: "Erreur",
          description: "Veuillez entrer un CVV valide (3 chiffres)",
          variant: "destructive",
        });
        return;
      }

      if (!billingAddress || billingAddress.trim().length === 0) {
        toast({
          title: "Erreur",
          description: "Veuillez entrer votre adresse de facturation",
          variant: "destructive",
        });
        return;
      }

      if (!billingCity || billingCity.trim().length === 0) {
        toast({
          title: "Erreur",
          description: "Veuillez entrer votre ville",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      const fullPhoneNumber = paymentMethod === "mobile_money" ? `${countryCode}${phoneNumber}` : booking.customer_phone;
      
      // Nettoyer le numéro de carte (enlever les espaces)
      const cleanCardNumber = cardNumber.replace(/\s+/g, "");
      
      const { data, error } = await supabase.functions.invoke("process-payment", {
        body: {
          bookingId: booking.id,
          amount: booking.total_price,
          currency: booking.currency || "FCFA",
          paymentMethod: paymentMethod,
          customerInfo: {
            name: booking.customer_name,
            email: booking.customer_email,
            phone: fullPhoneNumber,
            address: paymentMethod === "card" ? billingAddress : "",
            city: paymentMethod === "card" ? billingCity : "",
          },
          paymentDetails: paymentMethod === "card" ? {
            cardNumber: cleanCardNumber,
            cardExpiry,
            cardCvv
          } : {
            phone: fullPhoneNumber
          },
        },
      });

      if (error) throw error;

      if (data.success) {
        // Si CinetPay retourne une URL de paiement, rediriger l'utilisateur
        if (data.cinetpay_data?.payment_url) {
          toast({
            title: "Redirection vers le paiement",
            description: "Vous allez être redirigé vers la page de paiement CinetPay...",
          });
          
          // Rediriger directement vers la page de paiement CinetPay
          window.location.href = data.cinetpay_data.payment_url;
        } else {
          toast({
            title: "Succès",
            description: "Paiement effectué avec succès",
          });

          // Générer la facture
          await supabase.functions.invoke("generate-invoice", {
            body: { bookingId: booking.id },
          });

          navigate(`/dashboard?tab=bookings`);
        }
      } else {
        throw new Error(data.error || "Payment failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Erreur",
        description: "Le paiement a échoué. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Paiement de votre réservation</CardTitle>
              <CardDescription>
                Référence: {booking.booking_reference}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-xl border-2 border-primary/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Montant total</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold text-primary">
                      {booking.total_price} {booking.currency || "FCFA"}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between pt-2 border-t border-primary/10">
                  <span className="text-sm text-muted-foreground">Client:</span>
                  <span className="text-sm font-medium">{booking.customer_name}</span>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold">Méthode de paiement</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid gap-3">
                  <Card 
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      paymentMethod === "mobile_money" && "border-primary shadow-md bg-primary/5"
                    )}
                    onClick={() => setPaymentMethod("mobile_money")}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className={cn(
                        "p-3 rounded-full",
                        paymentMethod === "mobile_money" ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        <Smartphone className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">Mobile Money</h4>
                        <p className="text-sm text-muted-foreground">Orange Money, MTN, Moov</p>
                      </div>
                      <RadioGroupItem value="mobile_money" id="mobile_money" />
                    </CardContent>
                  </Card>

                  {paymentMethod === "mobile_money" && (
                    <div className="ml-4 space-y-2 animate-in slide-in-from-top-2">
                      <Label htmlFor="phone">Numéro de téléphone</Label>
                      <div className="flex gap-2">
                        <CountryCodeSelect value={countryCode} onValueChange={setCountryCode} />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="XX XX XX XX XX"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  )}

                  <Card 
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      paymentMethod === "card" && "border-primary shadow-md bg-primary/5"
                    )}
                    onClick={() => setPaymentMethod("card")}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className={cn(
                        "p-3 rounded-full",
                        paymentMethod === "card" ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">Carte bancaire</h4>
                        <p className="text-sm text-muted-foreground">Visa, Mastercard</p>
                      </div>
                      <RadioGroupItem value="card" id="card" />
                    </CardContent>
                  </Card>

                  {paymentMethod === "card" && (
                    <div className="ml-4 space-y-4 animate-in slide-in-from-top-2">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Numéro de carte</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          maxLength={19}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Expiration</Label>
                          <Input
                            id="expiry"
                            placeholder="MM/AA"
                            value={cardExpiry}
                            onChange={handleCardExpiryChange}
                            maxLength={5}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            type="password"
                            placeholder="123"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            maxLength={3}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billingAddress">Adresse de facturation</Label>
                        <Input
                          id="billingAddress"
                          placeholder="123 Rue de la Paix"
                          value={billingAddress}
                          onChange={(e) => setBillingAddress(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billingCity">Ville</Label>
                        <Input
                          id="billingCity"
                          placeholder="Abidjan"
                          value={billingCity}
                          onChange={(e) => setBillingCity(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <Card 
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      paymentMethod === "bank_transfer" && "border-primary shadow-md bg-primary/5"
                    )}
                    onClick={() => setPaymentMethod("bank_transfer")}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className={cn(
                        "p-3 rounded-full",
                        paymentMethod === "bank_transfer" ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">Virement bancaire</h4>
                        <p className="text-sm text-muted-foreground">Transfert bancaire</p>
                      </div>
                      <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                    </CardContent>
                  </Card>
                </RadioGroup>
              </div>

              <Button
                className="w-full h-12 text-lg font-semibold"
                onClick={handlePayment}
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Payer {booking.total_price} {booking.currency || "FCFA"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Payment;