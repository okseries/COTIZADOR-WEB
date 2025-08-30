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

const OdontologiaSelect = ({ value, onChange, options = [] }: OdontologiaSelectProps) => {
  // Asegurar que value siempre sea string para evitar controlled/uncontrolled switching
  const safeValue = value || "0";
  
  // Verificar que el valor exista en las opciones disponibles
  const isValidValue = options.some(opt => opt.value === safeValue);
  const finalValue = isValidValue ? safeValue : "0";
  
  // 🔍 DEBUG CRÍTICO: Log para verificar valores de odontología
  if (process.env.NODE_ENV === 'development') {
    console.log('🦷 OdontologiaSelect:', JSON.stringify({
      originalValue: value,
      safeValue,
      finalValue,
      isValidValue,
      optionsCount: options?.length || 0,
      hasMatchingOption: options?.some(opt => opt.value === finalValue) || false,
      availableOptions: options?.map(opt => ({ value: opt.value, label: opt.label })) || [],
      timestamp: new Date().toISOString()
    }, null, 2));
  }

  // 🔍 DEBUG ADICIONAL: useEffect para detectar cambios en value y options
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 OdontologiaSelect - EFFECT:', JSON.stringify({
        effectTrigger: 'value or options changed',
        value,
        finalValue,
        optionsLength: options?.length || 0,
        isValidValue,
        timestamp: new Date().toISOString()
      }, null, 2));
    }
  }, [value, options, finalValue, isValidValue]);
  
  // No renderizar el Select hasta que tengamos opciones
  if (!options || options.length === 0) {
    return (
      <div className="w-full mt-2 h-10 border border-gray-300 rounded-md flex items-center px-3 text-gray-500">
        Cargando opciones...
      </div>
    );
  }
  
  return (
    <Select
      key={`odontologia-${finalValue}-${options.length}`} // Forzar re-render cuando cambien las opciones
      value={finalValue}
      onValueChange={(newValue) => onChange(newValue)}
    >
      <SelectTrigger className="w-full mt-2">
        <SelectValue 
          placeholder="Seleccionar opción de odontología"
        >
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

export default OdontologiaSelect;
