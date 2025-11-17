import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface UnifiedFormFieldProps {
  label?: string;
  icon?: LucideIcon;
  type?: "text" | "email" | "password" | "number" | "tel" | "date" | "time" | "textarea";
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  disabled?: boolean;
  children?: ReactNode;
  name?: string;
  id?: string;
  min?: number;
  max?: number;
  defaultValue?: string | number;
}

/**
 * UnifiedFormField - Champ de formulaire premium avec animations
 * Style Opodo/Booking avec thème Bossiz
 */
export const UnifiedFormField = ({
  label,
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  error,
  hint,
  className,
  disabled = false,
  children,
  name,
  id,
  min,
  max,
  defaultValue,
}: UnifiedFormFieldProps) => {
  const fieldId = id || name || `field-${Math.random()}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("space-y-2", className)}
    >
      {label && (
        <Label 
          htmlFor={fieldId}
          className={cn(
            "text-sm font-semibold text-foreground flex items-center gap-2",
            required && "after:content-['*'] after:text-destructive after:ml-0.5"
          )}
        >
          {Icon && <Icon className="w-4 h-4 text-primary" />}
          {label}
        </Label>
      )}

      <div className="relative group">
        {children ? (
          children
        ) : type === "textarea" ? (
          <Textarea
            id={fieldId}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={cn(
              "min-h-[120px] resize-none",
              "border-2 border-input hover:border-primary/50 focus:border-primary",
              "transition-all duration-200",
              "placeholder:text-muted-foreground/60",
              error && "border-destructive focus:border-destructive"
            )}
          />
        ) : (
          <>
            {Icon && (
              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors pointer-events-none z-10" />
            )}
            <Input
              id={fieldId}
              name={name}
              type={type}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              required={required}
              disabled={disabled}
              min={min}
              max={max}
              defaultValue={defaultValue}
              className={cn(
                Icon && "pl-11",
                "h-12 border-2 border-input hover:border-primary/50 focus:border-primary",
                "transition-all duration-200",
                "placeholder:text-muted-foreground/60",
                "font-medium",
                error && "border-destructive focus:border-destructive"
              )}
            />
          </>
        )}
      </div>

      {hint && !error && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          {hint}
        </p>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xs text-destructive font-medium flex items-center gap-1"
        >
          ⚠️ {error}
        </motion.p>
      )}
    </motion.div>
  );
};
