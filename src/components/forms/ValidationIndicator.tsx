import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ValidationIndicatorProps {
  status: "idle" | "validating" | "valid" | "invalid";
  message?: string;
  className?: string;
}

/**
 * ValidationIndicator - Indicateur visuel de l'état de validation
 * Affiche une icône et un message selon l'état de validation
 */
export const ValidationIndicator = ({
  status,
  message,
  className
}: ValidationIndicatorProps) => {
  return (
    <AnimatePresence mode="wait">
      {status !== "idle" && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className={cn("flex items-center gap-2", className)}
        >
          {status === "validating" && (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Validation...</span>
            </>
          )}
          
          {status === "valid" && (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              {message && (
                <span className="text-xs text-green-600 dark:text-green-400">
                  {message}
                </span>
              )}
            </>
          )}
          
          {status === "invalid" && message && (
            <>
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-xs text-destructive">{message}</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
