import React from "react";
import { SelectSimple } from "./FormFieldSelectSimple";
import { cn } from "@/lib/utils";

interface DocumentTypeSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
  placeholder?: string;
  className?: string;
  label?: string;
  required?: boolean;
}

export const DocumentTypeSelect = React.forwardRef<
  HTMLDivElement,
  DocumentTypeSelectProps
>(
  (
    {
      value,
      onChange,
      error,
      placeholder = "Selecciona tipo",
      className,
      label = "Tipo de documento",
      required = false,
      ...props
    },
    ref
  ) => {
    const documentOptions = [
      { label: "Cédula", value: "1" },
      { label: "Pasaporte", value: "2" },
      { label: "RNC", value: "3" },
    ];

    return (
      <div className={cn("", className)} ref={ref}>
        
        <SelectSimple
          value={value || ""}
          onChange={onChange}
          options={documentOptions}
          placeholder={placeholder}
          error={error}
          className="h-full w-full"
          {...props}
        />
      </div>
    );
  }
);

