import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { bookingSchema } from "@/lib/validation";
import { UnifiedForm, UnifiedFormField, UnifiedDatePicker, UnifiedSubmitButton } from "@/components/forms";

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
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const rooms = parseInt(formData.get("rooms") as string);
    const adults = parseInt(formData.get("adults") as string);
    const children = parseInt(formData.get("children") as string) || 0;
    const customerName = formData.get("customerName") as string;
    const customerEmail = formData.get("customerEmail") as string;
    const customerPhone = formData.get("customerPhone") as string;
    const notes = formData.get("notes") as string;

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
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error(t('booking.validation.mustBeLoggedIn'));
      setLoading(false);
      return;
    }

    if (!checkIn || !checkOut) {
      toast.error(t('booking.validation.selectCheckInOut'));
      setLoading(false);
      return;
    }

    // Calculate nights
    const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
    
    if (nights < 1) {
      toast.error(t('booking.validation.checkOutAfterCheckIn'));
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
        currency: "EUR",
        location: hotel.location,
        destination: hotel.location,
        available: true,
      })
      .select()
      .single();

    if (serviceError) {
      console.error("Service creation error:", serviceError);
      toast.error(t('booking.error.createService') + ": " + serviceError.message);
      setLoading(false);
      return;
    }

    const totalPrice = hotel.price * rooms * nights;
    const totalGuests = adults + children;

    const { data: booking, error } = await supabase.from("bookings").insert({
      user_id: user.id,
      service_id: newService.id,
      start_date: checkIn.toISOString().split('T')[0],
      end_date: checkOut.toISOString().split('T')[0],
      guests: totalGuests,
      total_price: totalPrice,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      notes: notes ? `${rooms} chambre(s), ${adults} adulte(s), ${children} enfant(s)\n${notes}` : `${rooms} chambre(s), ${adults} adulte(s), ${children} enfant(s)`,
      currency: "EUR",
      status: "pending",
      payment_status: "pending",
    }).select().single();

    if (error) {
      console.error("Booking error:", error);
      toast.error("Erreur lors de la création de la réservation: " + error.message);
      setLoading(false);
      return;
    }

    toast.success("Réservation créée avec succès");
    onOpenChange(false);
    navigate(`/payment?bookingId=${booking.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Réserver {hotel.name}</DialogTitle>
          <DialogDescription>
            Complétez votre réservation d'hôtel à {hotel.location}
          </DialogDescription>
        </DialogHeader>

        <UnifiedForm onSubmit={handleSubmit} variant="booking" loading={loading}>
          <div className="space-y-6">
            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UnifiedDatePicker
                label="Date d'arrivée"
                value={checkIn}
                onChange={setCheckIn}
                required
                minDate={new Date()}
              />
              <UnifiedDatePicker
                label="Date de départ"
                value={checkOut}
                onChange={setCheckOut}
                required
                minDate={checkIn || new Date()}
              />
            </div>

            {/* Room & Guests */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <UnifiedFormField
                label="Chambres"
                name="rooms"
                type="number"
                defaultValue="1"
                min={1}
                required
              />
              <UnifiedFormField
                label="Adultes"
                name="adults"
                type="number"
                defaultValue="1"
                min={1}
                required
              />
              <UnifiedFormField
                label="Enfants"
                name="children"
                type="number"
                defaultValue="0"
                min={0}
              />
            </div>

            {/* Customer Info */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-lg">Informations de contact</h3>
              
              <UnifiedFormField
                label="Nom complet"
                name="customerName"
                placeholder="Nom du client principal"
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

              <UnifiedFormField
                label="Demandes spéciales"
                name="notes"
                type="textarea"
                placeholder="Préférences, allergies, demandes particulières..."
              />
            </div>

            <UnifiedSubmitButton variant="booking" loading={loading} fullWidth>
              Confirmer la réservation
            </UnifiedSubmitButton>
          </div>
        </UnifiedForm>
      </DialogContent>
    </Dialog>
  );
};
