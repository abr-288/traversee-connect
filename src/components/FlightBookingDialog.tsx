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
  const navigate = useNavigate();
  
  const departureDate = searchParams?.departureDate || flight.departureDate || new Date().toISOString().split('T')[0];
  const returnDate = searchParams?.returnDate || flight.returnDate;
  const tripType = returnDate ? "Aller-retour" : "Aller simple";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const passengers = parseInt(formData.get("passengers") as string);
    const customerName = formData.get("customerName") as string;
    const customerEmail = formData.get("customerEmail") as string;
    const customerPhone = formData.get("customerPhone") as string;
    const passportNumber = formData.get("passportNumber") as string;
    const passportIssueDate = formData.get("passportIssueDate") as string;
    const passportExpiryDate = formData.get("passportExpiryDate") as string;
    const notes = formData.get("notes") as string;

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
      setTimeout(() => {
        navigate(`/payment?bookingId=${booking.id}`);
      }, 1500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-primary" />
            Réserver votre vol
          </DialogTitle>
          <DialogDescription>
            {flight.airline} • {flight.from} → {flight.to} • {flight.class} • {tripType}
          </DialogDescription>
        </DialogHeader>

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

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Réservation en cours..." : "Confirmer et payer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};