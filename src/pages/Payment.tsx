import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("mobile_money");

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

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("process-payment", {
        body: {
          bookingId: booking.id,
          amount: booking.total_amount,
          currency: booking.currency,
          paymentMethod: paymentMethod,
          customerInfo: {
            name: booking.customer_name,
            email: booking.customer_email,
            phone: booking.customer_phone,
          },
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Succès",
          description: "Paiement effectué avec succès",
        });

        // Générer la facture
        await supabase.functions.invoke("generate-invoice", {
          body: { bookingId: booking.id },
        });

        navigate(`/dashboard?tab=bookings`);
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
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Montant:</span>
                  <span className="font-semibold">
                    {booking.total_amount} {booking.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="capitalize">{booking.booking_type}</span>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Méthode de paiement</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mobile_money" id="mobile_money" />
                    <Label htmlFor="mobile_money">Mobile Money</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                    <Label htmlFor="bank_transfer">Virement bancaire</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card">Carte bancaire</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button
                className="w-full"
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  `Payer ${booking.total_amount} ${booking.currency}`
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