"use client";
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface CopagoOption {
  value: string;
  label: string;
  porcentaje: number;
  prima: number;
  limite?: number;
  planId?: string;
}

interface CopagoSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CopagoOption[];
  placeholder?: string;
}

const CopagoSelect = ({ value, onChange, options, placeholder = "Seleccionar copago" }: CopagoSelectProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
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

export default CopagoSelect;
