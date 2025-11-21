import { useState } from "react";
import { LucideIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { AirportAutocomplete } from "@/components/AirportAutocomplete";
import { HotelAutocomplete } from "@/components/HotelAutocomplete";
import { CityAutocomplete } from "@/components/CityAutocomplete";

interface UnifiedAutocompleteProps {
  type: "airport" | "hotel" | "city";
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: LucideIcon;
  label?: string;
  required?: boolean;
}

export const UnifiedAutocomplete = ({
  type,
  value,
  onChange,
  placeholder,
  icon: Icon,
  label,
  required = false,
}: UnifiedAutocompleteProps) => {
  const renderAutocomplete = () => {
    switch (type) {
      case "airport":
        return (
          <AirportAutocomplete
            value={value}
            onChange={onChange}
            placeholder={placeholder}
          />
        );
      case "hotel":
        return (
          <HotelAutocomplete
            value={value}
            onChange={onChange}
            placeholder={placeholder}
          />
        );
      case "city":
        return (
          <CityAutocomplete
            value={value}
            onChange={onChange}
            placeholder={placeholder}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" />}
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      {renderAutocomplete()}
    </div>
  );
};
