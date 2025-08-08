import React from "react";
import { Label } from "@/components/ui/label";
import { SelectSimple } from "./FormFieldSelectSimple";
import { cn } from "@/lib/utils";

interface FormSelectProps {
  label: string;
  placeholder: string;
  options: Array<{ label: string; value: string }>;
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
  containerClassName?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
}

export const FormSelect = React.forwardRef<HTMLDivElement, FormSelectProps>(
  ({ 
    label, 
    placeholder, 
    options, 
    value, 
    onChange, 
    error, 
    errorMessage, 
    required, 
    containerClassName, 
    className,
    id,
    disabled,
    ...props 
  }, ref) => {
    return (
      <div className={cn("space-y-2", containerClassName)} ref={ref}>
        <Label htmlFor={id} className="text-sm font-medium text-foreground">
          {error && errorMessage ? (
            <span className="text-destructive">{errorMessage}</span>
          ) : (
            <>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </>
          )}
        </Label>
        <SelectSimple
          id={id}
          placeholder={placeholder}
          value={value || ""}
          onChange={onChange}
          options={options}
          error={error}
          disabled={disabled}
          className={cn("h-11", className)}
          {...props}
        />
        {error && errorMessage && (
          <p className="text-sm text-destructive">{errorMessage}</p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = "FormSelect";
