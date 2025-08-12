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
  return (
    <Select
      value={value}
      onValueChange={(newValue) => onChange(newValue)}
    >
      <SelectTrigger className="w-full mt-2">
        <SelectValue placeholder={placeholder} />
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
