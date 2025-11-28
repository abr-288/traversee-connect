import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2, 
  Home, 
  Download, 
  Share2, 
  Mail, 
  Plane, 
  Hotel, 
  Car, 
  MapPin, 
  Calendar,
  Users,
  CreditCard,
  Copy,
  Check,
  Printer,
  QrCode
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { Price } from "@/components/ui/price";

const Confirmation = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadBooking();
    
    const interval = setInterval(() => {
      if (booking?.status === 'pending') {
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

  const getServiceIcon = (type: string) => {
    switch (type) {
      case "flight": return <Plane className="h-6 w-6" />;
      case "hotel":
      case "stay": return <Hotel className="h-6 w-6" />;
      case "car": return <Car className="h-6 w-6" />;
      default: return <MapPin className="h-6 w-6" />;
    }
  };

  const getStatusConfig = () => {
    if (booking?.status === 'confirmed' || booking?.payment_status === 'paid') {
      return {
        icon: <CheckCircle2 className="h-20 w-20 text-green-500" />,
        title: "Réservation confirmée !",
        description: "Votre réservation a été confirmée avec succès. Un email de confirmation vous a été envoyé.",
        bgClass: "from-green-500/20 to-green-500/5",
        borderClass: "border-green-500/30",
      };
    } else if (booking?.status === 'failed' || booking?.payment_status === 'failed') {
      return {
        icon: <XCircle className="h-20 w-20 text-destructive" />,
        title: "Réservation échouée",
        description: "La confirmation de votre réservation a échoué. Veuillez contacter le support.",
        bgClass: "from-destructive/20 to-destructive/5",
        borderClass: "border-destructive/30",
      };
    } else if (booking?.payment_status === 'pending') {
      return {
        icon: <Clock className="h-20 w-20 text-amber-500 animate-pulse" />,
        title: "Paiement en cours",
        description: "Votre paiement est en cours de traitement. Veuillez patienter...",
        bgClass: "from-amber-500/20 to-amber-500/5",
        borderClass: "border-amber-500/30",
      };
    }
    return {
      icon: <Clock className="h-20 w-20 text-muted-foreground" />,
      title: "En attente",
      description: "Votre réservation est en attente de confirmation.",
      bgClass: "from-muted/50 to-muted/20",
      borderClass: "border-border",
    };
  };

  const generateBookingRef = () => {
    if (booking?.external_ref) return booking.external_ref;
    if (booking?.id) return `BOS-${booking.id.substring(0, 8).toUpperCase()}`;
    return "---";
  };

  const copyToClipboard = async () => {
    const ref = generateBookingRef();
    await navigator.clipboard.writeText(ref);
    setCopied(true);
    toast.success("Numéro de réservation copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareData = {
      title: "Ma réservation Bossiz",
      text: `Réservation ${generateBookingRef()} - ${booking?.services?.name}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié dans le presse-papier !");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col pt-16 bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Chargement de votre réservation...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex flex-col pt-16 bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-6">
                <XCircle className="h-20 w-20 text-destructive mx-auto" />
                <div>
                  <h1 className="text-2xl font-bold">Erreur</h1>
                  <p className="text-muted-foreground mt-2">{error || "Réservation non trouvée"}</p>
                </div>
                <Button asChild size="lg">
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

  const statusConfig = getStatusConfig();
  const bookingRef = generateBookingRef();

  return (
    <div className="min-h-screen flex flex-col pt-16 bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          {/* Status Header */}
          <Card className={`overflow-hidden border-2 ${statusConfig.borderClass}`}>
            <div className={`bg-gradient-to-br ${statusConfig.bgClass} p-8 md:p-12`}>
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                >
                  {statusConfig.icon}
                </motion.div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    {statusConfig.title}
                  </h1>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    {statusConfig.description}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Booking Reference */}
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <p className="text-sm text-muted-foreground mb-1">Numéro de réservation</p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl md:text-4xl font-bold text-primary tracking-wider">
                      {bookingRef}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={copyToClipboard}
                      className="shrink-0"
                    >
                      {copied ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center border">
                    <QrCode className="h-16 w-16 text-foreground" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Booking Details */}
            <Card className="md:col-span-2">
              <CardContent className="py-6 space-y-6">
                {/* Service Info */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {getServiceIcon(booking.services?.type)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{booking.services?.name}</h2>
                      <p className="text-sm text-muted-foreground">{booking.services?.location}</p>
                    </div>
                  </div>
                  
                  <Badge variant="secondary" className="mb-4">
                    {booking.services?.type === "flight" ? "Vol" :
                     booking.services?.type === "hotel" ? "Hôtel" :
                     booking.services?.type === "car" ? "Location de voiture" :
                     booking.services?.type === "tour" ? "Circuit" :
                     booking.services?.type === "stay" ? "Séjour" : "Service"}
                  </Badge>
                </div>

                <Separator />

                {/* Dates & Guests */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>Date de début</span>
                    </div>
                    <p className="font-semibold">
                      {format(new Date(booking.start_date), "EEEE d MMMM yyyy", { locale: fr })}
                    </p>
                  </div>
                  {booking.end_date && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>Date de fin</span>
                      </div>
                      <p className="font-semibold">
                        {format(new Date(booking.end_date), "EEEE d MMMM yyyy", { locale: fr })}
                      </p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Users className="h-4 w-4" />
                      <span>Participants</span>
                    </div>
                    <p className="font-semibold">{booking.guests} personne(s)</p>
                  </div>
                </div>

                <Separator />

                {/* Passengers */}
                {booking.passengers && booking.passengers.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Participants
                    </h3>
                    <div className="space-y-2">
                      {booking.passengers.map((passenger: any, index: number) => (
                        <div 
                          key={passenger.id} 
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">
                              {passenger.first_name} {passenger.last_name}
                            </p>
                            {passenger.date_of_birth && (
                              <p className="text-xs text-muted-foreground">
                                Né(e) le {format(new Date(passenger.date_of_birth), "dd/MM/yyyy")}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {index === 0 ? "Principal" : `Passager ${index + 1}`}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Contact Info */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    Contact
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">{booking.customer_name}</p>
                    <p className="text-muted-foreground">{booking.customer_email}</p>
                    <p className="text-muted-foreground">{booking.customer_phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price Summary & Actions */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                <CardContent className="py-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    Montant payé
                  </h3>
                  <div className="text-4xl font-bold text-primary mb-2">
                    <Price amount={booking.total_price} fromCurrency="XOF" />
                  </div>
                  <Badge 
                    variant={booking.payment_status === 'paid' ? 'default' : 'secondary'}
                    className={booking.payment_status === 'paid' ? 'bg-green-500' : ''}
                  >
                    {booking.payment_status === 'paid' ? '✓ Payé' : 'En attente'}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-6 space-y-3">
                  <h3 className="font-semibold mb-2">Actions</h3>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handlePrint}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimer
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    asChild
                  >
                    <Link to={`/support?bookingRef=${bookingRef}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Contacter le support
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3">
                <Button asChild size="lg" className="w-full">
                  <Link to="/dashboard?tab=bookings">
                    Voir mes réservations
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link to="/">
                    <Home className="h-4 w-4 mr-2" />
                    Retour à l'accueil
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Important Info */}
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="py-4">
              <h3 className="font-semibold mb-2 text-amber-700 dark:text-amber-400">
                Informations importantes
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Conservez votre numéro de réservation <strong>{bookingRef}</strong></li>
                <li>• Un email de confirmation a été envoyé à <strong>{booking.customer_email}</strong></li>
                <li>• Présentez ce numéro lors de votre arrivée</li>
                <li>• Pour toute modification, contactez notre support</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Confirmation;
