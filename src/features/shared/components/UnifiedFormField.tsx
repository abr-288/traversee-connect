import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ValidationIndicator } from "@/components/forms/ValidationIndicator";
import { ContextualHelp } from "@/components/forms/ContextualHelp";
import { useState } from "react";

export interface UnifiedFormFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "tel" | "date" | "time" | "textarea" | "number";
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  minLength?: number;
  min?: number;
  max?: number;
  className?: string;
  error?: string;
  helpText?: string;
  validMessage?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}

export const UnifiedFormField = ({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  defaultValue,
  minLength,
  min,
  max,
  className,
  error,
  helpText,
  validMessage,
  onChange,
  onBlur,
}: UnifiedFormFieldProps) => {
  const [value, setValue] = useState(defaultValue || "");
  const [touched, setTouched] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange?.(newValue);
  };

  const handleBlur = () => {
    setTouched(true);
    onBlur?.();
  };

  const getValidationStatus = () => {
    if (!touched || !value) return "idle";
    if (error) return "invalid";
    if (validMessage) return "valid";
    return "idle";
  };

  const inputClassName = cn(
    "w-full transition-all duration-200",
    error && touched && "border-destructive focus:ring-destructive",
    !error && touched && value && "border-green-500 focus:ring-green-500",
    className
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {helpText && <ContextualHelp content={helpText} />}
      </div>
      
      {type === "textarea" ? (
        <Textarea
          id={name}
          name={name}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={inputClassName}
        />
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          minLength={minLength}
          min={min}
          max={max}
          className={inputClassName}
        />
      )}
      
      <ValidationIndicator
        status={getValidationStatus()}
        message={error || (touched && value ? validMessage : undefined)}
      />
    </div>
  );
};
