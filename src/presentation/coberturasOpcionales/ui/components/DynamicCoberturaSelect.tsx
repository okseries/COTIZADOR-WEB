"use client"
import React, { useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CoberturasOpcionaleColectivo } from '../../interface/Coberturaopcional.interface';

interface DynamicCoberturaSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CoberturasOpcionaleColectivo[];
  placeholder?: string;
}

const DynamicCoberturaSelect = ({ value, onChange, options, placeholder = "Seleccionar opción" }: DynamicCoberturaSelectProps) => {
  // Asegurar que value siempre sea string para evitar controlled/uncontrolled switching
  const safeValue = value || "";
  
  // 🔍 DEBUG CRÍTICO: Log para todos los componentes en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 DynamicCoberturaSelect [${placeholder}]:`, JSON.stringify({
      originalValue: value,
      safeValue,
      optionsCount: options.length,
      placeholder,
      hasMatchingOption: options.some(opt => opt.opt_id.toString() === safeValue),
      availableOptions: options.map(opt => ({ id: opt.opt_id, desc: opt.descripcion })),
      timestamp: new Date().toISOString()
    }, null, 2));
  }

  // 🔍 DEBUG ADICIONAL: useEffect para detectar cambios en value y options
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 DynamicCoberturaSelect [${placeholder}] - EFFECT:`, JSON.stringify({
        effectTrigger: 'value or options changed',
        value,
        safeValue,
        optionsLength: options.length,
        hasMatchingOption: options.some(opt => opt.opt_id.toString() === safeValue),
        timestamp: new Date().toISOString()
      }, null, 2));
    }
  }, [value, options, placeholder, safeValue]);

  return (
    <Select
      value={safeValue}
      onValueChange={(newValue) => onChange(newValue)}
    >
      <SelectTrigger className="w-full mt-2">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {/* Opción para deseleccionar */}
        <SelectItem value="0">
          Ninguna (No seleccionar)
        </SelectItem>
        {options.map((option) => (
          <SelectItem key={option.opt_id} value={option.opt_id.toString()}>
            {option.descripcion}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default DynamicCoberturaSelect;
