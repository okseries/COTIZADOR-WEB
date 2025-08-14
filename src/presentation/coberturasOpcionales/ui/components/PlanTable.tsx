"use client"
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CoberturasOpcional, CoberturasOpcionaleColectivo, Copago } from '../../interface/Coberturaopcional.interface';
import { Plan } from '@/presentation/quotations/interface/createQuotation.interface';
import OdontologiaSelect, { OdontologiaOption } from './OdontologiaSelect';
import CoberturaSelect, { CoberturaOption } from './CoberturaSelect';
import CopagoSelect, { CopagoOption } from './CopagoSelect';
import DynamicCoberturaSelect from './DynamicCoberturaSelect';
import DynamicCopagoSelect from './DynamicCopagoSelect';
import { formatCurrency } from '@/presentation/helpers/FormattCurrency';

// Tipo para las selecciones de cobertura
type CoberturaSelections = {
  altoCosto: string;
  medicamentos: string;
  habitacion: string;
  odontologia: string;
};

interface PlanTableProps {
  planName: string;
  planData: CoberturasOpcional[];
  plan: Plan;
  cliente?: any; // Agregar cliente para acceder a tipoPlan
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
  altoCostoOptions?: CoberturaOption[];
  medicamentosOptions?: CoberturaOption[];
  habitacionOptions?: CoberturaOption[];
  copagoSelection: string;
  copagoMedicamentosOptions?: CopagoOption[];
  copagoHabitacionSelection: string;
  // copagoHabitacionOptions: CopagoOption[];
  
  // Nuevas props para selecciones dinámicas
  dynamicCoberturaSelections?: {
    altoCosto: string;
    medicamentos: string;
    habitacion: string;
    odontologia: string;
  };
  dynamicCopagoSelection: string;
  dynamicAltoCostoOptions: CoberturasOpcionaleColectivo[];
  dynamicMedicamentosOptions: CoberturasOpcionaleColectivo[];
  dynamicHabitacionOptions: CoberturasOpcionaleColectivo[];
  dynamicOdontologiaOptions: CoberturasOpcionaleColectivo[];
  dynamicCopagosOptions: Copago[];
  dynamicCopagosAltoCostoOptions: Copago[];
  dynamicCopagosHabitacionOptions: Copago[];
  
  onOdontologiaChange: (planName: string, value: string) => void;
  onCoberturaChange: (planName: string, coberturaType: keyof CoberturaSelections, value: string) => void;
  onCopagoChange: (planName: string, value: string) => void;
  onCopagoHabitacionChange: (planName: string, value: string) => void;
  onDynamicCoberturaChange: (planName: string, coberturaType: string, value: string) => void;
  onDynamicCopagoChange: (planName: string, value: string) => void;
}

