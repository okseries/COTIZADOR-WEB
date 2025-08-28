"use client"
import React from 'react';
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
  
  // 🔍 DEBUG: Log para verificar props recibidos
  // if (process.env.NODE_ENV === 'development' && placeholder.includes('Habitación')) {
  //   console.log('🏠 DynamicCoberturaSelect HABITACIÓN:', {
  //     originalValue: value,
  //     safeValue,
  //     optionsCount: options.length,
  //     placeholder,
  //     firstOption: options[0]
  //   });
  // }

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
