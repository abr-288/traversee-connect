import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { bookingSchema } from "@/lib/validation";
import { UnifiedForm, UnifiedFormField, UnifiedDatePicker, UnifiedSubmitButton } from "@/components/forms";

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
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const guests = parseInt(formData.get("guests") as string);
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
      toast({
        title: "Erreur de validation",
        description: error.errors?.[0]?.message || "Veuillez vérifier vos informations",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

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

    // Check if service exists in DB, if not create it
    let serviceId = service.id;
    const { data: existingService } = await supabase
      .from("services")
      .select("id")
      .eq("id", service.id)
      .maybeSingle();

    if (!existingService) {
      const { data: newService, error: serviceError } = await supabase
        .from("services")
        .insert({
          name: service.name,
          type: service.type as any,
          price_per_unit: service.price_per_unit,
          currency: service.currency,
          location: "Côte d'Ivoire",
          available: true,
        } as any)
        .select()
        .single();

      if (serviceError) {
        toast({
          title: "Erreur",
          description: "Impossible de créer le service",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      serviceId = newService.id;
    }

    // Calculate days
    const start = startDate || new Date();
    const end = endDate || start;
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const totalPrice = service.price_per_unit * guests * days;

    const { data: bookingData, error } = await supabase.from("bookings").insert({
      user_id: user.id,
      service_id: serviceId,
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0],
      guests,
      total_price: totalPrice,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      notes: notes || null,
      currency: service.currency,
      status: "pending",
      payment_status: "pending",
    }).select().single();

    if (error) {
      console.error("Booking error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la réservation: " + error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Réservation créée",
      description: "Votre réservation a été créée avec succès",
    });

    onOpenChange(false);
    navigate(`/payment?bookingId=${bookingData.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Réserver {service.name}</DialogTitle>
          <DialogDescription>
            Remplissez les informations ci-dessous pour finaliser votre réservation
          </DialogDescription>
        </DialogHeader>

        <UnifiedForm onSubmit={handleSubmit} variant="booking" loading={loading}>
          <div className="space-y-6">
            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UnifiedDatePicker
                label="Date de début"
                value={startDate}
                onChange={setStartDate}
                required
                minDate={new Date()}
              />
              <UnifiedDatePicker
                label="Date de fin"
                value={endDate}
                onChange={setEndDate}
                minDate={startDate || new Date()}
              />
            </div>

            {/* Guests */}
            <UnifiedFormField
              label="Nombre de personnes"
              name="guests"
              type="number"
              defaultValue="1"
              min={1}
              required
            />

            {/* Customer Info */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-lg">Informations du voyageur</h3>
              
              <UnifiedFormField
                label="Nom complet"
                name="customerName"
                placeholder="John Doe"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UnifiedFormField
                  label="Email"
                  name="customerEmail"
                  type="email"
                  placeholder="john@example.com"
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
                label="Notes supplémentaires"
                name="notes"
                type="textarea"
                placeholder="Demandes spéciales, préférences..."
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
