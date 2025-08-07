"use client"
import { useQuotationStore } from '@/presentation/quotations/store/useQuotationStore';
import React, { useState, useEffect } from 'react'
import { usePlanesOpcionales } from '../hooks/usePlanesOpcionales';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CoberturasOpcional } from '../interface/Coberturaopcional.interface';
import { Opcional } from '@/presentation/quotations/interface/createQuotation.interface';

// Datos estáticos para odontología
const odontologiaOptions = [
  { value: "0", label: "Seleccionar", prima: 0 },
  { value: "1", label: "Nivel I", prima: 150 },
  { value: "2", label: "Nivel II", prima: 350 },
  { value: "3", label: "Nivel III", prima: 700 }
];

const CoberturasOpcionales = () => {
    const { getFinalObject, updatePlanByName } = useQuotationStore();
    const { cliente, planes } = getFinalObject();
    
    // Estados para filtros globales (solo para clientChoosen === 2)
    const [globalFilters, setGlobalFilters] = useState({
      altoCosto: false,
      medicamentos: false,
      habitacion: false,
      odontologia: false
    });
    
    // Estados para selecciones por plan
    const [planSelections, setPlanSelections] = useState<{[planName: string]: {[key: string]: string}}>({});
    const [planesData, setPlanesData] = useState<{[planName: string]: CoberturasOpcional[]}>({});
    const [isUpdating, setIsUpdating] = useState(false);

    // Hacer petición para cada plan
    const planQueries = planes.map(plan => ({
      planName: plan.plan,
      query: usePlanesOpcionales(plan.plan, cliente?.tipoPlan || 1, cliente?.clientChoosen || 1)
    }));

    // Cargar datos de las peticiones
    useEffect(() => {
      const newPlanesData: {[planName: string]: CoberturasOpcional[]} = {};
      let hasChanges = false;
      
      planQueries.forEach(({ planName, query }) => {
        if (query.data) {
          newPlanesData[planName] = query.data;
          if (!planesData[planName] || JSON.stringify(planesData[planName]) !== JSON.stringify(query.data)) {
            hasChanges = true;
          }
        }
      });
      
      if (hasChanges) {
        setPlanesData(newPlanesData);
      }
    }, [planQueries.map(q => q.query.data).join(',')]);

    // Inicializar selecciones de odontología para cada plan
    useEffect(() => {
      const initialSelections: {[planName: string]: {[key: string]: string}} = {};
      let needsUpdate = false;
      
      planes.forEach(plan => {
        if (!planSelections[plan.plan]) {
          // Buscar si ya hay una selección de odontología en el store
          const odontologiaOpcional = plan.opcionales.find(opt => opt.nombre === "ODONTOLOGÍA");
          let odontologiaValue = "0";
          
          if (odontologiaOpcional) {
            const found = odontologiaOptions.find(opt => opt.label === odontologiaOpcional.descripcion);
            if (found) {
              odontologiaValue = found.value;
            }
          }
          
          initialSelections[plan.plan] = {
            odontologia: odontologiaValue
          };
          needsUpdate = true;
        }
      });
      
      if (needsUpdate) {
        setPlanSelections(prev => ({ ...prev, ...initialSelections }));
      }
    }, [planes.length]);

    // Inicializar filtros globales desde el store
    useEffect(() => {
      if (cliente?.clientChoosen === 2 && planes.length > 0) {
        const hasAltoCosto = planes.some(plan => plan.opcionales.some(opt => opt.nombre === "ALTO COSTO"));
        const hasMedicamentos = planes.some(plan => plan.opcionales.some(opt => opt.nombre === "MEDICAMENTOS"));
        const hasHabitacion = planes.some(plan => plan.opcionales.some(opt => opt.nombre === "HABITACIÓN"));
        const hasOdontologia = planes.some(plan => plan.opcionales.some(opt => opt.nombre === "ODONTOLOGÍA"));
        
        setGlobalFilters({
          altoCosto: hasAltoCosto,
          medicamentos: hasMedicamentos,
          habitacion: hasHabitacion,
          odontologia: hasOdontologia
        });
      }
    }, [cliente?.clientChoosen, planes.length]);

    const handleGlobalFilterChange = (filter: string, checked: boolean) => {
      setGlobalFilters(prev => ({
        ...prev,
        [filter]: checked
      }));
    };

    const handleOdontologiaChange = (planName: string, value: string) => {
      setPlanSelections(prev => ({
        ...prev,
        [planName]: {
          ...prev[planName],
          odontologia: value
        }
      }));
      updatePlanOpcionales(planName, value);
    };

    const updatePlanOpcionales = (planName: string, odontologiaValue: string) => {
      if (isUpdating) return;
      
      const planData = planesData[planName];
      if (!planData || !planData[0]) return;

      setIsUpdating(true);
      
      const opcionales: Opcional[] = [];
      const data = planData[0];
      const plan = planes.find(p => p.plan === planName);
      if (!plan) {
        setIsUpdating(false);
        return;
      }

      let subTotalOpcional = 0;
      const cantidadAfiliados = plan.afiliados.length;

      // Solo agregar las coberturas que están filtradas (para clientChoosen === 2) o todas (para clientChoosen === 1)
      if (cliente?.clientChoosen === 1 || globalFilters.altoCosto) {
        const prima = parseFloat(data.primaCosto) || 0;
        opcionales.push({
          nombre: "ALTO COSTO",
          descripcion: data.altoCosto,
          prima: prima * cantidadAfiliados
        });
        subTotalOpcional += prima * cantidadAfiliados;
      }

      if (cliente?.clientChoosen === 1 || globalFilters.medicamentos) {
        const prima = parseFloat(data.medicamentoCosto) || 0;
        opcionales.push({
          nombre: "MEDICAMENTOS",
          descripcion: data.medicamento,
          prima: prima * cantidadAfiliados
        });
        subTotalOpcional += prima * cantidadAfiliados;
      }

      if (cliente?.clientChoosen === 1 || globalFilters.habitacion) {
        const prima = parseFloat(data.habitacionCosto) || 0;
        opcionales.push({
          nombre: "HABITACIÓN",
          descripcion: data.habitacion,
          prima: prima * cantidadAfiliados
        });
        subTotalOpcional += prima * cantidadAfiliados;
      }

      // Odontología
      if (cliente?.clientChoosen === 1 || globalFilters.odontologia) {
        const odontologiaSelected = odontologiaOptions.find(opt => opt.value === odontologiaValue);
        if (odontologiaSelected && odontologiaSelected.value !== "0") {
          opcionales.push({
            nombre: "ODONTOLOGÍA",
            descripcion: odontologiaSelected.label,
            prima: odontologiaSelected.prima * cantidadAfiliados
          });
          subTotalOpcional += odontologiaSelected.prima * cantidadAfiliados;
        }
      }

      // Actualizar el plan en el store
      const currentPlan = planes.find(p => p.plan === planName);
      if (currentPlan) {
        const subTotalAfiliado = currentPlan.resumenPago.subTotalAfiliado;
        
        updatePlanByName(planName, {
          opcionales,
          resumenPago: {
            ...currentPlan.resumenPago,
            subTotalOpcional,
            totalPagar: subTotalAfiliado + subTotalOpcional
          }
        });
      }
      
      setTimeout(() => setIsUpdating(false), 100);
    };

    // Actualizar todos los planes cuando cambian los filtros globales
    useEffect(() => {
      if (cliente?.clientChoosen === 2 && !isUpdating) {
        const timer = setTimeout(() => {
          planes.forEach(plan => {
            if (planesData[plan.plan]) {
              const odontologiaValue = planSelections[plan.plan]?.odontologia || "0";
              updatePlanOpcionales(plan.plan, odontologiaValue);
            }
          });
        }, 50);
        return () => clearTimeout(timer);
      }
    }, [globalFilters.altoCosto, globalFilters.medicamentos, globalFilters.habitacion, globalFilters.odontologia]);

    // Actualizar planes cuando se cargan los datos por primera vez o cambia la selección de odontología
    useEffect(() => {
      if (!isUpdating && Object.keys(planesData).length > 0) {
        const timer = setTimeout(() => {
          planes.forEach(plan => {
            if (planesData[plan.plan] && planSelections[plan.plan]) {
              const odontologiaValue = planSelections[plan.plan].odontologia || "0";
              // Solo actualizar si no hay opcionales ya guardados o si la odontología cambió
              const hasOpcionales = plan.opcionales.length > 0;
              const currentOdontologia = plan.opcionales.find(opt => opt.nombre === "ODONTOLOGÍA");
              const expectedOdontologia = odontologiaOptions.find(opt => opt.value === odontologiaValue);
              
              const shouldUpdate = !hasOpcionales || 
                (expectedOdontologia && currentOdontologia?.descripcion !== expectedOdontologia.label) ||
                (!expectedOdontologia && currentOdontologia);
              
              if (shouldUpdate) {
                updatePlanOpcionales(plan.plan, odontologiaValue);
              }
            }
          });
        }, 50);
        return () => clearTimeout(timer);
      }
    }, [Object.keys(planesData).join(','), JSON.stringify(planSelections)]);

    const renderPlanTable = (planName: string, planData: CoberturasOpcional[]) => {
      if (!planData || !planData[0]) return null;
      
      const data = planData[0];
      const plan = planes.find(p => p.plan === planName);
      if (!plan) return null;

      const cantidadAfiliados = plan.afiliados.length;
      const odontologiaSelection = planSelections[planName]?.odontologia || "0";

      return (
        <Card key={planName} className="mb-6">
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
              {(cliente?.clientChoosen === 1 || globalFilters.altoCosto) && (
                <div className="grid grid-cols-2 gap-4 py-2 border-b">
                  <div className="text-sm">
                    <div className="font-medium">ALTO COSTO {data.altoCosto}</div>
                  </div>
                  <div className="text-sm font-medium">{(parseFloat(data.primaCosto) * cantidadAfiliados).toFixed(2)}</div>
                </div>
              )}

              {/* Medicamentos */}
              {(cliente?.clientChoosen === 1 || globalFilters.medicamentos) && (
                <div className="grid grid-cols-2 gap-4 py-2 border-b">
                  <div className="text-sm">
                    <div className="font-medium">MEDICAMENTOS {data.medicamento}</div>
                  </div>
                  <div className="text-sm font-medium">{(parseFloat(data.medicamentoCosto) * cantidadAfiliados).toFixed(2)}</div>
                </div>
              )}

              {/* Habitación */}
              {(cliente?.clientChoosen === 1 || globalFilters.habitacion) && (
                <div className="grid grid-cols-2 gap-4 py-2 border-b">
                  <div className="text-sm">
                    <div className="font-medium">HABITACIÓN {data.habitacion}</div>
                  </div>
                  <div className="text-sm font-medium">{(parseFloat(data.habitacionCosto) * cantidadAfiliados).toFixed(2)}</div>
                </div>
              )}

              {/* Odontología */}
              {(cliente?.clientChoosen === 1 || globalFilters.odontologia) && (
                <div className="grid grid-cols-2 gap-4 py-2 border-b">
                  <div className="text-sm">
                    <div className="font-medium">ODONTOLOGÍA</div>
                    <Select
                      value={odontologiaSelection}
                      onValueChange={(value) => handleOdontologiaChange(planName, value)}
                    >
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {odontologiaOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

    if (!cliente || planes.length === 0) {
      return (
        <div className="text-center py-8">
          <p>No hay planes seleccionados para mostrar coberturas opcionales.</p>
        </div>
      );
    }

    const isLoading = planQueries.some(q => q.query.isLoading);
    const hasError = planQueries.some(q => q.query.error);

    if (isLoading) {
      return (
        <div className="text-center py-8">
          <p>Cargando coberturas opcionales...</p>
        </div>
      );
    }

    if (hasError) {
      return (
        <div className="text-center py-8 text-red-500">
          <p>Error al cargar las coberturas opcionales.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Filtros globales - Solo para clientChoosen === 2 */}
        {cliente?.clientChoosen === 2 && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">
              Selecciona las coberturas opcionales que deseas incluir:
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="filter-altoCosto"
                  checked={globalFilters.altoCosto}
                  onCheckedChange={(checked) => handleGlobalFilterChange('altoCosto', checked as boolean)}
                />
                <label htmlFor="filter-altoCosto" className="text-sm font-medium">
                  ALTO COSTO
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="filter-medicamentos"
                  checked={globalFilters.medicamentos}
                  onCheckedChange={(checked) => handleGlobalFilterChange('medicamentos', checked as boolean)}
                />
                <label htmlFor="filter-medicamentos" className="text-sm font-medium">
                  MEDICAMENTOS
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="filter-habitacion"
                  checked={globalFilters.habitacion}
                  onCheckedChange={(checked) => handleGlobalFilterChange('habitacion', checked as boolean)}
                />
                <label htmlFor="filter-habitacion" className="text-sm font-medium">
                  HABITACIÓN
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="filter-odontologia"
                  checked={globalFilters.odontologia}
                  onCheckedChange={(checked) => handleGlobalFilterChange('odontologia', checked as boolean)}
                />
                <label htmlFor="filter-odontologia" className="text-sm font-medium">
                  ODONTOLOGÍA
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Tablas por plan */}
        {planes.map(plan => {
          const planData = planesData[plan.plan];
          return renderPlanTable(plan.plan, planData);
        })}
      </div>
    );
}

export default CoberturasOpcionales
