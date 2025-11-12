import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plane, Calendar, User } from "lucide-react";
import { bookingSchema } from "@/lib/validation";

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

export const FlightBookingDialog = ({ open, onOpenChange, flight, searchParams }: FlightBookingDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const navigate = useNavigate();
  
  const departureDate = searchParams?.departureDate || flight.departureDate || new Date().toISOString().split('T')[0];
  const returnDate = searchParams?.returnDate || flight.returnDate;
  const tripType = returnDate ? "Aller-retour" : "Aller simple";

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
      toast.error(error.errors?.[0]?.message || "Veuillez vérifier vos informations");
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
      toast.error("Vous devez être connecté pour réserver");
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
      toast.error("Erreur lors de la création du service: " + serviceError.message);
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
      booking_details: {
        tripType,
        passportNumber,
        passportIssueDate,
        passportExpiryDate,
      },
      notes: notes || null,
      currency: "FCFA",
      status: "pending",
      payment_status: "pending",
    }).select().single();

    setLoading(false);

    if (error) {
      toast.error("Erreur de réservation: " + error.message);
    } else {
      toast.success("Réservation confirmée! Redirection vers le paiement...");
      onOpenChange(false);
      setShowSummary(false);
      setFormData(null);
      setTimeout(() => {
        navigate(`/payment?bookingId=${booking.id}`);
      }, 1500);
    }
  };

  const handleBackToForm = () => {
    setShowSummary(false);
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

            <div className="bg-muted/50 p-6 rounded-lg space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Informations passagers
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">Nombre de passagers</p>
                  <p className="font-semibold">{formData?.passengers}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Nom complet</p>
                  <p className="font-semibold">{formData?.customerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Email</p>
                  <p className="font-semibold">{formData?.customerEmail}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Téléphone</p>
                  <p className="font-semibold">{formData?.customerPhone}</p>
                </div>
              </div>

              <div className="border-t pt-4 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">Passeport N°</p>
                  <p className="font-semibold">{formData?.passportNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Délivré le</p>
                  <p className="font-semibold">{new Date(formData?.passportIssueDate).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Expire le</p>
                  <p className="font-semibold">{new Date(formData?.passportExpiryDate).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              {formData?.notes && (
                <div className="border-t pt-4">
                  <p className="text-muted-foreground text-sm">Demandes spéciales</p>
                  <p className="font-semibold">{formData.notes}</p>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-xl border-2 border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Prix par passager</p>
                  <p className="text-lg font-semibold">{flight.price.toLocaleString()} FCFA</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-sm">Montant total</p>
                  <p className="text-3xl font-bold text-primary">
                    {(flight.price * formData?.passengers).toLocaleString()} FCFA
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleBackToForm}
                className="flex-1"
                disabled={loading}
              >
                Modifier
              </Button>
              <Button 
                type="button" 
                onClick={handleConfirmBooking}
                className="flex-1"
                disabled={loading}
                size="lg"
              >
                {loading ? "Confirmation en cours..." : "Confirmer et payer"}
              </Button>
            </div>
          </div>
        ) : (
          // Form View
          <>

        <div className="bg-muted p-4 rounded-lg mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Date de départ</p>
              <p className="font-semibold">{new Date(departureDate).toLocaleDateString('fr-FR')}</p>
            </div>
            {returnDate && (
              <div>
                <p className="text-muted-foreground">Date de retour</p>
                <p className="font-semibold">{new Date(returnDate).toLocaleDateString('fr-FR')}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Horaire départ</p>
              <p className="font-semibold">{flight.departure}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Horaire arrivée</p>
              <p className="font-semibold">{flight.arrival}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Prix par passager</p>
              <p className="font-semibold text-primary text-xl">{flight.price.toLocaleString()} FCFA</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="passengers" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nombre de passagers
            </Label>
            <Input id="passengers" name="passengers" type="number" min="1" max="9" defaultValue="1" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerName">Nom complet</Label>
            <Input id="customerName" name="customerName" type="text" required />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="passportNumber">Numéro de passeport</Label>
              <Input id="passportNumber" name="passportNumber" type="text" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passportIssueDate">Date de délivrance</Label>
              <Input id="passportIssueDate" name="passportIssueDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passportExpiryDate">Date d'expiration</Label>
              <Input id="passportExpiryDate" name="passportExpiryDate" type="date" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input id="customerEmail" name="customerEmail" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Téléphone</Label>
              <Input id="customerPhone" name="customerPhone" type="tel" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Demandes spéciales (optionnel)</Label>
            <Textarea 
              id="notes" 
              name="notes" 
              placeholder="Repas spécial, assistance, etc."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" size="lg">
            Voir le récapitulatif
          </Button>
        </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};