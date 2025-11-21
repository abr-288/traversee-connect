import { LucideIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

interface UnifiedPassengerSelectorProps {
  value: PassengerCounts;
  onChange: (value: PassengerCounts) => void;
  icon?: LucideIcon;
  label?: string;
  required?: boolean;
}

export const UnifiedPassengerSelector = ({
  value,
  onChange,
  icon: Icon,
  label,
  required = false,
}: UnifiedPassengerSelectorProps) => {
  const updateCount = (type: keyof PassengerCounts, delta: number) => {
    const newValue = { ...value };
    newValue[type] = Math.max(0, newValue[type] + delta);
    if (type === "adults" && newValue[type] < 1) newValue[type] = 1;
    onChange(newValue);
  };

  const totalPassengers = value.adults + value.children + value.infants;

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
          <Button variant="outline" className="w-full justify-start">
            {Icon && <Icon className="mr-2 h-4 w-4" />}
            {totalPassengers} {totalPassengers > 1 ? "voyageurs" : "voyageur"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <PassengerRow
              label="Adultes"
              description="12 ans et plus"
              count={value.adults}
              onIncrement={() => updateCount("adults", 1)}
              onDecrement={() => updateCount("adults", -1)}
              minValue={1}
            />
            <PassengerRow
              label="Enfants"
              description="2-11 ans"
              count={value.children}
              onIncrement={() => updateCount("children", 1)}
              onDecrement={() => updateCount("children", -1)}
            />
            <PassengerRow
              label="Bébés"
              description="Moins de 2 ans"
              count={value.infants}
              onIncrement={() => updateCount("infants", 1)}
              onDecrement={() => updateCount("infants", -1)}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

interface PassengerRowProps {
  label: string;
  description: string;
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
  minValue?: number;
}

const PassengerRow = ({
  label,
  description,
  count,
  onIncrement,
  onDecrement,
  minValue = 0,
}: PassengerRowProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={onDecrement}
          disabled={count <= minValue}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center">{count}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={onIncrement}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
