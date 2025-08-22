import React, { useState, useEffect, useMemo } from 'react'
import { useGetAllPlans } from '../hooks/usePlans';
import { GetPrimaPlan } from '../service/prima.service';
import CheckBoxPlans from './CheckBoxPlans';
import AddAfiliadoForm from './AddAfiliadoForm';
import AfiliadosList from './AfiliadosList';
import PlanesResumen from './PlanesResumen';
import { useQuotationData } from '@/core';
import { Spinner } from '@/components/shared/Spinner';
import { Plan as PlanInterface } from '../interface/plan.interface';
import { Plan as QuotationPlan, Afiliado } from '@/presentation/quotations/interface/createQuotation.interface';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const CategoryPlan = () => {
  // Acceder directamente a los datos del store sin usar getFinalObject en cada render
  const { cliente, planes, addPlan, updatePlanByName, removePlan } = useQuotationData();
  
  const tipoPoliza = cliente?.tipoPlan;
  const subTipoPoliza = cliente?.clientChoosen;

  const [selectedPlans, setSelectedPlans] = useState<Map<number, PlanInterface>>(new Map());
  const [ageError, setAgeError] = useState<string | null>(null);
  
  const { data: plans, isLoading, error } = useGetAllPlans(tipoPoliza ?? 0, subTipoPoliza ?? 0);

  // Función para ordenar los planes según el orden deseado
  const getOrderedPlans = (plansList: PlanInterface[]) => {
    if (!plansList) return [];
    
    const desiredOrder = ['FLEX', 'SMART', 'UP', 'CARE', 'LIFE']; // Orden deseado de los planes
    
    return plansList.sort((a, b) => {
      // Extraer el nombre del plan sin "FLEX " al inicio
      const getBaseName = (planName: string) => {
        // Si el plan se llama exactamente "FLEX", devolver "FLEX"
        if (planName === 'FLEX') return 'FLEX';
        
        // Si empieza con "FLEX ", quitar el prefijo
        if (planName.startsWith('FLEX ')) {
          return planName.replace('FLEX ', '');
        }
        
        // Si no empieza con FLEX, devolver el nombre completo
        return planName;
      };
      
      const baseNameA = getBaseName(a.plan_name);
      const baseNameB = getBaseName(b.plan_name);
      
      const indexA = desiredOrder.indexOf(baseNameA);
      const indexB = desiredOrder.indexOf(baseNameB);
      
      // Si ambos están en el orden deseado, usar ese orden
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      // Si solo uno está en el orden deseado, ese va primero
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      // Si ninguno está en el orden deseado, mantener orden alfabético
      return a.plan_name.localeCompare(b.plan_name);
    });
  };

  const orderedPlans = useMemo(() => getOrderedPlans(plans || []), [plans]);

  // Sincronizar con el store
  useEffect(() => {
    const currentPlanes = planes || [];
    const newSelectedPlans = new Map<number, PlanInterface>();
    
    // Solo agregar a selectedPlans los planes que están en el store Y existen en la lista de planes
    currentPlanes.forEach((quotationPlan: QuotationPlan) => {
      const planFromAPI = orderedPlans?.find((plan: PlanInterface) => plan.plan_name === quotationPlan.plan);
      if (planFromAPI) {
        newSelectedPlans.set(planFromAPI.id, planFromAPI);
      }
    });
    
    setSelectedPlans(newSelectedPlans);
  }, [orderedPlans, planes]); // Incluir las referencias completas para sincronización correcta

  const handlePlanChange = (plan: PlanInterface, checked: boolean) => {
    const newSelectedPlans = new Map(selectedPlans);
    
    if (checked) {
      newSelectedPlans.set(plan.id, plan);
      // Agregar plan al store
      const newQuotationPlan: QuotationPlan = {
        plan: plan.plan_name,
        afiliados: [],
        opcionales: [],
        resumenPago: {
          subTotalAfiliado: 0,
          subTotalOpcional: 0,
          periodoPago: "",
          totalPagar: 0
        },
        cantidadAfiliados: 0,
        tipo: "VOLUNTARIO"
      };
      addPlan(newQuotationPlan);
    } else {
      newSelectedPlans.delete(plan.id);
      // Remover plan del store
      removePlan(plan.plan_name);
    }
    
    setSelectedPlans(newSelectedPlans);
  };

  const handleSelectAllPlans = (checked: boolean) => {
    if (checked) {
      // Seleccionar todos los planes
      const newSelectedPlans = new Map<number, PlanInterface>();
      orderedPlans?.forEach((plan: PlanInterface) => {
        newSelectedPlans.set(plan.id, plan);
        // Agregar al store si no existe
        const existingPlan = planes?.find((p: QuotationPlan) => p.plan === plan.plan_name);
        if (!existingPlan) {
          const newQuotationPlan: QuotationPlan = {
            plan: plan.plan_name,
            afiliados: [],
            opcionales: [],
            resumenPago: {
              subTotalAfiliado: 0,
              subTotalOpcional: 0,
              periodoPago: "",
              totalPagar: 0
            },
            cantidadAfiliados: 0,
            tipo: "VOLUNTARIO"
          };
          addPlan(newQuotationPlan);
        }
      });
      setSelectedPlans(newSelectedPlans);
    } else {
      // Deseleccionar todos los planes
      setSelectedPlans(new Map());
      // Remover todos del store
      planes?.forEach((plan: QuotationPlan) => {
        removePlan(plan.plan);
      });
    }
  };

  const handleAddAfiliado = async (planName: string, afiliado: Afiliado) => {
    // Limpiar errores anteriores
    setAgeError(null);
    
    const tipoPlan = cliente?.tipoPlan ?? 0;
    const clientChoosen = cliente?.clientChoosen ?? 0;

    if (planName === "Todos") {
      // Agregar el afiliado a todos los planes seleccionados con prima específica para cada uno
      for (const plan of Array.from(selectedPlans.values())) {
        const currentPlanes = planes || [];
        const existingPlan = currentPlanes.find((p: QuotationPlan) => p.plan === plan.plan_name);
        
        if (existingPlan) {
          try {
            // Calcular prima específica para este plan
            // Para complementarios y colectivos, usar la cantidad como edad para el cálculo de prima
            const edadParaCalculo = (tipoPlan === 2 && clientChoosen === 2) ? afiliado.cantidadAfiliados : afiliado.edad;
            const primaValue = await GetPrimaPlan(
              plan.plan_name, 
              edadParaCalculo, 
              tipoPlan, 
              clientChoosen
            );
            
            // Para colectivos, multiplicar prima por cantidad (afiliado.cantidadAfiliados)
            const cantidad = clientChoosen === 2 ? afiliado.cantidadAfiliados : 1;
            const totalPrima = primaValue * cantidad;
            
            const afiliadoForPlan: Afiliado = {
              ...afiliado,
              plan: plan.plan_name,
              subtotal: totalPrima.toFixed(2)
            };
            
            const updatedAfiliados = [...existingPlan.afiliados, afiliadoForPlan];
            const subTotalAfiliado = updatedAfiliados.reduce((acc: number, af: Afiliado) => acc + parseFloat(af.subtotal), 0);
            
            updatePlanByName(plan.plan_name, {
              afiliados: updatedAfiliados,
              cantidadAfiliados: clientChoosen === 2 ? afiliado.cantidadAfiliados : updatedAfiliados.length,
              resumenPago: {
                ...existingPlan.resumenPago,
                subTotalAfiliado,
                totalPagar: subTotalAfiliado + existingPlan.resumenPago.subTotalOpcional
              }
            });
          } catch (error: unknown) {
            console.log("Error al obtener prima del plan:", error);
            
            // Si es un error de edad inválida, mostrar el mensaje al usuario
            if (error && typeof error === 'object' && 'message' in error && 
                typeof error.message === 'string' && error.message.includes('No se encontraron planes para la edad')) {
              setAgeError(error.message);
              return; // No agregar el afiliado si hay error de edad
            }
            
            // Usar valor por defecto si hay error, multiplicar por cantidad si es colectivo
            const defaultPrima = 1186.57;
            const cantidad = clientChoosen === 2 ? afiliado.cantidadAfiliados : 1;
            const totalPrima = defaultPrima * cantidad;
            
            const afiliadoForPlan: Afiliado = {
              ...afiliado,
              plan: plan.plan_name,
              subtotal: totalPrima.toFixed(2)
            };
            
            const updatedAfiliados = [...existingPlan.afiliados, afiliadoForPlan];
            const subTotalAfiliado = updatedAfiliados.reduce((acc: number, af: Afiliado) => acc + parseFloat(af.subtotal), 0);
            
            updatePlanByName(plan.plan_name, {
              afiliados: updatedAfiliados,
              cantidadAfiliados: clientChoosen === 2 ? afiliado.cantidadAfiliados : updatedAfiliados.length,
              resumenPago: {
                ...existingPlan.resumenPago,
                subTotalAfiliado,
                totalPagar: subTotalAfiliado + existingPlan.resumenPago.subTotalOpcional
              }
            });
          }
        }
      }
    } else {
      // Agregar solo al plan específico
      const currentPlanes = planes || [];
      const existingPlan = currentPlanes.find((p: QuotationPlan) => p.plan === planName);
      
      if (existingPlan) {
        const updatedAfiliados = [...existingPlan.afiliados, afiliado];
        const subTotalAfiliado = updatedAfiliados.reduce((acc: number, af: Afiliado) => acc + parseFloat(af.subtotal), 0);
        
        updatePlanByName(planName, {
          afiliados: updatedAfiliados,
          cantidadAfiliados: clientChoosen === 2 && afiliado.cantidadAfiliados 
            ? afiliado.cantidadAfiliados 
            : updatedAfiliados.length,
          resumenPago: {
            ...existingPlan.resumenPago,
            subTotalAfiliado,
            totalPagar: subTotalAfiliado + existingPlan.resumenPago.subTotalOpcional
          }
        });
      }
    }
  };

  const handleRemoveAfiliado = (plan: PlanInterface, afiliadoIndex: number) => {
    const currentPlanes = planes || [];
    const existingPlan = currentPlanes.find((p: QuotationPlan) => p.plan === plan.plan_name);
    
    if (existingPlan) {
      const removedAfiliado = existingPlan.afiliados[afiliadoIndex];
      const updatedAfiliados = existingPlan.afiliados.filter((_: Afiliado, index: number) => index !== afiliadoIndex);
      const subTotalAfiliado = updatedAfiliados.reduce((acc: number, af: Afiliado) => acc + parseFloat(af.subtotal), 0);
      
      updatePlanByName(plan.plan_name, {
        afiliados: updatedAfiliados,
        cantidadAfiliados: cliente?.clientChoosen === 2 && removedAfiliado?.cantidadAfiliados 
          ? (updatedAfiliados.length > 0 ? updatedAfiliados[0].cantidadAfiliados : 0)
          : updatedAfiliados.length,
        resumenPago: {
          ...existingPlan.resumenPago,
          subTotalAfiliado,
          totalPagar: subTotalAfiliado + existingPlan.resumenPago.subTotalOpcional
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Spinner size="xl" color="primary" className="mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Cargando planes disponibles...</p>
        </div>
      </div>
    );
  }
  if (error) return <div>Error al cargar los planes: {error.message}</div>;

  if (!orderedPlans || orderedPlans.length === 0) {
    return <div>No se encontraron planes.</div>;
  }

  const currentQuotationPlans = planes || [];
  const isAllPlansSelected = orderedPlans?.length > 0 && selectedPlans.size === orderedPlans.length;

  return (
    <div className="space-y-6">
      {/* Selección de planes */}
      <div>
        {/* Mobile: lista compacta de planes (tarjetas pequeñas) */}
        <div className="md:hidden space-y-2">
          <label className="flex items-center justify-between p-2 rounded-lg border bg-white">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={isAllPlansSelected}
                onChange={(e) => handleSelectAllPlans(e.target.checked)}
              />
              <div>
                <div className="text-sm font-medium">Todos</div>
                <div className="text-xs text-gray-500">Seleccionar todos</div>
              </div>
            </div>
          </label>

          {orderedPlans?.map((plan: PlanInterface) => (
            <label key={plan.id} className="flex items-center justify-between p-2 rounded-lg border bg-white">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={selectedPlans.has(plan.id)}
                  onChange={(e) => handlePlanChange(plan, e.target.checked)}
                />
                <div>
                  <div className="text-sm font-medium">{plan.plan_name}</div>
                  <div className="text-xs text-gray-500">{plan.poliza}</div>
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Desktop / Tablet: grid original con CheckBoxPlans */}
        <div className="hidden md:grid grid-cols-5 gap-6">
          <CheckBoxPlans
            plan={{ id: 0, plan_name: "Todos", poliza: "Seleccionar todos" }}
            isChecked={isAllPlansSelected}
            onChange={handleSelectAllPlans}
          />
          {orderedPlans?.map((plan: PlanInterface) => (
            <CheckBoxPlans
              key={plan.id}
              plan={plan}
              isChecked={selectedPlans.has(plan.id)}
              onChange={(checked) => handlePlanChange(plan, checked)}
            />
          ))}
        </div>
      </div>

      {/* Mostrar error de edad si existe */}
      {ageError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{ageError}</AlertDescription>
        </Alert>
      )}

      {/* Formulario único para agregar afiliados - Solo mostrar si hay planes seleccionados */}
      {selectedPlans.size > 0 && (
        <div className="space-y-4">
          <AddAfiliadoForm
            selectedPlans={Array.from(selectedPlans.values())}
            onAddAfiliado={handleAddAfiliado}
            clienteChousen={subTipoPoliza || 0}
          />
        </div>
      )}

      {/* Lista de afiliados por plan - Solo mostrar si hay afiliados */}
      {currentQuotationPlans.length > 0 && (
        <div className="space-y-4">
          {currentQuotationPlans.map((quotationPlan: QuotationPlan) => {
            const originalPlan = plans?.find((p: PlanInterface) => p.plan_name === quotationPlan.plan);
            if (!originalPlan || quotationPlan.afiliados.length === 0) return null;
            
            return (
              <AfiliadosList
                key={`list-${quotationPlan.plan}`}
                planName={quotationPlan.plan}
                planType={originalPlan.poliza}
                afiliados={quotationPlan.afiliados}
                clienteChousen={subTipoPoliza || 0}
                onRemoveAfiliado={(index) => handleRemoveAfiliado(originalPlan, index)}
              />
            );
          })}
        </div>
      )}

      {/* Resumen - Solo mostrar si hay planes con afiliados */}
      {currentQuotationPlans.length > 0 && (
        <PlanesResumen planes={currentQuotationPlans} clienteChousen={subTipoPoliza} />
      )}
    </div>
  )
}

export default CategoryPlan
