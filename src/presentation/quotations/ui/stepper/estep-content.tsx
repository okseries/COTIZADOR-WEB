import React, { useRef } from 'react'
import ClientInformation, { ClientInformationRef } from '../../../client/ui/ClientInformation';
import StepButton from './stepButtom';
import { useQuotationStore } from '../../store/useQuotationStore';
import CategoryPlan from '@/presentation/plans/ui/CategoryPlan';
import { ClientSearchProvider } from '@/presentation/client/hooks/useClientSearch';
import CoberturasOpcionales from '@/presentation/coberturasOpcionales/ui/CoberturasOptinals';
import PaymentOptions from '@/presentation/payments/PaymentOptions';

interface Props {
    step: string;
    setStep: (step: string) => void;
}

const StepContent = ({ step, setStep }: Props) => {
  // No necesitamos destructurar nada del store ya que no se usa
  const clientInfoRef = useRef<ClientInformationRef>(null);

  const handleNext = async (nextStep: string) => {
    if (step === "step1") {
      const isValid = await clientInfoRef.current?.validateAndSave();
      if (isValid) {
        setStep(nextStep);
      }
      return; // evita continuar si no es válido
    }

    setStep(nextStep);
  };

  return (
    <ClientSearchProvider>
      <div className="bg-white rounded-2xl shadow-lg border border-border">
        <div className="h-[600px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
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
            <CoberturasOpcionales/>
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
