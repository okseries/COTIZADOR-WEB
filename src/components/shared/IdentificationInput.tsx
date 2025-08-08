import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface IdentificationInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  label?: string;
  required?: boolean;
  containerClassName?: string;
}

export const IdentificationInput = React.forwardRef<HTMLInputElement, IdentificationInputProps>(
  ({ 
    error, 
    label = "Identificación", 
    required = false, 
    containerClassName, 
    className,
    placeholder = "Ingrese identificación",
    ...props 
  }, ref) => {
    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <Label htmlFor={props.id} className="text-sm font-medium text-foreground">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        <Input
          ref={ref}
          className={cn(
            "h-11 w-full transition-colors",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          placeholder={placeholder}
          {...props}
        />
      </div>
    );
  }
);

IdentificationInput.displayName = "IdentificationInput";
