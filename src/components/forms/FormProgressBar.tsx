import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormProgressBarProps {
  totalFields: number;
  completedFields: number;
  className?: string;
}

/**
 * FormProgressBar - Barre de progression du formulaire
 * Affiche visuellement la progression de remplissage du formulaire
 */
export const FormProgressBar = ({
  totalFields,
  completedFields,
  className
}: FormProgressBarProps) => {
  const progress = (completedFields / totalFields) * 100;
  const isComplete = completedFields === totalFields;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {isComplete && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-green-500"
            >
              <CheckCircle2 className="h-4 w-4" />
            </motion.div>
          )}
          <span className={cn(
            "font-medium",
            isComplete ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
          )}>
            {isComplete ? "Formulaire complet !" : `Progression : ${completedFields}/${totalFields} champs`}
          </span>
        </div>
        <span className="text-muted-foreground font-semibold">
          {Math.round(progress)}%
        </span>
      </div>
      
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={cn(
            "h-full rounded-full transition-colors duration-300",
            isComplete 
              ? "bg-gradient-to-r from-green-500 to-green-600" 
              : "bg-gradient-to-r from-primary to-primary/70"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};
