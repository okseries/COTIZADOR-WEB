"use client"
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CoberturasOpcional } from '../../interface/Coberturaopcional.interface';
import { Plan } from '@/presentation/quotations/interface/createQuotation.interface';
import OdontologiaSelect, { OdontologiaOption } from './OdontologiaSelect';
import CoberturaSelect, { CoberturaOption } from './CoberturaSelect';
import { CoberturaSelections } from '../../data/coberturaOptions';
import { formatCurrency } from '@/presentation/helpers/FormattCurrency';

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
  coberturaSelections?: CoberturaSelections;
  altoCostoOptions: CoberturaOption[];
  medicamentosOptions: CoberturaOption[];
  habitacionOptions: CoberturaOption[];
  onOdontologiaChange: (planName: string, value: string) => void;
  onCoberturaChange: (planName: string, coberturaType: keyof CoberturaSelections, value: string) => void;
}

const PlanTable = ({
  planName,
  planData,
  plan,
  clientChoosen,
  globalFilters,
  odontologiaSelection,
  odontologiaOptions,
  coberturaSelections,
  altoCostoOptions,
  medicamentosOptions,
  habitacionOptions,
  onOdontologiaChange,
  onCoberturaChange
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
                {clientChoosen === 2 ? (
                  <div>
                    <div className="font-medium">ALTO COSTO</div>
                    <CoberturaSelect
                      value={coberturaSelections?.altoCosto || ''}
                      onChange={(value) => onCoberturaChange(planName, 'altoCosto', value)}
                      options={altoCostoOptions}
                      placeholder="Seleccionar opción"
                    />
                  </div>
                ) : (
                  <div className="font-medium">ALTO COSTO {data.altoCosto}</div>
                )}
              </div>
              <div className="text-sm font-medium">
                {clientChoosen === 2 ? (
                  (() => {
                    const selected = altoCostoOptions.find(opt => opt.value === coberturaSelections?.altoCosto);
                    return selected ? formatCurrency(selected.prima * cantidadAfiliados) : formatCurrency(0);
                  })()
                ) : (
                  formatCurrency(Number(data.primaCosto) * cantidadAfiliados)
                )}
              </div>
            </div>
          )}

          {/* Medicamentos */}
          {(clientChoosen === 1 || globalFilters.medicamentos) && (
            <div className="grid grid-cols-2 gap-4 py-2 border-b">
              <div className="text-sm">
                {clientChoosen === 2 ? (
                  <div>
                    <div className="font-medium">MEDICAMENTOS</div>
                    <CoberturaSelect
                      value={coberturaSelections?.medicamentos || ''}
                      onChange={(value) => onCoberturaChange(planName, 'medicamentos', value)}
                      options={medicamentosOptions}
                      placeholder="Seleccionar opción"
                    />
                  </div>
                ) : (
                  <div className="font-medium">MEDICAMENTOS {data.medicamento}</div>
                )}
              </div>
              <div className="text-sm font-medium">
                {clientChoosen === 2 ? (
                  (() => {
                    const selected = medicamentosOptions.find(opt => opt.value === coberturaSelections?.medicamentos);
                    return selected ? formatCurrency(selected.prima * cantidadAfiliados) : formatCurrency(0);
                  })()
                ) : (
                  formatCurrency(Number(data.medicamentoCosto) * cantidadAfiliados)
                )}
              </div>
            </div>
          )}

          {/* Habitación */}
          {(clientChoosen === 1 || globalFilters.habitacion) && (
            <div className="grid grid-cols-2 gap-4 py-2 border-b">
              <div className="text-sm">
                {clientChoosen === 2 ? (
                  <div>
                    <div className="font-medium">HABITACIÓN</div>
                    <CoberturaSelect
                      value={coberturaSelections?.habitacion || ''}
                      onChange={(value) => onCoberturaChange(planName, 'habitacion', value)}
                      options={habitacionOptions}
                      placeholder="Seleccionar opción"
                    />
                  </div>
                ) : (
                  <div className="font-medium">HABITACIÓN {data.habitacion}</div>
                )}
              </div>
              <div className="text-sm font-medium">
                {clientChoosen === 2 ? (
                  (() => {
                    const selected = habitacionOptions.find(opt => opt.value === coberturaSelections?.habitacion);
                    return selected ? formatCurrency(selected.prima * cantidadAfiliados) : formatCurrency(0);
                  })()
                ) : (
                  formatCurrency(Number(data.habitacionCosto) * cantidadAfiliados)
                )}
              </div>
            </div>
          )}

          {/* Odontología */}
          {(clientChoosen === 1 || globalFilters.odontologia) && (
            <div className="grid grid-cols-2 gap-4 py-2 border-b items-end">
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
                  return selected ? (formatCurrency(selected.prima * cantidadAfiliados)) : "0";
                })()}
              </div>
            </div>
          )}

          {/* Subtotal */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t font-bold">
            <div className="text-sm">SubTotal Opcionales</div>
            <div className="text-sm">
              {formatCurrency(plan?.resumenPago.subTotalOpcional || 0)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanTable;
