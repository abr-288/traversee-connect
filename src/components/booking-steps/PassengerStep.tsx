import { motion } from "framer-motion";
import { User, Users, Calendar, Globe } from "lucide-react";
import { UnifiedForm } from "@/components/forms/UnifiedForm";
import { UnifiedFormField } from "@/components/forms/UnifiedFormField";
import { UnifiedSubmitButton } from "@/components/forms/UnifiedSubmitButton";
import { CountryCodeSelect } from "@/components/CountryCodeSelect";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Passenger {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  documentType: string;
  documentNumber: string;
}

interface PassengerStepProps {
  passengers: Passenger[];
  onPassengersChange: (passengers: Passenger[]) => void;
  adultsCount: number;
  childrenCount: number;
  onNext: () => void;
}

export const PassengerStep = ({
  passengers,
  onPassengersChange,
  adultsCount,
  childrenCount,
  onNext,
}: PassengerStepProps) => {
  const totalPassengers = adultsCount + childrenCount;

  const handlePassengerChange = (index: number, field: keyof Passenger, value: string) => {
    const newPassengers = [...passengers];
    if (!newPassengers[index]) {
      newPassengers[index] = {
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        nationality: "",
        documentType: "passport",
        documentNumber: "",
      };
    }
    newPassengers[index] = { ...newPassengers[index], [field]: value };
    onPassengersChange(newPassengers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20">
        <h2 className="text-2xl font-bold text-primary mb-2">Informations des passagers</h2>
        <p className="text-muted-foreground">
          Veuillez renseigner les informations exactement comme indiqué sur les documents d'identité
        </p>
      </div>

      <UnifiedForm onSubmit={handleSubmit} variant="booking">
        <div className="space-y-6">
          {/* Passager principal */}
          <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Passager principal (Adulte)</h3>
                <p className="text-sm text-muted-foreground">Contact de réservation</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UnifiedFormField
                label="Prénom"
                icon={User}
                value={passengers[0]?.firstName || ""}
                onChange={(e) => handlePassengerChange(0, "firstName", e.target.value)}
                required
                placeholder="Prénom"
              />
              <UnifiedFormField
                label="Nom"
                icon={User}
                value={passengers[0]?.lastName || ""}
                onChange={(e) => handlePassengerChange(0, "lastName", e.target.value)}
                required
                placeholder="Nom"
              />
              <UnifiedFormField
                label="Date de naissance"
                type="date"
                icon={Calendar}
                value={passengers[0]?.dateOfBirth || ""}
                onChange={(e) => handlePassengerChange(0, "dateOfBirth", e.target.value)}
                required
              />
              <div className="space-y-2">
                <Label>Nationalité</Label>
                <CountryCodeSelect
                  value={passengers[0]?.nationality || ""}
                  onValueChange={(value) => handlePassengerChange(0, "nationality", value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Type de document</Label>
                <Select
                  value={passengers[0]?.documentType || "passport"}
                  onValueChange={(value) => handlePassengerChange(0, "documentType", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">Passeport</SelectItem>
                    <SelectItem value="id_card">Carte d'identité</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <UnifiedFormField
                label="Numéro de document"
                icon={Globe}
                value={passengers[0]?.documentNumber || ""}
                onChange={(e) => handlePassengerChange(0, "documentNumber", e.target.value)}
                required
                placeholder="Ex: 123456789"
              />
            </div>
          </Card>

          {/* Passagers additionnels */}
          {totalPassengers > 1 && (
            <div className="space-y-4">
              {Array.from({ length: totalPassengers - 1 }, (_, i) => i + 1).map((index) => (
                <Card key={index} className="p-6 border border-border/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Passager {index + 1} ({index < adultsCount ? "Adulte" : "Enfant"})
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UnifiedFormField
                      label="Prénom"
                      icon={User}
                      value={passengers[index]?.firstName || ""}
                      onChange={(e) => handlePassengerChange(index, "firstName", e.target.value)}
                      required
                      placeholder="Prénom"
                    />
                    <UnifiedFormField
                      label="Nom"
                      icon={User}
                      value={passengers[index]?.lastName || ""}
                      onChange={(e) => handlePassengerChange(index, "lastName", e.target.value)}
                      required
                      placeholder="Nom"
                    />
                    <UnifiedFormField
                      label="Date de naissance"
                      type="date"
                      icon={Calendar}
                      value={passengers[index]?.dateOfBirth || ""}
                      onChange={(e) => handlePassengerChange(index, "dateOfBirth", e.target.value)}
                      required
                    />
                    <div className="space-y-2">
                      <Label>Nationalité</Label>
                      <CountryCodeSelect
                        value={passengers[index]?.nationality || ""}
                        onValueChange={(value) => handlePassengerChange(index, "nationality", value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type de document</Label>
                      <Select
                        value={passengers[index]?.documentType || "passport"}
                        onValueChange={(value) => handlePassengerChange(index, "documentType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="passport">Passeport</SelectItem>
                          <SelectItem value="id_card">Carte d'identité</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <UnifiedFormField
                      label="Numéro de document"
                      icon={Globe}
                      value={passengers[index]?.documentNumber || ""}
                      onChange={(e) => handlePassengerChange(index, "documentNumber", e.target.value)}
                      required
                      placeholder="Ex: 123456789"
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="flex items-start space-x-2 p-4 bg-muted/50 rounded-lg">
            <Checkbox id="terms" required />
            <label
              htmlFor="terms"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              J'accepte les conditions générales de vente et la politique de confidentialité de B-reserve
            </label>
          </div>
        </div>

        <div className="mt-8">
          <UnifiedSubmitButton variant="booking" fullWidth>
            Continuer vers les bagages
          </UnifiedSubmitButton>
        </div>
      </UnifiedForm>
    </motion.div>
  );
};
