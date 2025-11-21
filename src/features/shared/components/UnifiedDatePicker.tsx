import { LucideIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface UnifiedDatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder: string;
  icon?: LucideIcon;
  label?: string;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export const UnifiedDatePicker = ({
  value,
  onChange,
  placeholder,
  icon: Icon,
  label,
  required = false,
  minDate,
  maxDate,
}: UnifiedDatePickerProps) => {
  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" />}
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            {Icon && <Icon className="mr-2 h-4 w-4" />}
            {value ? format(value, "PPP", { locale: fr }) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            disabled={(date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
