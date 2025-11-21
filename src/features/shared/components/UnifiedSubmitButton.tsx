import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2, Search, ShoppingCart, CreditCard, LogIn, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UnifiedSubmitButtonProps {
  children: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  variant?: "search" | "booking" | "payment" | "auth" | "contact";
  className?: string;
  fullWidth?: boolean;
  icon?: ReactNode;
}

/**
 * UnifiedSubmitButton - Bouton de soumission unifié premium
 */
export const UnifiedSubmitButton = ({
  children,
  loading = false,
  disabled = false,
  variant = "search",
  className,
  fullWidth = false,
  icon,
}: UnifiedSubmitButtonProps) => {
  const getDefaultIcon = () => {
    switch (variant) {
      case "search":
        return <Search className="w-4 h-4" />;
      case "booking":
        return <ShoppingCart className="w-4 h-4" />;
      case "payment":
        return <CreditCard className="w-4 h-4" />;
      case "auth":
        return <LogIn className="w-4 h-4" />;
      case "contact":
        return <Send className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const displayIcon = icon || getDefaultIcon();

  return (
    <motion.div
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={cn(fullWidth && "w-full")}
    >
      <Button
        type="submit"
        disabled={disabled || loading}
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          fullWidth && "w-full",
          className
        )}
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="ml-2">Chargement...</span>
          </>
        ) : (
          <>
            {displayIcon}
            <span className="ml-2">{children}</span>
          </>
        )}
      </Button>
    </motion.div>
  );
};
