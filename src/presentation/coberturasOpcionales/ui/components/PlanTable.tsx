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
import { useQuotationStore } from '@/presentation/quotations/store/useQuotationStore';

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
  dynamicCopagoSelection: {
    altoCosto: string;
    medicamentos: string;
    habitacion: string;
  };
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
  onDynamicCopagoChange: (planName: string, coberturaType: string, value: string) => void;
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
  // Leer el plan actualizado directamente del store para asegurar que se muestren los valores más recientes
  const currentPlan = useQuotationStore((state) => 
    state.planes.find(p => p.plan === planName)
  ) || plan;
  
  if (!planData || !planData[0]) return null;
  
  const data = planData[0];
  // Para colectivos: usar plan.cantidadAfiliados
  // Para individuales: usar plan.afiliados.length
  const cantidadAfiliados = clientChoosen === 2 
    ? (currentPlan.cantidadAfiliados || 1)
    : currentPlan.afiliados.length;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Cobertura Opcionales - {planName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Header */}
          {clientChoosen === 2 ? (
            <div className="grid grid-cols-2 gap-4 pb-2 border-b font-medium text-sm text-gray-600">
              <div>Opcional</div>
              <div>Prima Base y Copago</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 pb-2 border-b font-medium text-sm text-gray-600">
              <div>Opcional</div>
              <div>Prima Opcional</div>
            </div>
          )}
          
          {/* Alto Costo */}
          {(clientChoosen === 1 || globalFilters.altoCosto) && (
            <div className="grid grid-cols-2 gap-4 py-2 border-b items-end">
              <div className="text-sm">
                {clientChoosen === 2 ? (
                  <div>
                    <div className="font-medium">ALTO COSTO</div>
                    <div className="flex items-center gap-2 mt-1">
                      <DynamicCoberturaSelect
                        value={dynamicCoberturaSelections?.altoCosto || ''}
                        onChange={(value) => onDynamicCoberturaChange(planName, 'altoCosto', value)}
                        options={dynamicAltoCostoOptions}
                        placeholder="Seleccionar opción de Alto Costo"
                      />
                      <div className="text-sm font-medium min-w-[80px]">
                        {(() => {
                          const selectedAltoCosto = dynamicCoberturaSelections?.altoCosto;
                          if (selectedAltoCosto && selectedAltoCosto !== "0") {
                            const cobertura = dynamicAltoCostoOptions?.find((ac: any) => ac.opt_id === parseInt(selectedAltoCosto));
                            if (cobertura) {
                              return formatCurrency(parseFloat(cobertura.opt_prima || '0'));
                            }
                          }
                          return formatCurrency(0);
                        })()}
                      </div>
                    </div>
                    {/* Mostrar select de copago solo para complementarios colectivos */}
                    {(() => {
                      const shouldShowCopago = dynamicCoberturaSelections?.altoCosto && cliente?.tipoPlan === 2 && clientChoosen === 2;
                     
                      return shouldShowCopago;
                    })() && (
                      <div className="flex items-center gap-2 mt-2">
                        <DynamicCopagoSelect
                          value={dynamicCopagoSelection.altoCosto}
                          onChange={(value) => onDynamicCopagoChange(planName, 'altoCosto', value)}
                          options={dynamicCopagosAltoCostoOptions}
                          placeholder="Seleccionar copago (opcional)"
                        />
                        <div className="text-sm font-medium min-w-[80px]">
                          {(() => {
                            const selectedCopago = dynamicCopagoSelection?.altoCosto;
                            if (selectedCopago && selectedCopago !== "0") {
                              const copago = dynamicCopagosAltoCostoOptions?.find((c: any) => c.id === parseInt(selectedCopago));
                              if (copago) {
                                return formatCurrency(copago.price || 0);
                              }
                            }
                            return formatCurrency(0);
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="font-medium">ALTO COSTO {data.altoCosto}</div>
                )}
              </div>
              <div className="text-sm font-medium">
                {clientChoosen === 2 ? (
                  "."
                ) : (
                  (() => {
                    const altoCostoOpcional = currentPlan?.opcionales?.find(opt => opt.nombre === "ALTO COSTO");
                    return formatCurrency(altoCostoOpcional?.prima || 0);
                  })()
                )}
              </div>
            </div>
          )}

          {/* Medicamentos */}
          {(clientChoosen === 1 || globalFilters.medicamentos) && (
            <div className="grid grid-cols-2 gap-4 py-2 border-b items-end">
              <div className="text-sm">
                {clientChoosen === 2 ? (
                  <div>
                    <div className="font-medium">MEDICAMENTOS</div>
                    <div className="flex items-center gap-2 mt-1">
                      <DynamicCoberturaSelect
                        value={dynamicCoberturaSelections?.medicamentos || ''}
                        onChange={(value) => onDynamicCoberturaChange(planName, 'medicamentos', value)}
                        options={dynamicMedicamentosOptions}
                        placeholder="Seleccionar opción de Medicamentos"
                      />
                      <div className="text-sm font-medium min-w-[80px]">
                        {(() => {
                          const selectedMedicamentos = dynamicCoberturaSelections?.medicamentos;
                          if (selectedMedicamentos && selectedMedicamentos !== "0") {
                            const cobertura = dynamicMedicamentosOptions?.find((m: any) => m.opt_id === parseInt(selectedMedicamentos));
                            if (cobertura) {
                              return formatCurrency(parseFloat(cobertura.opt_prima || '0'));
                            }
                          }
                          return formatCurrency(0);
                        })()}
                      </div>
                    </div>
                    {/* Mostrar select de copago solo para complementarios colectivos */}
                    {(() => {
                      const shouldShowCopago = dynamicCoberturaSelections?.medicamentos && cliente?.tipoPlan === 2 && clientChoosen === 2;
                    
                      return shouldShowCopago;
                    })() && (
                      <div className="flex items-center gap-2 mt-2">
                        <DynamicCopagoSelect
                          value={dynamicCopagoSelection.medicamentos}
                          onChange={(value) => onDynamicCopagoChange(planName, 'medicamentos', value)}
                          options={dynamicCopagosOptions}
                          placeholder="Seleccionar copago (opcional)"
                        />
                        <div className="text-sm font-medium min-w-[80px]">
                          {(() => {
                            const selectedCopago = dynamicCopagoSelection?.medicamentos;
                            if (selectedCopago && selectedCopago !== "0") {
                              const copago = dynamicCopagosOptions?.find((c: any) => c.id === parseInt(selectedCopago));
                              if (copago) {
                                return formatCurrency(copago.price || 0);
                              }
                            }
                            return formatCurrency(0);
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="font-medium">MEDICAMENTOS {data.medicamento}</div>
                )}
              </div>
              <div className="text-sm font-medium">
                {clientChoosen === 2 ? (
                  "."
                ) : (
                  (() => {
                    const medicamentosOpcional = currentPlan?.opcionales?.find(opt => opt.nombre === "MEDICAMENTOS");
                    return formatCurrency(medicamentosOpcional?.prima || 0);
                  })()
                )}
              </div>
            </div>
          )}

          {/* Habitación */}
          {(clientChoosen === 1 || globalFilters.habitacion) && (
            <div className="grid grid-cols-2 gap-4 py-2 border-b items-end">
              <div className="text-sm">
                {clientChoosen === 2 ? (
                  <div>
                    <div className="font-medium">HABITACIÓN</div>
                    <div className="flex items-center gap-2 mt-1">
                      <DynamicCoberturaSelect
                        value={dynamicCoberturaSelections?.habitacion || ''}
                        onChange={(value) => onDynamicCoberturaChange(planName, 'habitacion', value)}
                        options={dynamicHabitacionOptions}
                        placeholder="Seleccionar opción de Habitación"
                      />
                      <div className="text-sm font-medium min-w-[80px]">
                        {(() => {
                          const selectedHabitacion = dynamicCoberturaSelections?.habitacion;
                          if (selectedHabitacion && selectedHabitacion !== "0") {
                            const cobertura = dynamicHabitacionOptions?.find((h: any) => h.opt_id === parseInt(selectedHabitacion));
                            if (cobertura) {
                              return formatCurrency(parseFloat(cobertura.opt_prima || '0'));
                            }
                          }
                          return formatCurrency(0);
                        })()}
                      </div>
                    </div>
                    {/* Mostrar select de copago solo para complementarios colectivos */}
                    {(() => {
                      const shouldShowCopago = dynamicCoberturaSelections?.habitacion && cliente?.tipoPlan === 2 && clientChoosen === 2;
                     
                      return shouldShowCopago;
                    })() && (
                      <div className="flex items-center gap-2 mt-2">
                        <DynamicCopagoSelect
                          value={dynamicCopagoSelection.habitacion}
                          onChange={(value) => onDynamicCopagoChange(planName, 'habitacion', value)}
                          options={dynamicCopagosHabitacionOptions}
                          placeholder="Seleccionar copago (opcional)"
                        />
                        <div className="text-sm font-medium min-w-[80px]">
                          {(() => {
                            const selectedCopago = dynamicCopagoSelection?.habitacion;
                            if (selectedCopago && selectedCopago !== "0") {
                              const copago = dynamicCopagosHabitacionOptions?.find((c: any) => c.id === parseInt(selectedCopago));
                              if (copago) {
                                return formatCurrency(copago.price || 0);
                              }
                            }
                            return formatCurrency(0);
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="font-medium">HABITACIÓN {data.habitacion}</div>
                )}
              </div>
              <div className="text-sm font-medium">
                {clientChoosen === 2 ? (
                  "."
                ) : (
                  (() => {
                    const habitacionOpcional = currentPlan?.opcionales?.find(opt => opt.nombre === "HABITACIÓN");
                    return formatCurrency(habitacionOpcional?.prima || 0);
                  })()
                )}
              </div>
            </div>
          )}

          {/* Odontología */}
          {(clientChoosen === 1 || globalFilters.odontologia) && (
            <div className="grid grid-cols-2 gap-4 py-2 border-b items-end">
              <div className="text-sm">
                {clientChoosen === 2 ? (
                  <div>
                    <div className="font-medium">ODONTOLOGÍA</div>
                    <div className="flex items-center gap-2 mt-1">
                      <OdontologiaSelect
                        value={odontologiaSelection}
                        onChange={(value) => onOdontologiaChange(planName, value)}
                        options={odontologiaOptions}
                      />
                      <div className="text-sm font-medium min-w-[80px]">
                        {(() => {
                          // Para colectivos, mostrar el valor al lado del select
                          const selectedOption = odontologiaOptions?.find(opt => opt.value === odontologiaSelection);
                          return formatCurrency(selectedOption?.prima || 0);
                        })()}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="font-medium">ODONTOLOGÍA</div>
                    <OdontologiaSelect
                      value={odontologiaSelection}
                      onChange={(value) => onOdontologiaChange(planName, value)}
                      options={odontologiaOptions}
                    />
                  </div>
                )}
              </div>
              <div className="text-sm font-medium">
                {clientChoosen === 2 ? (
                  "."
                ) : (
                  (() => {
                    const selectedOption = odontologiaOptions?.find(opt => opt.value === odontologiaSelection);
                    return formatCurrency(selectedOption?.prima || 0);
                  })()
                )}
              </div>
            </div>
          )}

          {/* Subtotal */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t font-bold">
            <div className="text-sm">SubTotal Opcionales - {cantidadAfiliados} Afiliados</div>
            <div className="text-sm">
              {(() => {
                if (clientChoosen === 2) {
                  // Para colectivos, calcular dinámicamente sumando valores unitarios y multiplicando por cantidad
                  let subtotalUnitario = 0;
                  
                  // Alto Costo
                  const selectedAltoCosto = dynamicCoberturaSelections?.altoCosto;
                  if (selectedAltoCosto && selectedAltoCosto !== "0") {
                    const cobertura = dynamicAltoCostoOptions?.find((ac: any) => ac.opt_id === parseInt(selectedAltoCosto));
                    if (cobertura) {
                      subtotalUnitario += parseFloat(cobertura.opt_prima || '0');
                    }
                  }
                  
                  // Copago Alto Costo
                  const selectedCopagoAltoCosto = dynamicCopagoSelection?.altoCosto;
                  if (selectedCopagoAltoCosto && selectedCopagoAltoCosto !== "0") {
                    const copago = dynamicCopagosAltoCostoOptions?.find((c: any) => c.id === parseInt(selectedCopagoAltoCosto));
                    if (copago) {
                      subtotalUnitario += copago.price || 0;
                    }
                  }
                  
                  // Medicamentos
                  const selectedMedicamentos = dynamicCoberturaSelections?.medicamentos;
                  if (selectedMedicamentos && selectedMedicamentos !== "0") {
                    const cobertura = dynamicMedicamentosOptions?.find((m: any) => m.opt_id === parseInt(selectedMedicamentos));
                    if (cobertura) {
                      subtotalUnitario += parseFloat(cobertura.opt_prima || '0');
                    }
                  }
                  
                  // Copago Medicamentos
                  const selectedCopagoMedicamentos = dynamicCopagoSelection?.medicamentos;
                  if (selectedCopagoMedicamentos && selectedCopagoMedicamentos !== "0") {
                    const copago = dynamicCopagosOptions?.find((c: any) => c.id === parseInt(selectedCopagoMedicamentos));
                    if (copago) {
                      subtotalUnitario += copago.price || 0;
                    }
                  }
                  
                  // Habitación
                  const selectedHabitacion = dynamicCoberturaSelections?.habitacion;
                  if (selectedHabitacion && selectedHabitacion !== "0") {
                    const cobertura = dynamicHabitacionOptions?.find((h: any) => h.opt_id === parseInt(selectedHabitacion));
                    if (cobertura) {
                      subtotalUnitario += parseFloat(cobertura.opt_prima || '0');
                    }
                  }
                  
                  // Copago Habitación
                  const selectedCopagoHabitacion = dynamicCopagoSelection?.habitacion;
                  if (selectedCopagoHabitacion && selectedCopagoHabitacion !== "0") {
                    const copago = dynamicCopagosHabitacionOptions?.find((c: any) => c.id === parseInt(selectedCopagoHabitacion));
                    if (copago) {
                      subtotalUnitario += copago.price || 0;
                    }
                  }
                  
                  // Odontología
                  const selectedOdontologia = odontologiaSelection;
                  if (selectedOdontologia && selectedOdontologia !== "0") {
                    const odontologiaOption = odontologiaOptions?.find(opt => opt.value === selectedOdontologia);
                    if (odontologiaOption) {
                      subtotalUnitario += odontologiaOption.prima || 0;
                    }
                  }
                  
                  // Multiplicar por cantidad de afiliados
                  const totalSubtotal = subtotalUnitario * cantidadAfiliados;
                  return formatCurrency(totalSubtotal);
                } else {
                  // Para individuales, usar el valor del store como antes
                  return formatCurrency(currentPlan?.resumenPago.subTotalOpcional || 0);
                }
              })()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanTable;
