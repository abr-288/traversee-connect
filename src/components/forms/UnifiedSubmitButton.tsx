import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon, Search, ArrowRight, Lock, CreditCard, Send } from "lucide-react";
import { Loader2 } from "lucide-react";

interface UnifiedSubmitButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  variant?: "search" | "booking" | "payment" | "auth" | "default";
  className?: string;
  icon?: LucideIcon;
  fullWidth?: boolean;
}

/**
 * UnifiedSubmitButton - Bouton de soumission premium
 * Design type OTA (Opodo/Booking) avec animations fluides
 */
export const UnifiedSubmitButton = ({
  children,
  loading = false,
  disabled = false,
  variant = "default",
  className,
  icon,
  fullWidth = true,
}: UnifiedSubmitButtonProps) => {
  const getDefaultIcon = (): LucideIcon => {
    switch (variant) {
      case "search": return Search;
      case "booking": return ArrowRight;
      case "payment": return CreditCard;
      case "auth": return Lock;
      default: return Send;
    }
  };

  const Icon = icon || getDefaultIcon();

  const variantStyles = {
    search: "bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl",
    booking: "bg-gradient-to-r from-primary to-primary-light hover:from-primary/90 hover:to-primary text-white shadow-xl hover:shadow-2xl",
    payment: "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-xl",
    auth: "bg-primary hover:bg-primary/90 text-white shadow-lg",
    default: "bg-primary hover:bg-primary/90 text-white shadow-lg"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={cn(!fullWidth && "inline-block")}
    >
      <Button
        type="submit"
        disabled={disabled || loading}
        className={cn(
          "h-12 font-semibold text-base",
          "transition-all duration-300",
          "hover:scale-[1.02] active:scale-[0.98]",
          fullWidth && "w-full",
          variantStyles[variant],
          className
        )}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Chargement...
          </>
        ) : (
          <>
            <Icon className="mr-2 h-5 w-5" />
            {children}
          </>
        )}
      </Button>
    </motion.div>
  );
};
