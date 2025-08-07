"use client"
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import React from 'react'
import { Plan } from '../interface/plan.interface'

interface Props {
  plan: Plan
  isChecked?: boolean
  onChange?: (checked: boolean) => void
}

const CheckBoxPlans = ({ plan, isChecked= false, onChange }: Props) => {
  return (
     <div className="flex flex-col gap-6">
     
      <Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
        <Checkbox
          id="toggle-2"
          defaultChecked={isChecked}
          className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
          onCheckedChange={onChange}
        />
        <div className="grid gap-1.5 font-normal">
          <p className="text-sm leading-none font-medium">
            {plan.plan_name}
          </p>
          <p className="text-muted-foreground text-sm">
            {plan.poliza}
          </p>
        </div>
      </Label>
    </div>
  )
}

export default CheckBoxPlans
