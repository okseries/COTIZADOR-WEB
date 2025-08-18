"use client"
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PeriodoPago } from '../hooks/usePaymentOptions';

interface Props {
  value?: PeriodoPago; // Change from string to PeriodoPago
  onChange: (value: PeriodoPago | undefined) => void;
}

const PaymentIntervalSelector = ({ value, onChange }: Props) => {
  const OPTIONS: PeriodoPago[] = ['Mensual', 'Trimestral', 'Semestral', 'Anual'];
  
  return (
    <Select
      value={value ? value : "unselected"}
      onValueChange={(newValue) => {
        if (newValue === "unselected") {
          onChange(undefined);
        } else {
          onChange(newValue as PeriodoPago);
        }
      }}
    >
      <SelectTrigger className="w-full h-10 text-sm">
        <SelectValue placeholder="Seleccionar período" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="unselected">Seleccionar período</SelectItem>
        {OPTIONS.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default PaymentIntervalSelector;
