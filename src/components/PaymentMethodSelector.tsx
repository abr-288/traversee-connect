import { CreditCard, Smartphone, Waves, Building2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "wave",
    name: "Wave",
    description: "Paiement rapide et sécurisé",
    icon: <Waves className="h-6 w-6" />,
    color: "bg-[#1DC2FF]/10 text-[#1DC2FF] border-[#1DC2FF]/30",
  },
  {
    id: "mobile_money",
    name: "Mobile Money",
    description: "Orange, MTN, Moov",
    icon: <Smartphone className="h-6 w-6" />,
    color: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  },
  {
    id: "card",
    name: "Carte bancaire",
    description: "Visa, Mastercard",
    icon: <CreditCard className="h-6 w-6" />,
    color: "bg-violet-500/10 text-violet-500 border-violet-500/30",
  },
  {
    id: "bank_transfer",
    name: "Virement bancaire",
    description: "Transfert sécurisé",
    icon: <Building2 className="h-6 w-6" />,
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  },
];

interface PaymentMethodSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {paymentMethods.map((method) => {
        const isSelected = value === method.id;
        return (
          <button
            key={method.id}
            type="button"
            onClick={() => onChange(method.id)}
            className={cn(
              "relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200",
              "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              isSelected
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card hover:border-muted-foreground/30"
            )}
          >
            {/* Icon container */}
            <div
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-lg border",
                method.color
              )}
            >
              {method.icon}
            </div>

            {/* Text content */}
            <div className="flex-1 text-left">
              <p className={cn(
                "font-semibold text-sm",
                isSelected ? "text-primary" : "text-foreground"
              )}>
                {method.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {method.description}
              </p>
            </div>

            {/* Selected indicator */}
            {isSelected && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
