/**
 * 🎯 Componente optimizado para filtros globales
 * Versión mejorada con mejor UX
 */

"use client"
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

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
  // Solo mostrar para clientes COLECTIVOS (clientChoosen === 2)
  if (clientChoosen !== 2) return null;

  const filterOptions = [
    {
      id: 'altoCosto',
      label: 'ALTO COSTO',
      description: 'Cobertura para procedimientos de alto costo médico',
      color: 'bg-red-100 text-red-800 border-red-200'
    },
    {
      id: 'medicamentos',
      label: 'MEDICAMENTOS',
      description: 'Cobertura para medicamentos especializados',
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      id: 'habitacion',
      label: 'HABITACIÓN',
      description: 'Upgrade de habitación hospitalaria',
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'odontologia',
      label: 'ODONTOLOGÍA',
      description: 'Cobertura dental especializada',
      color: 'bg-purple-100 text-purple-800 border-purple-200'
    }
  ];

  const selectedCount = Object.values(filters).filter(Boolean).length;

  return (
    <Card className="border-[#005BBB]/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-[#005BBB] flex items-center gap-2">
            <Info className="h-5 w-5" />
            Coberturas Opcionales Disponibles
          </CardTitle>
          {selectedCount > 0 && (
            <Badge variant="secondary" className="bg-[#005BBB]/10 text-[#005BBB]">
              {selectedCount} seleccionada{selectedCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Seleccione las coberturas opcionales que desea incluir en la cotización. 
          Solo las opciones marcadas estarán disponibles para configurar.
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filterOptions.map((option) => (
            <div 
              key={option.id}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                filters[option.id as keyof typeof filters] 
                  ? option.color 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-start space-x-3">
                <Checkbox
                  id={`filter-${option.id}`}
                  checked={filters[option.id as keyof typeof filters]}
                  onCheckedChange={(checked) => onFilterChange(option.id, checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <label 
                    htmlFor={`filter-${option.id}`} 
                    className="text-sm font-semibold cursor-pointer block"
                  >
                    {option.label}
                  </label>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {option.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {selectedCount === 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-700">
              💡 <strong>Sugerencia:</strong> Seleccione al menos una cobertura opcional 
              para personalizar el plan según las necesidades del cliente.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GlobalFilters;
