import { motion } from "framer-motion";
import { User, Users, Calendar, Globe } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { passengersFormSchema } from "@/lib/validation";
import { z } from "zod";
import { CountryCodeSelect } from "@/components/CountryCodeSelect";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface Passenger {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  documentType: "passport" | "id_card";
  documentNumber: string;
}

interface PassengerStepProps {
  passengers: Passenger[];
  onPassengersChange: (passengers: Passenger[]) => void;
  adultsCount: number;
  childrenCount: number;
  onNext: () => void;
}

type PassengersFormValues = z.infer<typeof passengersFormSchema>;

export const PassengerStep = ({
  passengers,
  onPassengersChange,
  adultsCount,
  childrenCount,
  onNext,
}: PassengerStepProps) => {
  const totalPassengers = adultsCount + childrenCount;

  // Initialize form with react-hook-form and zod validation
  const form = useForm<PassengersFormValues>({
    resolver: zodResolver(passengersFormSchema),
    mode: "onChange", // Validation en temps réel
    defaultValues: {
      passengers: Array.from({ length: totalPassengers }, (_, i) => passengers[i] || {
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        nationality: "",
        documentType: "passport",
        documentNumber: "",
      }),
      termsAccepted: false,
    },
  });

  const handleSubmit = (data: PassengersFormValues) => {
    // Cast the validated data to Passenger[] type
    const validatedPassengers: Passenger[] = data.passengers.map(p => ({
      firstName: p.firstName || "",
      lastName: p.lastName || "",
      dateOfBirth: p.dateOfBirth || "",
      nationality: p.nationality || "",
      documentType: p.documentType || "passport",
      documentNumber: p.documentNumber || "",
    }));
    onPassengersChange(validatedPassengers);
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
              <FormField
                control={form.control}
                name="passengers.0.firstName"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      Prénom *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Prénom"
                        className="h-12 border-2"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="passengers.0.lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      Nom *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nom"
                        className="h-12 border-2"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passengers.0.dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Date de naissance *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        className="h-12 border-2"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passengers.0.nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nationalité *</FormLabel>
                    <FormControl>
                      <CountryCodeSelect
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passengers.0.documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de document *</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="h-12 border-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="passport">Passeport</SelectItem>
                          <SelectItem value="id_card">Carte d'identité</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passengers.0.documentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      Numéro de document *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ex: 123456789"
                        className="h-12 border-2"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
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
                    <FormField
                      control={form.control}
                      name={`passengers.${index}.firstName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" />
                            Prénom *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Prénom"
                              className="h-12 border-2"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`passengers.${index}.lastName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" />
                            Nom *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Nom"
                              className="h-12 border-2"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`passengers.${index}.dateOfBirth`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            Date de naissance *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              className="h-12 border-2"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`passengers.${index}.nationality`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nationalité *</FormLabel>
                          <FormControl>
                            <CountryCodeSelect
                              value={field.value}
                              onValueChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`passengers.${index}.documentType`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type de document *</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="h-12 border-2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="passport">Passeport</SelectItem>
                                <SelectItem value="id_card">Carte d'identité</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`passengers.${index}.documentNumber`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-primary" />
                            Numéro de document *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ex: 123456789"
                              className="h-12 border-2"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}

          <FormField
            control={form.control}
            name="termsAccepted"
            render={({ field }) => (
              <FormItem className="flex items-start space-x-2 p-4 bg-muted/50 rounded-lg">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal cursor-pointer">
                    J'accepte les conditions générales de vente et la politique de confidentialité de B-reserve
                  </FormLabel>
                  <FormMessage className="text-xs" />
                </div>
              </FormItem>
            )}
          />

          <div className="mt-8">
            <Button
              type="submit"
              className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Vérification..." : "Continuer vers les bagages"}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
};
