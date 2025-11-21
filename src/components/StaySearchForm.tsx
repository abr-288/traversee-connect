import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { AlertCircle } from "lucide-react";
import { UnifiedForm, UnifiedAutocomplete, UnifiedDatePicker, UnifiedSubmitButton } from "@/components/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { staySearchSchema, type StaySearchInput } from "@/lib/validationSchemas";
import { safeValidate } from "@/lib/formHelpers";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export const StaySearchForm = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [propertyType, setPropertyType] = useState<"all" | "apartment" | "house" | "villa" | "guesthouse">("all");
  const [guests, setGuests] = useState(2);

  // État des erreurs de validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validation en temps réel
  useEffect(() => {
    if (Object.keys(touched).length === 0) return;

    const formData: StaySearchInput = {
      destination: destination || "",
      checkIn: checkIn ? format(checkIn, "yyyy-MM-dd") : "",
      checkOut: checkOut ? format(checkOut, "yyyy-MM-dd") : "",
      guests,
      propertyType,
    };

    const validation = safeValidate(staySearchSchema, formData);
    
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
  }, [destination, checkIn, checkOut, guests, propertyType, touched]);

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Marquer tous les champs comme touchés
    setTouched({
      destination: true,
      checkIn: true,
      checkOut: true,
      guests: true,
      propertyType: true,
    });

    // Validation complète avant soumission
    const formData: StaySearchInput = {
      destination: destination || "",
      checkIn: checkIn ? format(checkIn, "yyyy-MM-dd") : "",
      checkOut: checkOut ? format(checkOut, "yyyy-MM-dd") : "",
      guests,
      propertyType,
    };

    const validation = safeValidate(staySearchSchema, formData);

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
      destination: validation.data.destination,
      checkIn: validation.data.checkIn,
      checkOut: validation.data.checkOut,
      guests: validation.data.guests.toString(),
      ...(validation.data.propertyType !== "all" && { type: validation.data.propertyType }),
    });

    navigate(`/stays?${params.toString()}`);
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <UnifiedForm onSubmit={handleSearch} variant="search" className="w-full max-w-6xl mx-auto">
      {/* Alert d'erreur générale */}
      {hasErrors && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Veuillez corriger les erreurs dans le formulaire
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="md:col-span-2 space-y-1">
          <UnifiedAutocomplete
            label={t("search.destination")}
            type="location"
            value={destination}
            onChange={(value) => {
              setDestination(value);
              handleBlur("destination");
            }}
            placeholder={t("search.location")}
            required
            className={errors.destination && touched.destination ? "border-destructive" : ""}
          />
          {errors.destination && touched.destination && (
            <p className="text-xs text-destructive mt-1 animate-in slide-in-from-top-1">
              {errors.destination}
            </p>
          )}
        </div>

        <div className="md:col-span-1 space-y-1">
          <UnifiedDatePicker
            label={t("search.checkIn")}
            value={checkIn}
            onChange={(date) => {
              setCheckIn(date);
              handleBlur("checkIn");
            }}
            minDate={new Date()}
          />
          {errors.checkIn && touched.checkIn && (
            <p className="text-xs text-destructive mt-1 animate-in slide-in-from-top-1">
              {errors.checkIn}
            </p>
          )}
        </div>

        <div className="md:col-span-1 space-y-1">
          <UnifiedDatePicker
            label={t("search.checkOut")}
            value={checkOut}
            onChange={(date) => {
              setCheckOut(date);
              handleBlur("checkOut");
            }}
            minDate={checkIn || new Date()}
          />
          {errors.checkOut && touched.checkOut && (
            <p className="text-xs text-destructive mt-1 animate-in slide-in-from-top-1">
              {errors.checkOut}
            </p>
          )}
        </div>

        <div className="md:col-span-1 space-y-2">
          <label className="text-sm font-medium text-foreground">{t("search.guests")} *</label>
          <Select 
            value={guests.toString()} 
            onValueChange={(value) => {
              setGuests(parseInt(value));
              handleBlur("guests");
            }}
          >
            <SelectTrigger className={cn("h-11", errors.guests && touched.guests && "border-destructive")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.guests && touched.guests && (
            <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors.guests}</p>
          )}
        </div>

        <div className="md:col-span-1 flex items-end">
          <UnifiedSubmitButton 
            fullWidth
            disabled={hasErrors}
            className={hasErrors ? "opacity-50 cursor-not-allowed" : ""}
          >
            {t("search.search")}
          </UnifiedSubmitButton>
        </div>
      </div>

      <div className="mt-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("search.type")}</label>
          <Select 
            value={propertyType} 
            onValueChange={(value) => {
              setPropertyType(value as typeof propertyType);
              handleBlur("propertyType");
            }}
          >
            <SelectTrigger className={cn("h-11", errors.propertyType && touched.propertyType && "border-destructive")}>
              <SelectValue placeholder={t("search.allCategories")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("search.allCategories")}</SelectItem>
              <SelectItem value="apartment">Appartement</SelectItem>
              <SelectItem value="house">Maison</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="guesthouse">Maison d'hôtes</SelectItem>
            </SelectContent>
          </Select>
          {errors.propertyType && touched.propertyType && (
            <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors.propertyType}</p>
          )}
        </div>
      </div>
    </UnifiedForm>
  );
};

