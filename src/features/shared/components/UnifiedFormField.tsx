import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface UnifiedFormFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "tel" | "date" | "time" | "textarea";
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  minLength?: number;
  className?: string;
  error?: string;
}

export const UnifiedFormField = ({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  defaultValue,
  minLength,
  className,
  error,
}: UnifiedFormFieldProps) => {
  const inputClassName = cn(
    "w-full",
    error && "border-destructive",
    className
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      {type === "textarea" ? (
        <Textarea
          id={name}
          name={name}
          placeholder={placeholder}
          required={required}
          defaultValue={defaultValue}
          className={inputClassName}
        />
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          defaultValue={defaultValue}
          minLength={minLength}
          className={inputClassName}
        />
      )}
      
      {error && (
        <p className="text-xs text-destructive animate-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
};
