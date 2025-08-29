// DEBUG VERSION - Temporary component for debugging select issues
"use client"
import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CoberturasOpcionaleColectivo } from '../../interface/Coberturaopcional.interface';

interface DebugDynamicCoberturaSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CoberturasOpcionaleColectivo[];
  placeholder?: string;
}

const DebugDynamicCoberturaSelect = ({ value, onChange, options, placeholder = "Seleccionar opción" }: DebugDynamicCoberturaSelectProps) => {
  const [internalValue, setInternalValue] = useState(value || "");
  
  // Sync internal value with prop value
  useEffect(() => {
    console.log(`🐛 DebugSelect [${placeholder}] - Value sync:`, {
      propValue: value,
      internalValue,
      willUpdate: value !== internalValue
    });
    
    if (value !== internalValue) {
      setInternalValue(value || "");
    }
  }, [value, placeholder, internalValue]);
  
  const handleChange = (newValue: string) => {
    console.log(`🐛 DebugSelect [${placeholder}] - Change triggered:`, {
      oldValue: internalValue,
      newValue,
      options: options.length
    });
    
    setInternalValue(newValue);
    onChange(newValue);
  };
  
  // Log render info
  console.log(`🐛 DebugSelect [${placeholder}] - RENDER:`, {
    propValue: value,
    internalValue,
    optionsCount: options.length,
    hasMatchingOption: options.some(opt => opt.opt_id.toString() === internalValue)
  });

  return (
    <div style={{ border: '2px solid red', padding: '4px' }}>
      <div style={{ fontSize: '10px', color: 'red', marginBottom: '4px' }}>
        DEBUG: value="{internalValue}" | options={options.length}
      </div>
      <Select
        value={internalValue}
        onValueChange={handleChange}
      >
        <SelectTrigger className="w-full mt-2">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
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
    </div>
  );
};

export default DebugDynamicCoberturaSelect;
