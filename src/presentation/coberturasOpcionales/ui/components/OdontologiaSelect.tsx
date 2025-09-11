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
  
  // OdontologiaSelect component


  
  return (
    <Select
      value={safeValue}
      onValueChange={(newValue) => onChange(newValue)}
    >
      <SelectTrigger className="w-full mt-2">
        <SelectValue placeholder="Seleccionar opción de odontología" />
      </SelectTrigger>
      <SelectContent>
        {options?.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        )) || []}
      </SelectContent>
    </Select>
  );
};

export default OdontologiaSelect;
