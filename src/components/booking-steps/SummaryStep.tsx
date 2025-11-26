import { motion } from "framer-motion";
import { Plane, User, Briefcase, Armchair, CreditCard, Calendar, Clock, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UnifiedSubmitButton } from "@/components/forms/UnifiedSubmitButton";
import { useState } from "react";
import { useCreateBooking } from "@/hooks/useCreateBooking";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Price } from "@/components/ui/price";

interface Passenger {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  documentType: string;
  documentNumber: string;
}

interface SummaryStepProps {
  flightData?: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate: string | null;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    airline: string;
    flightNumber: string;
    price: string;
    stops: number;
    fare: string;
  } | null;
  serviceType: string;
  serviceName: string;
  servicePrice: number;
  serviceLocation: string;
  startDate: string;
  endDate?: string;
  passengers: Passenger[];
  selectedBaggage: Record<string, number>;
  selectedSeats: string[];
  adultsCount: number;
  childrenCount: number;
  onBack: () => void;
}

export const SummaryStep = ({
  flightData,
  serviceType,
  serviceName,
  servicePrice,
  serviceLocation,
  startDate,
  endDate,
  passengers,
  selectedBaggage,
  selectedSeats,
  adultsCount,
  childrenCount,
  onBack,
}: SummaryStepProps) => {
  const [paymentMethod, setPaymentMethod] = useState<"mobile" | "card">("mobile");
  const { createBooking, loading } = useCreateBooking();
  const navigate = useNavigate();

  const getBaggagePrice = () => {
    const baggageOptions = [
      { id: "cabin-large", price: 15000 },
      { id: "checked-20", price: 25000 },
      { id: "checked-30", price: 40000 },
    ];
    
    return Object.entries(selectedBaggage).reduce((total, [id, quantity]) => {
      const option = baggageOptions.find((opt) => opt.id === id);
      return total + (option?.price || 0) * quantity;
    }, 0);
  };

  const getSeatsPrice = () => {
    // Simulation - dans une vraie app, vous récupéreriez les prix réels
    return selectedSeats.length * 7500;
  };

  const getBasePrice = () => {
    const basePrice = flightData ? parseFloat(flightData.price) : servicePrice;
    return basePrice * (adultsCount + childrenCount);
  };

  const getTotalPrice = () => {
    return getBasePrice() + getBaggagePrice() + getSeatsPrice();
  };

  const handlePayment = async () => {
    try {
      const bookingId = await createBooking({
        service_type: serviceType as any,
        service_name: flightData ? `Vol ${flightData.origin} - ${flightData.destination}` : serviceName,
        service_description: flightData ? `${flightData.airline} - ${flightData.flightNumber}` : serviceLocation,
        location: flightData ? flightData.origin : serviceLocation,
        start_date: startDate,
        end_date: endDate || startDate,
        guests: adultsCount + childrenCount,
        total_price: getTotalPrice(),
        currency: "FCFA",
        customer_name: `${passengers[0].firstName} ${passengers[0].lastName}`,
        customer_email: "client@example.com", // À récupérer du formulaire
        customer_phone: "+225 00 00 00 00", // À récupérer du formulaire
        passengers: passengers.map((p) => ({
          first_name: p.firstName,
          last_name: p.lastName,
          date_of_birth: p.dateOfBirth,
          document_type: p.documentType,
          document_number: p.documentNumber,
          nationality: p.nationality,
        })),
        booking_details: {
          ...(flightData && { flight: flightData }),
          baggage: selectedBaggage,
          seats: selectedSeats,
          paymentMethod,
        },
      });

      if (bookingId) {
        navigate(`/payment?bookingId=${bookingId}`);
      }
    } catch (error) {
      console.error("Erreur lors de la création de la réservation:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20">
        <h2 className="text-2xl font-bold text-primary mb-2">Récapitulatif et paiement</h2>
        <p className="text-muted-foreground">
          Vérifiez vos informations avant de procéder au paiement
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Détails de la réservation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Details */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Plane className="h-5 w-5 text-primary" />
              {flightData ? "Détails du vol" : "Détails du service"}
            </h3>
            <div className="space-y-4">
              {flightData ? (
                <>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div>
                          <p className="text-2xl font-bold">{flightData.departureTime}</p>
                          <p className="text-sm text-muted-foreground">{flightData.origin}</p>
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                          <Separator className="flex-1" />
                          <Badge variant="secondary" className="px-3">
                            {flightData.duration}
                          </Badge>
                          <Separator className="flex-1" />
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{flightData.arrivalTime}</p>
                          <p className="text-sm text-muted-foreground">{flightData.destination}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {flightData.airline} • Vol {flightData.flightNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(flightData.departureDate).toLocaleDateString("fr-FR")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{flightData.stops === 0 ? "Vol direct" : `${flightData.stops} escale(s)`}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service:</span>
                      <span className="font-medium">{serviceName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Localisation:</span>
                      <span className="font-medium">{serviceLocation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date de début:</span>
                      <span className="font-medium">
                        {new Date(startDate).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    {endDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date de fin:</span>
                        <span className="font-medium">
                          {new Date(endDate).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Passagers */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Passagers
            </h3>
            <div className="space-y-3">
              {passengers.map((passenger, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {passenger.firstName} {passenger.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {passenger.documentType === "passport" ? "Passeport" : "Carte d'identité"}: {passenger.documentNumber}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {index < adultsCount ? "Adulte" : "Enfant"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Bagages */}
          {Object.keys(selectedBaggage).length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Bagages
              </h3>
              <div className="space-y-2">
                {Object.entries(selectedBaggage).map(([id, quantity]) => {
                  if (quantity === 0) return null;
                  return (
                    <div key={id} className="flex justify-between items-center">
                      <span className="text-sm">{id} ({quantity}x)</span>
                      <span className="font-medium">{(quantity * 15000).toLocaleString()} FCFA</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Sièges */}
          {selectedSeats.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Armchair className="h-5 w-5 text-primary" />
                Sièges sélectionnés
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedSeats.map((seat) => (
                  <Badge key={seat} variant="secondary" className="px-3 py-1">
                    {seat}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Résumé des prix */}
        <div className="space-y-6">
          <Card className="p-6 sticky top-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Détails du prix
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Vol ({adultsCount + childrenCount} passagers)</span>
                <span className="font-medium">
                  <Price amount={getBasePrice()} fromCurrency="XOF" />
                </span>
              </div>
              {getBaggagePrice() > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Bagages</span>
                  <span className="font-medium">
                    <Price amount={getBaggagePrice()} fromCurrency="XOF" />
                  </span>
                </div>
              )}
              {getSeatsPrice() > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Sièges</span>
                  <span className="font-medium">
                    <Price amount={getSeatsPrice()} fromCurrency="XOF" />
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">Total</span>
                <span className="font-bold text-2xl text-primary">
                  <Price amount={getTotalPrice()} fromCurrency="XOF" showLoader />
                </span>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <h4 className="font-semibold">Mode de paiement</h4>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("mobile")}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === "mobile"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      📱
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Mobile Money</p>
                      <p className="text-xs text-muted-foreground">Orange, MTN, Moov</p>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === "card"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      💳
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Carte bancaire</p>
                      <p className="text-xs text-muted-foreground">Visa, Mastercard</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <UnifiedSubmitButton
                variant="payment"
                fullWidth
                loading={loading}
                onClick={handlePayment}
              >
                Procéder au paiement
              </UnifiedSubmitButton>
              <Button type="button" variant="outline" onClick={onBack} className="w-full">
                Retour
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
