import { motion } from "framer-motion";
import { Armchair, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UnifiedSubmitButton } from "@/components/forms/UnifiedSubmitButton";
import { useState } from "react";
import { Price } from "@/components/ui/price";

interface Seat {
  id: string;
  row: number;
  letter: string;
  type: "standard" | "extra" | "front";
  price: number;
  available: boolean;
}

interface SeatsStepProps {
  selectedSeats: string[];
  onSeatsChange: (seats: string[]) => void;
  adultsCount: number;
  childrenCount: number;
  onNext: () => void;
  onBack: () => void;
}

export const SeatsStep = ({
  selectedSeats,
  onSeatsChange,
  adultsCount,
  childrenCount,
  onNext,
  onBack,
}: SeatsStepProps) => {
  const totalPassengers = adultsCount + childrenCount;
  const rows = 20;
  const letters = ["A", "B", "C", "", "D", "E", "F"];

  const generateSeats = (): Seat[] => {
    const seats: Seat[] = [];
    for (let row = 1; row <= rows; row++) {
      for (const letter of letters) {
        if (letter === "") continue;
        
        let type: "standard" | "extra" | "front" = "standard";
        let price = 5000;
        
        if (row <= 3) {
          type = "front";
          price = 15000;
        } else if (row === 10 || row === 20 || ["A", "F"].includes(letter)) {
          type = "extra";
          price = 10000;
        }
        
        // Simuler quelques sièges non disponibles
        const available = Math.random() > 0.3;
        
        seats.push({
          id: `${row}${letter}`,
          row,
          letter,
          type,
          price,
          available,
        });
      }
    }
    return seats;
  };

  const [seats] = useState<Seat[]>(generateSeats());

  const handleSeatClick = (seatId: string) => {
    const seat = seats.find((s) => s.id === seatId);
    if (!seat?.available) return;

    if (selectedSeats.includes(seatId)) {
      onSeatsChange(selectedSeats.filter((id) => id !== seatId));
    } else if (selectedSeats.length < totalPassengers) {
      onSeatsChange([...selectedSeats, seatId]);
    }
  };

  const getTotalSeatsPrice = () => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = seats.find((s) => s.id === seatId);
      return total + (seat?.price || 0);
    }, 0);
  };

  const getSeatColor = (seat: Seat) => {
    if (!seat.available) return "bg-muted text-muted-foreground";
    if (selectedSeats.includes(seat.id)) return "bg-primary text-white";
    if (seat.type === "front") return "bg-purple-100 text-purple-700 hover:bg-purple-200";
    if (seat.type === "extra") return "bg-blue-100 text-blue-700 hover:bg-blue-200";
    return "bg-secondary text-foreground hover:bg-secondary/80";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20">
        <h2 className="text-2xl font-bold text-primary mb-2">Sélection des sièges</h2>
        <p className="text-muted-foreground">
          Sélectionnez {totalPassengers} siège{totalPassengers > 1 ? "s" : ""} pour votre voyage
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Légende */}
        <Card className="p-6 h-fit">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Armchair className="h-5 w-5 text-primary" />
            Légende
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                <Armchair className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Standard</p>
                <p className="text-xs text-muted-foreground"><Price amount={8} fromCurrency="EUR" /></p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                <Armchair className="h-4 w-4 text-blue-700" />
              </div>
              <div>
                <p className="text-sm font-medium">Espace extra</p>
                <p className="text-xs text-muted-foreground"><Price amount={15} fromCurrency="EUR" /></p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                <Armchair className="h-4 w-4 text-purple-700" />
              </div>
              <div>
                <p className="text-sm font-medium">Avant de l'avion</p>
                <p className="text-xs text-muted-foreground"><Price amount={23} fromCurrency="EUR" /></p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <Armchair className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">Sélectionné</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                <X className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Indisponible</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm font-semibold mb-2">
              Sièges sélectionnés: {selectedSeats.length}/{totalPassengers}
            </p>
            {selectedSeats.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedSeats.map((seatId) => (
                  <Badge key={seatId} variant="secondary" className="px-3 py-1">
                    {seatId}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {getTotalSeatsPrice() > 0 && (
            <div className="mt-4 p-3 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground">Total sièges</p>
              <p className="text-xl font-bold text-primary">
                <Price amount={getTotalSeatsPrice()} fromCurrency="EUR" showLoader />
              </p>
            </div>
          )}
        </Card>

        {/* Plan de l'avion */}
        <Card className="p-6 lg:col-span-2 overflow-x-auto">
          <div className="mb-6 text-center">
            <div className="inline-block bg-primary/10 px-6 py-2 rounded-full">
              <p className="text-sm font-semibold text-primary">Avant de l'avion</p>
            </div>
          </div>

          <div className="space-y-2 min-w-fit">
            {/* En-tête des colonnes */}
            <div className="flex gap-2 justify-center mb-4">
              {letters.map((letter, idx) => (
                <div
                  key={idx}
                  className="w-10 h-6 flex items-center justify-center text-sm font-semibold text-muted-foreground"
                >
                  {letter}
                </div>
              ))}
            </div>

            {/* Rangées de sièges */}
            {Array.from({ length: rows }, (_, i) => i + 1).map((row) => (
              <div key={row} className="flex gap-2 justify-center items-center">
                <div className="w-8 text-sm font-semibold text-muted-foreground text-right">
                  {row}
                </div>
                {letters.map((letter, idx) => {
                  if (letter === "") {
                    return <div key={idx} className="w-10" />;
                  }
                  const seat = seats.find((s) => s.row === row && s.letter === letter);
                  if (!seat) return null;

                  return (
                    <button
                      key={seat.id}
                      type="button"
                      onClick={() => handleSeatClick(seat.id)}
                      disabled={!seat.available}
                      className={`w-10 h-10 rounded flex items-center justify-center text-xs font-medium transition-all ${getSeatColor(
                        seat
                      )} ${
                        seat.available && !selectedSeats.includes(seat.id)
                          ? "cursor-pointer"
                          : ""
                      } ${!seat.available ? "cursor-not-allowed opacity-50" : ""}`}
                      title={seat.available ? `Siège ${seat.id} - ${Math.round(seat.price * 656).toLocaleString()} FCFA` : "Non disponible"}
                    >
                      {seat.available ? (
                        <Armchair className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </button>
                  );
                })}
                <div className="w-8 text-sm font-semibold text-muted-foreground">
                  {row}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <div className="inline-block bg-muted px-6 py-2 rounded-full">
              <p className="text-sm font-semibold text-muted-foreground">Arrière de l'avion</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Retour
        </Button>
        <div className="flex-1">
          <UnifiedSubmitButton variant="booking" fullWidth onClick={onNext}>
            Continuer vers le paiement
          </UnifiedSubmitButton>
        </div>
      </div>
    </motion.div>
  );
};
