import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { AlertCircle } from "lucide-react";
import { 
  UnifiedForm, 
  UnifiedAutocomplete,
  UnifiedDatePicker,
  UnifiedSubmitButton 
} from "@/features/shared";
import { useTranslation } from "react-i18next";
import { carRentalSchema, type CarRentalInput } from "@/lib/validationSchemas";
import { safeValidate } from "@/lib/formHelpers";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const CarSearchForm = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [pickupDate, setPickupDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnTime, setReturnTime] = useState("10:00");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (Object.keys(touched).length === 0) return;

    const formData: Partial<CarRentalInput> = {
      pickupLocation: location || "",
      dropoffLocation: location || "",
      pickupDate: pickupDate ? format(pickupDate, "yyyy-MM-dd") : "",
      pickupTime,
      dropoffDate: returnDate ? format(returnDate, "yyyy-MM-dd") : "",
      dropoffTime: returnTime,
      driverAge: 25,
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
    
    setTouched({
      pickupLocation: true,
      dropoffLocation: true,
      pickupDate: true,
      pickupTime: true,
      dropoffDate: true,
      dropoffTime: true,
    });

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
    <UnifiedForm onSubmit={handleSearch} variant="search" className="w-full max-w-6xl mx-auto p-4 md:p-6">
      {hasErrors && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Veuillez corriger les erreurs dans le formulaire
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1">
            <UnifiedAutocomplete
              label={t("search.pickup")}
              type="city"
              value={location}
              onChange={(value) => {
                setLocation(value);
                handleBlur("pickupLocation");
              }}
              placeholder={t("search.cityOrAirport")}
            />
            {errors.pickupLocation && touched.pickupLocation && (
              <p className="text-xs text-destructive mt-1 animate-in slide-in-from-top-1">
                {errors.pickupLocation}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <UnifiedDatePicker
              label={t("search.pickup")}
              value={pickupDate}
              onChange={(date) => {
                setPickupDate(date);
                handleBlur("pickupDate");
              }}
              minDate={new Date()}
              placeholder="Sélectionner une date"
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
              placeholder="Sélectionner une date"
            />
            {errors.dropoffDate && touched.dropoffDate && (
              <p className="text-xs text-destructive mt-1 animate-in slide-in-from-top-1">
                {errors.dropoffDate}
              </p>
            )}
          </div>
        </div>

        <div className="pt-2">
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
