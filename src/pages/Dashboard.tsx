import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CreditCard, Package, MapPin, TrendingUp, Clock, CheckCircle2, Sparkles } from "lucide-react";

interface Booking {
  id: string;
  service_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  start_date: string;
  end_date: string | null;
  guests: number;
  total_price: number;
  currency: string;
  status: string;
  payment_status: string;
  created_at: string;
  services: {
    name: string;
    type: string;
    location: string;
  };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      fetchBookings();
    };

    checkAuth();
  }, [navigate]);

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

      // Calculate stats
      const total = data?.length || 0;
      const pending = data?.filter((b) => b.status === "pending").length || 0;
      const confirmed = data?.filter((b) => b.status === "confirmed").length || 0;
      const completed = data?.filter((b) => b.status === "completed").length || 0;
      const totalSpent = data?.reduce((sum, b) => sum + Number(b.total_price), 0) || 0;

      setStats({ total, pending, confirmed, completed, totalSpent });
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "confirmed":
        return "default";
      case "pending":
        return "secondary";
      case "completed":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPaymentStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const bookingsByService = bookings.reduce((acc, booking) => {
    const serviceType = booking.services?.type || "other";
    if (!acc[serviceType]) {
      acc[serviceType] = [];
    }
    acc[serviceType].push(booking);
    return acc;
  }, {} as Record<string, Booking[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 mt-20">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Mon Tableau de Bord
            </h1>
            <p className="text-muted-foreground mt-2">Gérez vos réservations et suivez vos voyages</p>
          </div>
          <Button onClick={() => navigate("/booking-history")} size="lg" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Historique complet
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <Card className="border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Réservations</CardTitle>
                <Package className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">Toutes vos réservations</p>
            </CardContent>
          </Card>
          
          <Card className="border-secondary/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">En Attente</CardTitle>
                <Clock className="w-5 h-5 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{stats.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">En cours de traitement</p>
            </CardContent>
          </Card>
          
          <Card className="border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Confirmées</CardTitle>
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.confirmed}</div>
              <p className="text-xs text-muted-foreground mt-1">Prêtes à partir</p>
            </CardContent>
          </Card>
          
          <Card className="border-accent/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Complétées</CardTitle>
                <CheckCircle2 className="w-5 h-5 text-accent-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.completed}</div>
              <p className="text-xs text-muted-foreground mt-1">Voyages terminés</p>
            </CardContent>
          </Card>
          
          <Card className="border-primary/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Dépensé</CardTitle>
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalSpent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">FCFA dépensés</p>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 md:grid-cols-6 gap-2 bg-muted/50 p-1 rounded-lg">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Toutes</TabsTrigger>
            <TabsTrigger value="hotel" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Hôtels</TabsTrigger>
            <TabsTrigger value="flight" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Vols</TabsTrigger>
            <TabsTrigger value="car" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Voitures</TabsTrigger>
            <TabsTrigger value="tour" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Tours</TabsTrigger>
            <TabsTrigger value="event" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Événements</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-8">
            {bookings.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground text-lg">Aucune réservation pour le moment</p>
                  <p className="text-sm text-muted-foreground/70 mt-2">Commencez à explorer et réserver vos voyages</p>
                </CardContent>
              </Card>
            ) : (
              bookings.map((booking) => (
                <Card key={booking.id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/50 hover:border-l-primary">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <CardTitle className="flex items-center gap-3 text-xl">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Package className="w-5 h-5 text-primary" />
                          </div>
                          {booking.services?.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2 text-base">
                          <MapPin className="w-4 h-4 text-primary" />
                          {booking.services?.location}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant={getStatusVariant(booking.status)} className="capitalize">
                          {booking.status}
                        </Badge>
                        <Badge variant={getPaymentStatusVariant(booking.payment_status)} className="capitalize">
                          {booking.payment_status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Dates</p>
                          <p className="text-sm font-medium">
                            {new Date(booking.start_date).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' })}
                            {booking.end_date && ` - ${new Date(booking.end_date).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' })}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <CreditCard className="w-5 h-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Prix Total</p>
                          <p className="text-sm font-bold text-primary">
                            {Number(booking.total_price).toLocaleString()} {booking.currency}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Package className="w-5 h-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Passagers</p>
                          <p className="text-sm font-medium">{booking.guests} personne{booking.guests > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {Object.entries(bookingsByService).map(([serviceType, serviceBookings]) => (
            <TabsContent key={serviceType} value={serviceType} className="space-y-4 mt-8">
              {serviceBookings.map((booking) => (
                <Card key={booking.id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/50 hover:border-l-primary">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <CardTitle className="flex items-center gap-3 text-xl">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Package className="w-5 h-5 text-primary" />
                          </div>
                          {booking.services?.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2 text-base">
                          <MapPin className="w-4 h-4 text-primary" />
                          {booking.services?.location}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant={getStatusVariant(booking.status)} className="capitalize">
                          {booking.status}
                        </Badge>
                        <Badge variant={getPaymentStatusVariant(booking.payment_status)} className="capitalize">
                          {booking.payment_status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Dates</p>
                          <p className="text-sm font-medium">
                            {new Date(booking.start_date).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' })}
                            {booking.end_date && ` - ${new Date(booking.end_date).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' })}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <CreditCard className="w-5 h-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Prix Total</p>
                          <p className="text-sm font-bold text-primary">
                            {Number(booking.total_price).toLocaleString()} {booking.currency}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Package className="w-5 h-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Passagers</p>
                          <p className="text-sm font-medium">{booking.guests} personne{booking.guests > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
