"use client"
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CoberturasOpcional } from '../../interface/Coberturaopcional.interface';
import { Plan } from '@/presentation/quotations/interface/createQuotation.interface';
import OdontologiaSelect, { OdontologiaOption } from './OdontologiaSelect';

interface PlanTableProps {
  planName: string;
  planData: CoberturasOpcional[];
  plan: Plan;
  clientChoosen: number;
  globalFilters: {
    altoCosto: boolean;
    medicamentos: boolean;
    habitacion: boolean;
    odontologia: boolean;
  };
  odontologiaSelection: string;
  odontologiaOptions: OdontologiaOption[];
  onOdontologiaChange: (planName: string, value: string) => void;
}

const PlanTable = ({
  planName,
  planData,
  plan,
  clientChoosen,
  globalFilters,
  odontologiaSelection,
  odontologiaOptions,
  onOdontologiaChange
}: PlanTableProps) => {
  if (!planData || !planData[0]) return null;
  
  const data = planData[0];
  const cantidadAfiliados = plan.afiliados.length;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Cobertura Opcionales - {planName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Header */}
          <div className="grid grid-cols-2 gap-4 pb-2 border-b font-medium text-sm text-gray-600">
            <div>Opcional</div>
            <div>Prima Opcional</div>
          </div>
          
          {/* Alto Costo */}
          {(clientChoosen === 1 || globalFilters.altoCosto) && (
            <div className="grid grid-cols-2 gap-4 py-2 border-b">
              <div className="text-sm">
                <div className="font-medium">ALTO COSTO {data.altoCosto}</div>
              </div>
              <div className="text-sm font-medium">{(parseFloat(data.primaCosto) * cantidadAfiliados).toFixed(2)}</div>
            </div>
          )}

          {/* Medicamentos */}
          {(clientChoosen === 1 || globalFilters.medicamentos) && (
            <div className="grid grid-cols-2 gap-4 py-2 border-b">
              <div className="text-sm">
                <div className="font-medium">MEDICAMENTOS {data.medicamento}</div>
              </div>
              <div className="text-sm font-medium">{(parseFloat(data.medicamentoCosto) * cantidadAfiliados).toFixed(2)}</div>
            </div>
          )}

          {/* Habitación */}
          {(clientChoosen === 1 || globalFilters.habitacion) && (
            <div className="grid grid-cols-2 gap-4 py-2 border-b">
              <div className="text-sm">
                <div className="font-medium">HABITACIÓN {data.habitacion}</div>
              </div>
              <div className="text-sm font-medium">{(parseFloat(data.habitacionCosto) * cantidadAfiliados).toFixed(2)}</div>
            </div>
          )}

          {/* Odontología */}
          {(clientChoosen === 1 || globalFilters.odontologia) && (
            <div className="grid grid-cols-2 gap-4 py-2 border-b">
              <div className="text-sm">
                <div className="font-medium">ODONTOLOGÍA</div>
                <OdontologiaSelect
                  value={odontologiaSelection}
                  onChange={(value) => onOdontologiaChange(planName, value)}
                  options={odontologiaOptions}
                />
              </div>
              <div className="text-sm font-medium">
                {(() => {
                  const selected = odontologiaOptions.find(opt => opt.value === odontologiaSelection);
                  return selected ? (selected.prima * cantidadAfiliados).toFixed(2) : "0";
                })()}
              </div>
            </div>
          )}

          {/* Subtotal */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t font-bold">
            <div className="text-sm">SubTotal Opcionales</div>
            <div className="text-sm">
              {plan?.resumenPago.subTotalOpcional.toFixed(2) || '0.00'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanTable;
