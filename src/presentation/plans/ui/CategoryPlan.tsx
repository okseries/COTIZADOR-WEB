import React from 'react'
import { useGetAllPlans } from '../hooks/usePlans';
import CheckBoxPlans from './CheckBoxPlans';
import { useQuotationStore } from '@/presentation/quotations/store/useQuotationStore';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/shared/loading';

const CategoryPlan = () => {
  const {getFinalObject} = useQuotationStore();
  const tipoPoliza = getFinalObject().cliente?.tipoPlan;
  const subTipoPoliza = getFinalObject().cliente?.clientChoosen;


  const { data: plans, isLoading, error } = useGetAllPlans(tipoPoliza ?? 0, subTipoPoliza ?? 0);
    console.log(getFinalObject());


  if (isLoading) return <LoadingSpinner className="h-10 w-10 mx-auto mb-4 mt-10 text-[#005BBB]" />;
  if (error) return <div>Error al cargar los planes: {error.message}</div>;

  if (!plans || plans.length === 0) {
    return <div>No se encontraron planes.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {
        plans?.map((plan) => (
          <CheckBoxPlans key={plan.id} plan={plan} />
        ))
      }



      {/* <div className="space-y-2 flex flex-col justify-center">
          <Label htmlFor="tipoPoliza">
            {errors.tipoPoliza ? errors.tipoPoliza.message : "Tipo de poliza *"}
          </Label>
          <Controller
            name="tipoPoliza"
            control={control}
            render={({ field }) => (
              <SelectSimple
                {...field}
                id="tipoPoliza"
                placeholder="Selecciona tipo"
                options={
                  plans?.map((plan) => ({
                    label: plan.tipoPlanName,
                    value: String(plan.id),
                  })) || []
                }
                error={!!errors.tipoPoliza}
                className="mt-1 h-10"
              />
            )}
          />
        </div> */}


    </div>
  )
}

export default CategoryPlan
