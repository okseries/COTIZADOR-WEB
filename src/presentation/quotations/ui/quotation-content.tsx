"use client"

import React from 'react'
import { Stepper } from './stepper/stepper-quotation'
import { useForm, FormProvider } from "react-hook-form";

const QuotationContent = () => {
  const methods = useForm();
  return (
    <FormProvider {...methods}>
      <Stepper/>
    </FormProvider>
  )
}

export default QuotationContent
