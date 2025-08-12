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
  
  // Debug log para verificar el valor que llega
  console.log('PaymentIntervalSelector value:', value);
  
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-600">
        Período de Pago
      </label>
      <Select
        value={value ? value : "unselected"}
        onValueChange={(newValue) => {
          console.log('Selected value:', newValue);
          if (newValue === "unselected") {
            onChange(undefined);
          } else {
            onChange(newValue as PeriodoPago);
          }
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Seleccionar período">
            {value ? value : "Seleccionar período"}
          </SelectValue>
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
    </div>
  );
};

export default PaymentIntervalSelector;
