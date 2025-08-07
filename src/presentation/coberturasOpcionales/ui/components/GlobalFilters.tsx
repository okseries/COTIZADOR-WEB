"use client"
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

interface GlobalFiltersProps {
  filters: {
    altoCosto: boolean;
    medicamentos: boolean;
    habitacion: boolean;
    odontologia: boolean;
  };
  onFilterChange: (filter: string, checked: boolean) => void;
  clientChoosen: number;
}

const GlobalFilters = ({ filters, onFilterChange, clientChoosen }: GlobalFiltersProps) => {
  if (clientChoosen !== 2) return null;

  return (
    <div className="mb-6">
      <p className="text-sm text-gray-600 mb-4">
        Selecciona las coberturas opcionales que deseas incluir:
      </p>
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="filter-altoCosto"
            checked={filters.altoCosto}
            onCheckedChange={(checked) => onFilterChange('altoCosto', checked as boolean)}
          />
          <label htmlFor="filter-altoCosto" className="text-sm font-medium">
            ALTO COSTO
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="filter-medicamentos"
            checked={filters.medicamentos}
            onCheckedChange={(checked) => onFilterChange('medicamentos', checked as boolean)}
          />
          <label htmlFor="filter-medicamentos" className="text-sm font-medium">
            MEDICAMENTOS
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="filter-habitacion"
            checked={filters.habitacion}
            onCheckedChange={(checked) => onFilterChange('habitacion', checked as boolean)}
          />
          <label htmlFor="filter-habitacion" className="text-sm font-medium">
            HABITACIÓN
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="filter-odontologia"
            checked={filters.odontologia}
            onCheckedChange={(checked) => onFilterChange('odontologia', checked as boolean)}
          />
          <label htmlFor="filter-odontologia" className="text-sm font-medium">
            ODONTOLOGÍA
          </label>
        </div>
      </div>
    </div>
  );
};

export default GlobalFilters;
