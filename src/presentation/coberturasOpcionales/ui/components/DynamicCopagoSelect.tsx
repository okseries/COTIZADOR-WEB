"use client"
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copago } from '../../interface/Coberturaopcional.interface';

interface DynamicCopagoSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Copago[];
  placeholder?: string;
}

const DynamicCopagoSelect = ({ value, onChange, options, placeholder = "Seleccionar copago" }: DynamicCopagoSelectProps) => {
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
          <SelectItem key={option.id} value={option.id.toString()}>
            {option.descripcion}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default DynamicCopagoSelect;
