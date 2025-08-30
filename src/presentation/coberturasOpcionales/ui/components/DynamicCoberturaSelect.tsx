/**
 * Componente para selección dinámica de coberturas
 * Versión original sin cambios visuales
 */

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

const DynamicCoberturaSelect = ({ 
  value, 
  onChange, 
  options = [], 
  placeholder = "Seleccionar opción"
}: DynamicCoberturaSelectProps) => {
  // Asegurar que value siempre sea string para evitar controlled/uncontrolled switching
  const safeValue = value || "";
  
  return (
    <Select
      value={safeValue}
      onValueChange={onChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {/* Opción para deseleccionar */}
        <SelectItem value="0">
          Ninguna (No seleccionar)
        </SelectItem>
        
        {/* Opciones dinámicas */}
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
