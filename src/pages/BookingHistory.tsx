import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar, MapPin, Users, CreditCard, Download, Plane, Hotel, Car, Map as MapIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Booking {
  id: string;
  service_id: string;
  start_date: string;
  end_date: string | null;
  total_price: number;
  currency: string;
  status: string;
  payment_status: string;
  booking_details: any;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  guests: number;
  notes: string | null;
  services: {
    name: string;
    type: string;
    location: string;
  };
}

const BookingHistory = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchBookings();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          services (
            name,
            type,
            location
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Erreur lors du chargement de vos réservations");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pending: { variant: "secondary", label: "En attente" },
      confirmed: { variant: "default", label: "Confirmée" },
      cancelled: { variant: "destructive", label: "Annulée" },
      completed: { variant: "outline", label: "Terminée" }
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pending: { variant: "secondary", label: "En attente" },
      paid: { variant: "default", label: "Payé" },
      failed: { variant: "destructive", label: "Échoué" },
      refunded: { variant: "outline", label: "Remboursé" }
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getServiceIcon = (type: string) => {
    const icons: Record<string, any> = {
      hotel: Hotel,
      flight: Plane,
      car: Car,
      tour: MapIcon
    };
    const Icon = icons[type] || MapIcon;
    return <Icon className="w-5 h-5" />;
  };

  const filterBookings = (filter: string) => {
    if (filter === "all") return bookings;
    return bookings.filter(b => b.services.type === filter);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 mt-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Mes Réservations</h1>
          <p className="text-muted-foreground text-lg">
            Consultez et gérez toutes vos réservations
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">Toutes ({bookings.length})</TabsTrigger>
            <TabsTrigger value="flight">Vols ({filterBookings("flight").length})</TabsTrigger>
            <TabsTrigger value="hotel">Hôtels ({filterBookings("hotel").length})</TabsTrigger>
            <TabsTrigger value="car">Voitures ({filterBookings("car").length})</TabsTrigger>
            <TabsTrigger value="tour">Circuits ({filterBookings("tour").length})</TabsTrigger>
          </TabsList>

          {["all", "flight", "hotel", "car", "tour"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-6">
              {filterBookings(tab).length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-muted-foreground mb-4">Aucune réservation trouvée</p>
                    <Button onClick={() => navigate("/")}>
                      Découvrir nos offres
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filterBookings(tab).map((booking) => (
                  <Card key={booking.id} className="hover:shadow-lg transition-all">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            {getServiceIcon(booking.services.type)}
                          </div>
                          <div>
                            <CardTitle className="text-xl mb-1">{booking.services.name}</CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              {booking.services.location}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {getStatusBadge(booking.status)}
                          {getPaymentBadge(booking.payment_status)}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Date de début</p>
                            <p className="font-semibold">
                              {format(new Date(booking.start_date), "dd MMM yyyy", { locale: fr })}
                            </p>
                          </div>
                        </div>

                        {booking.end_date && (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Date de fin</p>
                              <p className="font-semibold">
                                {format(new Date(booking.end_date), "dd MMM yyyy", { locale: fr })}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Voyageurs</p>
                            <p className="font-semibold">{booking.guests} personne(s)</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Montant total</p>
                            <p className="font-semibold text-primary">
                              {booking.total_price.toLocaleString()} {booking.currency}
                            </p>
                          </div>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="bg-muted/50 rounded-lg p-4 mb-4">
                          <p className="text-sm font-semibold mb-1">Notes :</p>
                          <p className="text-sm text-muted-foreground">{booking.notes}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3">
                        <Button variant="outline" className="gap-2">
                          <Download className="w-4 h-4" />
                          Télécharger le billet
                        </Button>
                        {booking.status === "confirmed" && booking.payment_status === "paid" && (
                          <Button variant="outline">
                            Modifier la réservation
                          </Button>
                        )}
                        {booking.status === "pending" && (
                          <Button className="gradient-primary shadow-primary">
                            Finaliser le paiement
                          </Button>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          Réservation effectuée le {format(new Date(booking.created_at), "dd MMMM yyyy à HH:mm", { locale: fr })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default BookingHistory;
