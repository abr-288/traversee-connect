import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, CreditCard, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NotificationCenter, Notification } from "@/components/dashboard/NotificationCenter";
import { BookingCard } from "@/components/dashboard/BookingCard";
import { UpcomingReminders } from "@/components/dashboard/UpcomingReminders";
import { BookingCalendar } from "@/components/dashboard/BookingCalendar";
import { CurrencyDebugPanel } from "@/components/CurrencyDebugPanel";

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
  external_ref: string | null;
  created_at: string;
  services: {
    name: string;
    type: string;
    location: string;
  };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userProfile, setUserProfile] = useState<{ full_name: string; email: string } | null>(null);
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
      
      // Fetch user profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      
      setUserProfile({
        full_name: profileData?.full_name || "Utilisateur",
        email: user.email || "",
      });
      
      fetchBookings();
      loadNotifications();
    };

    checkAuth();
  }, [navigate]);

  const loadNotifications = () => {
    const saved = localStorage.getItem("dashboard_notifications");
    if (saved) {
      const parsed = JSON.parse(saved);
      setNotifications(parsed.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      })));
    }
  };

  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    
    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    localStorage.setItem("dashboard_notifications", JSON.stringify(updatedNotifications));
  };

  const markNotificationAsRead = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    localStorage.setItem("dashboard_notifications", JSON.stringify(updated));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.removeItem("dashboard_notifications");
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
        .order("created_at", { ascending: false});

      if (error) throw error;

      setBookings(data || []);

      const total = data?.length || 0;
      const pending = data?.filter((b) => b.status === "pending").length || 0;
      const confirmed = data?.filter((b) => b.status === "confirmed").length || 0;
      const completed = data?.filter((b) => b.status === "completed").length || 0;
      const totalSpent = data.reduce((sum, booking) => {
        // Count only paid bookings, regardless of booking status
        if (booking.payment_status === "paid") {
          return sum + Number(booking.total_price);
        }
        return sum;
      }, 0);

      setStats({ total, pending, confirmed, completed, totalSpent });

      data?.forEach((booking) => {
        const startDate = new Date(booking.start_date);
        const today = new Date();
        const diffDays = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1 && booking.status === "confirmed") {
          const existingNotif = notifications.find(n => n.message.includes(booking.id));
          if (!existingNotif) {
            addNotification({
              type: "warning",
              title: "Départ demain !",
              message: `Votre ${booking.services.name} commence demain`,
            });
          }
        }
      });
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos réservations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async (id: string) => {
    try {
      // Get booking details first to check payment status
      const booking = bookings.find((b) => b.id === id);
      if (!booking) {
        throw new Error("Réservation introuvable");
      }

      // Update booking status with updated_at timestamp
      const { error } = await supabase
        .from("bookings")
        .update({ 
          status: "confirmed",
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;

      // Update local state immediately for better UX
      setBookings(prevBookings => 
        prevBookings.map(b => 
          b.id === id 
            ? { ...b, status: "confirmed", updated_at: new Date().toISOString() } 
            : b
        )
      );

      // Check if payment is pending
      if (booking.payment_status === "pending") {
        toast({
          title: "Confirmation réussie",
          description: "Redirection vers le paiement...",
        });
        
        // Refresh bookings and redirect
        await fetchBookings();
        
        setTimeout(() => {
          navigate(`/payment?bookingId=${id}`);
        }, 1000);
        return;
      }

      // Send confirmation email with PDF only if payment is complete
      try {
        await supabase.functions.invoke("send-booking-pdf-email", {
          body: { bookingId: id },
        });
        
        toast({
          title: "Succès",
          description: "Réservation confirmée et email envoyé",
        });
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
        toast({
          title: "Réservation confirmée",
          description: "Email non envoyé. Vous pouvez le télécharger manuellement.",
        });
      }

      addNotification({
        type: "success",
        title: "Réservation confirmée",
        message: booking.payment_status === "paid" 
          ? "Votre réservation a été confirmée et un email de confirmation a été envoyé"
          : "Votre réservation a été confirmée. Veuillez procéder au paiement.",
      });

      fetchBookings();
    } catch (error: any) {
      console.error("Error confirming booking:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de confirmer la réservation",
        variant: "destructive",
      });
    }
  };

  const handleCancelBooking = async (id: string) => {
    try {
      const booking = bookings.find((b) => b.id === id);
      if (!booking) {
        throw new Error("Réservation introuvable");
      }

      // Update booking status and set payment status to refunded if it was paid
      const updateData: any = { 
        status: "cancelled",
        updated_at: new Date().toISOString()
      };

      // If payment was completed, initiate refund process
      if (booking.payment_status === "paid") {
        updateData.payment_status = "refunded";
      }

      const { error } = await supabase
        .from("bookings")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      // Update local state immediately
      setBookings(prevBookings => 
        prevBookings.map(b => 
          b.id === id 
            ? { ...b, ...updateData } 
            : b
        )
      );

      toast({
        title: "Annulation réussie",
        description: booking.payment_status === "paid" 
          ? "Réservation annulée. Remboursement en cours."
          : "Réservation annulée avec succès",
      });

      addNotification({
        type: "info",
        title: "Réservation annulée",
        message: booking.payment_status === "paid" 
          ? "Remboursement sous 5-7 jours ouvrés"
          : "Votre réservation a été annulée",
      });

      fetchBookings();
    } catch (error: any) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'annuler la réservation",
        variant: "destructive",
      });
    }
  };

  const handleEditBooking = (booking: Booking) => {
    toast({
      title: "Fonctionnalité à venir",
      description: "Modification bientôt disponible",
    });
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      const booking = bookings.find((b) => b.id === id);
      if (!booking) {
        throw new Error("Réservation introuvable");
      }

      // Prevent deletion of confirmed or completed bookings with paid status
      if ((booking.status === "confirmed" || booking.status === "completed") && booking.payment_status === "paid") {
        toast({
          title: "Suppression impossible",
          description: "Impossible de supprimer une réservation payée. Veuillez l'annuler d'abord.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("bookings").delete().eq("id", id);

      if (error) throw error;

      // Update local state immediately
      setBookings(prevBookings => prevBookings.filter(b => b.id !== id));

      toast({
        title: "Suppression réussie",
        description: "Réservation supprimée définitivement",
      });

      addNotification({
        type: "info",
        title: "Réservation supprimée",
        message: "La réservation a été supprimée de votre historique",
      });

      fetchBookings();
    } catch (error: any) {
      console.error("Error deleting booking:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la réservation",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (id: string) => {
    const booking = bookings.find((b) => b.id === id);
    if (booking) {
      toast({
        title: booking.services.name,
        description: `Départ le ${new Date(booking.start_date).toLocaleDateString("fr-FR")}`,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">Mon Tableau de Bord</h1>
            </div>
            {userProfile && (
              <p className="text-lg font-semibold text-primary mb-1">
                Bienvenue, {userProfile.full_name} 👋
              </p>
            )}
            <p className="text-muted-foreground">
              Gérez vos réservations et suivez vos voyages
            </p>
          </div>
          <NotificationCenter
            notifications={notifications}
            onMarkAsRead={markNotificationAsRead}
            onClearAll={clearAllNotifications}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="w-4 h-4" />
                Total Réservations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                En Attente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Confirmées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.confirmed}</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Total Dépensé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSpent.toLocaleString()} FCFA</div>
            </CardContent>
          </Card>

          <CurrencyDebugPanel />
        </div>

        <div className="mb-8">
          <UpcomingReminders
            bookings={bookings.filter((b) => b.status === "confirmed")}
            onViewDetails={handleViewDetails}
          />
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">Toutes ({stats.total})</TabsTrigger>
            <TabsTrigger value="pending">En attente ({stats.pending})</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmées ({stats.confirmed})</TabsTrigger>
            <TabsTrigger value="completed">Terminées ({stats.completed})</TabsTrigger>
            <TabsTrigger value="calendar">📅 Calendrier</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {bookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucune réservation</h3>
                  <p className="text-muted-foreground mb-6">
                    Commencez à planifier votre prochain voyage
                  </p>
                  <Button onClick={() => navigate("/")}>Explorer les destinations</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {bookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onConfirm={handleConfirmBooking}
                    onCancel={handleCancelBooking}
                    onEdit={handleEditBooking}
                    onDelete={handleDeleteBooking}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bookings
                .filter((b) => b.status === "pending")
                .map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onConfirm={handleConfirmBooking}
                    onCancel={handleCancelBooking}
                    onEdit={handleEditBooking}
                    onDelete={handleDeleteBooking}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="confirmed" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bookings
                .filter((b) => b.status === "confirmed")
                .map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onConfirm={handleConfirmBooking}
                    onCancel={handleCancelBooking}
                    onEdit={handleEditBooking}
                    onDelete={handleDeleteBooking}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bookings
                .filter((b) => b.status === "completed")
                .map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onConfirm={handleConfirmBooking}
                    onCancel={handleCancelBooking}
                    onEdit={handleEditBooking}
                    onDelete={handleDeleteBooking}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <BookingCalendar bookings={bookings} />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