const PlanTable = ({
  planName,
  planData,
  plan,
  cliente,
  clientChoosen,
  globalFilters,
  odontologiaSelection,
  odontologiaOptions,
  coberturaSelections,
  altoCostoOptions,
  medicamentosOptions,
  habitacionOptions,
  copagoSelection,
  copagoMedicamentosOptions,
  copagoHabitacionSelection,
  // copagoHabitacionOptions,
  
  // Nuevas props dinámicas
  dynamicCoberturaSelections,
  dynamicCopagoSelection,
  dynamicAltoCostoOptions,
  dynamicMedicamentosOptions,
  dynamicHabitacionOptions,
  dynamicOdontologiaOptions,
  dynamicCopagosOptions,
  dynamicCopagosAltoCostoOptions,
  dynamicCopagosHabitacionOptions,
  
  onOdontologiaChange,
  onCoberturaChange,
  onCopagoChange,
  onCopagoHabitacionChange,
  onDynamicCoberturaChange,
  onDynamicCopagoChange
}: PlanTableProps) => {
  if (!planData || !planData[0]) return null;
  
  const data = planData[0];
  // Para colectivos: usar plan.cantidadAfiliados
  // Para individuales: usar plan.afiliados.length
  const cantidadAfiliados = clientChoosen === 2 
    ? (plan.cantidadAfiliados || 1)
    : plan.afiliados.length;

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
                    <DynamicCoberturaSelect
                      value={dynamicCoberturaSelections?.altoCosto || ''}
                      onChange={(value) => onDynamicCoberturaChange(planName, 'altoCosto', value)}
                      options={dynamicAltoCostoOptions}
                      placeholder="Seleccionar opción de Alto Costo"
                    />
                    {/* Mostrar select de copago solo para complementarios colectivos */}
                    {(() => {
                      const shouldShowCopago = dynamicCoberturaSelections?.altoCosto && cliente?.tipoPlan === 2 && clientChoosen === 2;
                      console.log("🔍 Copago Alto Costo visibility check:", {
                        hasAltoCostoSelected: !!dynamicCoberturaSelections?.altoCosto,
                        tipoPlan: cliente?.tipoPlan,
                        clientChoosen: clientChoosen,
                        shouldShow: shouldShowCopago
                      });
                      return shouldShowCopago;
                    })() && (
                      <DynamicCopagoSelect
                        value={dynamicCopagoSelection}
                        onChange={(value) => onDynamicCopagoChange(planName, value)}
                        options={dynamicCopagosAltoCostoOptions}
                        placeholder="Seleccionar copago (opcional)"
                      />
                    )}
                  </div>
                ) : (
                  <div className="font-medium">ALTO COSTO {data.altoCosto}</div>
                )}
              </div>
              <div className="text-sm font-medium">
                {clientChoosen === 2 ? (
                  (() => {
                    const selected = dynamicAltoCostoOptions.find(opt => opt.opt_id.toString() === dynamicCoberturaSelections?.altoCosto);
                    return selected ? formatCurrency(parseFloat(selected.opt_prima) * cantidadAfiliados) : formatCurrency(0);
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
                    <DynamicCoberturaSelect
                      value={dynamicCoberturaSelections?.medicamentos || ''}
                      onChange={(value) => onDynamicCoberturaChange(planName, 'medicamentos', value)}
                      options={dynamicMedicamentosOptions}
                      placeholder="Seleccionar opción de Medicamentos"
                    />
                    {/* Mostrar select de copago solo para complementarios colectivos */}
                    {(() => {
                      const shouldShowCopago = dynamicCoberturaSelections?.medicamentos && cliente?.tipoPlan === 2 && clientChoosen === 2;
                      console.log("🔍 Copago visibility check:", {
                        hasMedicamentosSelected: !!dynamicCoberturaSelections?.medicamentos,
                        tipoPlan: cliente?.tipoPlan,
                        clientChoosen: clientChoosen,
                        shouldShow: shouldShowCopago
                      });
                      return shouldShowCopago;
                    })() && (
                      <DynamicCopagoSelect
                        value={dynamicCopagoSelection}
                        onChange={(value) => onDynamicCopagoChange(planName, value)}
                        options={dynamicCopagosOptions}
                        placeholder="Seleccionar copago (opcional)"
                      />
                    )}
                  </div>
                ) : (
                  <div className="font-medium">MEDICAMENTOS {data.medicamento}</div>
                )}
              </div>
              <div className="text-sm font-medium">
                {clientChoosen === 2 ? (
                  (() => {
                    // Calcular precio usando opciones dinámicas
                    const selectedMedicamentos = dynamicMedicamentosOptions.find(opt => opt.opt_id.toString() === dynamicCoberturaSelections?.medicamentos);
                    const selectedCopago = dynamicCopagosOptions.find(opt => opt.id.toString() === dynamicCopagoSelection);
                    
                    let totalPrima = 0;
                    if (selectedMedicamentos) {
                      totalPrima += parseFloat(selectedMedicamentos.opt_prima) * cantidadAfiliados;
                    }
                    if (selectedCopago) {
                      totalPrima += selectedCopago.price * cantidadAfiliados;
                    }
                    
                    return formatCurrency(totalPrima);
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
                    <DynamicCoberturaSelect
                      value={dynamicCoberturaSelections?.habitacion || ''}
                      onChange={(value) => onDynamicCoberturaChange(planName, 'habitacion', value)}
                      options={dynamicHabitacionOptions}
                      placeholder="Seleccionar opción de Habitación"
                    />
                    {/* Mostrar select de copago solo para complementarios colectivos */}
                    {(() => {
                      const shouldShowCopago = dynamicCoberturaSelections?.habitacion && cliente?.tipoPlan === 2 && clientChoosen === 2;
                      console.log("🔍 Copago habitación visibility check:", {
                        hasHabitacionSelected: !!dynamicCoberturaSelections?.habitacion,
                        tipoPlan: cliente?.tipoPlan,
                        clientChoosen: clientChoosen,
                        shouldShow: shouldShowCopago
                      });
                      return shouldShowCopago;
                    })() && (
                      <DynamicCopagoSelect
                        value={dynamicCopagoSelection}
                        onChange={(value) => onDynamicCopagoChange(planName, value)}
                        options={dynamicCopagosHabitacionOptions}
                        placeholder="Seleccionar copago (opcional)"
                      />
                    )}
                  </div>
                ) : (
                  <div className="font-medium">HABITACIÓN {data.habitacion}</div>
                )}
              </div>
              <div className="text-sm font-medium">
                {clientChoosen === 2 ? (
                  (() => {
                    const selected = dynamicHabitacionOptions.find(opt => opt.opt_id.toString() === dynamicCoberturaSelections?.habitacion);
                    return selected ? formatCurrency(parseFloat(selected.opt_prima) * cantidadAfiliados) : formatCurrency(0);
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
