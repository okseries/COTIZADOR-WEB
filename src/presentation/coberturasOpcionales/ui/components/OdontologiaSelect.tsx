"use client"
import React, { useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface OdontologiaOption {
  value: string;
  label: string;
  prima: number;
}

interface OdontologiaSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: OdontologiaOption[];
}

const OdontologiaSelect = ({ value, onChange, options }: OdontologiaSelectProps) => {
  // Asegurar que value siempre sea string para evitar controlled/uncontrolled switching
  const safeValue = value || "0";
  
  // 🔍 DEBUG CRÍTICO: Log para verificar valores de odontología
  if (process.env.NODE_ENV === 'development') {
    console.log('🦷 OdontologiaSelect:', JSON.stringify({
      originalValue: value,
      safeValue,
      optionsCount: options.length,
      hasMatchingOption: options.some(opt => opt.value === safeValue),
      availableOptions: options.map(opt => ({ value: opt.value, label: opt.label })),
      timestamp: new Date().toISOString()
    }, null, 2));
  }

  // 🔍 DEBUG ADICIONAL: useEffect para detectar cambios en value y options
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 OdontologiaSelect - EFFECT:', JSON.stringify({
        effectTrigger: 'value or options changed',
        value,
        safeValue,
        optionsLength: options.length,
        hasMatchingOption: options.some(opt => opt.value === safeValue),
        timestamp: new Date().toISOString()
      }, null, 2));
    }
  }, [value, options, safeValue]);
  
  return (
    <Select
      value={safeValue}
      onValueChange={(newValue) => onChange(newValue)}
    >
      <SelectTrigger className="w-full mt-2">
        <SelectValue placeholder="Seleccionar opción de odontología" />
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

export default OdontologiaSelect;
