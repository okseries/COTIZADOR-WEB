import React, { useRef, useState } from 'react'
import ClientInformation, { ClientInformationRef } from '../../../client/ui/ClientInformation';
import StepButton from './stepButtom';
import CategoryPlan from '@/presentation/plans/ui/CategoryPlan';
import { ClientSearchProvider } from '@/presentation/client/hooks/useClientSearch';
import CoberturasOpcionales, { CoberturasOpcionalesRef } from '@/presentation/coberturasOpcionales/ui/CoberturasOptinals';
import PaymentOptions from '@/presentation/payments/PaymentOptions';
import { useQuotationData } from '@/core';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface Props {
    step: string;
    setStep: (step: string) => void;
}

const StepContent = ({ step, setStep }: Props) => {
  const clientInfoRef = useRef<ClientInformationRef>(null);
  const coberturasRef = useRef<CoberturasOpcionalesRef>(null);
  const { planes } = useQuotationData();
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleNext = async (nextStep: string) => {
    setValidationError(null);

    if (step === "step1") {
      const isValid = await clientInfoRef.current?.validateAndSave();
      if (isValid) {
        setStep(nextStep);
      } else {
        setValidationError("Por favor complete todos los campos requeridos. Si ingresó una identificación, presione 'Buscar' para continuar.");
      }
      return;
    }

    if (step === "step2") {
      // Validar que hay planes seleccionados y que al menos uno tiene afiliados
      if (!planes || planes.length === 0) {
        setValidationError("Debe seleccionar al menos un plan para continuar.");
        return;
      }

      const planesConAfiliados = planes.filter(plan => plan.afiliados && plan.afiliados.length > 0);
      if (planesConAfiliados.length === 0) {
        setValidationError("Debe agregar al menos un afiliado a los planes seleccionados para continuar.");
        return;
      }
    }

    // 🆕 VALIDACIÓN PARA STEP 3: Guardar coberturas opcionales antes de avanzar
    if (step === "step3") {
      const isValid = await coberturasRef.current?.validateAndSave();
      if (isValid) {
        setStep(nextStep);
      } else {
        setValidationError("Error al guardar las coberturas opcionales. Por favor, inténtelo nuevamente.");
      }
      return;
    }

    setStep(nextStep);
  };

  return (
    <ClientSearchProvider>
      <div className="bg-white rounded-2xl shadow-lg border border-border">
        <div className="min-h-[500px] max-h-[calc(100vh-200px)] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {/* Mostrar error de validación */}
            {validationError && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {validationError}
                </AlertDescription>
              </Alert>
            )}

            {step === "step1" && (
              <div className="space-y-6">
                <ClientInformation ref={clientInfoRef} />
              </div>
            )}
        {step === "step2" && (
          <div className="space-y-6">
            <CategoryPlan/>
          </div>
        )}
        {step === "step3" && (
          <div className="space-y-6">
            <CoberturasOpcionales ref={coberturasRef} />
          </div>
        )}
        {step === "step4" && (
          <div className="space-y-6">
            <PaymentOptions />
          </div>
        )}
          </div>
          
          {/* Botones fijos en la parte inferior */}
          <div className="border-t border-border/50 p-4 sm:p-6 bg-gray-50/50">
            {step === "step1" && (
              <div className="flex justify-end">
                <StepButton
                  onClick={() => handleNext("step2")}
                  isNext={true}
                  isDisabled={false}
                />
              </div>
            )}
            {step === "step2" && (
              <div className="flex justify-between">
                <StepButton
                  onClick={() => setStep("step1")}
                  isNext={false}
                  isDisabled={false}
                />
                <StepButton
                  onClick={() => handleNext("step3")}
                  isNext={true}
                  isDisabled={false}
                />
              </div>
            )}
            {step === "step3" && (
              <div className="flex justify-between">
                <StepButton
                  onClick={() => setStep("step2")}
                  isNext={false}
                  isDisabled={false}
                />
                <StepButton
                  onClick={() => handleNext("step4")}
                  isNext={true}
                  isDisabled={false}
                />
              </div>
            )}
            {step === "step4" && (
              <div className="flex justify-start">
                <StepButton
                  onClick={() => setStep("step3")}
                  isNext={false}
                  isDisabled={false}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </ClientSearchProvider>
  )
}

export default StepContent
