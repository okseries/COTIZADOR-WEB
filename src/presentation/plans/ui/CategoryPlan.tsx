import React from 'react'
import { useGetAllPlans } from '../hooks/usePlans';
import CheckBoxPlans from './CheckBoxPlans';

const CategoryPlan = () => {
    const { data: plans, isLoading, error } = useGetAllPlans(1, 1);
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {
        plans?.map((plan) => (
          <CheckBoxPlans key={plan.id} plan={plan} />
        ))
      }
    </div>
  )
}

export default CategoryPlan
