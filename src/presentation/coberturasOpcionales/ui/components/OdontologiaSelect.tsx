"use client"
import React from 'react';
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
  return (
    <Select
      value={value}
      onValueChange={(newValue) => onChange(newValue)}
    >
      <SelectTrigger className="w-full mt-2">
        <SelectValue placeholder="Seleccionar" />
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
