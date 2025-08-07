import React, { useState, useEffect } from 'react'
import { useGetAllPlans } from '../hooks/usePlans';
import CheckBoxPlans from './CheckBoxPlans';
import AddAfiliadoForm from './AddAfiliadoForm';
import AfiliadosList from './AfiliadosList';
import PlanesResumen from './PlanesResumen';
import { useQuotationStore } from '@/presentation/quotations/store/useQuotationStore';
import { LoadingSpinner } from '@/components/shared/loading';
import { Plan as PlanInterface } from '../interface/plan.interface';
import { Plan as QuotationPlan, Afiliado } from '@/presentation/quotations/interface/createQuotation.interface';

const CategoryPlan = () => {
  const { getFinalObject, addPlan, updatePlanByName, removePlan } = useQuotationStore();
  const tipoPoliza = getFinalObject().cliente?.tipoPlan;
  const subTipoPoliza = getFinalObject().cliente?.clientChoosen;

  const [selectedPlans, setSelectedPlans] = useState<Map<number, PlanInterface>>(new Map());
  
  const { data: plans, isLoading, error } = useGetAllPlans(tipoPoliza ?? 0, subTipoPoliza ?? 0);

  // Sincronizar con el store
  useEffect(() => {
    const currentPlans = getFinalObject().planes || [];
    const newSelectedPlans = new Map<number, PlanInterface>();
    
    plans?.forEach(plan => {
      const existsInStore = currentPlans.some(quotationPlan => quotationPlan.plan === plan.plan_name);
      if (existsInStore) {
        newSelectedPlans.set(plan.id, plan);
      }
    });
    
    setSelectedPlans(newSelectedPlans);
  }, [plans, getFinalObject]);

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
          periodoPago: "Mensual",
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

  const handleAddAfiliado = (plan: PlanInterface, afiliado: Afiliado) => {
    const currentPlans = getFinalObject().planes || [];
    const existingPlan = currentPlans.find(p => p.plan === plan.plan_name);
    
    if (existingPlan) {
      const updatedAfiliados = [...existingPlan.afiliados, afiliado];
      const subTotalAfiliado = updatedAfiliados.reduce((acc, af) => acc + parseFloat(af.subtotal), 0);
      
      updatePlanByName(plan.plan_name, {
        afiliados: updatedAfiliados,
        cantidadAfiliados: updatedAfiliados.length,
        resumenPago: {
          ...existingPlan.resumenPago,
          subTotalAfiliado,
          totalPagar: subTotalAfiliado + existingPlan.resumenPago.subTotalOpcional
        }
      });
    }
  };

  const handleRemoveAfiliado = (plan: PlanInterface, afiliadoIndex: number) => {
    const currentPlans = getFinalObject().planes || [];
    const existingPlan = currentPlans.find(p => p.plan === plan.plan_name);
    
    if (existingPlan) {
      const updatedAfiliados = existingPlan.afiliados.filter((_, index) => index !== afiliadoIndex);
      const subTotalAfiliado = updatedAfiliados.reduce((acc, af) => acc + parseFloat(af.subtotal), 0);
      
      updatePlanByName(plan.plan_name, {
        afiliados: updatedAfiliados,
        cantidadAfiliados: updatedAfiliados.length,
        resumenPago: {
          ...existingPlan.resumenPago,
          subTotalAfiliado,
          totalPagar: subTotalAfiliado + existingPlan.resumenPago.subTotalOpcional
        }
      });
    }
  };

  if (isLoading) return <LoadingSpinner className="h-10 w-10 mx-auto mb-4 mt-10 text-[#005BBB]" />;
  if (error) return <div>Error al cargar los planes: {error.message}</div>;

  if (!plans || plans.length === 0) {
    return <div>No se encontraron planes.</div>;
  }

  const currentQuotationPlans = getFinalObject().planes || [];

  return (
    <div className="space-y-6">
      {/* Selección de planes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {plans?.map((plan) => (
          <CheckBoxPlans 
            key={plan.id} 
            plan={plan}
            isChecked={selectedPlans.has(plan.id)}
            onChange={(checked) => handlePlanChange(plan, checked)}
          />
        ))}
      </div>

      {/* Formularios para agregar afiliados */}
      <div className="space-y-4">
        {Array.from(selectedPlans.values()).map((plan) => (
          <AddAfiliadoForm
            key={`form-${plan.id}`}
            plan={plan}
            onAddAfiliado={(afiliado) => handleAddAfiliado(plan, afiliado)}
          />
        ))}
      </div>

      {/* Lista de afiliados por plan */}
      <div className="space-y-4">
        {currentQuotationPlans.map((quotationPlan) => {
          const originalPlan = plans?.find(p => p.plan_name === quotationPlan.plan);
          if (!originalPlan) return null;
          
          return (
            <AfiliadosList
              key={`list-${quotationPlan.plan}`}
              planName={quotationPlan.plan}
              afiliados={quotationPlan.afiliados}
              onRemoveAfiliado={(index) => handleRemoveAfiliado(originalPlan, index)}
            />
          );
        })}
      </div>

      {/* Resumen */}
      <PlanesResumen planes={currentQuotationPlans} />
    </div>
  )
}

export default CategoryPlan
