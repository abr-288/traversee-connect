import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plane, Download, ArrowLeft, Users, Briefcase, Luggage, X, Check, Info } from "lucide-react";
import { bookingSchema } from "@/lib/validation";
import { UnifiedForm, UnifiedFormField, UnifiedSubmitButton } from "@/components/forms";
import { Card } from "@/components/ui/card";

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
        currency: "FCFA",
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
      currency: "FCFA",
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
    setCurrentStep('booking');
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
            <div className="p-6 border-b bg-background sticky top-0 z-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Informations relatives au voyage</h2>
                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>1</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span>0</span>
                </div>
                <div className="flex items-center gap-2">
                  <Luggage className="h-4 w-4" />
                  <span>0</span>
                </div>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Left Side - Flight Details */}
              <div className="p-6 bg-muted/30">
                <div className="space-y-6">
                  {/* Route Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">{flight.from} → {flight.to}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Plane className="h-4 w-4" />
                      <span>2 h 50 min</span>
                    </div>
                  </div>

                  {/* Flight Timeline */}
                  <Card className="p-4">
                    {/* Departure */}
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="text-2xl font-bold">{formatTime(flight.departure)}</div>
                        <div className="text-xs text-muted-foreground">ven. 21 nov.</div>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{flight.from} · DSS</div>
                        <div className="text-sm text-muted-foreground">Blaise Diagne International Airport</div>
                      </div>
                    </div>

                    {/* Duration Line */}
                    <div className="flex items-center gap-2 my-4 pl-12">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="h-12 w-[2px] bg-border" />
                        <span className="text-muted-foreground">2 h 50 min</span>
                        <Plane className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span className="text-sm font-medium text-primary">{flight.airline}</span>
                        </div>
                      </div>
                    </div>

                    {/* Arrival with Stopover */}
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="text-2xl font-bold">{formatTime(flight.arrival)}</div>
                        <div className="text-xs text-muted-foreground">ven. 21 nov.</div>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{flight.to} · ABJ</div>
                        <div className="text-sm text-muted-foreground">Aéroport international Félix-Houphouët-Boigny</div>
                        <div className="mt-2 flex items-start gap-2 text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg">
                          <span className="text-lg">⭐</span>
                          <div className="flex-1">
                            <div className="font-medium">Astuce « ville cachée » :</div>
                            <div className="text-sm">Bamako est la destination finale de cet itinéraire, mais vous vous arrêterez dans la ville d&apos;escale.</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Stopover Info */}
                  <Card className="p-4 bg-background">
                    <div className="font-medium mb-2">Bamako · BKO</div>
                    <div className="text-sm text-muted-foreground">Mali</div>
                  </Card>

                  {/* Share */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Vous voyagez avec quelqu&apos;un ?</span>
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <span>↗</span>
                        <span>Partager</span>
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Partagez les informations relatives à votre itinéraire
                    </div>
                  </Card>
                </div>
              </div>

              {/* Right Side - Fare Options */}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-6">Sélectionnez une option de réservation</h3>
                
                <div className="space-y-4">
                  {/* Basic Fare */}
                  <Card className="p-6 hover:border-primary transition-colors">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold">
                        K
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold mb-2">Basic</h4>
                        <p className="text-sm text-muted-foreground">
                          Seulement le billet d&apos;avion, rien d&apos;autre. Vous pouvez choisir des services supplémentaires plus tard, mais vous ferez des économies si vous les ajoutez maintenant.
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
                      className="w-full bg-slate-600 hover:bg-slate-700"
                      size="lg"
                    >
                      Continuer pour un montant de {flight.price.toLocaleString()} €
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
                  <Card className="p-6 border-2 border-primary hover:border-primary/80 transition-colors">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold">
                        K
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold mb-2">Benefits</h4>
                        <p className="text-sm text-muted-foreground">
                          Obtenez un remboursement instantané en crédit sur votre compte Kiwi.com si des annulations ou des retards imputables à la compagnie aérienne
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Bagages et sièges moins chers</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Remboursement instantané en crédit Kiwi.com en cas d&apos;annulation de la compagnie aérienne</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Informations en direct concernant les retards et les portes d&apos;embarquement</span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleSelectFare('benefits')}
                      className="w-full"
                      size="lg"
                    >
                      Continuer pour un montant de {(flight.price + 50).toLocaleString()} €
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
                  {(flight.price * formData?.passengers).toLocaleString()} FCFA
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
