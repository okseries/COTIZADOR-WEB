import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Option = {
  label: string;
  value: string;
};

interface SelectSimpleProps {
  value?: string;
  onChange?: (value: string) => void;
  options: Option[];
  placeholder?: string;
  label?: string;
  id?: string;
  error?: boolean;
  className?: string;
  disabled?: boolean;
}

export function SelectSimple({
  value,
  onChange,
  options,
  placeholder = "Selecciona una opción",
  id,
  error,
  className = "",
  disabled = false,
}: SelectSimpleProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        id={id}
        className={`w-full py-5 ${error ? "border-red-500" : ""} ${className}`}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
