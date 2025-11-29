import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plane, Download, ArrowLeft, Users, Briefcase, Luggage, X, Check, Info, Clock, MapPin, Calendar } from "lucide-react";
import { bookingSchema } from "@/lib/validation";
import { UnifiedForm, UnifiedFormField, UnifiedSubmitButton } from "@/components/forms";
import { Card } from "@/components/ui/card";
import { Price } from "@/components/ui/price";

interface FlightBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flight: {
    id: string;
    airline: string;
    from: string;
    to: string;
    departure: string;
    arrival: string;
    price: number;
    class: string;
    departureDate?: string;
    returnDate?: string;
  };
  searchParams?: {
    departureDate: string;
    returnDate?: string;
  };
}

export const FlightBookingDialog = ({ open, onOpenChange, flight, searchParams = null }: FlightBookingDialogProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'fareSelection' | 'booking' | 'summary'>('fareSelection');
  const [selectedFare, setSelectedFare] = useState<'basic' | 'benefits' | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const departureDate = (searchParams && searchParams.departureDate) || flight.departureDate || new Date().toISOString().split('T')[0];
  const returnDate = (searchParams && searchParams.returnDate) || flight.returnDate;
  const tripType = returnDate ? t('booking.dialog.flight.roundTrip') : t('booking.dialog.flight.oneWay');

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const passengers = parseInt(form.get("passengers") as string);
    const customerName = form.get("customerName") as string;
    const customerEmail = form.get("customerEmail") as string;
    const customerPhone = form.get("customerPhone") as string;
    const passportNumber = form.get("passportNumber") as string;
    const passportIssueDate = form.get("passportIssueDate") as string;
    const passportExpiryDate = form.get("passportExpiryDate") as string;
    const notes = form.get("notes") as string;

    // Validate input
    try {
      bookingSchema.parse({
        customerName,
        customerEmail,
        customerPhone,
        notes: notes || null,
      });
    } catch (error: any) {
      toast.error(error.errors?.[0]?.message || t('booking.validation.checkInfo'));
      return;
    }

    // Store form data and show summary
    setFormData({
      passengers,
      customerName,
      customerEmail,
      customerPhone,
      passportNumber,
      passportIssueDate,
      passportExpiryDate,
      notes,
    });
    setCurrentStep('summary');
  };

  const handleConfirmBooking = async () => {
    if (!formData) return;
    
    setLoading(true);

    const { passengers, customerName, customerEmail, customerPhone, passportNumber, passportIssueDate, passportExpiryDate, notes } = formData;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error(t('booking.validation.mustBeLoggedIn'));
      setLoading(false);
      return;
    }

    // Create service in DB
    const { data: newService, error: serviceError } = await supabase
      .from("services")
      .insert({
        name: `Vol ${flight.from} → ${flight.to}`,
        type: "flight",
        price_per_unit: flight.price,
        currency: "EUR",
        location: flight.to,
        destination: flight.from,
        available: true,
        description: `${flight.airline} - Classe ${flight.class} - ${tripType}`
      })
      .select()
      .single();

    if (serviceError) {
      console.error("Service creation error:", serviceError);
      toast.error("Erreur lors de la création du service");
      setLoading(false);
      return;
    }

    const totalPrice = flight.price * passengers;

    const { data: booking, error } = await supabase.from("bookings").insert({
      user_id: user.id,
      service_id: newService.id,
      start_date: departureDate,
      end_date: returnDate || departureDate,
      guests: passengers,
      total_price: totalPrice,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      notes: notes || null,
      currency: "EUR",
      status: "pending",
      payment_status: "pending",
      booking_details: {
        passportNumber,
        passportIssueDate,
        passportExpiryDate,
        flightDetails: {
          airline: flight.airline,
          from: flight.from,
          to: flight.to,
          departure: flight.departure,
          arrival: flight.arrival,
          class: flight.class,
          tripType
        }
      }
    }).select().single();

    if (error) {
      console.error("Booking error:", error);
      toast.error("Erreur lors de la création de la réservation");
      setLoading(false);
      return;
    }

    setBookingId(booking.id);

    // Send confirmation email
    try {
      await supabase.functions.invoke("send-flight-confirmation", {
        body: { bookingId: booking.id },
      });
    } catch (emailError) {
      console.error("Email error:", emailError);
    }

    toast.success("Réservation créée avec succès!");
    setLoading(false);
  };

  const handleBackToForm = () => {
    setCurrentStep('booking');
  };

  const handleSelectFare = (fare: 'basic' | 'benefits') => {
    setSelectedFare(fare);
    // Navigate to booking process page with flight data
    const params = new URLSearchParams({
      id: flight.id,
      airline: flight.airline,
      from: flight.from,
      to: flight.to,
      departure: flight.departure,
      arrival: flight.arrival,
      price: flight.price.toString(),
      class: flight.class,
      fare: fare,
      departureDate: departureDate,
    });
    if (returnDate) {
      params.append('returnDate', returnDate);
    }
    navigate(`/booking-process?${params.toString()}`);
    onOpenChange(false);
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return isoString;
    }
  };

  const handleDownloadTicket = async () => {
    if (!bookingId) {
      toast.error(t('booking.validation.confirmFirst'));
      return;
    }

    try {
      toast.loading(t('booking.loading.generatingTicket'));
      
      const { data, error } = await supabase.functions.invoke("generate-flight-ticket", {
        body: { bookingId },
      });

      if (error) throw error;

      const blob = new Blob([data.ticket], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `billet-vol-${bookingId.substring(0, 8)}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(t('booking.success.ticketDownloaded'));
    } catch (error: any) {
      console.error("Error downloading ticket:", error);
      toast.error(t('booking.error.downloadTicket'));
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[95vw] p-0 overflow-y-auto">
        {currentStep === 'fareSelection' && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b bg-gradient-to-r from-primary/10 to-primary/5 sticky top-0 z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Informations relatives au voyage</h2>
                  <p className="text-sm text-muted-foreground mt-1">B-reserve by Bossiz</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="hover:bg-background/50">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium">1 Passager</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <span className="font-medium">Bagage cabine</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Luggage className="h-4 w-4 text-primary" />
                  <span className="font-medium">Bagage en soute</span>
                </div>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Left Side - Flight Details */}
              <div className="p-8 bg-gradient-to-b from-muted/30 to-background">
                <div className="space-y-6">
                  {/* Airline Header */}
                  <Card className="p-5 bg-gradient-to-r from-primary/10 to-background border-primary/30 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                        <Plane className="h-7 w-7 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Compagnie aérienne</p>
                        <p className="text-xl font-bold text-foreground">{flight.airline}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Vol · Classe {flight.class}</p>
                      </div>
                    </div>
                  </Card>

                  {/* Itinerary Card */}
                  <Card className="p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                      <MapPin className="h-5 w-5 text-primary" />
                      <h3 className="font-bold text-lg">Itinéraire détaillé</h3>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Departure */}
                      <div className="relative pl-8 border-l-2 border-primary/40">
                        <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-primary border-4 border-background shadow-sm"></div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded">Départ</div>
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground font-medium">
                              {new Date(departureDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-3">
                            <p className="text-3xl font-bold text-foreground">{formatTime(flight.departure)}</p>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <p className="text-base font-semibold">{flight.from}</p>
                          <p className="text-sm text-muted-foreground">Aéroport international</p>
                        </div>
                      </div>

                      {/* Flight Duration */}
                      <div className="pl-8 border-l-2 border-dashed border-border">
                        <div className="flex items-center gap-3 py-2">
                          <Clock className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm font-semibold">Durée totale du vol</p>
                            <p className="text-xs text-muted-foreground">Temps de trajet estimé</p>
                          </div>
                        </div>
                        
                        {/* Stopover Warning if needed */}
                        <div className="mt-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                                Vol avec escale
                              </p>
                              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                Ce vol peut comporter une ou plusieurs escales. Les détails précis des escales et temps d'attente seront communiqués lors de la confirmation.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Arrival */}
                      <div className="relative pl-8 border-l-2 border-primary/40">
                        <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-primary border-4 border-background shadow-sm"></div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded">Arrivée</div>
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground font-medium">
                              {new Date(departureDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-3">
                            <p className="text-3xl font-bold text-foreground">{formatTime(flight.arrival)}</p>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <p className="text-base font-semibold">{flight.to}</p>
                          <p className="text-sm text-muted-foreground">Aéroport international</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Price Card */}
                  <Card className="p-5 bg-gradient-to-br from-primary/15 to-primary/5 border-primary/30 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Prix du billet</p>
                        <p className="text-sm text-muted-foreground">Par passager</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-primary">
                          <Price amount={flight.price} fromCurrency="EUR" showLoader />
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Right Side - Fare Options */}
              <div className="p-8 bg-background">
                <h3 className="text-2xl font-bold mb-2">Sélectionnez une option de réservation</h3>
                <p className="text-sm text-muted-foreground mb-8">Choisissez l'option qui correspond le mieux à vos besoins</p>
                
                <div className="space-y-4">
                  {/* Basic Fare */}
                  <Card className="p-6 hover:border-primary/50 hover:shadow-md transition-all">
                    <div className="flex items-start gap-4 mb-5">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
                        <Briefcase className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold mb-2">Tarif Basic</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          L'essentiel pour votre voyage. Billet d'avion uniquement avec bagage cabine inclus.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-2 text-sm">
                        <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <span className="line-through text-muted-foreground">Bagages et sièges moins chers</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <span className="line-through text-muted-foreground">Remboursement instantané en crédit Kiwi.com en cas d&apos;annulation de la compagnie aérienne</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <span className="line-through text-muted-foreground">Informations en direct concernant les retards et les portes d&apos;embarquement</span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleSelectFare('basic')}
                      className="w-full"
                      size="lg"
                    >
                      Continuer pour <Price amount={flight.price} fromCurrency="EUR" />
                    </Button>

                    <button className="w-full text-center text-sm text-primary mt-3 flex items-center justify-center gap-1">
                      <span>+</span>
                      <span className="underline">Afficher les détails</span>
                    </button>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">Vol annulé ou retardé</span>
                      </div>
                      <div className="text-xs text-muted-foreground ml-6">
                        Cela dépend des règles de la compagnie aérienne et des lois applicables
                      </div>
                      <div className="flex items-start gap-2 text-sm mt-3">
                        <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">Annulez ou modifiez votre voyage</span>
                      </div>
                      <div className="text-xs text-muted-foreground ml-6">
                        Cela dépend des règles de la compagnie aérienne
                      </div>
                    </div>
                  </Card>

                  {/* Benefits Fare */}
                  <Card className="p-6 border-2 border-primary hover:border-primary/90 hover:shadow-lg transition-all bg-gradient-to-br from-primary/5 to-background">
                    <div className="flex items-start gap-4 mb-5">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                        <Check className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-xl font-bold">Tarif Benefits</h4>
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded">RECOMMANDÉ</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Voyage en toute sérénité avec des avantages exclusifs et une protection complète.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="font-medium">Bagages et sièges à tarifs préférentiels</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="font-medium">Remboursement instantané en cas d&apos;annulation par la compagnie</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="font-medium">Informations en temps réel (retards, portes d&apos;embarquement)</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="font-medium">Assistance prioritaire 24/7</span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleSelectFare('benefits')}
                      className="w-full"
                      size="lg"
                    >
                      Continuer pour <Price amount={flight.price + 40} fromCurrency="EUR" />
                    </Button>

                    <button className="w-full text-center text-sm text-primary mt-3 flex items-center justify-center gap-1">
                      <span>+</span>
                      <span className="underline">Afficher les détails</span>
                    </button>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'booking' && (
          <div className="p-6">
            <SheetHeader className="mb-6">
              <SheetTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-primary" />
                {t('booking.dialog.flight.title')}
              </SheetTitle>
              <p className="text-sm text-muted-foreground">
                {flight.airline} • {flight.from} → {flight.to} • {flight.class} • {tripType}
              </p>
              {selectedFare && (
                <p className="text-sm font-medium text-primary">
                  Option sélectionnée: {selectedFare === 'basic' ? 'Basic' : 'Benefits'}
                </p>
              )}
            </SheetHeader>

            <UnifiedForm onSubmit={handleFormSubmit} variant="booking" loading={loading}>
              <div className="space-y-6">
                <UnifiedFormField
                  label="Nombre de passagers"
                  name="passengers"
                  type="number"
                  defaultValue="1"
                  min={1}
                  required
                />

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-lg">Informations du passager principal</h3>
                  
                  <UnifiedFormField
                    label="Nom complet"
                    name="customerName"
                    placeholder="Nom tel qu'inscrit sur le passeport"
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UnifiedFormField
                      label="Email"
                      name="customerEmail"
                      type="email"
                      placeholder="email@example.com"
                      required
                    />
                    <UnifiedFormField
                      label="Téléphone"
                      name="customerPhone"
                      type="tel"
                      placeholder="+225 XX XX XX XX XX"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-lg">Informations du passeport</h3>
                  
                  <UnifiedFormField
                    label="Numéro de passeport"
                    name="passportNumber"
                    placeholder="ABC123456"
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <UnifiedFormField
                      label="Date de délivrance"
                      name="passportIssueDate"
                      type="date"
                      required
                    />
                    <UnifiedFormField
                      label="Date d'expiration"
                      name="passportExpiryDate"
                      type="date"
                      required
                    />
                  </div>
                </div>

                <UnifiedFormField
                  label="Demandes spéciales"
                  name="notes"
                  type="textarea"
                  placeholder="Préférences de siège, régime alimentaire, assistance spéciale..."
                />

                <UnifiedSubmitButton variant="booking" loading={loading} fullWidth>
                  Continuer vers le récapitulatif
                </UnifiedSubmitButton>
              </div>
            </UnifiedForm>
          </div>
        )}

        {currentStep === 'summary' && (
          // Summary View
          <div className="space-y-6">
            <div className="bg-primary/5 border-2 border-primary/20 p-6 rounded-lg space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Plane className="h-5 w-5 text-primary" />
                {t('booking.summary.flightDetails')}
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">{t('booking.summary.airline')}</p>
                  <p className="font-semibold">{flight.airline}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">{t('booking.summary.class')}</p>
                  <p className="font-semibold">{flight.class}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">{t('booking.summary.route')}</p>
                  <p className="font-semibold">{flight.from} → {flight.to}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">{t('booking.summary.type')}</p>
                  <p className="font-semibold">{tripType}</p>
                </div>
              </div>

              <div className="border-t pt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">{t('booking.summary.departure')}</p>
                  <p className="font-semibold">{new Date(departureDate).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                  <p className="text-primary font-bold text-lg">{flight.departure}</p>
                </div>
                {returnDate && (
                  <div>
                    <p className="text-muted-foreground text-sm">{t('search.return')}</p>
                    <p className="font-semibold">{new Date(returnDate).toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                    <p className="text-primary font-bold text-lg">{flight.arrival}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-muted/30 p-6 rounded-lg space-y-3">
              <h3 className="font-semibold text-lg">{t('booking.summary.passengerInfo')}</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">{t('booking.summary.name')}</p>
                  <p className="font-medium">{formData?.customerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('booking.form.passengers')}</p>
                  <p className="font-medium">{formData?.passengers}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('booking.summary.email')}</p>
                  <p className="font-medium">{formData?.customerEmail}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('booking.summary.phone')}</p>
                  <p className="font-medium">{formData?.customerPhone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('booking.form.passportNumber')}</p>
                  <p className="font-medium">{formData?.passportNumber}</p>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 p-6 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">{t('booking.summary.totalPrice')}</span>
                <span className="text-2xl font-bold text-primary">
                  <Price amount={flight.price * formData?.passengers} fromCurrency="EUR" showLoader />
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBackToForm} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('booking.summary.modify')}
              </Button>
              
              {bookingId ? (
                <>
                  <Button onClick={handleDownloadTicket} variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    {t('booking.summary.downloadTicket')}
                  </Button>
                  <Button 
                    onClick={() => navigate(`/payment?bookingId=${bookingId}`)}
                    className="flex-1"
                  >
                    {t('booking.summary.proceedToPayment')}
                  </Button>
                </>
              ) : (
                <Button onClick={handleConfirmBooking} disabled={loading} className="flex-1">
                  {loading ? t('booking.summary.confirming') : t('booking.summary.confirm')}
                </Button>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
