"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CoberturasOpcional,
  CoberturasOpcionaleColectivo,
  Copago,
} from "../../interface/Coberturaopcional.interface";
import { Plan } from "@/presentation/quotations/interface/createQuotation.interface";
import OdontologiaSelect, { OdontologiaOption } from "./OdontologiaSelect";
import { CoberturaOption } from "./CoberturaSelect";
import { CopagoOption } from "./CopagoSelect";
import DynamicCoberturaSelect from "./DynamicCoberturaSelect";
import DynamicCopagoSelect from "./DynamicCopagoSelect";
import { formatCurrency } from "@/presentation/helpers/FormattCurrency";
import { useUnifiedQuotationStore } from "@/core";
import { Cliente } from "@/presentation/quotations/interface/quotation.interface";
import { Badge } from "@/components/ui/badge";

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
  cliente: Cliente | null; // Agregar cliente para acceder a tipoPlan
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
  onCoberturaChange: (
    planName: string,
    coberturaType: keyof CoberturaSelections,
    value: string
  ) => void;
  onCopagoChange: (planName: string, value: string) => void;
  onCopagoHabitacionChange: (planName: string, value: string) => void;
  onDynamicCoberturaChange: (
    planName: string,
    coberturaType: string,
    value: string
  ) => void;
  onDynamicCopagoChange: (
    planName: string,
    coberturaType: string,
    value: string
  ) => void;
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
  // copagoHabitacionOptions,

  // Nuevas props dinámicas
  dynamicCoberturaSelections,
  dynamicCopagoSelection,
  dynamicAltoCostoOptions,
  dynamicMedicamentosOptions,
  dynamicHabitacionOptions,
  dynamicCopagosOptions,
  dynamicCopagosAltoCostoOptions,
  dynamicCopagosHabitacionOptions,

  onOdontologiaChange,
  onDynamicCoberturaChange,
  onDynamicCopagoChange,
}: PlanTableProps) => {
  // Leer el plan actualizado directamente del store para asegurar que se muestren los valores más recientes
  const currentPlan =
    useUnifiedQuotationStore((state) =>
      state.planes.find((p) => p.plan === planName)
    ) || plan;

  if (!planData || !planData[0]) return null;

  const data = planData[0];
  // Para colectivos: usar plan.cantidadAfiliados
  // Para individuales: usar plan.afiliados.length
  const cantidadAfiliados =
    clientChoosen === 2
      ? currentPlan.cantidadAfiliados || 1
      : currentPlan.afiliados.length;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>
          <Badge className=" bg-gradient-to-b from-[#009590] to-[#0269aa] text-white mr-2">
            {planName}
          </Badge>
        </CardTitle>
        
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Header - Simplificado sin columnas */}
         

          {/* Alto Costo */}
          {(clientChoosen === 1 || globalFilters.altoCosto) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-3">Alto Costo</h3>
              {clientChoosen === 2 ? (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">
                      Cobertura:
                    </label>
                    <div className="flex-1 min-w-0">
                      <DynamicCoberturaSelect
                        value={dynamicCoberturaSelections?.altoCosto || ""}
                        onChange={(value) =>
                          onDynamicCoberturaChange(planName, "altoCosto", value)
                        }
                        options={dynamicAltoCostoOptions}
                        placeholder="Seleccionar opción de Alto Costo"
                      />
                    </div>
                    <div className="text-base font-medium text-blue-600 w-24 flex-shrink-0 text-right">
                      {(() => {
                        const selectedAltoCosto =
                          dynamicCoberturaSelections?.altoCosto;
                        if (selectedAltoCosto && selectedAltoCosto !== "0") {
                          const cobertura = dynamicAltoCostoOptions?.find(
                            (ac: CoberturasOpcionaleColectivo) =>
                              ac.opt_id === parseInt(selectedAltoCosto)
                          );
                          if (cobertura) {
                            return formatCurrency(
                              parseFloat(cobertura.opt_prima || "0")
                            );
                          }
                        }
                        return formatCurrency(0);
                      })()}
                    </div>
                  </div>

                  {/* Mostrar select de copago solo para complementarios colectivos */}
                  {(() => {
                    const shouldShowCopago =
                      dynamicCoberturaSelections?.altoCosto &&
                      dynamicCoberturaSelections?.altoCosto !== "0" &&
                      cliente?.tipoPlan === 2 &&
                      clientChoosen === 2;

                    return shouldShowCopago;
                  })() && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">
                        Copago:
                      </label>
                      <div className="flex-1 min-w-0">
                        <DynamicCopagoSelect
                          value={dynamicCopagoSelection.altoCosto}
                          onChange={(value) =>
                            onDynamicCopagoChange(planName, "altoCosto", value)
                          }
                          options={dynamicCopagosAltoCostoOptions}
                          placeholder="Seleccionar copago (opcional)"
                        />
                      </div>
                      <div className="text-base font-medium text-green-600 w-24 flex-shrink-0 text-right">
                        {(() => {
                          const selectedCopago =
                            dynamicCopagoSelection?.altoCosto;
                          if (selectedCopago && selectedCopago !== "0") {
                            const copago = dynamicCopagosAltoCostoOptions?.find(
                              (c: Copago) => c.id === parseInt(selectedCopago)
                            );
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
                <div className="flex justify-between items-center">
                  <div className="text-gray-700">{data.altoCosto}</div>
                  <div className="text-base font-medium text-blue-600">
                    {(() => {
                      const altoCostoOpcional = currentPlan?.opcionales?.find(
                        (opt) => opt.nombre === "ALTO COSTO"
                      );
                      return formatCurrency(altoCostoOpcional?.prima || 0);
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Medicamentos */}
          {(clientChoosen === 1 || globalFilters.medicamentos) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-3">Medicamentos</h3>
              {clientChoosen === 2 ? (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">
                      Cobertura:
                    </label>
                    <div className="flex-1 min-w-0">
                      <DynamicCoberturaSelect
                        value={dynamicCoberturaSelections?.medicamentos || ""}
                        onChange={(value) =>
                          onDynamicCoberturaChange(
                            planName,
                            "medicamentos",
                            value
                          )
                        }
                        options={dynamicMedicamentosOptions}
                        placeholder="Seleccionar opción de Medicamentos"
                      />
                    </div>
                    <div className="text-base font-medium text-blue-600 w-24 flex-shrink-0 text-right">
                      {(() => {
                        const selectedMedicamentos =
                          dynamicCoberturaSelections?.medicamentos;
                        if (
                          selectedMedicamentos &&
                          selectedMedicamentos !== "0"
                        ) {
                          const cobertura = dynamicMedicamentosOptions?.find(
                            (m: CoberturasOpcionaleColectivo) =>
                              m.opt_id === parseInt(selectedMedicamentos)
                          );
                          if (cobertura) {
                            return formatCurrency(
                              parseFloat(cobertura.opt_prima || "0")
                            );
                          }
                        }
                        return formatCurrency(0);
                      })()}
                    </div>
                  </div>

                  {/* Mostrar select de copago solo para complementarios colectivos */}
                  {(() => {
                    const shouldShowCopago =
                      dynamicCoberturaSelections?.medicamentos &&
                      dynamicCoberturaSelections?.medicamentos !== "0" &&
                      cliente?.tipoPlan === 2 &&
                      clientChoosen === 2;

                    return shouldShowCopago;
                  })() && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">
                        Copago:
                      </label>
                      <div className="flex-1 min-w-0">
                        <DynamicCopagoSelect
                          value={dynamicCopagoSelection.medicamentos}
                          onChange={(value) =>
                            onDynamicCopagoChange(
                              planName,
                              "medicamentos",
                              value
                            )
                          }
                          options={dynamicCopagosOptions}
                          placeholder="Seleccionar copago (opcional)"
                        />
                      </div>
                      <div className="text-base font-medium text-green-600 w-24 flex-shrink-0 text-right">
                        {(() => {
                          const selectedCopago =
                            dynamicCopagoSelection?.medicamentos;
                          if (selectedCopago && selectedCopago !== "0") {
                            const copago = dynamicCopagosOptions?.find(
                              (c: Copago) => c.id === parseInt(selectedCopago)
                            );
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
                <div className="flex justify-between items-center">
                  <div className="text-gray-700">{data.medicamento}</div>
                  <div className="text-base font-medium text-blue-600">
                    {(() => {
                      const medicamentosOpcional =
                        currentPlan?.opcionales?.find(
                          (opt) => opt.nombre === "MEDICAMENTOS"
                        );
                      return formatCurrency(medicamentosOpcional?.prima || 0);
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Habitación */}
          {(clientChoosen === 1 || globalFilters.habitacion) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-3">Habitación</h3>
              {clientChoosen === 2 ? (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">
                      Cobertura:
                    </label>
                    <div className="flex-1 min-w-0">
                      <DynamicCoberturaSelect
                        value={dynamicCoberturaSelections?.habitacion || ""}
                        onChange={(value) =>
                          onDynamicCoberturaChange(
                            planName,
                            "habitacion",
                            value
                          )
                        }
                        options={dynamicHabitacionOptions}
                        placeholder="Seleccionar opción de Habitación"
                      />
                    </div>
                    <div className="text-base font-medium text-blue-600 w-24 flex-shrink-0 text-right">
                      {(() => {
                        const selectedHabitacion =
                          dynamicCoberturaSelections?.habitacion;
                        if (selectedHabitacion && selectedHabitacion !== "0") {
                          const cobertura = dynamicHabitacionOptions?.find(
                            (h: CoberturasOpcionaleColectivo) =>
                              h.opt_id === parseInt(selectedHabitacion)
                          );
                          if (cobertura) {
                            return formatCurrency(
                              parseFloat(cobertura.opt_prima || "0")
                            );
                          }
                        }
                        return formatCurrency(0);
                      })()}
                    </div>
                  </div>

                  {/* Mostrar select de copago solo para complementarios colectivos */}
                  {(() => {
                    const shouldShowCopago =
                      dynamicCoberturaSelections?.habitacion &&
                      dynamicCoberturaSelections?.habitacion !== "0" &&
                      cliente?.tipoPlan === 2 &&
                      clientChoosen === 2;

                    return shouldShowCopago;
                  })() && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">
                        Copago:
                      </label>
                      <div className="flex-1 min-w-0">
                        <DynamicCopagoSelect
                          value={dynamicCopagoSelection.habitacion}
                          onChange={(value) =>
                            onDynamicCopagoChange(planName, "habitacion", value)
                          }
                          options={dynamicCopagosHabitacionOptions}
                          placeholder="Seleccionar copago (opcional)"
                        />
                      </div>
                      <div className="text-base font-medium text-green-600 w-24 flex-shrink-0 text-right">
                        {(() => {
                          const selectedCopago =
                            dynamicCopagoSelection?.habitacion;
                          if (selectedCopago && selectedCopago !== "0") {
                            const copago =
                              dynamicCopagosHabitacionOptions?.find(
                                (c: Copago) => c.id === parseInt(selectedCopago)
                              );
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
                <div className="flex justify-between items-center">
                  <div className="text-gray-700">{data.habitacion}</div>
                  <div className="text-base font-medium text-blue-600">
                    {(() => {
                      const habitacionOpcional = currentPlan?.opcionales?.find(
                        (opt) => opt.nombre === "HABITACION" || opt.nombre === "HABITACIÓN"
                      );
                      return formatCurrency(habitacionOpcional?.prima || 0);
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Odontología */}
          {(clientChoosen === 1 || globalFilters.odontologia) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-3">Odontología</h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <label className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">
                    Cobertura:
                  </label>
                  <div className="flex-1 min-w-0">
                    <OdontologiaSelect
                      value={odontologiaSelection}
                      onChange={(value) => onOdontologiaChange(planName, value)}
                      options={odontologiaOptions}
                    />
                  </div>
                  <div className="text-base font-medium text-blue-600 w-24 flex-shrink-0 text-right">
                    {(() => {
                      const selectedOption = odontologiaOptions?.find(
                        (opt) => opt.value === odontologiaSelection
                      );
                      return formatCurrency(selectedOption?.prima  || 0 );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subtotal */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="font-bold text-gray-800">
                SubTotal Opcionales
                <div className="text-xs text-gray-600 font-normal mt-1">
                  {cantidadAfiliados} Afiliados
                </div>
              </div>

              <div className="flex items-end">
                {(() => {
                  if (clientChoosen === 2) {
                    // Calcular subtotal unitario (misma lógica que antes)
                    let subtotalUnitario = 0;

                    // Alto Costo
                    const selectedAltoCosto =
                      dynamicCoberturaSelections?.altoCosto;
                    if (selectedAltoCosto && selectedAltoCosto !== "0") {
                      const cobertura = dynamicAltoCostoOptions?.find(
                        (ac: CoberturasOpcionaleColectivo) => ac.opt_id === parseInt(selectedAltoCosto)
                      );
                      if (cobertura) {
                        subtotalUnitario += parseFloat(
                          cobertura.opt_prima || "0"
                        );
                      }
                    }

                    // Copago Alto Costo
                    const selectedCopagoAltoCosto =
                      dynamicCopagoSelection?.altoCosto;
                    if (
                      selectedCopagoAltoCosto &&
                      selectedCopagoAltoCosto !== "0"
                    ) {
                      const copago = dynamicCopagosAltoCostoOptions?.find(
                        (c: Copago) => c.id === parseInt(selectedCopagoAltoCosto)
                      );
                      if (copago) {
                        subtotalUnitario += copago.price || 0;
                      }
                    }

                    // Medicamentos
                    const selectedMedicamentos =
                      dynamicCoberturaSelections?.medicamentos;
                    if (selectedMedicamentos && selectedMedicamentos !== "0") {
                      const cobertura = dynamicMedicamentosOptions?.find(
                        (m: CoberturasOpcionaleColectivo) => m.opt_id === parseInt(selectedMedicamentos)
                      );
                      if (cobertura) {
                        subtotalUnitario += parseFloat(
                          cobertura.opt_prima || "0"
                        );
                      }
                    }

                    // Copago Medicamentos
                    const selectedCopagoMedicamentos =
                      dynamicCopagoSelection?.medicamentos;
                    if (
                      selectedCopagoMedicamentos &&
                      selectedCopagoMedicamentos !== "0"
                    ) {
                      const copago = dynamicCopagosOptions?.find(
                        (c: Copago) =>
                          c.id === parseInt(selectedCopagoMedicamentos)
                      );
                      if (copago) {
                        subtotalUnitario += copago.price || 0;
                      }
                    }

                    // Habitación
                    const selectedHabitacion =
                      dynamicCoberturaSelections?.habitacion;
                    if (selectedHabitacion && selectedHabitacion !== "0") {
                      const cobertura = dynamicHabitacionOptions?.find(
                        (h: CoberturasOpcionaleColectivo) => h.opt_id === parseInt(selectedHabitacion)
                      );
                      if (cobertura) {
                        subtotalUnitario += parseFloat(
                          cobertura.opt_prima || "0"
                        );
                      }
                    }

                    // Copago Habitación
                    const selectedCopagoHabitacion =
                      dynamicCopagoSelection?.habitacion;
                    if (
                      selectedCopagoHabitacion &&
                      selectedCopagoHabitacion !== "0"
                    ) {
                      const copago = dynamicCopagosHabitacionOptions?.find(
                        (c: Copago) => c.id === parseInt(selectedCopagoHabitacion)
                      );
                      if (copago) {
                        subtotalUnitario += copago.price || 0;
                      }
                    }

                    // Odontología
                    const selectedOdontologia = odontologiaSelection;
                    if (selectedOdontologia && selectedOdontologia !== "0") {
                      const odontologiaOption = odontologiaOptions?.find(
                        (opt) => opt.value === selectedOdontologia
                      );
                      if (odontologiaOption) {
                        subtotalUnitario += odontologiaOption.prima || 0;
                      }
                    }

                    // Calcular total
                    const totalSubtotal = subtotalUnitario * cantidadAfiliados;

                    // Mostrar unitario + total de forma responsiva
                    return (
                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:space-x-4 text-right">
                        <div className="flex items-baseline gap-2">
                          <div className="text-xs text-gray-600">Unitario:</div>
                          <div className="text-sm font-medium text-blue-600">
                            {formatCurrency(subtotalUnitario)}
                          </div>
                        </div>

                        <div className="flex items-baseline gap-2">
                          <div className="text-xs text-gray-600">Total:</div>
                          <div className="text-lg font-bold text-blue-700">
                            {formatCurrency(totalSubtotal)}
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    // Individual: mostrar subtotal guardado
                    return (
                      <div className="text-lg font-bold text-blue-700">
                        {formatCurrency(
                          currentPlan?.resumenPago.subTotalOpcional || 0
                        )}
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanTable;
