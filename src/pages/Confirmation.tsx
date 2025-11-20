import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, Loader2, Home } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const Confirmation = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBooking();
    
    // Poll for status updates
    const interval = setInterval(() => {
      if (booking?.status === 'paid' && booking?.payment_status === 'completed') {
        loadBooking();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [bookingId]);

  const loadBooking = async () => {
    if (!bookingId) {
      setError("ID de réservation manquant");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          services (*),
          passengers (*)
        `)
        .eq("id", bookingId)
        .single();

      if (error) throw error;
      
      setBooking(data);
    } catch (err: any) {
      console.error("Error loading booking:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (booking?.status === 'confirmed') {
      return <CheckCircle2 className="h-16 w-16 text-green-500" />;
    } else if (booking?.status === 'failed' || booking?.payment_status === 'failed') {
      return <XCircle className="h-16 w-16 text-destructive" />;
    } else if (booking?.status === 'paid') {
      return <Clock className="h-16 w-16 text-primary" />;
    }
    return <Clock className="h-16 w-16 text-muted-foreground" />;
  };

  const getStatusText = () => {
    if (booking?.status === 'confirmed') {
      return {
        title: "Réservation confirmée !",
        description: "Votre réservation a été confirmée avec succès.",
        color: "text-green-600",
      };
    } else if (booking?.status === 'failed') {
      return {
        title: "Réservation échouée",
        description: "La confirmation de votre réservation a échoué. Veuillez contacter le support.",
        color: "text-destructive",
      };
    } else if (booking?.status === 'paid') {
      return {
        title: "Paiement accepté",
        description: "Votre paiement a été accepté. Confirmation en cours...",
        color: "text-primary",
      };
    } else if (booking?.payment_status === 'failed') {
      return {
        title: "Paiement échoué",
        description: "Le paiement n'a pas abouti. Veuillez réessayer.",
        color: "text-destructive",
      };
    }
    return {
      title: "En attente de paiement",
      description: "Votre réservation est en attente de paiement.",
      color: "text-muted-foreground",
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <XCircle className="h-16 w-16 text-destructive mx-auto" />
                <h1 className="text-2xl font-bold">Erreur</h1>
                <p className="text-muted-foreground">{error || "Réservation non trouvée"}</p>
                <Button asChild>
                  <Link to="/">
                    <Home className="h-4 w-4 mr-2" />
                    Retour à l'accueil
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const statusInfo = getStatusText();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <div className="text-center space-y-4">
              {getStatusIcon()}
              <div>
                <CardTitle className={`text-3xl ${statusInfo.color}`}>
                  {statusInfo.title}
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  {statusInfo.description}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {booking.external_ref && (
              <div className="bg-muted p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Référence de réservation</p>
                <p className="text-2xl font-bold">{booking.external_ref}</p>
              </div>
            )}

            <div className="grid gap-4">
              <div>
                <h3 className="font-semibold mb-2">Détails de la réservation</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service:</span>
                    <span className="font-medium">{booking.services?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date de début:</span>
                    <span className="font-medium">
                      {format(new Date(booking.start_date), "dd MMMM yyyy", { locale: fr })}
                    </span>
                  </div>
                  {booking.end_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date de fin:</span>
                      <span className="font-medium">
                        {format(new Date(booking.end_date), "dd MMMM yyyy", { locale: fr })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nombre de passagers:</span>
                    <span className="font-medium">{booking.guests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Montant total:</span>
                    <span className="font-bold text-lg">
                      {booking.total_price.toLocaleString()} {booking.currency}
                    </span>
                  </div>
                </div>
              </div>

              {booking.passengers && booking.passengers.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Passagers</h3>
                  <div className="space-y-2">
                    {booking.passengers.map((passenger: any, index: number) => (
                      <div key={passenger.id} className="text-sm p-3 bg-muted rounded-lg">
                        <p className="font-medium">
                          {index + 1}. {passenger.first_name} {passenger.last_name}
                        </p>
                        {passenger.date_of_birth && (
                          <p className="text-muted-foreground text-xs">
                            Né(e) le {format(new Date(passenger.date_of_birth), "dd/MM/yyyy")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Contact</h3>
                <div className="space-y-1 text-sm">
                  <p>{booking.customer_name}</p>
                  <p className="text-muted-foreground">{booking.customer_email}</p>
                  <p className="text-muted-foreground">{booking.customer_phone}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button asChild className="flex-1">
                <Link to="/dashboard?tab=bookings">
                  Voir mes réservations
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Retour à l'accueil
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Confirmation;
