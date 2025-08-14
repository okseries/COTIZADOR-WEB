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

const DynamicCoberturaSelect = ({ value, onChange, options, placeholder = "Seleccionar" }: DynamicCoberturaSelectProps) => {
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
          <SelectItem key={option.opt_id} value={option.opt_id.toString()}>
            {option.descripcion}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default DynamicCoberturaSelect;
