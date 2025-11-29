import { motion } from "framer-motion";
import { Briefcase, Plus, Minus, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UnifiedSubmitButton } from "@/components/forms/UnifiedSubmitButton";
import { Price } from "@/components/ui/price";

interface BaggageOption {
  id: string;
  type: "cabin" | "checked";
  weight: number;
  price: number;
  included: boolean;
}

interface BaggageStepProps {
  selectedBaggage: Record<string, number>;
  onBaggageChange: (baggageId: string, quantity: number) => void;
  adultsCount: number;
  childrenCount: number;
  onNext: () => void;
  onBack: () => void;
}

export const BaggageStep = ({
  selectedBaggage,
  onBaggageChange,
  adultsCount,
  childrenCount,
  onNext,
  onBack,
}: BaggageStepProps) => {
  const totalPassengers = adultsCount + childrenCount;

  const baggageOptions: BaggageOption[] = [
    {
      id: "cabin-small",
      type: "cabin",
      weight: 7,
      price: 0,
      included: true,
    },
    {
      id: "cabin-large",
      type: "cabin",
      weight: 10,
      price: 15000,
      included: false,
    },
    {
      id: "checked-20",
      type: "checked",
      weight: 20,
      price: 25000,
      included: false,
    },
    {
      id: "checked-30",
      type: "checked",
      weight: 30,
      price: 40000,
      included: false,
    },
  ];

  const handleQuantityChange = (baggageId: string, delta: number) => {
    const currentQuantity = selectedBaggage[baggageId] || 0;
    const newQuantity = Math.max(0, Math.min(totalPassengers, currentQuantity + delta));
    onBaggageChange(baggageId, newQuantity);
  };

  const getTotalBaggagePrice = () => {
    return Object.entries(selectedBaggage).reduce((total, [id, quantity]) => {
      const option = baggageOptions.find((opt) => opt.id === id);
      return total + (option?.price || 0) * quantity;
    }, 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20">
        <h2 className="text-2xl font-bold text-primary mb-2">Sélection des bagages</h2>
        <p className="text-muted-foreground">
          Ajoutez des bagages pour votre voyage ({totalPassengers} passager{totalPassengers > 1 ? "s" : ""})
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Bagages cabine */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Bagages cabine
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {baggageOptions
              .filter((opt) => opt.type === "cabin")
              .map((option) => (
                <Card
                  key={option.id}
                  className={`p-6 transition-all ${
                    option.included
                      ? "border-2 border-primary bg-primary/5"
                      : "border border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-lg mb-1">
                        Bagage cabine {option.weight}kg
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Dimensions: 40x30x20cm
                      </p>
                    </div>
                    {option.included && (
                      <Badge className="bg-green-500">
                        <Check className="h-3 w-3 mr-1" />
                        Inclus
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="text-2xl font-bold text-primary">
                      {option.price === 0 ? "Gratuit" : <Price amount={option.price} fromCurrency="EUR" showLoader />}
                    </div>
                    {!option.included && (
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => handleQuantityChange(option.id, -1)}
                          disabled={(selectedBaggage[option.id] || 0) === 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold">
                          {selectedBaggage[option.id] || 0}
                        </span>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => handleQuantityChange(option.id, 1)}
                          disabled={(selectedBaggage[option.id] || 0) >= totalPassengers}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
          </div>
        </div>

        {/* Bagages enregistrés */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Bagages enregistrés
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {baggageOptions
              .filter((opt) => opt.type === "checked")
              .map((option) => (
                <Card
                  key={option.id}
                  className="p-6 border border-border hover:border-primary/50 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-lg mb-1">
                        Bagage enregistré {option.weight}kg
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Dimensions: {option.weight === 20 ? "55x40x23cm" : "75x50x30cm"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="text-2xl font-bold text-primary">
                      <Price amount={option.price} fromCurrency="EUR" showLoader />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => handleQuantityChange(option.id, -1)}
                        disabled={(selectedBaggage[option.id] || 0) === 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold">
                        {selectedBaggage[option.id] || 0}
                      </span>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => handleQuantityChange(option.id, 1)}
                        disabled={(selectedBaggage[option.id] || 0) >= totalPassengers}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      </div>

      {/* Total */}
      {getTotalBaggagePrice() > 0 && (
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total bagages supplémentaires</span>
            <span className="text-2xl font-bold text-primary">
              <Price amount={getTotalBaggagePrice()} fromCurrency="EUR" showLoader />
            </span>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Retour
        </Button>
        <div className="flex-1">
          <UnifiedSubmitButton variant="booking" fullWidth onClick={onNext}>
            Continuer vers les sièges
          </UnifiedSubmitButton>
        </div>
      </div>
    </motion.div>
  );
};
