import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface UnifiedFormProps {
  onSubmit: (e: React.FormEvent) => void;
  children: ReactNode;
  className?: string;
  loading?: boolean;
  variant?: "search" | "booking" | "auth" | "payment" | "contact";
}

/**
 * UnifiedForm - Formulaire universel premium type Opodo/Booking
 * Design harmonisé avec identité Bossiz (#192342)
 */
export const UnifiedForm = ({
  onSubmit,
  children,
  className,
  loading = false,
  variant = "search",
}: UnifiedFormProps) => {
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut" as const
      }
    }
  };

  const variantStyles = {
    search: "bg-white rounded-2xl shadow-lg border border-border/50 p-4 md:p-6",
    booking: "bg-gradient-to-br from-white to-muted/30 rounded-2xl shadow-xl border border-border p-6 md:p-8",
    auth: "bg-white rounded-2xl shadow-2xl border border-border p-6 md:p-8 max-w-md mx-auto",
    payment: "bg-gradient-to-br from-white via-white to-accent/10 rounded-2xl shadow-xl border-2 border-primary/20 p-6 md:p-8",
    contact: "bg-white rounded-xl shadow-md border border-border/50 p-4 md:p-6"
  };

  return (
    <motion.form
      initial="hidden"
      animate="visible"
      variants={variants}
      onSubmit={onSubmit}
      className={cn(
        "w-full transition-all duration-300",
        variantStyles[variant],
        loading && "opacity-60 pointer-events-none",
        className
      )}
    >
      {children}
    </motion.form>
  );
};
