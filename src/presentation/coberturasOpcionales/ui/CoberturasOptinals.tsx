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
  { value: "0", label: "No incluir", prima: 0 },
  { value: "1", label: "Básica", prima: 150 },
  { value: "2", label: "Avanzada", prima: 300 },
  { value: "3", label: "Premium", prima: 500 }
];

const CoberturasOpcionales = () => {
    const { getFinalObject, updatePlanByName } = useQuotationStore();
    const { cliente, planes } = getFinalObject();
    
    const [selectedOpcionales, setSelectedOpcionales] = useState<{[planName: string]: {[key: string]: boolean | string}}>({});
    const [planesData, setPlanesData] = useState<{[planName: string]: CoberturasOpcional[]}>({});

    // Hacer petición para cada plan
    const planQueries = planes.map(plan => ({
      planName: plan.plan,
      query: usePlanesOpcionales(plan.plan, cliente?.tipoPlan || 1, cliente?.clientChoosen || 1)
    }));

    // Cargar datos de las peticiones
    useEffect(() => {
      const newPlanesData: {[planName: string]: CoberturasOpcional[]} = {};
      planQueries.forEach(({ planName, query }) => {
        if (query.data) {
          newPlanesData[planName] = query.data;
        }
      });
      setPlanesData(newPlanesData);
    }, [planQueries.map(q => q.query.data).join(',')]);

    // Inicializar estados de selección
    useEffect(() => {
      const initialSelection: {[planName: string]: {[key: string]: boolean | string}} = {};
      planes.forEach(plan => {
        if (!selectedOpcionales[plan.plan]) {
          initialSelection[plan.plan] = {
            altoCosto: false,
            medicamentos: false,
            habitacion: false,
            odontologia: "0"
          };
        }
      });
      setSelectedOpcionales(prev => ({ ...prev, ...initialSelection }));
    }, [planes]);

    const handleCheckboxChange = (planName: string, opcion: string, checked: boolean) => {
      const newSelections = {
        ...selectedOpcionales[planName],
        [opcion]: checked
      };
      
      setSelectedOpcionales(prev => ({
        ...prev,
        [planName]: newSelections
      }));
      
      updateOpcionales(planName, newSelections);
    };

    const handleSelectChange = (planName: string, value: string) => {
      const newSelections = {
        ...selectedOpcionales[planName],
        odontologia: value
      };
      
      setSelectedOpcionales(prev => ({
        ...prev,
        [planName]: newSelections
      }));
      
      updateOpcionales(planName, newSelections);
    };

    const updateOpcionales = (planName: string, selections: {[key: string]: boolean | string}) => {
      const planData = planesData[planName];
      if (!planData || !planData[0]) return;

      const opcionales: Opcional[] = [];
      const data = planData[0];

      // Alto Costo
      if (selections.altoCosto) {
        opcionales.push({
          nombre: "ALTO COSTO",
          descripcion: data.altoCosto,
          prima: parseFloat(data.primaCosto) || 0
        });
      }

      // Medicamentos
      if (selections.medicamentos) {
        opcionales.push({
          nombre: "MEDICAMENTOS",
          descripcion: data.medicamento,
          prima: parseFloat(data.medicamentoCosto) || 0
        });
      }

      // Habitación
      if (selections.habitacion) {
        opcionales.push({
          nombre: "HABITACIÓN",
          descripcion: data.habitacion,
          prima: parseFloat(data.habitacionCosto) || 0
        });
      }

      // Odontología
      const odontologiaSelected = odontologiaOptions.find(opt => opt.value === selections.odontologia);
      if (odontologiaSelected && odontologiaSelected.value !== "0") {
        opcionales.push({
          nombre: "ODONTOLOGÍA",
          descripcion: odontologiaSelected.label,
          prima: odontologiaSelected.prima
        });
      }

      // Calcular subtotal de opcionales
      const subTotalOpcional = opcionales.reduce((sum, opt) => sum + opt.prima, 0);
      
      // Obtener el plan actual para mantener otros datos
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
    };

    const renderPlanOpcionales = (planName: string, planData: CoberturasOpcional[]) => {
      if (!planData || !planData[0]) return null;
      
      const data = planData[0];
      const selections = selectedOpcionales[planName] || {};

      if (cliente?.clientChoosen === 1) {
        // Vista para clientChoosen = 1 (con checkboxes)
        return (
          <Card key={planName} className="mb-6">
            <CardHeader>
              <CardTitle>Coberturas Opcionales - {planName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Selecciona las coberturas opcionales que deseas incluir:
                </p>

                {/* Alto Costo */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`altoCosto-${planName}`}
                    checked={selections.altoCosto as boolean}
                    onCheckedChange={(checked) => handleCheckboxChange(planName, 'altoCosto', checked as boolean)}
                  />
                  <label htmlFor={`altoCosto-${planName}`} className="text-sm font-medium">
                    ALTO COSTO
                  </label>
                  <span className="text-sm text-gray-500">
                    {data.altoCosto}
                  </span>
                </div>

                {/* Medicamentos */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`medicamentos-${planName}`}
                    checked={selections.medicamentos as boolean}
                    onCheckedChange={(checked) => handleCheckboxChange(planName, 'medicamentos', checked as boolean)}
                  />
                  <label htmlFor={`medicamentos-${planName}`} className="text-sm font-medium">
                    MEDICAMENTOS
                  </label>
                  <span className="text-sm text-gray-500">
                    {data.medicamento}
                  </span>
                </div>

                {/* Habitación */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`habitacion-${planName}`}
                    checked={selections.habitacion as boolean}
                    onCheckedChange={(checked) => handleCheckboxChange(planName, 'habitacion', checked as boolean)}
                  />
                  <label htmlFor={`habitacion-${planName}`} className="text-sm font-medium">
                    HABITACIÓN
                  </label>
                  <span className="text-sm text-gray-500">
                    {data.habitacion}
                  </span>
                </div>

                {/* Odontología */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">ODONTOLOGÍA</label>
                  <Select
                    value={selections.odontologia as string}
                    onValueChange={(value) => handleSelectChange(planName, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar cobertura" />
                    </SelectTrigger>
                    <SelectContent>
                      {odontologiaOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label} {option.prima > 0 && `- DOP ${option.prima.toFixed(2)}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      } else if (cliente?.clientChoosen === 2) {
        // Vista para clientChoosen = 2 (tabla detallada con checkboxes)
        return (
          <Card key={planName} className="mb-6">
            <CardHeader>
              <CardTitle>Coberturas Opcionales - {planName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Header */}
                <div className="grid grid-cols-2 gap-4 pb-2 border-b font-medium text-sm text-gray-600">
                  <div>Opcional</div>
                  <div>Prima Opcional</div>
                </div>
                
                {/* Alto Costo */}
                <div className="grid grid-cols-2 gap-4 py-2 border-b items-center">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`altoCosto-${planName}`}
                      checked={selections.altoCosto as boolean}
                      onCheckedChange={(checked) => handleCheckboxChange(planName, 'altoCosto', checked as boolean)}
                    />
                    <div className="text-sm">
                      <div className="font-medium">ALTO COSTO {data.altoCosto}</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium">{data.primaCosto}</div>
                </div>

                {/* Medicamentos */}
                <div className="grid grid-cols-2 gap-4 py-2 border-b items-center">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`medicamentos-${planName}`}
                      checked={selections.medicamentos as boolean}
                      onCheckedChange={(checked) => handleCheckboxChange(planName, 'medicamentos', checked as boolean)}
                    />
                    <div className="text-sm">
                      <div className="font-medium">MEDICAMENTOS {data.medicamento}</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium">{data.medicamentoCosto}</div>
                </div>

                {/* Habitación */}
                <div className="grid grid-cols-2 gap-4 py-2 border-b items-center">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`habitacion-${planName}`}
                      checked={selections.habitacion as boolean}
                      onCheckedChange={(checked) => handleCheckboxChange(planName, 'habitacion', checked as boolean)}
                    />
                    <div className="text-sm">
                      <div className="font-medium">HABITACIÓN {data.habitacion}</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium">{data.habitacionCosto}</div>
                </div>

                {/* Odontología */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">ODONTOLOGÍA</label>
                  <Select
                    value={selections.odontologia as string}
                    onValueChange={(value) => handleSelectChange(planName, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar cobertura" />
                    </SelectTrigger>
                    <SelectContent>
                      {odontologiaOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label} {option.prima > 0 && `- DOP ${option.prima.toFixed(2)}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subtotal */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t font-bold">
                  <div className="text-sm">SubTotal Opcionales</div>
                  <div className="text-sm">
                    DOP {planes.find(p => p.plan === planName)?.resumenPago.subTotalOpcional.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      }

      return null;
    };

    if (!cliente || planes.length === 0) {
      return (
        <div className="text-center py-8">
          <p>No hay planes seleccionados para mostrar coberturas opcionales.</p>
        </div>
      );
    }
    
  return (
    <div className="space-y-6">
      {planes.map(plan => {
        const planData = planesData[plan.plan];
        const query = planQueries.find(q => q.planName === plan.plan)?.query;
        
        if (query?.isLoading) {
          return (
            <Card key={plan.plan} className="mb-6">
              <CardContent className="p-6">
                <div className="text-center">Cargando coberturas para {plan.plan}...</div>
              </CardContent>
            </Card>
          );
        }

        if (query?.error) {
          return (
            <Card key={plan.plan} className="mb-6">
              <CardContent className="p-6">
                <div className="text-center text-red-500">
                  Error al cargar coberturas para {plan.plan}
                </div>
              </CardContent>
            </Card>
          );
        }

        return renderPlanOpcionales(plan.plan, planData);
      })}
    </div>
  );
}

export default CoberturasOpcionales
