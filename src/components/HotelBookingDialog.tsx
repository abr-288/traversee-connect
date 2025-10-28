import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Hotel, Calendar } from "lucide-react";

interface HotelBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotel: {
    id: string;
    name: string;
    location: string;
    price: number;
  };
}

export const HotelBookingDialog = ({ open, onOpenChange, hotel }: HotelBookingDialogProps) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const checkIn = formData.get("checkIn") as string;
    const checkOut = formData.get("checkOut") as string;
    const rooms = parseInt(formData.get("rooms") as string);
    const adults = parseInt(formData.get("adults") as string);
    const children = parseInt(formData.get("children") as string) || 0;
    const customerName = formData.get("customerName") as string;
    const customerEmail = formData.get("customerEmail") as string;
    const customerPhone = formData.get("customerPhone") as string;
    const notes = formData.get("notes") as string;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Vous devez être connecté pour réserver");
      setLoading(false);
      return;
    }

    // Calculate nights
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    
    if (nights < 1) {
      toast.error("La date de départ doit être après la date d'arrivée");
      setLoading(false);
      return;
    }

    // Create service
    const { data: newService, error: serviceError } = await supabase
      .from("services")
      .insert({
        name: hotel.name,
        type: "hotel",
        price_per_unit: hotel.price,
        currency: "FCFA",
        location: hotel.location,
        destination: hotel.location,
        available: true,
      })
      .select()
      .single();

    if (serviceError) {
      console.error("Service creation error:", serviceError);
      toast.error("Erreur lors de la création du service: " + serviceError.message);
      setLoading(false);
      return;
    }

    const totalPrice = hotel.price * rooms * nights;
    const totalGuests = adults + children;

    const { data: booking, error } = await supabase.from("bookings").insert({
      user_id: user.id,
      service_id: newService.id,
      start_date: checkIn,
      end_date: checkOut,
      guests: totalGuests,
      total_price: totalPrice,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      notes: notes ? `${rooms} chambre(s), ${adults} adulte(s), ${children} enfant(s)\n${notes}` : `${rooms} chambre(s), ${adults} adulte(s), ${children} enfant(s)`,
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
            <Hotel className="h-5 w-5 text-primary" />
            Réserver votre hébergement
          </DialogTitle>
          <DialogDescription>
            {hotel.name} • {hotel.location}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted p-4 rounded-lg mb-4">
          <p className="text-sm text-muted-foreground">Prix par nuit</p>
          <p className="text-2xl font-bold text-primary">{hotel.price.toLocaleString()} FCFA</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkIn" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date d'arrivée
              </Label>
              <Input id="checkIn" name="checkIn" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkOut">Date de départ</Label>
              <Input id="checkOut" name="checkOut" type="date" required />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rooms">Chambres</Label>
              <Input id="rooms" name="rooms" type="number" min="1" defaultValue="1" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adults">Adultes</Label>
              <Input id="adults" name="adults" type="number" min="1" defaultValue="2" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="children">Enfants</Label>
              <Input id="children" name="children" type="number" min="0" defaultValue="0" />
            </div>
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
            <Label htmlFor="notes">Demandes spéciales (optionnel)</Label>
            <Textarea 
              id="notes" 
              name="notes" 
              placeholder="Heure d'arrivée, lit supplémentaire, etc."
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