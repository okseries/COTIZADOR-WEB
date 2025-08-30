"use client"
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface CoberturaOption {
  value: string;
  label: string;
  descripcion: string;
  prima: number;
  porcentaje: number;
}

interface CoberturaSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CoberturaOption[];
  placeholder?: string;
}

const CoberturaSelect = ({ value, onChange, options, placeholder = "Seleccionar" }: CoberturaSelectProps) => {
  // Validar que el valor actual existe en las opciones
  const isValidValue = (val: string) => {
    if (!val) return false;
    return options.some(option => option.value === val);
  };
  
  // Si las opciones están cargando, mostrar loading
  if (options.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger className="w-full mt-2">
          <SelectValue placeholder="Cargando opciones..." />
        </SelectTrigger>
      </Select>
    );
  }
  
  const finalValue = isValidValue(value) ? value : '';
  
  // Debug logging detallado
  console.log(`CoberturaSelect - placeholder: ${placeholder}, value: ${value}, finalValue: ${finalValue}, options: ${options.length}, isValid: ${isValidValue(value)}`);
  console.log(`CoberturaSelect - ${placeholder} available options:`, options.map(opt => ({ value: opt.value, label: opt.label })));
  
  if (value && !isValidValue(value)) {
    console.warn(`⚠️ CoberturaSelect - ${placeholder}: Valor "${value}" no encontrado en opciones disponibles`);
  }
  
  return (
    <Select
      key={`cobertura-${finalValue}-${options.length}`}
      value={finalValue}
      onValueChange={(newValue) => onChange(newValue)}
    >
      <SelectTrigger className="w-full mt-2">
        <SelectValue placeholder={placeholder}>
          {/* Forzar el display del valor seleccionado */}
          {finalValue && options.find(opt => opt.value === finalValue)?.label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CoberturaSelect;
