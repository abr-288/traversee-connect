import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Hotel, Car, Calendar, MapPin, CheckCircle2 } from "lucide-react";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: {
    id: string;
    name: string;
    price: number;
    currency: string;
    type: string;
    location?: string;
  };
}

export const BookingDialog = ({ open, onOpenChange, service }: BookingDialogProps) => {
  const navigate = useNavigate();

  const getServiceIcon = () => {
    switch (service.type) {
      case "flight":
        return <Plane className="w-5 h-5" />;
      case "hotel":
        return <Hotel className="w-5 h-5" />;
      case "car":
        return <Car className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  const handleStartBooking = () => {
    const params = new URLSearchParams({
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: service.price.toString(),
      serviceCurrency: service.currency,
      serviceType: service.type,
    });

    if (service.location) {
      params.append("serviceLocation", service.location);
    }

    navigate(`/booking/${service.type}?${params.toString()}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getServiceIcon()}
            Confirmer votre réservation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="p-4 bg-muted/50">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{service.name}</h3>
              {service.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {service.location}
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">Prix de base</span>
                <span className="font-bold text-xl text-primary">
                  {service.price} {service.currency}
                </span>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            <h4 className="font-semibold">Étapes de réservation</h4>
            <div className="space-y-2">
              {["Informations passagers", "Bagages et options", "Sélection des sièges", "Paiement"].map(
                (step, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>{step}</span>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Annuler
            </Button>
            <Button onClick={handleStartBooking} className="flex-1">
              Commencer la réservation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
