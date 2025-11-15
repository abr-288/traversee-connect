import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Payment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const bookingId = searchParams.get("bookingId");

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("wave");
  
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
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Erreur",
          description: "Réservation introuvable",
          variant: "destructive",
        });
        navigate("/dashboard?tab=bookings");
        return;
      }

      setBooking(data);
      setCustomerName(data.customer_name || "");
      setCustomerEmail(data.customer_email || "");
      setCustomerPhone(data.customer_phone || "");
    } catch (error) {
      console.error("Error loading booking:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la réservation",
        variant: "destructive",
      });
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
          .single();

        if (profile) {
          if (!customerName) setCustomerName(profile.full_name || "");
          if (!customerPhone) setCustomerPhone(profile.phone || "");
          if (!customerEmail) setCustomerEmail(user.email || "");
        }
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const handlePayment = async () => {
    if (!booking) return;

    // Validation
    if (!customerName || !customerEmail || !customerPhone) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    // Phone validation
    const phoneRegex = /^[\d\s\-\+\(\)]{8,}$/;
    if (!phoneRegex.test(customerPhone)) {
      toast({
        title: "Erreur",
        description: "Numéro de téléphone invalide",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      toast({
        title: "Erreur",
        description: "Adresse email invalide",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      console.log("=== INITIATING PAYMENT ===");
      console.log("Booking ID:", bookingId);
      console.log("Amount:", booking.total_price, booking.currency);
      console.log("Method:", paymentMethod);

      const { data, error } = await supabase.functions.invoke("process-payment", {
        body: {
          bookingId: bookingId,
          amount: booking.total_price,
          currency: booking.currency,
          paymentMethod: paymentMethod,
          customerInfo: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            address: customerAddress,
            city: customerCity,
          },
        },
      });

      console.log("Payment response:", data);

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

      console.log("✅ Redirecting to:", data.payment_url);

      // Redirect to CinetPay payment page
      window.location.href = data.payment_url;
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Erreur de paiement",
        description: error instanceof Error ? error.message : "Une erreur s'est produite",
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Paiement</h1>
          <p className="text-muted-foreground mb-8">
            Complétez votre réservation en effectuant le paiement
          </p>

          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Détails de la réservation</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Référence:</span>
                <span className="font-medium">{booking.id.substring(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Montant:</span>
                <span className="font-bold text-lg">
                  {booking.total_price.toLocaleString()} {booking.currency}
                </span>
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
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Votre nom complet"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+225 07 XX XX XX XX"
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Ce numéro sera utilisé pour le paiement mobile
                  </p>
                </div>

                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Votre adresse"
                  />
                </div>

                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    placeholder="Abidjan"
                  />
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
  );
}
