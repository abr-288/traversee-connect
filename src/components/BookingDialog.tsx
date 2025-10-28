import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: {
    id: string;
    name: string;
    price_per_unit: number;
    currency: string;
    type: string;
  };
}

export const BookingDialog = ({ open, onOpenChange, service }: BookingDialogProps) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const guests = parseInt(formData.get("guests") as string);
    const customerName = formData.get("customerName") as string;
    const customerEmail = formData.get("customerEmail") as string;
    const customerPhone = formData.get("customerPhone") as string;
    const notes = formData.get("notes") as string;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour réserver",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Calculate days
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const totalPrice = service.price_per_unit * guests * days;

    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      service_id: service.id,
      start_date: startDate,
      end_date: endDate || startDate,
      guests,
      total_price: totalPrice,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      notes: notes || null,
      currency: service.currency,
      status: "pending",
      payment_status: "pending",
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Erreur de réservation",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Réservation confirmée",
        description: `Votre réservation pour ${service.name} a été enregistrée`,
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-secondary" />
            Réserver: {service.name}
          </DialogTitle>
          <DialogDescription>
            Prix: {service.price_per_unit} {service.currency} par {service.type === "hotel" ? "nuit" : "personne"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Date de début</Label>
              <Input id="startDate" name="startDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Date de fin</Label>
              <Input id="endDate" name="endDate" type="date" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guests">Nombre de {service.type === "hotel" ? "chambres" : "personnes"}</Label>
            <Input id="guests" name="guests" type="number" min="1" defaultValue="1" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerName">Nom complet</Label>
            <Input id="customerName" name="customerName" type="text" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail">Email</Label>
            <Input id="customerEmail" name="customerEmail" type="email" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerPhone">Téléphone</Label>
            <Input id="customerPhone" name="customerPhone" type="tel" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea id="notes" name="notes" placeholder="Des demandes spéciales?" />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Réservation..." : "Confirmer la réservation"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
