"use client"

import React from 'react'
import { Stepper } from './stepper/stepper-quotation'
import { useForm, FormProvider } from "react-hook-form";

const QuotationContent = () => {
  const methods = useForm();
  return (
    <div className="h-full w-full">
      <FormProvider {...methods}>
        <Stepper />
      </FormProvider>
    </div>
  )
}

export default QuotationContent
