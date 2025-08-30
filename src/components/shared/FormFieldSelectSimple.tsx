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
  // Validar que el valor actual existe en las opciones
  const isValidValue = (val: string) => {
    if (!val) return false;
    return options.some(option => option.value === val);
  };
  
  // Si las opciones están cargando, mostrar loading
  if (options.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger
          id={id}
          className={`w-full py-5 ${error ? "border-red-500" : ""} ${className}`}
        >
          <SelectValue placeholder="Cargando opciones..." />
        </SelectTrigger>
      </Select>
    );
  }
  
  const finalValue = isValidValue(value || '') ? value : '';
  
  // Debug logging
  console.log(`SelectSimple - id: ${id}, value: ${value}, finalValue: ${finalValue}, options: ${options.length}, isValid: ${isValidValue(value || '')}`);
  
  return (
    <Select 
      key={`simple-${finalValue}-${options.length}`}
      value={finalValue} 
      onValueChange={onChange} 
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        className={`w-full py-5 ${error ? "border-red-500" : ""} ${className}`}
      >
        <SelectValue placeholder={placeholder}>
          {/* Forzar el display del valor seleccionado */}
          {finalValue && options.find(opt => opt.value === finalValue)?.label}
        </SelectValue>
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
