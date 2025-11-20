import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { carBookingSchema } from "@/lib/validation";
import { UnifiedForm, UnifiedFormField, UnifiedSubmitButton } from "@/components/forms";

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
  const { t } = useTranslation();
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

    // Calculate days
    const start = new Date(`${pickupDate}T${pickupTime}`);
    const end = new Date(`${dropoffDate}T${dropoffTime}`);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    
    if (days < 1) {
      toast.error(t('booking.validation.dropoffAfterPickup'));
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
      toast.error(t('booking.error.createService'));
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
      notes: notes || null,
      currency: "FCFA",
      status: "pending",
      payment_status: "pending",
      booking_details: {
        pickupTime,
        dropoffTime,
        pickupLocation,
        dropoffLocation,
        driverLicense,
      }
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
          <DialogTitle>Réserver {car.name}</DialogTitle>
          <DialogDescription>
            {car.category} - {car.transmission || 'Automatique'} - {car.seats || 5} places
          </DialogDescription>
        </DialogHeader>

        <UnifiedForm onSubmit={handleSubmit} variant="booking" loading={loading}>
          <div className="space-y-6">
            {/* Informations de prise en charge */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Lieu et horaire de prise en charge</h3>
              <UnifiedFormField
                label="Lieu de prise en charge"
                name="pickupLocation"
                placeholder="Abidjan - Aéroport"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <UnifiedFormField
                  label="Date de prise en charge"
                  name="pickupDate"
                  type="date"
                  required
                />
                <UnifiedFormField
                  label="Heure de prise en charge"
                  name="pickupTime"
                  type="time"
                  defaultValue="10:00"
                  required
                />
              </div>
            </div>

            {/* Dropoff Info */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-lg">Lieu et horaire de retour</h3>
              <UnifiedFormField
                label="Lieu de retour"
                name="dropoffLocation"
                placeholder="Abidjan - Aéroport"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <UnifiedFormField
                  label="Date de retour"
                  name="dropoffDate"
                  type="date"
                  required
                />
                <UnifiedFormField
                  label="Heure de retour"
                  name="dropoffTime"
                  type="time"
                  defaultValue="10:00"
                  required
                />
              </div>
            </div>

            {/* Driver Info */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-lg">Informations du conducteur</h3>
              
              <UnifiedFormField
                label="Nom complet"
                name="customerName"
                placeholder="Nom du conducteur principal"
                required
              />

              <UnifiedFormField
                label="Numéro de permis de conduire"
                name="driverLicense"
                placeholder="ABC123456"
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
                label="Informations supplémentaires"
                name="notes"
                type="textarea"
                placeholder="Demandes spéciales, équipements additionnels..."
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
