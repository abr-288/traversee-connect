import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plane, Download, ArrowLeft } from "lucide-react";
import { bookingSchema } from "@/lib/validation";
import { UnifiedForm, UnifiedFormField, UnifiedSubmitButton } from "@/components/forms";

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
  const [showSummary, setShowSummary] = useState(false);
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
    setShowSummary(true);
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
    setShowSummary(false);
  };

  const handleDownloadTicket = async () => {
    if (!bookingId) {
      toast.error("Veuillez d'abord confirmer la réservation");
      return;
    }

    try {
      toast.loading("Génération du billet...");
      
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

      toast.success("Billet téléchargé avec succès!");
    } catch (error: any) {
      console.error("Error downloading ticket:", error);
      toast.error("Erreur lors du téléchargement du billet");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-primary" />
            {showSummary ? "Récapitulatif de votre réservation" : "Réserver votre vol"}
          </DialogTitle>
          <DialogDescription>
            {flight.airline} • {flight.from} → {flight.to} • {flight.class} • {tripType}
          </DialogDescription>
        </DialogHeader>

        {showSummary ? (
          // Summary View
          <div className="space-y-6">
            <div className="bg-primary/5 border-2 border-primary/20 p-6 rounded-lg space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Plane className="h-5 w-5 text-primary" />
                Détails du vol
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">Compagnie</p>
                  <p className="font-semibold">{flight.airline}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Classe</p>
                  <p className="font-semibold">{flight.class}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Trajet</p>
                  <p className="font-semibold">{flight.from} → {flight.to}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Type</p>
                  <p className="font-semibold">{tripType}</p>
                </div>
              </div>

              <div className="border-t pt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">Départ</p>
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
                    <p className="text-muted-foreground text-sm">Retour</p>
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
              <h3 className="font-semibold text-lg">Informations passager</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Nom</p>
                  <p className="font-medium">{formData?.customerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Passagers</p>
                  <p className="font-medium">{formData?.passengers}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{formData?.customerEmail}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{formData?.customerPhone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Passeport</p>
                  <p className="font-medium">{formData?.passportNumber}</p>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 p-6 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Prix total</span>
                <span className="text-2xl font-bold text-primary">
                  {(flight.price * formData?.passengers).toLocaleString()} FCFA
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBackToForm} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Modifier
              </Button>
              
              {bookingId ? (
                <>
                  <Button onClick={handleDownloadTicket} variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger le billet
                  </Button>
                  <Button 
                    onClick={() => navigate(`/payment?bookingId=${bookingId}`)}
                    className="flex-1"
                  >
                    Procéder au paiement
                  </Button>
                </>
              ) : (
                <Button onClick={handleConfirmBooking} disabled={loading} className="flex-1">
                  {loading ? "Confirmation..." : "Confirmer la réservation"}
                </Button>
              )}
            </div>
          </div>
        ) : (
          // Booking Form
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
        )}
      </DialogContent>
    </Dialog>
  );
};
