import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  CreditCard, 
  Plane, 
  Hotel, 
  Car, 
  MapPin,
  TestTube,
  Loader2,
  CheckCircle,
  AlertCircle,
  Smartphone
} from "lucide-react";
import { Price } from "@/components/ui/price";

const PaymentTest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    bookingId?: string;
    paymentUrl?: string;
  } | null>(null);

  // Test configuration
  const [testConfig, setTestConfig] = useState({
    serviceType: "flight" as "flight" | "hotel" | "car" | "tour",
    amount: 150000,
    customerName: "Test Client",
    customerEmail: "test@example.com",
    customerPhone: "+2250700000000",
    paymentMethod: "MOBILE_MONEY"
  });

  const serviceIcons = {
    flight: <Plane className="h-5 w-5" />,
    hotel: <Hotel className="h-5 w-5" />,
    car: <Car className="h-5 w-5" />,
    tour: <MapPin className="h-5 w-5" />
  };

  const serviceLabels = {
    flight: "Vol",
    hotel: "Hôtel",
    car: "Voiture",
    tour: "Circuit"
  };

  const handleTestPayment = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      // Step 1: Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté pour tester le paiement");
        setTestResult({
          success: false,
          message: "Utilisateur non connecté. Veuillez vous connecter pour tester le paiement."
        });
        setLoading(false);
        return;
      }

      // Step 2: Create a test service if needed or use existing
      const { data: existingService } = await supabase
        .from("services")
        .select("id")
        .eq("type", testConfig.serviceType)
        .limit(1)
        .single();

      let serviceId = existingService?.id;

      if (!serviceId) {
        const { data: newService, error: serviceError } = await supabase
          .from("services")
          .insert({
            name: `Test ${serviceLabels[testConfig.serviceType]}`,
            type: testConfig.serviceType,
            location: "Test Location",
            price_per_unit: testConfig.amount,
            currency: "XOF",
            available: true
          })
          .select("id")
          .single();

        if (serviceError) throw serviceError;
        serviceId = newService.id;
      }

      // Step 3: Create test booking
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          service_id: serviceId,
          customer_name: testConfig.customerName,
          customer_email: testConfig.customerEmail,
          customer_phone: testConfig.customerPhone,
          start_date: new Date().toISOString(),
          guests: 1,
          total_price: testConfig.amount,
          currency: "XOF",
          status: "pending",
          payment_status: "pending",
          notes: "Test payment - Created from PaymentTest page"
        })
        .select("id")
        .single();

      if (bookingError) throw bookingError;

      toast.success("Réservation test créée", {
        description: `ID: ${booking.id.substring(0, 8)}...`
      });

      // Step 4: Process payment
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        "process-payment",
        {
          body: {
            bookingId: booking.id,
            amount: testConfig.amount,
            currency: "XOF",
            customerEmail: testConfig.customerEmail,
            customerPhone: testConfig.customerPhone,
            customerName: testConfig.customerName,
            paymentMethod: testConfig.paymentMethod,
            description: `Test Payment - ${serviceLabels[testConfig.serviceType]}`
          }
        }
      );

      if (paymentError) throw paymentError;

      if (paymentData?.success && paymentData?.payment_url) {
        setTestResult({
          success: true,
          message: "Paiement initialisé avec succès! Redirection vers CinetPay...",
          bookingId: booking.id,
          paymentUrl: paymentData.payment_url
        });

        toast.success("Paiement initialisé!", {
          description: "Redirection vers la page de paiement..."
        });

        // Redirect to payment URL after 2 seconds
        setTimeout(() => {
          window.location.href = paymentData.payment_url;
        }, 2000);
      } else {
        throw new Error(paymentData?.error || "Échec de l'initialisation du paiement");
      }

    } catch (error: any) {
      console.error("Test payment error:", error);
      setTestResult({
        success: false,
        message: error.message || "Erreur lors du test de paiement"
      });
      toast.error("Erreur", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewConfirmation = () => {
    if (testResult?.bookingId) {
      navigate(`/confirmation?bookingId=${testResult.bookingId}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pt-16 bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full">
              <TestTube className="h-5 w-5" />
              <span className="font-medium">Mode Test</span>
            </div>
            <h1 className="text-3xl font-bold">Test de Paiement</h1>
            <p className="text-muted-foreground">
              Testez le processus de paiement CinetPay de bout en bout
            </p>
          </div>

          {/* Test Configuration Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Configuration du Test
              </CardTitle>
              <CardDescription>
                Configurez les paramètres du paiement test
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Service Type */}
              <div className="space-y-2">
                <Label>Type de service</Label>
                <div className="grid grid-cols-4 gap-2">
                  {(["flight", "hotel", "car", "tour"] as const).map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={testConfig.serviceType === type ? "default" : "outline"}
                      className="flex flex-col items-center gap-1 h-auto py-3"
                      onClick={() => setTestConfig(prev => ({ ...prev, serviceType: type }))}
                    >
                      {serviceIcons[type]}
                      <span className="text-xs">{serviceLabels[type]}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Montant (FCFA)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={testConfig.amount}
                  onChange={(e) => setTestConfig(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                  min={100}
                  step={1000}
                />
                <p className="text-sm text-muted-foreground">
                  Montant affiché: <Price amount={testConfig.amount} fromCurrency="XOF" />
                </p>
              </div>

              <Separator />

              {/* Customer Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Nom du client</Label>
                  <Input
                    id="customerName"
                    value={testConfig.customerName}
                    onChange={(e) => setTestConfig(prev => ({ ...prev, customerName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={testConfig.customerEmail}
                    onChange={(e) => setTestConfig(prev => ({ ...prev, customerEmail: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone">Téléphone</Label>
                <Input
                  id="customerPhone"
                  value={testConfig.customerPhone}
                  onChange={(e) => setTestConfig(prev => ({ ...prev, customerPhone: e.target.value }))}
                  placeholder="+2250700000000"
                />
              </div>

              <Separator />

              {/* Payment Method */}
              <div className="space-y-2">
                <Label>Méthode de paiement</Label>
                <Select
                  value={testConfig.paymentMethod}
                  onValueChange={(value) => setTestConfig(prev => ({ ...prev, paymentMethod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MOBILE_MONEY">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        Mobile Money
                      </div>
                    </SelectItem>
                    <SelectItem value="WAVE">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        Wave
                      </div>
                    </SelectItem>
                    <SelectItem value="CREDIT_CARD">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Carte bancaire
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Test Button */}
              <Button
                onClick={handleTestPayment}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Test en cours...
                  </>
                ) : (
                  <>
                    <TestTube className="h-5 w-5 mr-2" />
                    Lancer le Test de Paiement
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Test Result */}
          {testResult && (
            <Card className={testResult.success ? "border-green-500/50" : "border-destructive/50"}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {testResult.success ? (
                    <CheckCircle className="h-8 w-8 text-green-500 shrink-0" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-destructive shrink-0" />
                  )}
                  <div className="space-y-2 flex-1">
                    <h3 className={`font-semibold ${testResult.success ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
                      {testResult.success ? "Test Réussi" : "Échec du Test"}
                    </h3>
                    <p className="text-muted-foreground">{testResult.message}</p>
                    
                    {testResult.bookingId && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        <Badge variant="secondary">
                          Booking: {testResult.bookingId.substring(0, 8)}...
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleViewConfirmation}
                        >
                          Voir Confirmation
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">📋 Instructions de test</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>1. Configurez les paramètres de test ci-dessus</li>
                <li>2. Cliquez sur "Lancer le Test de Paiement"</li>
                <li>3. Vous serez redirigé vers CinetPay pour simuler le paiement</li>
                <li>4. Après le paiement, vérifiez la page de confirmation</li>
                <li>5. Les mises à jour de statut apparaîtront en temps réel</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentTest;
