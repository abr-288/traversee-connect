import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { AlertCircle } from "lucide-react";
import { 
  UnifiedForm, 
  UnifiedAutocomplete,
  UnifiedDatePicker,
  UnifiedSubmitButton 
} from "@/components/forms";
import { useTranslation } from "react-i18next";
import { carRentalSchema, type CarRentalInput } from "@/lib/validationSchemas";
import { safeValidate } from "@/lib/formHelpers";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * CarSearchForm - Recherche de voitures avec validation Zod
 * Design premium type Rentalcars/Kayak avec identité Bossiz
 */
export const CarSearchForm = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [pickupDate, setPickupDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnTime, setReturnTime] = useState("10:00");

  // État des erreurs de validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validation en temps réel
  useEffect(() => {
    if (Object.keys(touched).length === 0) return;

    const formData: Partial<CarRentalInput> = {
      pickupLocation: location || "",
      dropoffLocation: location || "", // Même lieu pour simplifier
      pickupDate: pickupDate ? format(pickupDate, "yyyy-MM-dd") : "",
      pickupTime,
      dropoffDate: returnDate ? format(returnDate, "yyyy-MM-dd") : "",
      dropoffTime: returnTime,
      driverAge: 25, // Valeur par défaut
    };

    const validation = safeValidate(carRentalSchema, formData as CarRentalInput);
    
    if (!validation.success) {
      const filteredErrors: Record<string, string> = {};
      Object.keys(validation.errors).forEach(key => {
        if (touched[key]) {
          filteredErrors[key] = validation.errors[key];
        }
      });
      setErrors(filteredErrors);
    } else {
      const clearedErrors = { ...errors };
      Object.keys(touched).forEach(key => {
        delete clearedErrors[key];
      });
      setErrors(clearedErrors);
    }
  }, [location, pickupDate, returnDate, pickupTime, returnTime, touched]);

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Marquer tous les champs comme touchés
    setTouched({
      pickupLocation: true,
      dropoffLocation: true,
      pickupDate: true,
      pickupTime: true,
      dropoffDate: true,
      dropoffTime: true,
    });

    // Validation complète avant soumission
    const formData: CarRentalInput = {
      pickupLocation: location || "",
      dropoffLocation: location || "",
      pickupDate: pickupDate ? format(pickupDate, "yyyy-MM-dd") : "",
      pickupTime,
      dropoffDate: returnDate ? format(returnDate, "yyyy-MM-dd") : "",
      dropoffTime: returnTime,
      driverAge: 25,
    };

    const validation = safeValidate(carRentalSchema, formData);

    if (!validation.success) {
      setErrors(validation.errors);
      toast({
        title: "Erreur de validation",
        description: "Veuillez corriger les erreurs dans le formulaire",
        variant: "destructive",
      });
      
      const firstErrorField = Object.keys(validation.errors)[0];
      document.getElementById(firstErrorField)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const params = new URLSearchParams({
      location: validation.data.pickupLocation,
      pickupDate: `${validation.data.pickupDate}T${validation.data.pickupTime}`,
      returnDate: `${validation.data.dropoffDate}T${validation.data.dropoffTime}`,
    });

    navigate(`/cars?${params.toString()}`);
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <UnifiedForm onSubmit={handleSearch} variant="search" className="max-w-6xl mx-auto">
      {/* Alert d'erreur générale */}
      {hasErrors && (
        <Alert variant="destructive" className="mb-3 md:mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Veuillez corriger les erreurs dans le formulaire
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3 md:space-y-4">
        {/* Ligne 1: Lieu de prise en charge */}
        <div className="grid grid-cols-1 gap-3 md:gap-4">
          <div className="space-y-1">
            <UnifiedAutocomplete
              label={t("search.pickup")}
              type="location"
              value={location}
              onChange={(value) => {
                setLocation(value);
                handleBlur("pickupLocation");
              }}
              placeholder={t("search.cityOrAirport")}
              required
              className={errors.pickupLocation && touched.pickupLocation ? "border-destructive" : ""}
            />
            {errors.pickupLocation && touched.pickupLocation && (
              <p className="text-xs text-destructive mt-1 animate-in slide-in-from-top-1">
                {errors.pickupLocation}
              </p>
            )}
          </div>
        </div>

        {/* Ligne 2: Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div className="space-y-1">
            <UnifiedDatePicker
              label={t("search.pickup")}
              value={pickupDate}
              onChange={(date) => {
                setPickupDate(date);
                handleBlur("pickupDate");
              }}
              minDate={new Date()}
              required
            />
            {errors.pickupDate && touched.pickupDate && (
              <p className="text-xs text-destructive mt-1 animate-in slide-in-from-top-1">
                {errors.pickupDate}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <UnifiedDatePicker
              label={t("search.dropoff")}
              value={returnDate}
              onChange={(date) => {
                setReturnDate(date);
                handleBlur("dropoffDate");
              }}
              minDate={pickupDate || new Date()}
              required
            />
            {errors.dropoffDate && touched.dropoffDate && (
              <p className="text-xs text-destructive mt-1 animate-in slide-in-from-top-1">
                {errors.dropoffDate}
              </p>
            )}
          </div>
        </div>

        {/* Bouton de recherche */}
        <div className="mt-4 md:mt-6">
          <UnifiedSubmitButton 
            fullWidth
            disabled={hasErrors}
            className={hasErrors ? "opacity-50 cursor-not-allowed" : ""}
          >
            {t("search.search")}
          </UnifiedSubmitButton>
        </div>
      </div>
    </UnifiedForm>
  );
};
