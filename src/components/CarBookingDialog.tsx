import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Car, Calendar } from "lucide-react";
import { carBookingSchema } from "@/lib/validation";

interface CarBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  car: {
    id: string;
    name: string;
    category: string;
    price: number;
    transmission?: string;
    seats?: number;
  };
}

export const CarBookingDialog = ({ open, onOpenChange, car }: CarBookingDialogProps) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const pickupDate = formData.get("pickupDate") as string;
    const pickupTime = formData.get("pickupTime") as string;
    const dropoffDate = formData.get("dropoffDate") as string;
    const dropoffTime = formData.get("dropoffTime") as string;
    const pickupLocation = formData.get("pickupLocation") as string;
    const dropoffLocation = formData.get("dropoffLocation") as string;
    const driverLicense = formData.get("driverLicense") as string;
    const customerName = formData.get("customerName") as string;
    const customerEmail = formData.get("customerEmail") as string;
    const customerPhone = formData.get("customerPhone") as string;
    const notes = formData.get("notes") as string;

    // Validate input
    try {
      carBookingSchema.parse({
        customerName,
        customerEmail,
        customerPhone,
        driverLicense,
        pickupLocation,
        dropoffLocation,
        notes: notes || null,
      });
    } catch (error: any) {
      toast.error(error.errors?.[0]?.message || "Veuillez vérifier vos informations");
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Vous devez être connecté pour réserver");
      setLoading(false);
      return;
    }

    // Calculate days
    const start = new Date(`${pickupDate}T${pickupTime}`);
    const end = new Date(`${dropoffDate}T${dropoffTime}`);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    
    if (days < 1) {
      toast.error("La date de retour doit être après la date de prise en charge");
      setLoading(false);
      return;
    }

    // Create service
    const { data: newService, error: serviceError } = await supabase
      .from("services")
      .insert({
        name: car.name,
        type: "car",
        price_per_unit: car.price,
        currency: "FCFA",
        location: pickupLocation,
        available: true,
        description: `${car.category} - ${car.transmission || 'Automatique'} - ${car.seats || 5} places`
      } as any)
      .select()
      .single();

    if (serviceError) {
      toast.error("Erreur lors de la création du service");
      setLoading(false);
      return;
    }

    const totalPrice = car.price * days;

    const { data: booking, error } = await supabase.from("bookings").insert({
      user_id: user.id,
      service_id: newService.id,
      start_date: pickupDate,
      end_date: dropoffDate,
      guests: 1,
      total_price: totalPrice,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      notes: `Prise: ${pickupLocation} (${pickupTime})\nRetour: ${dropoffLocation} (${dropoffTime})\nPermis: ${driverLicense}${notes ? `\n${notes}` : ''}`,
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
            <Car className="h-5 w-5 text-primary" />
            Réserver votre véhicule
          </DialogTitle>
          <DialogDescription>
            {car.name} • {car.category} • {car.transmission || 'Automatique'}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted p-4 rounded-lg mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Prix par jour</p>
              <p className="text-xl font-bold text-primary">{car.price.toLocaleString()} FCFA</p>
            </div>
            <div>
              <p className="text-muted-foreground">Caractéristiques</p>
              <p className="font-semibold">{car.seats || 5} places • {car.transmission || 'Auto'}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pickupDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date de prise en charge
              </Label>
              <Input id="pickupDate" name="pickupDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickupTime">Heure</Label>
              <Input id="pickupTime" name="pickupTime" type="time" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dropoffDate">Date de retour</Label>
              <Input id="dropoffDate" name="dropoffDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dropoffTime">Heure</Label>
              <Input id="dropoffTime" name="dropoffTime" type="time" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pickupLocation">Lieu de prise en charge</Label>
              <Input id="pickupLocation" name="pickupLocation" type="text" placeholder="Adresse ou aéroport" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dropoffLocation">Lieu de retour</Label>
              <Input id="dropoffLocation" name="dropoffLocation" type="text" placeholder="Adresse ou aéroport" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="driverLicense">Numéro de permis de conduire</Label>
            <Input id="driverLicense" name="driverLicense" type="text" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Nom complet</Label>
              <Input id="customerName" name="customerName" type="text" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Téléphone</Label>
              <Input id="customerPhone" name="customerPhone" type="tel" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail">Email</Label>
            <Input id="customerEmail" name="customerEmail" type="email" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Options supplémentaires (optionnel)</Label>
            <Textarea 
              id="notes" 
              name="notes" 
              placeholder="GPS, siège bébé, chauffeur, etc."
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